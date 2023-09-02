import type { ActionDefinition } from "./actions";
import type { Attempt } from "./attempts";
import type { Character } from "./characters";
import { createSceneSet, type ChoiceConsequenceClosure } from "./consequences";
import { type News } from "./news";
import { console_log, publish, stringify } from "./paragraphs";
import { type Desireable } from "./resources";
import { getNextScene, playScene, type Scene, type SceneType } from "./scenes";

export interface SolicitPlayerInput {
  (story: Story, viewpointCharacter: Character): Promise<Attempt | undefined>;
}

export interface Story {
  readonly characters: Character[];
  readonly actionset: ActionDefinition<any, any>[];
  readonly desireables: Record<symbol, Desireable>;
  readonly getPlayerInput: SolicitPlayerInput;
  readonly notableScenes: SceneType[];

  readonly sceneStack: ChoiceConsequenceClosure[];
  readonly history: News[];
}

export async function playStory(
  characters: Character[],
  actionset: ActionDefinition<any, any>[],
  desireables: Record<symbol, Desireable>,
  notableScenes: SceneType[],
  getPlayerInput: SolicitPlayerInput,
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
  };
  if (firstScene) createSceneSet(story, { choice: "ally", scene: firstScene });

  let turn = 0;

  // debugging input
  // const turn0 = await getPlayerInput(story, firstScene!.actor);
  // publish(stringify(turn0));

  let suggestedNextScene: Scene | undefined;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene(story, suggestedNextScene)) {
    console_log("TURN", ++turn);

    // characters act // creates scene types of Action
    suggestedNextScene = await playScene(currentScene, story);

    console_log("END TURN", turn);
    console_log(stringify(characters));
    if (turn > 7) break;
  }
  publish("THE END");
  console_log(stringify(story.sceneStack));
  return story;
}
