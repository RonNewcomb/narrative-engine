type Button = any;

interface Character {
  name: string;
  buttons: Button[];
  think: () => void;
  //act: Act;

  goals: Attempt[];
}

interface WhyHowNode {
  parent?: WhyHowNode;
  node: Attempt;
}

interface Action {
  verb: Verb;
  directObject?: Noun;
  indirectObject?: Noun;
  actor: Character;
  definition: ActionDefinition;
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
interface Attempt {
  action: Action;
  status: "untried" | "failed" | "partly successful" | "successful";
  meddlingCheckRule?: Rule;
  fulfills: Attempt | undefined; // .parent
  fullfilledBy: Attempt[]; // .children
}

type Verb = string;
type Noun = string;

interface Planner {
  database: Option[];
}

interface Option extends Action {}

type Rule = ((noun: Noun | undefined, secondNoun: Noun | undefined, actor?: Character) => RuleOutcome) & { name?: string };

type RuleOutcome = "success" | "failed" | undefined;
const makeNoDecision: RuleOutcome = undefined;
const pretendItWorked: RuleOutcome = "success";

interface Rulebook {
  rules: Rule[];
}

///////////////

const characters: Character[] = [];

let reasonActionFailed: Rule | undefined;
let personAsked: Character;
let player: Character;

/////////// Buttons

interface ActionDefinition {
  verb: Verb;
  createAction: (...rest: any[]) => Action;
  rulebook: Rulebook;
}

const Waiting: ActionDefinition = {
  verb: "wait",
  createAction: (actor: Character): Action => ({ verb: Waiting.verb, actor, definition: Waiting }),
  rulebook: { rules: [] },
};
const Exiting: ActionDefinition = {
  verb: "exit",
  createAction: (actor: Character): Action => ({ verb: Exiting.verb, actor, definition: Exiting }),
  rulebook: {
    rules: [
      function cantlockwhatsopen() {
        return "failed";
      },
    ],
  },
};
const Taking: ActionDefinition = {
  verb: "take",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Taking.verb, directObject: noun, actor, definition: Taking }),
  rulebook: { rules: [] },
};
const TakingOff: ActionDefinition = {
  verb: "take off",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: TakingOff.verb, directObject: noun, actor, definition: TakingOff }),
  rulebook: { rules: [] },
};
const Opening: ActionDefinition = {
  verb: "open",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Opening.verb, directObject: noun, actor, definition: Opening }),
  rulebook: { rules: [] },
};
const Closing: ActionDefinition = {
  verb: "close",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Closing.verb, directObject: noun, actor, definition: Closing }),
  rulebook: { rules: [] },
};
const Dropping: ActionDefinition = {
  verb: "wait",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Dropping.verb, directObject: noun, actor, definition: Dropping }),
  rulebook: { rules: [] },
};
const AskingFor: ActionDefinition = {
  verb: "asking _ for",
  createAction: (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
    verb: AskingFor.verb,
    actor,
    directObject: noun,
    indirectObject: secondNoun,
    definition: AskingFor,
  }),
  rulebook: { rules: [] },
};
const PuttingOn: ActionDefinition = {
  verb: "putting _ on",
  createAction: (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
    verb: PuttingOn.verb,
    actor,
    directObject: noun,
    indirectObject: secondNoun,
    definition: PuttingOn,
  }),
  rulebook: { rules: [] },
};

/////////// debug

function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) =>
      key == "actor" && !!value
        ? `\\\\${value.name}`
        : key == "fulfills" && !!value
        ? "\\\\<backlink>"
        : key == "definition"
        ? undefined
        : value,
    4
  );
}

function stringifyAction(act: Action): string {
  return (act.actor?.name || "") + " " + act.verb + " " + (act.indirectObject || "") + " " + (act.directObject || "");
}

function stringifyAttempt(attempt: Attempt): string {
  return stringifyAction(attempt.action) + " (" + attempt.status + ")";
}

function printAttempt(attempt: Attempt) {
  console.log("  '" + stringifyAttempt(attempt) + '"');
}

//////////// action machinery

function executeRulebook(act: Action): RuleOutcome {
  const rulebook = act.definition.rulebook;
  for (const rule of rulebook.rules) {
    const outcome = rule(act.directObject, act.indirectObject, act.actor);
    if (outcome == "failed") reasonActionFailed = rule;
    if (!!outcome) return outcome;
  }
  return makeNoDecision;
}

/** performs the action */
function doThing(thisAttempt: Attempt, actor: Character) {
  if (!thisAttempt) throw "no TODO";
  if (!actor) throw "no ACTOR";
  personAsked = actor;
  reasonActionFailed = undefined;

  // DO the currentAction and get status
  const outcome: RuleOutcome = executeRulebook(thisAttempt.action);
  console.log(thisAttempt.action.verb, "is done:", outcome);

  // update trees to record result
  if (outcome != "failed") {
    thisAttempt.status = "successful";
  } else {
    console.log("Update plans on failure", stringifyAttempt(thisAttempt));
    const solution = thisAttempt.fullfilledBy.filter(a => a.status == "successful");
    if (solution.length > 0) {
      if (reasonActionFailed != thisAttempt.meddlingCheckRule) thisAttempt.status = "partly successful";
    }
    console.log(solution.length, "partial solutions found");
    const outcome = whenHinderedBy(thisAttempt, reasonActionFailed!); //	follow when hindered by rules for reason action failed;
    console.log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));
    thisAttempt.status = outcome == pretendItWorked ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
  }
  return makeNoDecision;
}

