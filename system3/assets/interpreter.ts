import { multimenu, type MenuElement } from "./multimenu";

type StoryNode =
  | string
  | StoryOperation
  | StoryMenu
  | StoryHashtag
  | StoryMatchpoint
  | StoryLoneResponse
  | StoryResponseEndMenu
  | StoryPlotpoint
  | StoryCutCopy
  | StoryPaste
  | StoryReplace;

type StoryHashtag = {
  op: "hashtag";
  tag: string;
};

type StoryMatchpoint = {
  op: "goto" | "the";
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

type StoryReplace = {
  op: "replace";
  from: string;
  to: string;
  wrap: StoryNode[];
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

type StoryResponseEndMenu = {
  op: "**";
};

type StoryMenu = {
  op: "menu";
  responses: StoryResponse[];
  combo?: "combo";
};

export type Story = StoryNode[];

// state
let state = {
  current: -1,
  chosen: [] as string[],
  story: [] as Story,
  templates: [] as StoryCutCopy[],
  replacements: [] as StoryReplace[],
  the: {} as Record<string, string>,
};

// helpers
let publishedElement = document.getElementById("published")!;
let menus: MenuElement[] = [];
let outermostMenu: MenuElement | false = false;
let previousMenuWantsToCombo: string | false = false;

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
  const out = state.replacements.reduce((sum, each) => sum.replaceAll(new RegExp(`\\b${each.from}\\b`, "g"), each.to), node);
  el.appendChild(document.createTextNode(out));
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

function renderStoryNodeLoneResponse(optionText: StoryResponse): false {
  const button = document.createElement("button");
  addResponseToMenu(button);
  optionText.forEach(segment => renderStoryNode(segment, button));
  return false;
}

function renderStoryNodeResponses(node: StoryMenu, el: HTMLElement): MenuElement | false {
  if (!Array.isArray(node.responses)) throw new Error("Expected responses to be an array");
  const menu = createNewMenu(); // do this here so GOTO immediately knows if it's conditional or not
  for (let response of node.responses) {
    if (!response || typeof response === "string") continue;
    renderStoryNodeLoneResponse(response);
  }
  return renderStoryResponseEndMenu(node, el);
}

/**
 * This function ends a menu, either via [/menu] or **
 * It returns truthy to stop rendering and await user input. It returns the (top-most / outermost) menu to show the user first.
 *
 * Before appending the menu to the Publish element, it asks if the previous menu wanted to combo.
 * If so, then instead of appending itself to Publish it'll append (clones of) itself to each of previous menu's responses.
 *
 * on [/menu combo] sets "previousMenuWantsToCombo" and returns false so rendering won't await user; we need the secondary menu to render first.
 *
 * if previous did not want a combo, and this isn't a submenu of a larger menu in-progress, then this is the outermostMenu.
 *
 * only stop for input (return truthy) if this is the outermost menu AND it doesn't want to combo with the following menu.
 *
 * @param node this will be the [menu] node unless you used the ** menu in which case it'll be blank and can't combo
 * @param el published element
 * @returns the outermost menu that needs to stop rendering and await user, or false to keep rendering
 */
function renderStoryResponseEndMenu(node: StoryMenu | undefined, el: HTMLElement): MenuElement | false {
  if (menus.length == 0) return false;
  const menu = menus.pop();
  if (!menu) return false;

  const dataId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  menu.className = dataId;

  if (!previousMenuWantsToCombo) {
    el.appendChild(menu);
    if (menus.length == 0) outermostMenu = menu;
  } else {
    // cycle through all responses for the previous menu and tack on this new menu
    const previousMenus = Array.from(el.getElementsByClassName(previousMenuWantsToCombo));
    for (const previousMenu of previousMenus)
      for (const button of previousMenu.childNodes) {
        button.appendChild(menu.cloneNode(true));
      }
    previousMenuWantsToCombo = false;
  }

  if (node?.combo === "combo") previousMenuWantsToCombo = dataId; // if [/menu combo] was used

  const stopForInputForOutermostMenu = outermostMenu && !(node?.combo === "combo") ? outermostMenu : false;
  return stopForInputForOutermostMenu;
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

function renderStoryNodeOperationCut(node: StoryCutCopy): false {
  state.templates.push(node);
  return false;
}

function renderStoryNodeOperationCopy(node: StoryCutCopy, el: HTMLElement): false | MenuElement {
  renderStoryNodeOperationCut(node);
  return renderStoryNodeOperationPaste(node, el);
}

function renderStoryNodeOperationPaste(node: StoryCutCopy | StoryPaste, el: HTMLElement): false | MenuElement {
  const template = state.templates.find(t => t.name === node.name || t.name?.includes(node.name));
  return template ? renderStoryNodes(template.wrap, el) : false;
}

function renderStoryNodeOperationReplace(node: StoryReplace, el: HTMLElement): false | MenuElement {
  state.replacements.push(node);
  const retval = renderStoryNodes(node.wrap, el);
  state.replacements = state.replacements.filter(r => r != node);
  return retval;
}

function renderStoryNodeThe(node: StoryMatchpoint, el: HTMLElement): false | MenuElement {
  const value = state.the[node.match];
  return value ? renderStoryNode(value, el) : false;
}

function renderStoryNode(node: StoryNode, el: HTMLElement): false | MenuElement {
  if (typeof node === "string") return renderStoryNodeString(node, el);
  if (node.op == "hashtag") return renderStoryNodeHashtag(node, el);
  if (node.op == "plot") return renderStoryNodePlotpoint(node);
  if (node.op == "goto") return renderStoryNodeGoto(node, el);
  if (node.op == "menu") return renderStoryNodeResponses(node, el);
  if (node.op == "*") return renderStoryNodeLoneResponse(node.option);
  if (node.op == "**") return renderStoryResponseEndMenu(undefined, el);
  if (node.op == "if") return renderStoryNodeOperationIf(node, el);
  if (node.op == "did") return renderStoryNodeOperationDid(node, el);
  if (node.op == "unless") return renderStoryNodeOperationIfnot(node, el);
  if (node.op == "didnt") return renderStoryNodeOperationDidnot(node, el);
  if (node.op == "cut") return renderStoryNodeOperationCut(node);
  if (node.op == "copy") return renderStoryNodeOperationCopy(node, el);
  if (node.op == "paste") return renderStoryNodeOperationPaste(node, el);
  if (node.op == "replace") return renderStoryNodeOperationReplace(node, el);
  if (node.op == "the") return renderStoryNodeThe(node, el);
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
  outermostMenu = false;
  if (!stopForInput) return renderTheEnd();
  return multimenu(stopForInput).then(({ chosen, goingTo }) => {
    if (chosen) state.chosen.push(chosen);
    if (chosen) state.the["choice"] = chosen;
    if (goingTo) performGoto(goingTo);
    return renderCurrentTurn();
  });
}

//////////////////////
// near entry point
export async function interpreter(story: Story): Promise<void> {
  state = { story, current: -1, chosen: [], templates: [], replacements: [], the: {} };
  publishedElement = document.getElementById("published")!;
  publishedElement.innerHTML = "";
  menus = [];
  outermostMenu = false;
  previousMenuWantsToCombo = false;
  return renderCurrentTurn();
}

// far entry point
export async function loadStory(filename: string, pwa = false) {
  if (pwa && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  const story: Story = await fetch(filename).then(r => r.json());
  return interpreter(story);
}

import "../../editor/window.d.ts";
window.interpreter = interpreter;
window.loadStory = loadStory;
document.dispatchEvent(new Event("interpreter"));
