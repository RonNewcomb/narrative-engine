import { animate, type MenuElement } from "./animate";

type StoryNode = string | StoryOperation | StoryResponses | StoryHashtag | StoryPlotpoint;

type StoryHashtag = {
  op: "hashtag";
  tag: string;
};

type StoryPlotpoint = {
  op: "plot";
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
  nav.classList = "playerChoices";
  nav.replaceChildren(...children);
  menus.push(nav);
  return nav;
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
  state.chosen.push(node.match);
  console.log("Plot point:", node.match);
  return false;
}

function renderTheEnd(): void {
  document.getElementById("choices")!.appendChild(document.createElement("hr"));
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement): MenuElement | false {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const buttons = node.responses
    .filter(response => response && typeof response !== "string")
    .map(response => {
      const button = document.createElement("button");
      response.forEach(segment => renderStoryNode(segment, button));
      return button;
    });
  el.appendChild(createNewMenu(buttons));
  const lastMenu = menus.pop();
  return lastMenu && menus.length == 0 ? lastMenu : false;
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
    return animate(stopForInput).then(response => {
      state.chosen.push(response);
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
