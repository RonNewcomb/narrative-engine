import { textGen } from "./advice";
import { did, didnt, trying, type Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import { createNewsItem, reactionsToNews, type News } from "./news";
import { publish, stringifyAction, stringifyAttempt } from "./paragraphs";
import type { Resource } from "./resources";
import type { Scene } from "./scenes";
import type { Story } from "./story";

export const can = "can";
export const cant = "cant";
export type RuleOutcome = undefined | false | typeof can | typeof cant | Attempt | Attempt[];

export interface Rulebooks<N extends Resource, SN extends Resource> {
  can?: ((attempt: Attempt<N, SN>, story: Story, scene?: Scene) => RuleOutcome | Promise<RuleOutcome>)[];
  change?: (attempt: Attempt<N, SN>, story: Story) => ShouldBeStatement[];
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
  attempt.status = outcome == can ? did : attempt.fullfilledBy.length > 0 ? trying : didnt;
  if (outcome == can && actionDefinition.change) {
    const shouldBeStatements = actionDefinition.change(attempt, story);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  const news = createNewsItem(attempt, story);
  attempt.consequences = reactionsToNews(news, currentScene, story);

  // debugging or goes into every Narrate
  publish(attempt.actor, attempt.definition, "DONE:", stringifyAttempt(attempt) + ".");
  const nextSteps =
    attempt.status == trying ? attempt.fullfilledBy.map(x => stringifyAction(x, { ing: true, omitActor: true })) : undefined;

  if (nextSteps) publish(attempt.actor, attempt.definition, attempt.actor.name, "could try", nextSteps);

  for (const consequence of attempt.consequences) {
    const foreshadow = consequence.foreshadow!;
    publish(attempt.actor, attempt.definition, "((But", foreshadow.character.name, "won't like", stringifyAction(foreshadow.news) + ".))");
  }

  for (const rule of story.narrationRules) {
    const textFn = rule(attempt, currentScene, story, attempt.consequences, attempt.fullfilledBy);
    const text: string = textGen(textFn, attempt, currentScene, story, attempt.consequences, attempt.fullfilledBy);
    if (text) publish(attempt.actor, attempt.definition, text);
  }

  return news;
}
