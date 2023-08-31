import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import type { Character } from "./characters";
import { createNewsItem, type News } from "./news";
import { publish, stringifyAttempt } from "./paragraphs";
import { weCouldTry } from "./planningTree";
import { type Desireable, type Resource } from "./resources";
import type { Rulebooks } from "./rulebooks";
import type { Story } from "./story";

export type Verb = string;
export type Noun = Desireable | Character; // Resource?

export interface AbstractActionDefinition<N = Resource, SN = Resource> {
  verb: Verb;
  rulebooks?: Rulebooks<N, SN>;
}

export interface ActionDefinition<N = Noun, SN = Noun> extends AbstractActionDefinition<Noun, Noun> {}

export const ReflectUpon: AbstractActionDefinition<Attempt> = {
  verb: "reflect upon attempting _",
  rulebooks: {
    news: {
      rules: [attempt => publish(attempt.actor.name, "reflected."), createNewsItem],
    },
  },
};

export const ReceivingImportantNews: AbstractActionDefinition<News, ShouldBe> = {
  verb: "receive news of _, but _",
  rulebooks: {
    check: {
      rules: [
        (attempt, story) => {
          const news = attempt.noun;
          const belief = attempt.secondNoun;
          if (!news) throw "missing News for ReceivingImportantNews";
          if (!belief) throw "missing Belief for ReceivingImportantNews";
          publish('"', stringifyAttempt(news), ' is bad news."');

          const actions = findActions(news, belief, story);
          for (const action of actions) weCouldTry<any, any>(attempt.actor, action, news.noun, news.secondNoun, attempt);

          return "failed";
        },
      ],
    },
  },
};

function findActions(badNews: Attempt<any, any>, shouldBe: ShouldBe, story: Story): ActionDefinition<any, any>[] {
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
  verb: "search for solutions to _",
};
