import type { Attempt } from "./attempts";
import type { ShouldBe, ShouldBeStatement } from "./beliefs";
import { console_log, printAttempt } from "./debug";
import { type Desireable, type Resource } from "./iPlot";
import { createNewsItem, type News } from "./news";
import { weCouldTry } from "./planningTree";
import { type Rulebook, type RulebookWithOutcome } from "./rulebooks";
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

export const ReflectUpon: AbstractActionDefinition<Attempt> = {
  verb: "reflecting upon _",
  rulebooks: {
    news: {
      rules: [attempt => console_log(attempt.actor.name, "reflected."), createNewsItem],
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

          const actions = findActions(news, belief);
          for (const action of actions) weCouldTry<any, any>(attempt.actor, action, news.noun, news.secondNoun, attempt);

          return "failed";
        },
      ],
    },
  },
};

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

export const StuckForSolutions: AbstractActionDefinition<Attempt> = {
  verb: "searching for solutions to _",
};
