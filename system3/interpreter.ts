type StoryNode = string | StoryOperation | StoryResponses;

type StoryOperation = {
  op: "if" | "did" | "menu" | "didnt" | "unless";
  match: string;
  wrap: StoryNode[];
};

type StoryResponses = {
  responses: StoryNode[][];
};

type Story = StoryNode[];

// state
let state = {
  current: -1,
  chosen: [] as string[],
  story: [] as Story,
  publishedElement: document.getElementById("published")!,
};

// helpers
const menus: HTMLElement[] = [];

function newSubmenu() {
  const ul = document.createElement("nav");
  ul.classList = "playerChoices";
  menus.push(ul);
  return ul;
}

function getCurrentMenu() {
  return menus.length === 0 ? newSubmenu() : menus[menus.length - 1];
}

function renderStoryNodeString(node: string, el: HTMLElement) {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement) {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const ul = getCurrentMenu();
  node.responses.forEach(response => {
    if (!response) return;
    const button = document.createElement("button");
    button.onclick = onChoice;
    ul.appendChild(button);
    response.forEach(n => renderStoryNode(n, button));
  });
  el.appendChild(ul);
  menus.pop();
  return menus.length == 0;
}

function renderStoryNodes(nodes: StoryNode[], el: HTMLElement) {
  nodes.forEach(node => renderStoryNode(node, el));
  return false;
}

function renderStoryNodeOperation(node: StoryOperation, el: HTMLElement) {
  switch (node.op) {
    case "if":
      return renderStoryNodeOperationIf(node, el);
    case "did":
      return renderStoryNodeOperationDid(node, el);
    case "menu":
      return renderStoryNodeSubmenu(node, el);
    case "didnt":
      return renderStoryNodeOperationDidnot(node, el);
    case "unless":
      return renderStoryNodeOperationIfnot(node, el);
    default:
      throw new Error("Unknown operation " + node.op);
  }
}

function renderStoryNodeOperationIf(node: StoryOperation, el: HTMLElement) {
  if (state.chosen.includes(node.match)) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationDid(node: StoryOperation, el: HTMLElement) {
  if (state.chosen.includes(node.match)) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationIfnot(node: StoryOperation, el: HTMLElement) {
  if (!state.chosen.includes(node.match)) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeOperationDidnot(node: StoryOperation, el: HTMLElement) {
  if (!state.chosen.includes(node.match)) {
    return renderStoryNodes(node.wrap, el);
  }
  return false;
}

function renderStoryNodeSubmenu(node: StoryOperation, el: HTMLElement) {
  newSubmenu();
  return false;
}

function renderStoryNode(node: StoryNode, el: HTMLElement) {
  if (typeof node === "string") return renderStoryNodeString(node, el);
  if ("responses" in node) return renderStoryNodeResponses(node, el);
  if (node.op == "if") return renderStoryNodeOperationIf(node, el);
  if (node.op == "did") return renderStoryNodeOperationDid(node, el);
  if (node.op == "unless") return renderStoryNodeOperationIfnot(node, el);
  if (node.op == "didnt") return renderStoryNodeOperationDidnot(node, el);
  if (node.op == "menu") return renderStoryNodeSubmenu(node, el);
  throw new Error("Unknown node type " + JSON.stringify(node));
}

function renderCurrentTurn() {
  let stopForInput = false;
  do {
    state.current++;
    const node = state.story[state.current];
    stopForInput = renderStoryNode(node, state.publishedElement);
  } while (!stopForInput && state.current < state.story.length);
}

function interpret(story: Story, el: HTMLElement) {
  state = {
    story,
    publishedElement: el,
    current: -1,
    chosen: [],
  };
  if (state.current < story.length) renderCurrentTurn();
}

function onChoice(event: Event) {
  const button = event.target as HTMLButtonElement;
  console.log("onChoice", button.innerText, button);
  state.chosen.push(button.innerText);
  renderCurrentTurn();
}

// function li(li: HTMLLIElement) {
//   const button = document.createElement("button");
//   button.innerHTML = li.innerHTML;
//   button.onclick = e => click(button, e);
//   li.parentElement!.replaceChild(button, li);
// }

// function click(btn: HTMLButtonElement, e: Event) {
//   const ul = btn.closest("ul");
//   const chosen = document.createElement("b");
//   chosen.innerText = btn.innerText + "\n";
//   ul!.parentElement!.replaceChild(chosen, ul!);
// }
