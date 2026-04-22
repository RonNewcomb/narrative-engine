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

function renderNewMenu() {
  const nav = document.createElement("nav");
  nav.classList = "playerChoices";
  menus.push(nav);
  return nav;
}

function renderStoryNodeString(node: string, el: HTMLElement): false {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderTheEnd() {
  document.getElementById("choices")!.appendChild(document.createElement("hr"));
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement) {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const responsesContainer = renderNewMenu();
  node.responses.forEach(response => {
    if (!response || typeof response === "string") return;
    const wrapper = div(undefined, { className: "response" });
    const button = document.createElement("button");
    wrapper.appendChild(button);
    responsesContainer.appendChild(wrapper);
    response.forEach(n => renderStoryNode(n, button));
    // move nav elements out of button's children to wrapper's children so .innerText on button is useful
    for (let i = 0; i < button.children.length; i++) {
      const child = button.children[i];
      if (child.tagName == "NAV") wrapper.appendChild(button.replaceChild(document.createElement("sub-menu"), child));
    }
  });
  el.appendChild(responsesContainer);
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
function renderCurrentTurn() {
  let stopForInput: ReturnType<typeof renderStoryNode> = false;
  do {
    state.current++;
    const node = state.story[state.current];
    if (!node) break;
    stopForInput = renderStoryNode(node, publishedElement);
  } while (!stopForInput && state.current < state.story.length);
  if (stopForInput)
    animate(stopForInput).then(response => {
      state.chosen.push(response);
      renderStoryNodeString(response, publishedElement);
      renderCurrentTurn();
    });
  else renderTheEnd();
}

//////////////////////
// main entry point
function interpret(story: Story) {
  state = { story, current: -1, chosen: [] };
  publishedElement = document.getElementById("published")!;
  menus = [];
  if (state.current < story.length) renderCurrentTurn();
}
