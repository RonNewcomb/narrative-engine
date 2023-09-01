import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import type { Resource } from "./resources";
import { ifLater } from "./scenes";
import type { Story } from "./story";

export type RuleOutcome = "continue" | "stop" | undefined | false | Attempt | Attempt[];
export const makeNoDecision: RuleOutcome = undefined;
export const noDecision: RuleOutcome = false;
export const pretendItWorked: RuleOutcome = "continue";

export interface Rulebooks<N extends Resource, SN extends Resource> {
  cant?: {
    rules: ((attempt: Attempt<N, SN>, story: Story) => RuleOutcome | Promise<RuleOutcome>)[];
  };
  change?: (attempt: Attempt<N, SN>) => ShouldBeStatement[];
  news?: {
    rules: ((attempt: Attempt<N, SN>, story: Story) => void)[];
  };
}

export async function executeRulebook(attempt: Attempt, story: Story): Promise<RuleOutcome> {
  const rulebooks = attempt.definition.rulebooks;
  if (!rulebooks) return makeNoDecision;
  let outcome: RuleOutcome = makeNoDecision;
  if (rulebooks.cant)
    for (const rule of rulebooks.cant.rules || []) {
      const ruleResult = await ifLater(rule(attempt, story));
      if (ruleResult == "stop" || typeof ruleResult == "object") {
        outcome = "stop";
        break;
      }
    }
  if (rulebooks.change && outcome != "stop") {
    const shouldBeStatements = rulebooks.change(attempt);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  for (const rule of rulebooks.news?.rules || []) {
    const ruleResult = rule(attempt, story);
  }
  return outcome;
}