/////////// Planner AI

// //First after an actor doing something (this is update plans on success rule):
// const updatePlansOnSuccess = (thisAttempt: Attempt) => {
//   if (!thisAttempt) return makeNoDecision; // nothing to do, always succeeds
//   if (currentAction == thisAttempt.action) thisAttempt.status = "successful";
//   return makeNoDecision;
// };

// //} First after not an actor doing something (this is update plans on failure rule):
// const updatePlansOnFailure = (thisAttempt: Attempt) => {
//   //console.log("updatePlansOnFailure");
//   // let thisAttempt = whatTheyWillDoNext(actor);
//   // if (!thisAttempt) {
//   //   console.log("Update plans on failure -- nothing to do");
//   //   return;
//   // }
//   console.log("Update plans on failure", stringifyAttempt(thisAttempt));
//   const solution = thisAttempt.fullfilledBy.filter(a => a.status == "successful");
//   if (solution.length > 0) {
//     if (reasonActionFailed != thisAttempt.meddlingCheckRule) thisAttempt.status = "partly successful";
//   }
//   console.log(solution.length, "partial solutions found");
//   const outcome = whenHinderedBy(thisAttempt, reasonActionFailed!); //	follow when hindered by rules for reason action failed;
//   console.log("circumventions", outcome, thisAttempt.fullfilledBy);
//   thisAttempt.status = outcome == pretendItWorked ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
//   return makeNoDecision;
// };

const hindered = (it: Attempt) =>
  (it.status == "failed" || it.status == "untried") &&
  !!it.fullfilledBy.filter(at => at.status == "untried").length &&
  !it.fullfilledBy.filter(at => at.status == "successful").length;
// attempts().some(at => at.fulfills == it && at.status == "untried") &&
// !attempts().some(at => at.fulfills == it && at.status == "successful");
// there are untried attempts which fulfill it && there are no successful attempts which fulfill it;
const moot = (it: Attempt) => it.status == "untried" && it.fulfills && ["successful", "partly successful"].includes(it.fulfills.status);
//attempts().some(at => ["successful", "partly successful"].includes(at.fulfills?.status || ""));
//  it fulfills an [already] successful attempt || it fulfills a partly successful attempt));
const inTheFuture = (it: Attempt) => it.status == "untried" && (!it.fulfills || inTheFuture(it.fulfills)); // attempts().every(at => at.fulfills?.status == "successful"); // it does not fulfill an [already] successful attempt;
const inThePresent = (it: Attempt) => hindered(it);
const inThePast = (it: Attempt) =>
  it.status == "successful" ||
  it.status == "partly successful" ||
  (it.status == "failed" && it.fullfilledBy.filter(at => at.status == "untried").length == 0);
// !attempts().some(at => at.status == "untried" && at.fulfills == it)); //there are no untried attempts which fulfill it);
const couldveBeen = (it: Attempt) => moot(it);
//const isTopLevel = (it: Attempt) => !it.fulfills; // someone plans the cause of it  // it fulfills no higher goal
const busy = (actor: Character) => !quiescent(actor);
const quiescent = (actor: Character) => actor.goals.filter(at => !inThePast(at)).length > 0;
//attempts().every(at => at.fulfills == actor.goals && inThePast(at)); // all attempts which [could possibly] fulfill goals of actor are in past;

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

