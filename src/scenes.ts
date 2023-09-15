import { textGen } from "./advice";
import { doThingAsAScene, type Attempt } from "./attempts";
import { type Character } from "./characters";
import { paragraph } from "./layout";
import { console_error, publish, publishHTML, stringifyAction } from "./paragraphs";
import { type Resource } from "./resources";
import { can, type CanOrCantOrTryThese } from "./rulebooks";
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
  beginning?: (texts: string[], attempt: Attempt, story: Story, scene: Scene) => ResultOfBeginScene | Promise<ResultOfBeginScene>;
  middle?: (texts: string[], attempt: Attempt, story: Story, scene: Scene) => ResultOfMidScene | Promise<ResultOfMidScene>;
  end?: (texts: string[], attempt: Attempt, story: Story, scene: Scene) => ResultOfEndScene | Promise<ResultOfEndScene>;
}

export function isSceneType(obj: any): boolean {
  return obj.match || obj.beginning || obj.middle || obj.end;
}

export type ResultOfBeginScene = string | void;
export type ResultOfMidScene = CanOrCantOrTryThese;
export type ResultOfEndScene = Scene | void | undefined;

export const defaultSceneType: SceneType = {
  match: () => true,
  beginning: (texts, attempt, story, scene) => {
    if (texts.length) texts.forEach(text => publish(attempt.actor, attempt.definition, text));
    else
      publish(attempt.actor, attempt.definition, attempt.actor.name + " arrives to " + stringifyAction(attempt, { omitActor: true }) + ".");
  },
  middle: (texts, attempt, story, scene) => {
    if (texts.length) texts.forEach(text => publish(attempt.actor, attempt.definition, text));
    if (attempt) return doThingAsAScene(attempt, scene, story);
    console_error("no scene action");
    return can; // TODO i guess?
  },
  end: (texts, attempt, story, scene) => {
    if (texts.length) texts.forEach(text => publish(attempt.actor, attempt.definition, text));
    else publish(attempt.actor, attempt.definition, attempt.actor.name, "leaves.");
    publishHTML(paragraph([], { className: "endscene" }));
  },
};

/////////

export const begin = "begin";
export const mid = "mid";
export const end = "end";
export type ScenePosition = typeof begin | typeof mid | typeof end;
export const ScenePositions: readonly ScenePosition[] = [begin, mid, end] as const;

export interface Scene {
  pulse: Attempt<Resource, Resource>;
  viewpoint: Character;
  result?: CanOrCantOrTryThese;
  position: ScenePosition;
}
// can a ShouldBe be supported, ArgMap-like, by smaller ShouldBes,
// so that each reflective scene knocks down a supporting ShouldBe until no support exists,
// and a final blow to break the larger ShouldBe ?

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
  // if (playbook) console.warn("FOUND", playbook);
  const phase = "";

  scene.position = begin;
  const beginning = playbook?.beginning ?? defaultSceneType.beginning;
  if (beginning) {
    const texts = story.narrationRules
      .map(rule => rule(scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .map(textFn => textGen(textFn, scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .filter(x => !!x);
    const retval = beginning(texts, scene.pulse, story, scene);
    publish(scene.viewpoint, scene.pulse.definition, await Promise.resolve(retval));
  }

  scene.position = mid;
  const middle = playbook?.middle ?? defaultSceneType.middle;
  if (middle) {
    const texts = story.narrationRules
      .map(rule => rule(scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .map(textFn => textGen(textFn, scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .filter(x => !!x);
    const retval = middle?.(texts, sceneAction, story, scene);
    scene.result = await Promise.resolve(retval);
  }

  scene.position = end;
  const ending = playbook?.end ?? defaultSceneType.end;
  if (ending) {
    const texts = story.narrationRules
      .map(rule => rule(scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .map(textFn => textGen(textFn, scene.pulse, scene, story, scene.pulse.consequences, scene.pulse.fullfilledBy, phase))
      .filter(x => !!x);
    const suggestedNextScene = ending?.(texts, scene.pulse, story, scene);
    return (await Promise.resolve(suggestedNextScene)) || undefined;
  }

  return undefined;
}

export function getNextScene(story: Story, suggestedNextScene?: Scene): Scene | undefined {
  if (suggestedNextScene) return suggestedNextScene; // TODO sometimes we want a Meanwhile or other interstitial
  const startScenes = story.sceneStack.filter(s => s.choice.scene.position !== end);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = story.sceneStack.filter(
    s => s.consequences && s.consequences.length && s.consequences.some(c => c.scene.position !== end)
  );
  if (midScenes.length) return midScenes[0].consequences.find(c => c.scene.position !== end)!.scene;
  const endScenes = story.sceneStack.filter(s => s.closure.scene.position !== end);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  return undefined;
}
