import type { ActionDefinition } from "./actions";
import type { Character } from "./character";
import { createSceneSet, type ChoiceConsequenceClosure } from "./choiceConsequenceClosure";
import { News } from "./news";
import { console_log, produceParagraphs } from "./produceParagraphs";
import { getNextScene, playScene, type Scene } from "./scene";

export interface Story {
  characters: Character[];
  readonly actionset: ActionDefinition<any, any>[];
  sceneStack: ChoiceConsequenceClosure[];
  history: News[];
  currentTurnsNews: News[];
}

export function playStory(firstScene: Scene | undefined, characters: Character[], actionset: ActionDefinition<any, any>[]): void {
  // initialize story
  const story: Story = { characters, actionset, sceneStack: [], history: [], currentTurnsNews: [] };
  if (firstScene) createSceneSet(story, { choice: "ally", scene: firstScene });

  let turn = 0;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene(story)) {
    console_log("TURN", ++turn);

    // characters act // creates scene types of Action
    const outcome = playScene(currentScene, story);

    console_log("END TURN", turn);
    produceParagraphs(characters);
    if (turn > 7) break;
  }
}
