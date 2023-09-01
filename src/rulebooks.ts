import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import { Resource } from "./resources";
import type { Story } from "./story";

export type RuleWithOutcome<N extends Resource, SN extends Resource> = ((attempt: Attempt<N, SN>, story: Story) => RuleOutcome) & {
  name?: string;
};
export type Rule<N extends Resource, SN extends Resource> = ((attempt: Attempt<N, SN>, story: Story) => void) & { name?: string };

export type RuleOutcome = "success" | "failed" | undefined | false | Attempt | Attempt[];
export const makeNoDecision: RuleOutcome = undefined;
export const noDecision: RuleOutcome = false;
export const pretendItWorked: RuleOutcome = "success";

export interface Rulebook<N extends Resource, SN extends Resource> {
  rules: Rule<N, SN>[];
}
export interface CouldRulebook<N extends Resource, SN extends Resource> {
  rules: RuleWithOutcome<N, SN>[];
}

export interface Rulebooks<N extends Resource, SN extends Resource> {
  check?: CouldRulebook<N, SN>;
  moveDesireables?: (attempt: Attempt<N, SN>) => ShouldBeStatement[];
  news?: Rulebook<N, SN>;
}

export function executeRulebook(attempt: Attempt, story: Story): RuleOutcome {
  const rulebooks = attempt.definition.rulebooks;
  if (!rulebooks) return makeNoDecision;
  let outcome: RuleOutcome = makeNoDecision;
  if (rulebooks.check)
    for (const rule of rulebooks.check.rules || []) {
      const ruleResult = rule(attempt, story);
      if (ruleResult == "failed") {
        outcome = ruleResult;
        break;
      }
      // array, attempts
      if (typeof ruleResult == "object") {
        outcome = "failed";
        break;
      }
    }
  if (rulebooks.moveDesireables && outcome != "failed") {
    const shouldBeStatements = rulebooks.moveDesireables(attempt);
    for (const statement of shouldBeStatements) moveDesireable(story, ...statement);
  }
  for (const rule of rulebooks.news?.rules || []) {
    const ruleResult = rule(attempt, story);
  }
  return outcome;
}
