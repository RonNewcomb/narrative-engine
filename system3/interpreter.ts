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

function renderStoryNodeString(node: string, el: HTMLElement) {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement) {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const responsesContainer = renderNewMenu();
  node.responses.forEach(response => {
    if (!response || typeof response === "string") return;
    const button = document.createElement("button");
    button.onclick = onChoice;
    responsesContainer.appendChild(button);
    response.forEach(n => renderStoryNode(n, button));
  });
  el.appendChild(responsesContainer);
  menus.pop();
  return menus.length == 0;
}

function renderStoryNodes(nodes: StoryNode[], el: HTMLElement) {
  nodes.forEach(node => renderStoryNode(node, el));
  return false;
}

function renderStoryNodeOperationIf(node: StoryOperation, el: HTMLElement) {
  if (state.chosen.some(oldChoice => oldChoice.includes(node.match))) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationDid(node: StoryOperation, el: HTMLElement) {
  if (state.chosen.some(oldChoice => oldChoice.includes(node.match))) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationIfnot(node: StoryOperation, el: HTMLElement) {
  if (!state.chosen.some(oldChoice => oldChoice.includes(node.match))) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationDidnot(node: StoryOperation, el: HTMLElement) {
  if (!state.chosen.some(oldChoice => oldChoice.includes(node.match))) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
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
  let stopForInput = false;
  do {
    state.current++;
    const node = state.story[state.current];
    stopForInput = renderStoryNode(node, publishedElement);
  } while (!stopForInput && state.current < state.story.length);
}

//////////////////////
// main entry point
function interpret(story: Story) {
  state = { story, current: -1, chosen: [] };
  publishedElement = document.getElementById("published")!;
  menus = [];
  if (state.current < story.length) renderCurrentTurn();
}

// secondary entry point -- button click handler, continue to next turn
function onChoice(event: Event) {
  const button = event.target as HTMLButtonElement;
  state.chosen.push(button.innerText);
  renderCurrentTurn();
}
