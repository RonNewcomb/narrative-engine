import type { ActionDefinition } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import type { Character } from "./characters";
import { publish, stringifyAction, stringifyAttempt } from "./paragraphs";
import type { Resource } from "./resources";

/** attaches a suggestion to the tree */
export function weCouldTry<N extends Resource, SN extends Resource>(
  actor: Character,
  definition: ActionDefinition<N, SN>,
  noun: N | undefined,
  secondNoun: SN | undefined,
  /** parent action */
  failingAction: Attempt<any, any> | undefined
): Attempt {
  const circumvention = createAttempt(actor, definition, noun, secondNoun, failingAction);
  publish(
    actor.name,
    "could try",
    stringifyAction(circumvention, { omitActor: true, ing: true }),
    "before",
    stringifyAction(failingAction, { omitActor: true, ing: true, withStatus: true }) + "."
  );
  if (failingAction) failingAction.fullfilledBy.push(circumvention);
  else actor.goals.push(circumvention);
  return circumvention;
}

const inTheFuture = (it: Attempt): boolean => it.status == "untried" && (!it.fulfills || inTheFuture(it.fulfills));
const inThePresent = (it: Attempt) =>
  (it.status == "failed" || it.status == "partly successful") &&
  it.fullfilledBy.filter(at => at.status == "untried").length > 0 &&
  it.fullfilledBy.filter(at => at.status == "successful").length == 0;
const inThePast = (it: Attempt) =>
  it.status == "successful" ||
  it.status == "partly successful" ||
  (it.status == "failed" && it.fullfilledBy.filter(at => at.status == "untried").length == 0);
const couldveBeen = (it: Attempt) =>
  it.status == "untried" && it.fulfills && ["successful", "partly successful"].includes(it.fulfills.status);
const isTopLevel = (it: Attempt) => !it.fulfills; // someone plans the cause of it  // it fulfills no higher goal
const busy = (actor: Character) => actor.goals.filter(at => !inThePast(at)).length == 0; // all attempts which [could possibly] fulfill goals of actor are in past;

let confusedAboutTiming: boolean;

// const whyTheyDid = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inThePast(act);
//   return act.fulfills;
// };

// const whyTheyWill = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inTheFuture(act);
//   return act.fulfills;
// };

// const whyTheyAre = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inThePresent(act);
//   return act.fulfills;
// };

// const howTheydid = (actor: Character, act: Attempt): Attempt => {
//   confusedAboutTiming = !inThePast(act);
//   if (confusedAboutTiming) return howTheyWill(actor, act);
//   let method = attempts().find(at => at.status == "successful" && at.fulfills == act);
//   //if there is a successful attempt (called method) which fulfills act,
//   if (method) return method;
//   method = attempts().find(at => at.status == "partly successful" && at.fulfills == act);
//   // if there is a partly successful attempt (called method) which fulfills act,
//   if (method) return method;
//   return act; //[ action was so simple and straightforward there is no "how" ]
// };

// const howTheyWill = (actor: Character, act: Attempt): Attempt => {
//   confusedAboutTiming = inThePast(act);
//   let choices = howTheyCan(actor, act);
//   for (const detail of choices) if (hindered(detail)) return howTheyWill(actor, detail);
//   for (const detail of choices) if (detail.status == "untried") return detail;
//   return actor.goals;
// };

export const howTheyCan = (actor: Character, act: Attempt): Attempt[] => {
  //[	return list of not in past attempts which fulfill act.]
  const options = act.fullfilledBy.filter(a => !inThePast(a));
  publish("  Q: How can", actor.name, stringifyAttempt(act));
  publish(
    "  A:",
    options.map(o => stringifyAttempt(o))
  );
  return options;
  // let choices = [] as Attempt[];
  // const list = attempts().filter(at => !inThePast(at) && at.fulfills == act); // not in past attempts which fulfill act
  // for (const item of list) choices.push(item);
  // publish("  choices are", choices.map(stringifyAttempt));
  // return choices;
};

// const howTheyCould = (actor: Character, act: Attempt): Attempt[] => {
//   //[	return list of attempts which fulfill act.]
//   let choices = [] as Attempt[];
//   const list = attempts().filter(at => at.fulfills == act); //for(const item  of  attempts which fulfill act )
//   for (const item of list) choices.push(item);
//   return choices;
// };

// const howTheyCouldHave = (actor: Character, act: Attempt): Attempt[] => {
//   //	[return fixed list of could've been attempts which fulfill act.]
//   let choices = [] as Attempt[];
//   const list = attempts().filter(at => couldveBeen(at) && at.fulfills == act); //for(const item  of  couldvebeen attempts which fulfill act)
//   for (const item of list) choices.push(item);
//   return choices;
// };

export const whatTheyAreTryingToDoNowRegarding = (actor: Character, act: Attempt<any, any>): Attempt | undefined => {
  let thisAct: Attempt<any, any> | undefined = act;
  if (thisAct.status == "untried") return thisAct;
  // let details:Attempt|undefined = thisAct;// thisAct.fullfilledBy.find(at => inThePresent(at));
  let previous: Attempt | undefined = thisAct;
  while (thisAct) {
    //	while a hindered attempt (called details) fulfills thisAct:
    previous = thisAct;
    thisAct = previous.fullfilledBy.find(g => g.status == "partly successful");
    //if (!thisAct) thisAct = previous.fullfilledBy.find(g => g.status == "untried");
  }
  thisAct = previous.fullfilledBy.find(at => at.status == "successful")
    ? previous
    : previous.fullfilledBy.find(at => at.status == "untried");
  publish("  Q: What is", actor.name, "trying to do now?");
  publish("  A: " + (thisAct ? stringifyAttempt(thisAct) : "nothing"));
  return thisAct; // [the most finely detailed, and hindered,]
};

export const whatTheyAreTryingToDoNow = (actor: Character): Attempt | undefined => {
  let thisAct = actor.goals.find(g => g.status == "partly successful") || actor.goals.find(g => g.status == "untried");
  if (!thisAct) return undefined;
  return whatTheyAreTryingToDoNowRegarding(actor, thisAct);
};

export const whatTheyWillDoNext = (actor: Character): Attempt | undefined => {
  const current = whatTheyAreTryingToDoNow(actor);
  const untried = !current ? undefined : howTheyCan(actor, current).find(item => item.status == "untried");
  //actor.goals.action = Waiting;
  publish("  Q: What will", actor.name, "do next?");
  publish("  A: ", untried ? stringifyAttempt(untried) : "No options.");
  return untried; //actor.goals; // of actor. ["I don't know"]
};

// const whichActionFromTheAgendaOf = (act: Action, performer: Character): Attempt | undefined => {
//   act.actor = performer;
//   let mostRecentAnswer: Attempt | undefined = undefined;
//   for (const item of attempts()) if (act == item.action) mostRecentAnswer = item;
//   return mostRecentAnswer;
// };
