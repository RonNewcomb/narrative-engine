import { animate } from "./animate";
import { div } from "./layout";

type StoryNode = string | StoryOperation | StoryResponses;

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
let menus: HTMLElement[] = [];

// rendering

function createNewMenu(children: HTMLElement[] = []) {
  const nav = document.createElement("nav");
  nav.classList = "playerChoices";
  nav.replaceChildren(...children);
  menus.push(nav);
  return nav;
}

function renderStoryNodeString(node: string, el: HTMLElement): false {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderStoryNodeCommand(command: string, el: HTMLElement) {
  const span = document.createElement("span");
  span.innerText = command;
  span.className = "command";
  el.appendChild(span);
}

function renderTheEnd() {
  document.getElementById("choices")!.appendChild(document.createElement("hr"));
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement) {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const responseWrappers = node.responses
    .filter(response => response && typeof response !== "string")
    .map(response => {
      const button = document.createElement("button");
      response.forEach(segment => renderStoryNode(segment, button));
      const responseWrapper = div([button], { className: "response" });
      // move nav elements out of button's children to wrapper's children so .innerText on button is useful
      for (let i = 0; i < button.children.length; i++) {
        const child = button.children[i];
        if (child.tagName == "NAV") responseWrapper.appendChild(button.replaceChild(document.createElement("sub-menu"), child));
      }
      return responseWrapper;
    });
  el.appendChild(createNewMenu(responseWrappers));
  const lastMenu = menus.pop();
  return menus.length == 0 ? lastMenu : false;
}

function renderStoryNodes(nodes: StoryNode[], el: HTMLElement): false {
  nodes.forEach(node => renderStoryNode(node, el));
  return false;
}

function renderStoryNodeOperationIf(node: StoryOperation, el: HTMLElement) {
  return state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationDid(node: StoryOperation, el: HTMLElement) {
  return state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationIfnot(node: StoryOperation, el: HTMLElement) {
  return !state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNodeOperationDidnot(node: StoryOperation, el: HTMLElement) {
  return !state.chosen.some(oldChoice => oldChoice.includes(node.match)) ? renderStoryNodes(node.wrap, el) : false;
}

function renderStoryNode(node: StoryNode, el: HTMLElement) {
  if (typeof node === "string") return renderStoryNodeString(node, el);
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
      renderStoryNodeCommand(response, publishedElement);
      renderCurrentTurn();
    });
  else renderTheEnd();
}

//////////////////////
// main entry point
export async function interpret(filename: string, pwa = false) {
  if (pwa && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  const story: Story = await fetch(filename).then(r => r.json());
  state = { story, current: -1, chosen: [] };
  publishedElement = document.getElementById("published")!;
  menus = [];
  return renderCurrentTurn();
}

(window as any).interpret = interpret;
