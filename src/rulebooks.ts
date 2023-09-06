import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import { ConsequenceWithForeshadowedNewsProvingAgency } from "./consequences";
import { createNewsItem, reactionsToNews, type News } from "./news";
import { publish, stringifyAction, stringifyAttempt } from "./paragraphs";
import type { Resource } from "./resources";
import type { Scene } from "./scenes";
import type { Story } from "./story";

export const can = "can";
export const cant = "cant";
export type RuleOutcome = undefined | false | typeof can | typeof cant | Attempt | Attempt[];
export type NarrateRule<N extends Resource, SN extends Resource> = (
  attempt: Attempt<N, SN>,
  consequences: ConsequenceWithForeshadowedNewsProvingAgency[],
  story: Story
) => void | string;

export interface Rulebooks<N extends Resource, SN extends Resource> {
  can?: ((attempt: Attempt<N, SN>, story: Story, scene?: Scene) => RuleOutcome | Promise<RuleOutcome>)[];
  change?: (attempt: Attempt<N, SN>, story: Story) => ShouldBeStatement[];
  narrate?: NarrateRule<N, SN>[];
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
  const consequences = reactionsToNews(news, currentScene, story);

  // debugging or goes into every Narrate
  publish("DONE:", stringifyAttempt(attempt) + ".");
  if (attempt.status == "partly successful") {
    const nextSteps = attempt.fullfilledBy.map(x => stringifyAction(x, { ing: true, omitActor: true }));
    publish(attempt.actor.name, "could try", nextSteps);
  }
  for (const consequence of consequences) {
    const foreshadow = consequence.foreshadow!;
    publish("((But", foreshadow.character.name, "won't like", stringifyAction(foreshadow.news) + ".))");
  }

  if (actionDefinition.narrate)
    for (const rule of actionDefinition.narrate) {
      const text = rule(attempt, consequences, story);
      if (text) publish(text);
    }

  return news;
}