const howTheyCan = (actor: Character, act: Attempt): Attempt[] => {
  //[	return list of not in past attempts which fulfill act.]
  const options = act.fullfilledBy.filter(a => !inThePast(a));
  console.log("  Q: How can", actor.name, stringifyAttempt(act));
  console.log("  A:", options.map(stringifyAttempt));
  return options;
  // let choices = [] as Attempt[];
  // const list = attempts().filter(at => !inThePast(at) && at.fulfills == act); // not in past attempts which fulfill act
  // for (const item of list) choices.push(item);
  // console.log("  choices are", choices.map(stringifyAttempt));
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

const whatTheyAreTryingToDoNow = (actor: Character): Attempt => {
  let thisAct = actor.goals[0];
  let details = thisAct.fullfilledBy.find(at => inThePresent(at));
  //let details = attempts().find(at => inThePresent(at) && at.fulfills == thisAct);
  while (details) {
    //	while a hindered attempt (called details) fulfills thisAct:
    thisAct = details;
    details = thisAct.fullfilledBy.find(at => inThePresent(at));
  }
  console.log("  Q: What is", actor.name, "trying to do now?");
  console.log("  A: " + stringifyAttempt(thisAct));
  return thisAct; // [the most finely detailed, and hindered,]
};

const whatTheyWillDoNext = (actor: Character): Attempt | undefined => {
  let choices = howTheyCan(actor, whatTheyAreTryingToDoNow(actor));
  const untried = choices.find(item => item.status == "untried");
  //actor.goals.action = Waiting;
  console.log("  Q: What will", actor.name, "do next?");
  console.log("  A: ", untried ? stringifyAttempt(untried) : "No options.");
  return untried; //actor.goals; // of actor. ["I don't know"]
};

// const whichActionFromTheAgendaOf = (act: Action, performer: Character): Attempt | undefined => {
//   act.actor = performer;
//   let mostRecentAnswer: Attempt | undefined = undefined;
//   for (const item of attempts()) if (act == item.action) mostRecentAnswer = item;
//   return mostRecentAnswer;
// };

/** attaches a suggestion to the tree */
function weCouldTry(actor: Character, suggestion: Action, thisAttempt: Attempt): Attempt {
  console.log(actor.name, "could try", stringifyAction(suggestion), "before", stringifyAttempt(thisAttempt));
  const circumvention: Attempt = {
    action: { ...suggestion, actor },
    status: "untried",
    fulfills: thisAttempt,
    fullfilledBy: [],
  };
  //circumvention.action.actor = actor;
  // if (thisAttempt == actor.goals[0]) {
  //   console.log("replacing toplevel goal");
  //   const newAttempt: Attempt = {
  //     action: currentAction,
  //     status: "untried",
  //     fulfills: actor.goals[0],
  //     fullfilledBy: [],
  //     meddlingCheckRule: reasonActionFailed!,
  //   };
  //   newAttempt.action.actor = actor;
  //   thisAttempt = newAttempt;
  //   actor.goals[0].fullfilledBy.push(newAttempt);
  //   actor.goals[0].status = "untried";
  // }
  thisAttempt.fullfilledBy.push(circumvention);
  //circumvention.fulfills = thisAttempt;
  return circumvention;
}

const whenHinderedBy = (attempt: Attempt, checkRuleThatFailedIt: Rule): RuleOutcome => {
  const actor: Character = attempt.action.actor;
  const noun: Noun | undefined = attempt.action.directObject;
  const secondNoun: Noun | undefined = attempt.action.indirectObject;

  // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
  if (actor == player) return "failed";

  console.log("RULE NAME", checkRuleThatFailedIt.name);

  switch (checkRuleThatFailedIt.name) {
    case "cantwearwhatsnotheld":
      if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
      break;
    case "cantwavewhatsnotheld":
      if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
      break;
    case "cantshowwhatyouhaventgot":
      if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
      break;
    case "cantgivewhatyouhaventgot":
      if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
      break;
    case "canttakewhatyoureinside":
      weCouldTry(actor, Exiting.createAction(actor), attempt);
      break;
    case "cantenterclosedcontainers":
      if (noun) weCouldTry(actor, Opening.createAction(actor, noun), attempt);
      break;
    //  case "cantexitclosedcontainers": weCouldTry(actor,Opening (personAsked.holder));break;
    case "cantinsertintoclosedcontainers":
      if (secondNoun) weCouldTry(actor, Opening.createAction(actor, secondNoun), attempt);
      break;
    //  case "cantsearchclosedopaquecontainers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening(noun));break;
    case "cantlockwhatsopen":
      weCouldTry(actor, Closing.createAction(actor, "whatever"), attempt);
      break;
    case "cantentersomethingcarried":
      if (noun) weCouldTry(actor, Dropping.createAction(actor, noun), attempt);
      break;
    case "cantputontosomethingbeingcarried":
      if (secondNoun) weCouldTry(actor, Dropping.createAction(actor, secondNoun), attempt);
      if (noun && secondNoun) weCouldTry(actor, PuttingOn.createAction(actor, noun, secondNoun), attempt);
      break;
    case "cantdropclothesbeingworn":
      if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
      break;
    case "cantputclothesbeingworn":
      if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
      break;
    //  case "canttakepeoplespossessions": weCouldTry(actor,AskingFor(  noun.holder,  noun));break;
    case "cantinsertclothesbeingworn":
      if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
      break;
    case "cantgiveclothesbeingworn":
      if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
      break;
    case "carryingrequirements":
      if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
      break;
    default:
      return pretendItWorked;
  }
  return makeNoDecision;
};

/////////////////

function main() {
  const Rose: Character = {
    name: "Rose",
    buttons: [],
    think: () => {},
    goals: [],
  };
  Rose.goals.push({ action: Exiting.createAction(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
  characters.push(Rose);
  console.log(stringify(characters));
  /// init end

  const next = whatTheyAreTryingToDoNow(Rose);
  console.log("Her next is", stringifyAttempt(next));

  // go
  doThing(next, Rose);

  console.log(stringify(characters));
}

main();
