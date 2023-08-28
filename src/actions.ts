import type { Attempt } from "./attempts";
import type { ShouldBe, ShouldBeStatement } from "./beliefs";
import type { Character } from "./character";
import { console_log, printAttempt, stringifyAttempt } from "./debug";
import { type Desireable, type Resource } from "./iPlot";
import { createNewsItem, type News } from "./news";
import { weCouldTry, whatTheyAreTryingToDoNowRegarding } from "./planningTree";
import { executeRulebook, type RuleOutcome, type Rulebook, type RulebookWithOutcome } from "./rulebooks";
import { story } from "./story";

export type Verb = string;
export type Noun = Desireable;

export interface AbstractActionDefinition<N = Resource, SN = Resource> {
  verb: Verb;
  rulebooks?: {
    check?: RulebookWithOutcome<N, SN>;
    moveDesireables?: (attempt: Attempt<N, SN>) => ShouldBeStatement[];
    news?: Rulebook<N, SN>;
  };
}

export interface ActionDefinition<N = Noun, SN = Noun> extends AbstractActionDefinition<Noun, Noun> {}

/** performs the action */
export function doThingAsAScene(thisAttempt: Attempt, viewpointCharacter: Character): RuleOutcome {
  doThing(thisAttempt, viewpointCharacter);

  while (thisAttempt.status == "partly successful") {
    let subAttempt = whatTheyAreTryingToDoNowRegarding(thisAttempt.actor, thisAttempt);
    console_log("same scene, now", stringifyAttempt(subAttempt));
    if (subAttempt) doThing(subAttempt, viewpointCharacter);
    else {
      console_log("STUCK:", stringifyAttempt(thisAttempt));
      break;
    }
  }

  return thisAttempt.status == "successful" ? "success" : thisAttempt.status == "failed" ? "failed" : "failed";
}

/** performs the action */
function doThing(thisAttempt: Attempt, viewpointCharacter: Character): Attempt["status"] {
  // DO the currentAction and get status
  const outcome = executeRulebook(thisAttempt);
  console_log(thisAttempt.verb, "is done:", outcome);

  thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";

  // update trees to record result
  if (thisAttempt.status == "partly successful")
    console_log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));

  return thisAttempt.status;
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
