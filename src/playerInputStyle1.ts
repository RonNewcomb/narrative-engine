import { createAttempt } from "./attempts";
import type { Attempt, Character, Story } from "./narrativeEngine";

export async function getPlayerChoices(story: Story, viewpointCharacter: Character): Promise<Attempt | undefined> {
  return new Promise(resolve => {
    // this box
    const playerChoices = document.createElement("div");
    playerChoices.className = "playerChoices";

    // append at the bottom of the published spot
    const published = document.getElementById("published")!;
    published.appendChild(playerChoices);

    // closes the choiceBox and returns to the story
    const onFinished = (attempt?: Attempt) => {
      published.removeChild(playerChoices);
      resolve(attempt);
    };

    // loop through whole palette
    for (const action of story.actionset) {
      const line = document.createElement("div");
      const button = document.createElement("button");
      button.innerText = action.verb;
      button.onclick = () => {
        const attempt = createAttempt(viewpointCharacter, action, undefined, undefined, undefined);
        onFinished(attempt);
      };
      line.appendChild(button);
      playerChoices.appendChild(line);
    }
  });
}

// add CSS for playerChoices box via direct side-effects
const playerChoicesCSS = document.createElement("style");
playerChoicesCSS.id = "playerChoicesCSS";
playerChoicesCSS.innerHTML = `
.playerChoices {
   /* position: fixed;*/
    top: 0px;    
    padding: 1em;
    background-color: wheat;
}
`;
document.body.appendChild(playerChoicesCSS);

/** set the CSS to use; use the class .playerChoices { .... } */
export async function setPlayerInputCSS(css: string) {
  document.getElementById("playerChoicesCSS")!.innerHTML = css;
  return new Promise(r => setTimeout(r, 1));
}
