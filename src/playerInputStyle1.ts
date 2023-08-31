import { createAttempt } from "./attempts";
import type { ActionDefinition, Attempt, Character, Story } from "./narrativeEngine";
import { stringifyNoun } from "./paragraphs";
import { Resource } from "./resources";

export async function getPlayerChoices(story: Story, viewpointCharacter: Character): Promise<Attempt | undefined> {
  return new Promise(async resolve => {
    // this box
    const playerChoices = document.createElement("div");
    playerChoices.className = "playerChoices";

    // append at the bottom of the published spot
    document.getElementById("published")!.appendChild(playerChoices);

    // choose verb panel
    let panel = document.createElement("div");
    playerChoices.appendChild(panel);
    const action = await chooseVerb(panel, story.actionset);
    playerChoices.removeChild(panel);

    let actionName = action.verb;
    const nouns: Resource[] = [];

    // choose noun panel
    while (actionName.includes("_")) {
      panel = document.createElement("div");
      playerChoices.appendChild(panel);

      const title = document.createElement("div");
      title.innerText = actionName;
      panel.appendChild(title);

      const noun = await chooseNoun(panel, story);
      playerChoices.removeChild(panel);
      actionName = actionName.replace("_", stringifyNoun(noun));
      nouns.push(noun);
    }

    // closes the choiceBox
    document.getElementById("published")!.removeChild(playerChoices);

    // returns to the story
    const attempt = createAttempt(viewpointCharacter, action, nouns[0] as any, nouns[1] as any, undefined);
    resolve(attempt);
  });
}

// add CSS for playerChoices box via direct side-effects
const playerChoicesCSS = document.createElement("style");
playerChoicesCSS.id = "playerChoicesCSS";
playerChoicesCSS.innerHTML = `
.playerChoices {
    position: fixed;
    top: 0px;    
    padding: 1em;
    background-color: wheat;
    z-index: 2;
}
`;
document.body.appendChild(playerChoicesCSS);

/** set the CSS to use; use the class .playerChoices { .... } */
export async function setPlayerInputCSS(css: string) {
  document.getElementById("playerChoicesCSS")!.innerHTML = css;
  return new Promise(r => setTimeout(r, 1));
}

async function chooseVerb(div: HTMLDivElement, actions: ActionDefinition[]): Promise<ActionDefinition> {
  return new Promise(resolve => {
    // loop through whole palette
    for (const action of actions) {
      const line = document.createElement("div");
      const button = document.createElement("button");
      button.innerText = action.verb;
      button.onclick = () => resolve(action);
      line.appendChild(button);
      div.appendChild(line);
    }
  });
}

async function chooseNoun(div: HTMLDivElement, story: Story): Promise<Resource> {
  return new Promise(resolve => {
    for (const character of story.characters) {
      const line = document.createElement("div");
      const button = document.createElement("button");
      button.innerText = character.name;
      button.onclick = () => resolve(character);
      line.appendChild(button);
      div.appendChild(line);
    }
    const desireables = Object.getOwnPropertySymbols(story.desireables);
    for (const each of desireables) {
      const desireable = story.desireables[each];
      const line = document.createElement("div");
      const button = document.createElement("button");
      button.innerText = desireable.name;
      button.onclick = () => resolve(desireable);
      line.appendChild(button);
      div.appendChild(line);
    }
  });
}
