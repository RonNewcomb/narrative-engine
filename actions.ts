import type { ShouldBeStatement } from "./beliefs";
import type { Character } from "./character";
import { console_log, stringifyAttempt } from "./debug";
import { type Desireable, type Resource } from "./iPlot";
import { moveDesireable } from "./narrativeEngine";
import { createNewsItem } from "./news";
import { whatTheyAreTryingToDoNowRegarding } from "./planningTree";

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
export interface Attempt<N = Resource, SN = Resource> extends Resource {
  verb: Verb;
  noun?: N;
  secondNoun?: SN;
  actor: Character;
  definition: AbstractActionDefinition<N, SN>;
  status: "untried" | "failed" | "partly successful" | "successful";
  //meddlingCheckRule?: Rule<N, SN> | RuleWithOutcome<N, SN>;
  fulfills: Attempt<any, any> | undefined; // .parent
  fullfilledBy: Attempt<any, any>[]; // .children
}

export type Verb = string;
export type Noun = Desireable;

export type RuleWithOutcome<N, SN> = ((attempt: Attempt<N, SN>) => RuleOutcome) & { name?: string };
export type Rule<N, SN> = ((attempt: Attempt<N, SN>) => void) & { name?: string };

export type RuleOutcome = "success" | "failed" | undefined;
export const makeNoDecision: RuleOutcome = undefined;
export const pretendItWorked: RuleOutcome = "success";

export interface Rulebook<N, SN> {
  rules: Rule<N, SN>[];
}
export interface RulebookWithOutcome<N, SN> {
  rules: RuleWithOutcome<N, SN>[];
}

export interface AbstractActionDefinition<N = Resource, SN = Resource> {
  verb: Verb;
  rulebooks?: {
    check?: RulebookWithOutcome<N, SN>;
    moveDesireables?: (attempt: Attempt<N, SN>) => ShouldBeStatement[];
    news?: Rulebook<N, SN>;
  };
}

export interface ActionDefinition<N = Noun, SN = Noun> extends AbstractActionDefinition<Noun, Noun> {}

//////////// action machinery

export function executeRulebook(attempt: Attempt): RuleOutcome {
  const rulebooks = attempt.definition.rulebooks;
  if (!rulebooks) return makeNoDecision;
  let outcome: RuleOutcome = makeNoDecision;
  if (rulebooks.check)
    for (const rule of rulebooks.check.rules || []) {
      const ruleResult = rule(attempt);
      if (ruleResult == "failed") {
        //attempt.meddlingCheckRule = rule;
        outcome = ruleResult;
        break;
      }
    }
  if (rulebooks.moveDesireables && outcome != "failed") {
    const shouldBeStatements = rulebooks.moveDesireables(attempt);
    for (const statement of shouldBeStatements) moveDesireable(...statement);
  }
  for (const rule of rulebooks.news?.rules || [createNewsItem]) {
    const ruleResult = rule(attempt);
  }
  return outcome;
}

/** performs the action */
export function doThingAsAScene(thisAttempt: Attempt, viewpointCharacter: Character): RuleOutcome {
  doThing(thisAttempt, viewpointCharacter);

  while (thisAttempt.status == "partly successful") {
    let subAttempt = whatTheyAreTryingToDoNowRegarding(thisAttempt.actor, thisAttempt);
    console_log("same scene, now", stringifyAttempt(subAttempt));
    if (subAttempt) doThing(subAttempt, viewpointCharacter);
    else {
      console_log("Stuck:", stringifyAttempt(thisAttempt));
      break;
    }
  }

  return thisAttempt.status == "successful" ? "success" : thisAttempt.status == "failed" ? "failed" : "failed";
}

/** performs the action */
function doThing(thisAttempt: Attempt, viewpointCharacter: Character): Attempt["status"] {
  // DO the currentAction and get status
  const outcome = executeRulebook(thisAttempt);
  console_log(thisAttempt.verb, "is done:", outcome);

  thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";

  // update trees to record result
  if (thisAttempt.status == "partly successful")
    console_log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));

  return thisAttempt.status;
}

export function createAttempt<N extends Resource, SN extends Resource>(
  actor: Character,
  definition: AbstractActionDefinition<N, SN>,
  noun: N | undefined,
  secondNoun: SN | undefined,
  parentAction: Attempt<any, any> | undefined
): Attempt<N, SN> {
  const circumvention: Attempt<N, SN> = {
    verb: definition.verb,
    actor,
    definition,
    noun: noun,
    secondNoun,
    status: "untried",
    //meddlingCheckRule: undefined,
    fulfills: parentAction,
    fullfilledBy: [],
  };
  return circumvention;
}
