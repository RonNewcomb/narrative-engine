import { doThingAsAScene, type Attempt } from "./attempts";
import { type Character } from "./characters";
import { paragraph } from "./layout";
import { console_error, publish, publishHTML, stringifyAction } from "./paragraphs";
import { type Resource } from "./resources";
import { can, type RuleOutcome } from "./rulebooks";
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
export interface SceneType {
  match: (attempt: Attempt, story: Story) => boolean;
  beginning?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfBeginScene | Promise<ResultOfBeginScene>;
  middle?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfMidScene | Promise<ResultOfMidScene>;
  end?: (attempt: Attempt, story: Story, scene: Scene) => ResultOfEndScene | Promise<ResultOfEndScene>;
}

export function isSceneType(obj: any): boolean {
  return obj.match || obj.beginning || obj.middle || obj.end;
}

export type ResultOfBeginScene = string | void;
export type ResultOfMidScene = RuleOutcome;
export type ResultOfEndScene = Scene | void | undefined;

export const defaultSceneType: SceneType = {
  match: () => true,
  beginning: attempt => attempt.actor.name + " arrives to " + stringifyAction(attempt, { omitActor: true }) + ".",
  middle: (attempt, story, scene) => {
    if (attempt) return doThingAsAScene(attempt, scene, story);
    console_error("no scene action");
    return can; // TODO i guess?
  },
  end: attempt => {
    publish(attempt.actor.name, "leaves.");
    publishHTML(paragraph([], { className: "endscene" }));
  },
};

/////////

export type ScenePosition = "begin" | "mid" | "end";
export const ScenePositions: readonly ScenePosition[] = ["begin", "mid", "end"] as const;

export interface Scene {
  pulse: Attempt<Resource, Resource>;
  isFinished?: boolean;
  result?: RuleOutcome;
  viewpoint: Character;
  position: ScenePosition;
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

export function isScene(obj: any): boolean {
  return obj.pulse && obj.viewpoint;
}

export function createScene(pulse: Attempt<Resource, Resource>, viewpoint?: Character): Scene {
  const scene: Scene = { pulse, viewpoint: viewpoint || pulse.actor, position: "begin" };
  return scene;
}

export async function playScene(scene: Scene, story: Story): Promise<Scene | undefined> {
  const sceneAction = scene.pulse;
  const playbook = story.notableScenes.find(scenetype => scenetype.match(sceneAction, story));
  scene.position = "begin";
  const beginning = playbook?.beginning ?? defaultSceneType.beginning;
  if (beginning) publish(await Promise.resolve(beginning(scene.pulse, story, scene)));
  scene.position = "mid";
  const middle = playbook?.middle ?? defaultSceneType.middle;
  scene.result = await Promise.resolve(middle?.(sceneAction, story, scene));
  scene.isFinished = true;
  scene.position = "end";
  const ending = playbook?.end ?? defaultSceneType.end;
  return (await Promise.resolve(ending?.(scene.pulse, story, scene))) || undefined;
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
