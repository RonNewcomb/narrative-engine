import { textGen } from "./advice";
import { did, didnt, trying, type Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import { createNewsItem, reactionsToNews, type News } from "./news";
import { publish } from "./paragraphs";
import type { Resource } from "./resources";
import type { Scene } from "./scenes";
import type { Story } from "./story";

export const can = "can";
export const cant = "cant";
export type CanOrCantOrTryThese = undefined | false | typeof can | typeof cant | Attempt | Attempt[];

export interface Rulebooks<N extends Resource, SN extends Resource> {
  can?: ((attempt: Attempt<N, SN>, story: Story, scene?: Scene) => CanOrCantOrTryThese | Promise<CanOrCantOrTryThese>)[];
  change?: (attempt: Attempt<N, SN>, story: Story) => ShouldBeStatement[];
}

export async function executeRulebook(attempt: Attempt, currentScene: Scene, story: Story): Promise<News> {
  const actionDefinition = attempt.definition;
  if (!actionDefinition) return createNewsItem(attempt, story);
  let outcome: CanOrCantOrTryThese = can;
  if (actionDefinition.can)
    for (const rule of actionDefinition.can) {
      const ruleResult = await Promise.resolve(rule(attempt, story));
      if (ruleResult == cant || typeof ruleResult == "object") {
        outcome = cant;
        break;
      }
    }
  attempt.status = outcome == can ? did : attempt.fullfilledBy.length > 0 ? trying : didnt;
  if (outcome == can && actionDefinition.change) {
    const shouldBeStatements = actionDefinition.change(attempt, story);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  const news = createNewsItem(attempt, story);
  attempt.consequences = reactionsToNews(news, currentScene, story);

  // OUTPUT
  for (const phase of phases)
    for (const rule of story.narrationRules) {
      const textFn = rule(attempt, currentScene, story, attempt.consequences, attempt.fullfilledBy, phase);
      const text: string = textGen(textFn, attempt, currentScene, story, attempt.consequences, attempt.fullfilledBy, phase);
      if (text) publish(attempt.actor, attempt.definition, text);
    }

  return news;
}

export const cause = "cause"; // motivation
export const feel = "feel"; //  involuntary subconscious response
export const flinch = "flinch"; // involuntary body language
export const move = "move"; // conscious body language
export const exclaim = "exclaim"; // semiconscious speech?
export const review = "review"; // review what happened, reasoning out why,
export const consider = "consider"; // consider options available
export const foresee = "foresee"; // anticipation of what follows from those options
export const choose = "choose"; // choice
export const speak = "speak"; // speech
export const phases = [cause, feel, flinch, move, exclaim, review, consider, foresee, choose, speak] as const;
