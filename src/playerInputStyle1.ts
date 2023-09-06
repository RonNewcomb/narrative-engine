import { div, element } from "./layout";
import {
  createAttempt,
  type ActionDefinition,
  type Attempt,
  type Character,
  type Resource,
  type Scene,
  type Story,
} from "./narrativeEngine";
import { stringifyNoun } from "./paragraphs";

export async function getPlayerChoices(
  story: Story,
  viewpointCharacter: Character,
  scene: Scene | undefined
): Promise<Attempt | undefined> {
  return new Promise(async awaited => {
    // pre-existing wrapper
    const published = document.getElementById("published")!;

    // this box
    const playerChoices = div([], { className: "playerChoices" });
    const title = div([], { innerText: viewpointCharacter.name + " will...", className: "title" });
    playerChoices.appendChild(title);

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
      let verb = action.verb;
      for (let i = 0; i < nouns.length; i++) verb = verb.replace("_", stringifyNoun(nouns[i]));
      verb = verb.replace(/_/g, "...");
      title.innerText = viewpointCharacter.name + " will " + verb;
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
    awaited(attempt);
  });
}

// add CSS for playerChoices box via direct side-effects
const playerChoicesCSS = document.createElement("style");
playerChoicesCSS.id = "playerChoicesCSS";
playerChoicesCSS.innerHTML = `
.playerChoices {
    position: fixed;
    top: 1.1em;
    left: 1.2em;
    right: 1.2em;
    padding: 1em;
    background-color: wheat;
    z-index: 2;
    border-radius: 5px;
    box-shadow: wheat 0 0 8px 11px;
}

.playerChoices .title {
  font-style: italic;
}

.playerChoices button, .playerChoiceButton {
  line-height: 2em;
  margin-top: 1em;
  margin-right: 2em;
  border: 0;
  font-family: sans-serif;
  background-color: cadetblue;
  color: white;
  padding: 0.3em 1.2em;
  border-radius: 13px;
}
`;
document.body.appendChild(playerChoicesCSS);

/** set the CSS to use; use the class .playerChoices { .... } */
export async function setPlayerInputCSS(css: string) {
  document.getElementById("playerChoicesCSS")!.innerHTML = css;
  return new Promise(awaited => setTimeout(awaited, 1));
}

async function chooseVerb(
  container: HTMLDivElement,
  actions: ActionDefinition<Resource, Resource>[]
): Promise<ActionDefinition<Resource, Resource>> {
  return new Promise(awaited => {
    // loop through whole palette
    for (const action of actions) {
      // const verb = action.verb.charAt(0).toUpperCase() + action.verb.slice(1).replace(/_/g, "...");
      const verb = action.verb.replace(/_/g, "...");
      const button = element<HTMLButtonElement>("button", { type: "button", innerText: verb, onclick: () => awaited(action) });
      const line = div([button]);
      container.appendChild(line);
    }
  });
}

async function chooseNoun(container: HTMLDivElement, story: Story, action: ActionDefinition<Resource, Resource>): Promise<Resource> {
  return new Promise(awaited => {
    for (const character of story.characters) {
      const button = element("button", { innerText: character.name, onclick: () => awaited(character) });
      const line = div([button]);
      container.appendChild(line);
    }
    const keys = Object.getOwnPropertySymbols(story.desireables);
    for (const key of keys) {
      const desire = story.desireables[key];

      const button = element<HTMLButtonElement>("button", { type: "button", innerText: desire.name, onclick: () => awaited(desire) });
      const line = div([button]);
      container.appendChild(line);
    }
  });
}
