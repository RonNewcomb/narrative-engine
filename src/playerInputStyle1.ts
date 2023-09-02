import { div, element } from "./layout";
import { createAttempt, type ActionDefinition, type Attempt, type Character, type Resource, type Story } from "./narrativeEngine";
import { stringifyNoun } from "./paragraphs";

export async function getPlayerChoices(story: Story, viewpointCharacter: Character): Promise<Attempt | undefined> {
  return new Promise(async resolve => {
    // pre-existing wrapper
    const published = document.getElementById("published")!;

    // this box
    const playerChoices = div([], { className: "playerChoices" });

    // append at the bottom of the published spot
    published.appendChild(playerChoices);

    // choose verb panel
    let panel = div();
    playerChoices.appendChild(panel);
    const action = await chooseVerb(panel, story.actionset);
    playerChoices.removeChild(panel);

    const nouns: Resource[] = [];
    let noun: Resource;

    // choose noun panel
    for (let actionName = action.verb; actionName.includes("_"); actionName = actionName.replace("_", stringifyNoun(noun))) {
      const title = div([], { innerText: actionName });
      panel = div([title]);

      playerChoices.appendChild(panel);
      noun = await chooseNoun(panel, story, action);
      playerChoices.removeChild(panel);

      nouns.push(noun);
    }

    // closes the choiceBox
    published.removeChild(playerChoices);

    // returns to the story
    const attempt = createAttempt<Resource, Resource>(viewpointCharacter, action, nouns[0], nouns[1], undefined);
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

async function chooseVerb(
  container: HTMLDivElement,
  actions: ActionDefinition<Resource, Resource>[]
): Promise<ActionDefinition<Resource, Resource>> {
  return new Promise(resolve => {
    // loop through whole palette
    for (const action of actions) {
      const button = element("button", { innerText: action.verb, onclick: () => resolve(action) });
      const line = div([button]);
      container.appendChild(line);
    }
  });
}

async function chooseNoun(container: HTMLDivElement, story: Story, action: ActionDefinition<Resource, Resource>): Promise<Resource> {
  return new Promise(resolve => {
    for (const character of story.characters) {
      const button = element("button", { innerText: character.name, onclick: () => resolve(character) });
      const line = div([button]);
      container.appendChild(line);
    }
    const keys = Object.getOwnPropertySymbols(story.desireables);
    for (const key of keys) {
      const desireable = story.desireables[key];

      const button = element("button", { innerText: desireable.name, onclick: () => resolve(desireable) });
      const line = div([button]);
      container.appendChild(line);
    }
  });
}
