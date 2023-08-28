import type { ActionDefinition } from "./actions";
import type { Character } from "./character";
import { createSceneSet, type ChoiceConsequenceClosure } from "./choiceConsequenceClosure";
import { console_log } from "./debug";
import { News, runNewsCycle } from "./news";
import { produceParagraphs } from "./produceParagraphs";
import { Scene, getNextScene, playScene } from "./scene";

export let story: {
  characters: Character[];
  actionset: ActionDefinition<any, any>[];
  sceneStack: ChoiceConsequenceClosure[];
  history: News[];
  currentTurnsNews: News[];
} = { characters: [], actionset: [], sceneStack: [], history: [], currentTurnsNews: [] };

export function playStory(firstScene: Scene | undefined, characters: Character[], actionset: ActionDefinition<any, any>[]): void {
  story = { characters, actionset, sceneStack: [], history: [], currentTurnsNews: [] };

  if (firstScene) createSceneSet({ choice: "ally", scene: firstScene });

  let turn = 0;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene()) {
    produceParagraphs(characters);
    console_log("TURN", ++turn);

    // characters act // creates scene types of Action
    const news = playScene(currentScene);
    // react to news // creates scene types of Reaction
    runNewsCycle(news, currentScene);

    if (turn > 7) break;
  }
}
