import { AbstractActionDefinition, ActionDefinition, Attempt, RuleOutcome, doThingAsAScene } from "./actions";
import { ShouldBe } from "./beliefs";
import { Character } from "./character";
import { console_error, console_log, printAttempt, stringifyAttempt } from "./debug";
import { Resource } from "./iPlot";
import { News, createNewsItem } from "./news";
import { weCouldTry } from "./planningTree";
import { story } from "./story";

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

export function getNextScene(): Scene | undefined {
  const startScenes = story.sceneStack.filter(s => !s.choice.scene.isFinished);
  if (startScenes.length) return startScenes[0].choice.scene;
  const midScenes = story.sceneStack.filter(s => s.consequence && !s.consequence.scene.isFinished);
  if (midScenes.length) return midScenes[0].consequence!.scene;
  const endScenes = story.sceneStack.filter(s => !s.closure.scene.isFinished);
  if (endScenes.length) return endScenes.reverse()[0].closure.scene;
  console_log("END STORY", story.sceneStack);
  return undefined;
}

/** outputs: scene success/failure/complication and news of what happened */
export function playScene(scene: Scene): News[] {
  const character = scene.actor;
  const sceneAction = scene.pulse; // whatTheyAreTryingToDoNow(character);
  console_log("BEGIN", scene.pulse.verb, "SCENE:", character.name, stringifyAttempt(sceneAction));
  if (!sceneAction) console_error("no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?");
  if (sceneAction) scene.result = doThingAsAScene(sceneAction, character);
  scene.isFinished = true;
  return story.currentTurnsNews;
}

export const ReflectUpon: AbstractActionDefinition<Attempt> = {
  verb: "reflecting upon _",
  rulebooks: {
    news: {
      rules: [attempt => console_log(attempt.actor, "reflected."), createNewsItem],
    },
  },
};

export const GettingBadNews: AbstractActionDefinition<News, ShouldBe> = {
  verb: "getting bad _ news violating _ belief",
  rulebooks: {
    check: {
      rules: [
        attempt => {
          const news = attempt.noun;
          const belief = attempt.secondNoun;
          if (!news) throw "missing News for GettingBadNews";
          if (!belief) throw "missing Belief for GettingBadNews";
          console_log('"', printAttempt(news), ' is bad news."');

          function findActions(badNews: Attempt<any, any>, shouldBe: ShouldBe): ActionDefinition<any, any>[] {
            const retval: ActionDefinition<any, any>[] = [];
            for (const action of story.actionset) {
              const effects = action.rulebooks?.moveDesireables?.(badNews) || [];
              for (const e of effects)
                if (shouldBe.property == e[0] && shouldBe.ofDesireable == e[1] && shouldBe.shouldBe == e[2] && shouldBe.toValue == e[3])
                  retval.push(action);
            }
            return retval;
          }

          const actions = findActions(news, belief);
          for (const action of actions) weCouldTry<any, any>(attempt.actor, action, news.noun, news.secondNoun, attempt);

          return "failed";
        },
      ],
    },
  },
};
