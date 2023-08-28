import type { ActionDefinition } from "./actions";
import type { Character } from "./character";
import { createSceneSet, type ChoiceConsequenceClosure } from "./choiceConsequenceClosure";
import { News } from "./news";
import { console_log, produceParagraphs } from "./produceParagraphs";
import { getNextScene, playScene, type Scene } from "./scene";

export let story: {
  characters: Character[];
  actionset: ActionDefinition<any, any>[];
  sceneStack: ChoiceConsequenceClosure[];
  history: News[];
  currentTurnsNews: News[];
} = { characters: [], actionset: [], sceneStack: [], history: [], currentTurnsNews: [] };

export function playStory(firstScene: Scene | undefined, characters: Character[], actionset: ActionDefinition<any, any>[]): void {
  // initialize story
  story = { characters, actionset, sceneStack: [], history: [], currentTurnsNews: [] };
  if (firstScene) createSceneSet({ choice: "ally", scene: firstScene });

  let turn = 0;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene()) {
    console_log("TURN", ++turn);

    // characters act // creates scene types of Action
    const outcome = playScene(currentScene);

    console_log("END TURN", turn);
    produceParagraphs(characters);
    if (turn > 7) break;
  }
}
