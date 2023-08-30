import { StuckForSolutions, type AbstractActionDefinition, type Verb } from "./actions";
import type { Character } from "./characters";
import { createNewsItem, reactionsToNews, resetNewsCycle } from "./news";
import { publish, stringifyAction, stringifyAttempt } from "./paragraphs";
import { weCouldTry, whatTheyAreTryingToDoNowRegarding } from "./planningTree";
import type { Resource } from "./resources";
import { executeRulebook, type RuleOutcome } from "./rulebooks";
import type { Scene } from "./scenes";
import type { Story } from "./story";

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
  fulfills: Attempt<any, any> | undefined; // .parent
  fullfilledBy: Attempt<any, any>[]; // .children
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
    fulfills: parentAction,
    fullfilledBy: [],
  };
  return circumvention;
}

export function doThingAsAScene(thisAttempt: Attempt, currentScene: Scene, story: Story): RuleOutcome {
  doThing(thisAttempt, currentScene, story);

  while (thisAttempt.status == "partly successful") {
    let subAttempt = whatTheyAreTryingToDoNowRegarding(thisAttempt.actor, thisAttempt);
    publish("same scene, now", stringifyAttempt(subAttempt));
    if (subAttempt) doThing(subAttempt, currentScene, story);
    else {
      publish("STUCK:", stringifyAttempt(thisAttempt));
      if (thisAttempt.actor.goals.includes(thisAttempt)) thisAttempt.actor.goals = thisAttempt.actor.goals.filter(g => g != thisAttempt);
      return weCouldTry(thisAttempt.actor, StuckForSolutions, thisAttempt, undefined, undefined);
    }
  }

  return thisAttempt.status == "successful" ? "success" : thisAttempt.status == "failed" ? "failed" : "failed";
}

function doThing(thisAttempt: Attempt, currentScene: Scene, story: Story): Attempt["status"] {
  // DO the currentAction and get status
  const outcome = executeRulebook(thisAttempt, story);
  thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";

  publish("DONE:", stringifyAttempt(thisAttempt) + ".");

  if (thisAttempt.status == "partly successful")
    publish(
      thisAttempt.actor.name,
      "could try",
      thisAttempt.fullfilledBy.map(x => stringifyAction(x, { ing: true, omitActor: true }))
    );

  // react to news // creates scene types of Reaction
  const news = createNewsItem(thisAttempt, story);
  const consequences = reactionsToNews(news, currentScene, story);
  resetNewsCycle(story);

  for (const consequence of consequences) {
    const foreshadow = consequence.foreshadow!;
    publish("((But", foreshadow.character.name, " won't like ", stringifyAction(foreshadow.news), ".))");
  }

  return thisAttempt.status;
}
