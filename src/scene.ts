import { doThingAsAScene, type Attempt } from "./attempts";
import { type Character } from "./character";
import { type Resource } from "./iPlot";
import { console_error, console_log, stringifyAttempt } from "./produceParagraphs";
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

/////////

export interface Scene {
  pulse: Attempt<Resource, Resource>;
  isFinished?: boolean;
  result?: RuleOutcome;
  actor: Character;
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

export function createScene(actor: Character, pulse: Attempt<Resource, Resource>): Scene {
  const scene: Scene = { pulse, actor };
  return scene;
}

export function playScene(scene: Scene, story: Story): RuleOutcome {
  const character = scene.actor;
  const sceneAction = scene.pulse; // whatTheyAreTryingToDoNow(character);
  console_log("BEGIN", scene.pulse.verb, "SCENE:", character.name, stringifyAttempt(sceneAction));
  if (!sceneAction) console_error("no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?");
  if (sceneAction) scene.result = doThingAsAScene(sceneAction, scene, story);
  scene.isFinished = true;
  return scene.result;
}

export function getNextScene(story: Story): Scene | undefined {
  const startScenes = story.sceneStack.filter(s => !s.choice.scene.isFinished);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = story.sceneStack.filter(s => s.consequences && s.consequences.length && !s.consequences[0].scene.isFinished);
  if (midScenes.length) return midScenes[0].consequences![0].scene; // TODO loop through consequences
  const endScenes = story.sceneStack.filter(s => !s.closure.scene.isFinished);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  console_log("END STORY", story.sceneStack);
  return undefined;
}
