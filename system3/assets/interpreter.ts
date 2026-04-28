import { multimenu, type MenuElement } from "./multimenu";

type StoryNode =
  | string
  | StoryOperation
  | StoryResponses
  | StoryHashtag
  | StoryMatchpoint
  | StoryLoneResponse
  | StoryPlotpoint
  | StoryCutCopy
  | StoryPaste;

type StoryHashtag = {
  op: "hashtag";
  tag: string;
};

type StoryMatchpoint = {
  op: "goto";
  match: string;
};

type StoryPlotpoint = {
  op: "plot";
  name: string;
};

type StoryCutCopy = {
  op: "cut" | "copy";
  name: string;
  wrap: StoryNode[];
};

type StoryPaste = {
  op: "paste";
  name: string;
};

type StoryOperation = {
  op: "if" | "did" | "didnt" | "unless";
  match: string;
  wrap: StoryNode[];
};

type StoryResponse = StoryNode[];

type StoryLoneResponse = {
  op: "*";
  option: StoryResponse;
};

type StoryResponses = {
  op: "menu";
  responses: StoryResponse[];
};

type Story = StoryNode[];

// state
let state = {
  current: -1,
  chosen: [] as string[],
  story: [] as Story,
  templates: [] as StoryCutCopy[],
};

// helpers
let publishedElement = document.getElementById("published")!;
let menus: MenuElement[] = [];

// rendering

function createNewMenu(children: HTMLElement[] = []): MenuElement {
  const nav = document.createElement("nav") as MenuElement;
  nav.replaceChildren(...children);
  menus.push(nav);
  return nav;
}

function addResponseToMenu(button: HTMLButtonElement, menu: MenuElement = menus[menus.length - 1]): MenuElement {
  if (!menu) menu = createNewMenu();
  menu.appendChild(button);
  return menu;
}

function renderStoryNodeString(node: string, el: HTMLElement): false {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderStoryNodeHashtag(node: StoryHashtag, el: HTMLElement): false {
  const hashtag = document.createElement("hash-tag");
  hashtag.innerText = node.tag;
  el.appendChild(hashtag);
  return false;
}

function renderStoryNodePlotpoint(node: StoryPlotpoint): false {
  state.chosen.push(node.name);
  console.log("PLOT", node.name);
  return false;
}

function performGoto(match: string) {
  const newPlace = state.story.findIndex(n => typeof n === "string" && n.includes(match));
  if (newPlace === -1) {
    console.error("Goto target not found:", match);
    return false;
  }
  const passage = state.story[newPlace] as string;
  const i = passage.indexOf(match);
  // goto in a response means it follows a Command which never has spaces around it.
  renderStoryNodeString(" " + passage.slice(i), publishedElement);
  state.current = newPlace;
}

function renderStoryNodeGoto(node: StoryMatchpoint, el: HTMLElement): false {
  const go = document.createElement("go-to");
  go.textContent = node.match;
  el.appendChild(go);
  if (menus.length == 0) performGoto(node.match);
  return false;
}

function renderTheEnd(): void {
  publishedElement.appendChild(document.createElement("hr"));
}

function renderStoryNodeLoneResponse(option: StoryResponse): false {
  const button = document.createElement("button");
  addResponseToMenu(button);
  option.forEach(segment => renderStoryNode(segment, button));
  return false;
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement): MenuElement | false {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const menu = createNewMenu(); // do this here so GOTO immediately knows if it's conditional or not
  for (let response of node.responses) {
    if (!response || typeof response === "string") continue;
    renderStoryNodeLoneResponse(response);
  }
  el.appendChild(menu);
  const outermostMenu = menus.pop();
  return outermostMenu && menus.length == 0 ? outermostMenu : false;
}

function renderStoryNodes(nodes: StoryNode[], el: HTMLElement): false | MenuElement {
  const returns = nodes.map(node => renderStoryNode(node, el));
  return returns.filter(x => !!x)[0] || false;
}

function renderStoryNodeOperationIf(node: StoryOperation, el: HTMLElement): false | MenuElement {
  return state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationDid(node: StoryOperation, el: HTMLElement): false | MenuElement {
  return state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationIfnot(node: StoryOperation, el: HTMLElement): false | MenuElement {
  return !state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationDidnot(node: StoryOperation, el: HTMLElement): false | MenuElement {
  return !state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationCut(node: StoryCutCopy): false | MenuElement {
  state.templates.push(node);
  return false;
}

function renderStoryNodeOperationCopy(node: StoryCutCopy, el: HTMLElement): false | MenuElement {
  renderStoryNodeOperationCut(node);
  renderStoryNodeOperationPaste(node, el);
  return false;
}

function renderStoryNodeOperationPaste(node: StoryCutCopy | StoryPaste, el: HTMLElement): false | MenuElement {
  const template = state.templates.find(t => t.name === node.name || t.name?.includes(node.name));
  return template ? renderStoryNodes(template.wrap, el) : false;
}

function renderStoryNode(node: StoryNode, el: HTMLElement): false | MenuElement {
  if (typeof node === "string") return renderStoryNodeString(node, el);
  if (node.op == "hashtag") return renderStoryNodeHashtag(node, el);
  if (node.op == "plot") return renderStoryNodePlotpoint(node);
  if (node.op == "goto") return renderStoryNodeGoto(node, el);
  if (node.op == "menu") return renderStoryNodeResponses(node, el);
  if (node.op == "*") return renderStoryNodeLoneResponse(node.option);
  if (node.op == "if") return renderStoryNodeOperationIf(node, el);
  if (node.op == "did") return renderStoryNodeOperationDid(node, el);
  if (node.op == "unless") return renderStoryNodeOperationIfnot(node, el);
  if (node.op == "didnt") return renderStoryNodeOperationDidnot(node, el);
  if (node.op == "cut") return renderStoryNodeOperationCut(node);
  if (node.op == "copy") return renderStoryNodeOperationCopy(node, el);
  if (node.op == "paste") return renderStoryNodeOperationPaste(node, el);
  throw new Error("Unknown node type " + JSON.stringify(node));
}

// render the current turn, but leaves turn pointer to next turn, assuming no gotos
async function renderCurrentTurn(): Promise<void> {
  let stopForInput: ReturnType<typeof renderStoryNode> = false;
  do {
    state.current++;
    const node = state.story[state.current];
    if (!node) break;
    stopForInput = renderStoryNode(node, publishedElement);
  } while (!stopForInput && state.current < state.story.length);
  if (!stopForInput) return renderTheEnd();
  return multimenu(stopForInput).then(({ chosen, goingTo }) => {
    if (chosen) state.chosen.push(chosen);
    if (goingTo) performGoto(goingTo);
    return renderCurrentTurn();
  });
}

//////////////////////
// main entry point
export async function interpreter(filename: string, pwa = false): Promise<void> {
  if (pwa && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  const story: Story = await fetch(filename).then(r => r.json());
  state = { story, current: -1, chosen: [], templates: [] };
  publishedElement = document.getElementById("published")!;
  menus = [];
  return renderCurrentTurn();
}

(window as any).interpreter = interpreter;
document.dispatchEvent(new Event("interpreter"));
