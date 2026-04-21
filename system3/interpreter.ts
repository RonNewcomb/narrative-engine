type StoryNode = string | StoryOperation | StoryResponses;

type StoryOperation = {
  op: "if" | "did";
  match: string;
  wrap: StoryNode[];
};

type StoryResponses = {
  responses: StoryNode[][];
};

type Story = StoryNode[];

let current = -1;

function renderStoryNodeString(node: string, el: HTMLElement) {
  el.appendChild(document.createTextNode(node));
  return false;
}

function renderStoryNodeResponses(node: StoryResponses, el: HTMLElement) {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const ul = document.createElement("ul");
  ul.classList = "playerChoices";
  node.responses.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = r[0]; //.join("");
    ul.appendChild(li);
  });
  el.appendChild(ul);
  return true;
}

function renderStoryNodes(nodes: StoryNode[], el: HTMLElement) {
  nodes.forEach(node => renderStoryNode(node, el));
  return false;
}

function renderStoryNodeOperation(node: StoryOperation, el: HTMLElement) {
  if (node.op == "if") {
    return renderStoryNodeOperationIf(node, el);
  } else if (node.op == "did") {
    return renderStoryNodeOperationDid(node, el);
  }
  throw new Error("Unknown operation " + node.op);
}

function renderStoryNodeOperationIf(node: StoryOperation, el: HTMLElement) {
  return false;
}

function renderStoryNodeOperationDid(node: StoryOperation, el: HTMLElement) {
  return false;
}

function renderStoryNode(node: StoryNode, el: HTMLElement) {
  if (typeof node === "string") return renderStoryNodeString(node, el);
  if ("responses" in node) return renderStoryNodeResponses(node, el);
  if (node.op == "if") return renderStoryNodeOperationIf(node, el);
  if (node.op == "did") return renderStoryNodeOperationDid(node, el);
  throw new Error("Unknown node type " + JSON.stringify(node));
}

function interpret(story: Story, el: HTMLElement) {
  let stopForInput = false;
  do {
    current++;
    const node = story[current];
    stopForInput = renderStoryNode(node, el);
  } while (!stopForInput && current < story.length);

  //el.innerHTML = text.replaceAll("[", "<ul>").replaceAll("]", "</ul>").replaceAll("*", "<li>");

  //document.querySelectorAll("li").forEach(li);
}

function li(li: HTMLLIElement) {
  const button = document.createElement("button");
  button.innerHTML = li.innerHTML;
  button.onclick = e => click(button, e);
  li.parentElement!.replaceChild(button, li);
}

function click(btn: HTMLButtonElement, e: Event) {
  const ul = btn.closest("ul");
  const chosen = document.createElement("b");
  chosen.innerText = btn.innerText + "\n";
  ul!.parentElement!.replaceChild(chosen, ul!);
}
