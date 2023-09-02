import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import { ConsequenceWithForeshadowedNewsProvingAgency } from "./consequences";
import { createNewsItem, News, reactionsToNews, resetNewsCycle } from "./news";
import { publish, stringifyAction, stringifyAttempt } from "./paragraphs";
import type { Resource } from "./resources";
import { Scene } from "./scenes";
import type { Story } from "./story";

export const can = "can";
export const cant = "cant";
export const could = can;
export const couldnt = cant;
export type RuleOutcome = undefined | false | typeof can | typeof cant | Attempt | Attempt[];
export type AttemptResult = typeof could | typeof couldnt;

export interface Rulebooks<N extends Resource, SN extends Resource> {
  can?: ((attempt: Attempt<N, SN>, story: Story) => RuleOutcome | Promise<RuleOutcome>)[];
  change?: (attempt: Attempt<N, SN>, story: Story) => ShouldBeStatement[];
  narrate?: ((attempt: Attempt<N, SN>, consequences: ConsequenceWithForeshadowedNewsProvingAgency[], story: Story) => void | string)[];
}

export async function executeRulebook(attempt: Attempt, currentScene: Scene, story: Story): Promise<News> {
  const actionDefinition = attempt.definition;
  if (!actionDefinition) return createNewsItem(attempt, story);
  let outcome: RuleOutcome = can;
  if (actionDefinition.can)
    for (const rule of actionDefinition.can) {
      const ruleResult = await Promise.resolve(rule(attempt, story));
      if (ruleResult == cant || typeof ruleResult == "object") {
        outcome = cant;
        break;
      }
    }
  attempt.status = outcome == can ? "successful" : attempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
  if (outcome == can && actionDefinition.change) {
    const shouldBeStatements = actionDefinition.change(attempt, story);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  const news = createNewsItem(attempt, story);
  // react to news // creates scene types of Reaction
  const consequences = reactionsToNews(news, currentScene, story);
  resetNewsCycle(story);

  // debugging or goes into every Narrate
  publish("DONE:", stringifyAttempt(attempt) + ".");
  if (attempt.status == "partly successful")
    publish(
      attempt.actor.name,
      "could try",
      attempt.fullfilledBy.map(x => stringifyAction(x, { ing: true, omitActor: true }))
    );
  for (const consequence of consequences) {
    const foreshadow = consequence.foreshadow!;
    publish("((But", foreshadow.character.name, " won't like ", stringifyAction(foreshadow.news), ".))");
  }

  if (actionDefinition.narrate)
    for (const rule of actionDefinition.narrate) {
      const text = rule(attempt, consequences, story);
      if (text) publish(text);
    }

  return news;
}
