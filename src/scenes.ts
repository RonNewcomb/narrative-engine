import { doThingAsAScene, type Attempt } from "./attempts";
import { type Character } from "./characters";
import { console_error, publish, stringifyAction } from "./paragraphs";
import { type Resource } from "./resources";
import { type RuleOutcome } from "./rulebooks";
import { type Story } from "./story";

/**
 * scene beginning
 * - rarely interactive
 * - sets the stage
 * - its pulse is the Action the actor is attempting
 *
 * scene middle
 * - usually highly interactive
 * - toy commands OK
 * - tends toward conflict or other searching for a way forward
 *
 * scene ending
 * - any interactivity tends to be scene-scheduling level
 * - ends with success, failure, or a complication
 * - might foreshadow later scenes
 *
 */
export interface SceneRulebook {
  match: (attempt: Attempt, story: Story) => boolean;
  beginning?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfBeginScene | Promise<ResultOfBeginScene>;
  middle?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfMidScene | Promise<ResultOfMidScene>;
  end?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfEndScene | Promise<ResultOfEndScene>;
}

export type ResultOfBeginScene = string | void;
export type ResultOfMidScene = RuleOutcome;
export type ResultOfEndScene = Scene | void | undefined;

const SCENEBREAK = "\n   * * *    \n\n";

export const defaultSceneRulebook: SceneRulebook = {
  match: () => true,
  beginning: attempt => attempt.actor.name + " arrives to " + stringifyAction(attempt, { omitActor: true }) + ".",
  middle: (attempt, story, scene) => {
    if (attempt) return doThingAsAScene(attempt, scene, story);
    console_error("no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?");
    return "success";
  },
  end: attempt => {
    publish(attempt.actor.name, "leaves.");
    publish(SCENEBREAK);
  },
};

/////////

export interface Scene {
  pulse: Attempt<Resource, Resource>;
  isFinished?: boolean;
  result?: RuleOutcome;
  viewpoint: Character;
}
// interface ReflectiveScene extends BaseScene {
//   type: "reflective";
//   actor: Character;
//   // can a ShouldBe be supported, ArgMap-like, by smaller ShouldBes,
//   // so that each reflective scene knocks down a supporting ShouldBe until no support exists,
//   // and a final blow to break the larger ShouldBe ?
// }
// SuspenseScene -- scene with a lot of tension
// DramaticScene -- scene with strong emotion

export const ifLater = <T>(x: T | Promise<T>) => (x instanceof Promise ? x : Promise.resolve(x));

export function createScene(pulse: Attempt<Resource, Resource>, viewpoint?: Character): Scene {
  const scene: Scene = { pulse, viewpoint: viewpoint || pulse.actor };
  return scene;
}

export async function playScene(scene: Scene, story: Story): Promise<Scene | undefined> {
  const sceneAction = scene.pulse;
  const scenebook = story.notableScenes.find(sceneRulebook => sceneRulebook.match(sceneAction, story));
  const beginning = scenebook?.beginning ?? defaultSceneRulebook.beginning;
  if (beginning) publish(await ifLater(beginning(scene.pulse, story, scene)));
  const middle = scenebook?.middle ?? defaultSceneRulebook.middle;
  scene.result = await ifLater(middle?.(sceneAction, story, scene));
  scene.isFinished = true;
  const ending = scenebook?.end ?? defaultSceneRulebook.end;
  return (await ifLater(ending?.(scene.pulse, story, scene))) || undefined;
}

export function getNextScene(story: Story, suggestedNextScene?: Scene): Scene | undefined {
  if (suggestedNextScene) return suggestedNextScene; // TODO sometimes we want a Meanwhile or other interstitial
  const startScenes = story.sceneStack.filter(s => !s.choice.scene.isFinished);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = story.sceneStack.filter(s => s.consequences && s.consequences.length && s.consequences.some(c => !c.scene.isFinished));
  if (midScenes.length) return midScenes[0].consequences.find(c => !c.scene.isFinished)!.scene;
  const endScenes = story.sceneStack.filter(s => !s.closure.scene.isFinished);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  return undefined;
}
