import type { ActionDefinition } from "./actions";
import type { Advice } from "./advice";
import type { Attempt } from "./attempts";
import { narrator, type Character } from "./characters";
import { createSceneSet, type ChoiceConsequenceClosure } from "./consequences";
import type { News } from "./news";
import { publish } from "./paragraphs";
import type { Desireable } from "./resources";
import { getNextScene, playScene, type Scene, type SceneType } from "./scenes";

export interface SolicitPlayerInput {
  (story: Story, viewpointCharacter: Character, currentScene: Scene | undefined): Promise<Attempt | undefined>;
}

export interface Story {
  readonly characters: Character[];
  readonly actionset: ActionDefinition<any, any>[];
  readonly desireables: Record<symbol, Desireable>;
  readonly getPlayerInput: SolicitPlayerInput;
  readonly notableScenes: SceneType[];
  readonly narrationRules: Advice[];

  readonly sceneStack: ChoiceConsequenceClosure[];
  readonly history: News[];
}

export async function playStory(
  characters: Character[],
  actionset: ActionDefinition<any, any>[],
  desireables: Record<symbol, Desireable>,
  notableScenes: SceneType[],
  narrationRules: Advice[],
  getPlayerInput: SolicitPlayerInput,
  firstScene?: Scene
) {
  // initialize story
  const story: Story = { characters, actionset, desireables, getPlayerInput, notableScenes, narrationRules, sceneStack: [], history: [] };
  if (firstScene) createSceneSet(story, { choice: "ally", scene: firstScene });

  let sceneCount = 0;

  let suggestedNextScene: Scene | undefined;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene(story, suggestedNextScene)) {
    // characters act // creates scene types of Action
    suggestedNextScene = await playScene(currentScene, story);

    //console_log(stringify(characters));
    if (sceneCount++ > 7) {
      publish(narrator, undefined, "TIME OVER.");
      break;
    }
  }

  publish(narrator, undefined, "END.");
  //console_log(stringify(story.sceneStack));
  return story;
}
