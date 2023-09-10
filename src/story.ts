import type { ActionDefinition } from "./actions";
import type { Advice } from "./advice";
import type { Attempt } from "./attempts";
import type { Character } from "./characters";
import { createSceneSet, type ChoiceConsequenceClosure } from "./consequences";
import type { News } from "./news";
import { publish, publishStyled, stringifyAction } from "./paragraphs";
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

  let turn = 0;

  let suggestedNextScene: Scene | undefined;
  for (let currentScene = firstScene; currentScene; currentScene = getNextScene(story, suggestedNextScene)) {
    // characters act // creates scene types of Action
    suggestedNextScene = await playScene(currentScene, story);

    // debugging input
    const turn0 = await getPlayerInput(story, firstScene!.viewpoint, firstScene);
    publishStyled({ className: "b" }, stringifyAction(turn0) + ".");
    // ////

    //console_log(stringify(characters));
    if (turn++ > 7) break;
  }

  publish("THE END");
  //console_log(stringify(story.sceneStack));
  return story;
}
