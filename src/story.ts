import type { ActionDefinition } from "./actions";
import type { Attempt } from "./attempts";
import type { Character } from "./characters";
import { createSceneSet, type ChoiceConsequenceClosure } from "./consequences";
import { News } from "./news";
import { console_log, publish, stringify } from "./paragraphs";
import { Desireable } from "./resources";
import { SceneRulebook, getNextScene, playScene, type Scene } from "./scenes";

export interface Story {
  characters: Character[];
  readonly actionset: ActionDefinition<any, any>[];
  desireables: Record<symbol, Desireable>;
  getPlayerInput: (story: Story, viewpointCharacter: Character) => Promise<Attempt | undefined>;
  notableScenes: SceneRulebook[];

  sceneStack: ChoiceConsequenceClosure[];
  history: News[];
  currentTurnsNews: News[];
}

export async function playStory(
  characters: Character[],
  actionset: ActionDefinition<any, any>[],
  desireables: Record<symbol, Desireable>,
  notableScenes: SceneRulebook[],
  getPlayerInput: (story: Story, viewpointCharacter: Character) => Promise<Attempt | undefined>,
  firstScene?: Scene
) {
  // initialize story
  const story: Story = {
    characters,
    actionset,
    desireables,
    getPlayerInput,
    notableScenes,
    sceneStack: [],
    history: [],
    currentTurnsNews: [],
  };
  if (firstScene) createSceneSet(story, { choice: "ally", scene: firstScene });

  let turn = 0;

  // debug
  const turn0 = await getPlayerInput(story, firstScene!.actor);
  publish(stringify(turn0));

  for (let currentScene = firstScene; currentScene; currentScene = getNextScene(story)) {
    console_log("TURN", ++turn);

    // characters act // creates scene types of Action
    const outcome = playScene(currentScene, story);

    console_log("END TURN", turn);
    console_log(stringify(characters));
    if (turn > 7) break;
  }
  publish("THE END");
  console_log(stringify(story.sceneStack));
  return story;
}
