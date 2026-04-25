import { multimenu, type MenuElement } from "./multimenu";

type StoryNode = string | StoryOperation | StoryResponses | StoryHashtag | StoryMatchpoint;

type StoryHashtag = {
  op: "hashtag";
  tag: string;
};

type StoryMatchpoint = {
  op: "plot" | "goto";
  match: string;
};

type StoryOperation = {
  op: "if" | "did" | "didnt" | "unless";
  match: string;
  wrap: StoryNode[];
};

type StoryResponse = StoryNode[];

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

function addChildrenToMenu(menu: MenuElement, children: HTMLElement[]): MenuElement {
  menu.replaceChildren(...children);
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

function renderStoryNodePlotpoint(node: StoryMatchpoint): false {
  state.chosen.push(node.match);
  console.log("PLOT", node.match);
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

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement): MenuElement | false {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const menu = createNewMenu(); // do this here so GOTO immediately knows if it's conditional or not
  const buttons = node.responses
    .filter(response => response && typeof response !== "string")
    .map(response => {
      const button = document.createElement("button");
      response.forEach(segment => renderStoryNode(segment, button));
      return button;
    });
  el.appendChild(addChildrenToMenu(menu, buttons));
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

function renderStoryNode(node: StoryNode, el: HTMLElement): false | MenuElement {
  if (typeof node === "string") return renderStoryNodeString(node, el);
  if (node.op == "hashtag") return renderStoryNodeHashtag(node, el);
  if (node.op == "plot") return renderStoryNodePlotpoint(node);
  if (node.op == "goto") return renderStoryNodeGoto(node, el);
  if (node.op == "menu") return renderStoryNodeResponses(node, el);
  if (node.op == "if") return renderStoryNodeOperationIf(node, el);
  if (node.op == "did") return renderStoryNodeOperationDid(node, el);
  if (node.op == "unless") return renderStoryNodeOperationIfnot(node, el);
  if (node.op == "didnt") return renderStoryNodeOperationDidnot(node, el);
  throw new Error("Unknown node type " + JSON.stringify(node));
}

// render the current turn, but leaves turn pointer to next turn, assuming no gotos
async function renderCurrentTurn() {
  let stopForInput: ReturnType<typeof renderStoryNode> = false;
  do {
    state.current++;
    const node = state.story[state.current];
    if (!node) break;
    stopForInput = renderStoryNode(node, publishedElement);
  } while (!stopForInput && state.current < state.story.length);
  if (stopForInput)
    return multimenu(stopForInput).then(({ chosen, goingTo }) => {
      if (chosen) state.chosen.push(chosen);
      if (goingTo) performGoto(goingTo);
      renderCurrentTurn();
    });
  else renderTheEnd();
}

//////////////////////
// main entry point
export async function interpreter(filename: string, pwa = false) {
  if (pwa && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  const story: Story = await fetch(filename).then(r => r.json());
  state = { story, current: -1, chosen: [] };
  publishedElement = document.getElementById("published")!;
  menus = [];
  return renderCurrentTurn();
}

(window as any).interpreter = interpreter;
document.dispatchEvent(new Event("interpreter"));
