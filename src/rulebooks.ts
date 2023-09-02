import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import type { Resource } from "./resources";
import { ifLater } from "./scenes";
import type { Story } from "./story";

export const can = "can";
export const cant = "cant";
export type RuleOutcome = typeof can | typeof cant | undefined | false | Attempt | Attempt[];

export interface Rulebooks<N extends Resource, SN extends Resource> {
  can?: ((attempt: Attempt<N, SN>, story: Story) => RuleOutcome | Promise<RuleOutcome>)[];
  change?: (attempt: Attempt<N, SN>, story: Story) => ShouldBeStatement[];
  narrate?: ((attempt: Attempt<N, SN>, story: Story) => void)[];
}

export async function executeRulebook(attempt: Attempt, story: Story): Promise<RuleOutcome> {
  const rulebooks = attempt.definition;
  if (!rulebooks) return can;
  let outcome: RuleOutcome = can;
  if (rulebooks.can)
    for (const rule of rulebooks.can || []) {
      const ruleResult = await ifLater(rule(attempt, story));
      if (ruleResult == cant || typeof ruleResult == "object") {
        outcome = cant;
        break;
      }
    }
  if (rulebooks.change && outcome != cant) {
    const shouldBeStatements = rulebooks.change(attempt, story);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  for (const rule of rulebooks.narrate || []) {
    const ruleResult = rule(attempt, story);
  }
  return outcome;
}
