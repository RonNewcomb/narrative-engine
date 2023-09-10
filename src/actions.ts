import { createAttempt, did, didnt, trying, untried, type Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import type { Character } from "./characters";
import { createNewsItem, type News } from "./news";
import { publish, stringifyAttempt } from "./paragraphs";
import { weCouldTry } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { can, cant, type Rulebooks } from "./rulebooks";
import type { Story } from "./story";

export type Verb = string;
export type Noun = Desireable | Character; // Resource? ShouldBe? must have a .name

export interface ActionDefinition<N extends Resource = Noun, SN extends Resource = Noun> extends Rulebooks<N, SN> {
  verb: Verb;
}

export function isActionDefinition(obj: any): boolean {
  return obj.verb;
}

export const ActionResults: readonly Attempt["status"][] = [did, didnt, trying, untried] as const;

export const ReflectUpon: ActionDefinition<Attempt> = {
  verb: "reflect upon attempting _",
  narrate: [attempt => attempt.actor.name + " reflected."],
};

export const SpreadNewsToOthers: ActionDefinition<News, Character[]> = {
  verb: "spread news of _ to _",
  can: [
    (attempt, story) => {
      if (!attempt.noun || !attempt.secondNoun) return cant;
      const news = createNewsItem(attempt.noun, story);
      for (const character of attempt.secondNoun || []) {
        const newGoal = createAttempt(character, ReceivingImportantNews, news, undefined, undefined);
        character.goals!.push(newGoal);
      }
      return can;
    },
  ],
};

export const StuckForSolutions: ActionDefinition<Attempt> = {
  verb: "search for solutions to _",
  can: [
    async (attempt, story, scene) => {
      if (!attempt.actor.playersChoice) return can;
      const choice = await attempt.actor.playersChoice(story, attempt.actor, scene);
      if (choice) return weCouldTry(choice.actor, choice.definition, choice.noun, choice.secondNoun, attempt);
    },
  ],
};

export const ReceivingImportantNews: ActionDefinition<News, ShouldBe> = {
  verb: "receive news of _, but _",
  can: [
    (attempt, story) => {
      const news = attempt.noun;
      const belief = attempt.secondNoun;
      if (!news) throw "missing News for ReceivingImportantNews";
      if (!belief) throw "missing Belief for ReceivingImportantNews";
      publish(attempt.actor, attempt.definition, '"', stringifyAttempt(news), ' is bad news."');

      const actions = findActions(news, belief, story);
      for (const action of actions) weCouldTry<any, any>(attempt.actor, action, news.noun, news.secondNoun, attempt);

      return cant;
    },
  ],
};

function findActions(badNews: Attempt<any, any>, shouldBe: ShouldBe, story: Story): ActionDefinition<any, any>[] {
  const retval: ActionDefinition<any, any>[] = [];
  for (const action of story.actionset) {
    const effects = action.change?.(badNews, story) || [];
    for (const effect of effects)
      if (
        shouldBe.property == effect[0] &&
        shouldBe.ofDesireable == effect[1] &&
        shouldBe.shouldBe == effect[2] &&
        shouldBe.toValue == effect[3]
      )
        retval.push(action);
  }
  return retval;
}
