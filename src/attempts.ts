import { StuckForSolutions, type ActionDefinition, type Verb } from "./actions";
import { narrator, type Character } from "./characters";
import { ConsequenceWithForeshadowedNewsProvingAgency } from "./consequences";
import { weCouldTry, whatTheyAreTryingToDoNowRegarding } from "./planningTree";
import type { Resource } from "./resources";
import { can, cant, executeRulebook, type RuleOutcome } from "./rulebooks";
import type { Scene } from "./scenes";
import type { Story } from "./story";

export const did = "did";
export const didnt = "didn't";
export const trying = "trying";
export const untried = "untried";

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
export interface Attempt<N extends Resource = Resource, SN extends Resource = Resource> extends Resource {
  verb: Verb;
  noun?: N;
  secondNoun?: SN;
  actor: Character;
  definition: ActionDefinition<N, SN>;
  status: "untried" | "didn't" | "trying" | "did";
  fulfills: Attempt<any, any> | undefined; // .parent
  fullfilledBy: Attempt<any, any>[]; // .children
  consequences?: ConsequenceWithForeshadowedNewsProvingAgency[];
}

export function createAttempt<N extends Resource, SN extends Resource>(
  actor: Character,
  definition: ActionDefinition<N, SN>,
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
    fulfills: parentAction,
    fullfilledBy: [],
  };
  return circumvention;
}

export function createGoal<N extends Resource, SN extends Resource>(
  definition: ActionDefinition<N, SN>,
  noun?: N,
  secondNoun?: SN
): Attempt<N, SN> {
  return createAttempt(narrator, definition, noun, secondNoun, undefined);
}

export async function doThingAsAScene(thisAttempt: Attempt, currentScene: Scene, story: Story): Promise<RuleOutcome> {
  await executeRulebook(thisAttempt, currentScene, story);

  while (thisAttempt.status == trying) {
    let subAttempt = whatTheyAreTryingToDoNowRegarding(thisAttempt.actor, thisAttempt);
    //publish(thisAttempt.actor, thisAttempt.definition, "same scene, now", stringifyAttempt(subAttempt));
    if (subAttempt) await executeRulebook(subAttempt, currentScene, story);
    else {
      //publish(thisAttempt.actor, thisAttempt.definition, "STUCK:", stringifyAttempt(thisAttempt));
      if (thisAttempt.actor.goals!.includes(thisAttempt)) thisAttempt.actor.goals = thisAttempt.actor.goals!.filter(g => g != thisAttempt);
      return weCouldTry(thisAttempt.actor, StuckForSolutions, thisAttempt, undefined, undefined);
    }
  }

  switch (thisAttempt.status) {
    case did:
      return can;
    case didnt:
      return cant;
    case untried:
      return cant;
  }
}
