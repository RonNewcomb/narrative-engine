import type { Attempt } from "./attempts";
import { moveDesireable, type ShouldBeStatement } from "./beliefs";
import type { Story } from "./story";

export type RuleWithOutcome<N, SN> = ((attempt: Attempt<N, SN>, story: Story) => RuleOutcome) & { name?: string };
export type Rule<N, SN> = ((attempt: Attempt<N, SN>, story: Story) => void) & { name?: string };

export type RuleOutcome = "success" | "failed" | undefined;
export const makeNoDecision: RuleOutcome = undefined;
export const pretendItWorked: RuleOutcome = "success";

export interface Rulebook<N, SN> {
  rules: Rule<N, SN>[];
}
export interface RulebookWithOutcome<N, SN> {
  rules: RuleWithOutcome<N, SN>[];
}

export interface Rulebooks<N, SN> {
  check?: RulebookWithOutcome<N, SN>;
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
    }
  if (rulebooks.moveDesireables && outcome != "failed") {
    const shouldBeStatements = rulebooks.moveDesireables(attempt);
    for (const statement of shouldBeStatements) moveDesireable(...statement);
  }
  for (const rule of rulebooks.news?.rules || []) {
    const ruleResult = rule(attempt, story);
  }
  return outcome;
}
