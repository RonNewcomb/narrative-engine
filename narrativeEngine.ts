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
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
interface Attempt {
  action: Action;
  status: "untried" | "failed" | "partly successful" | "successful";
  meddlingCheckRule?: Rule<any>;
  fulfills: Attempt | undefined; // .parent
  fullfilledBy: Attempt[]; // .children
}

type Verb = string;
type Noun = string;

interface Planner {
  database: Option[];
}

interface Option extends Action {}

type Rule<T> = ((x: T, noun: Noun | undefined, secondNoun: Noun | undefined, actor?: Character) => RuleOutcome) & { name?: string };

type RuleOutcome = "success" | "failed" | undefined;
const makeNoDecision: RuleOutcome = undefined;
const pretendItWorked: RuleOutcome = "success";

interface Rulebook<T> {
  rules: Rule<T>[];
}

///////////////

const characters: Character[] = [];

let reasonActionFailed: Rule<any> | undefined;
let personAsked: Character;
let currentAction: Action;
let player: Character;

///////////

function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) => (key == "actor" && !!value ? `\\\\${value.name}` : key == "fulfills" && !!value ? "\\\\<backlink>" : value),
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

////////////

function weCouldTry(actor: Character, suggestion: Action): Attempt {
  let thisAttempt = whatTheyAreTryingToDoNow(actor);
  console.log(actor.name, "could try", stringifyAction(suggestion), "before", stringifyAttempt(thisAttempt));
  let circumvention: Attempt = {
    action: suggestion,
    status: "untried",
    fulfills: undefined,
    fullfilledBy: [],
  };
  circumvention.action.actor = actor;
  if (thisAttempt == actor.goals[0]) {
    console.log("replacing toplevel goal");
    const newAttempt: Attempt = {
      action: currentAction,
      status: "untried",
      fulfills: actor.goals[0],
      fullfilledBy: [],
      meddlingCheckRule: reasonActionFailed!,
    };
    newAttempt.action.actor = actor;
    thisAttempt = newAttempt;
    actor.goals[0].fullfilledBy.push(newAttempt);
    actor.goals[0].status = "untried";
  }
  thisAttempt.fullfilledBy.push(circumvention);
  circumvention.fulfills = thisAttempt;
  return circumvention;
}

function getRulebookFor<T>(act: Action): Rulebook<T> {
  switch (act.verb) {
    case "wait":
      return { rules: [] };
    case "exit":
      return {
        rules: [
          function cantlockwhatsopen() {
            return "failed";
          },
        ],
      };
    default:
      return { rules: [] };
  }
}

function executeRulebook<T>(rulebook: Rulebook<T>, on: T, actor: Character, noun?: Noun, secondNoun?: Noun): RuleOutcome {
  for (const rule of rulebook.rules) {
    const outcome = rule(on, noun, secondNoun, actor);
    if (outcome == "failed") reasonActionFailed = rule;
    if (!!outcome) return outcome;
  }
  return makeNoDecision;
}

function doThing(todo: Attempt, actor: Character) {
  if (!todo) throw "no TODO";
  personAsked = actor;
  reasonActionFailed = undefined;
  currentAction = todo.action;
  const verb = currentAction.verb;
  const noun = currentAction.directObject;
  const secondNoun = currentAction.indirectObject;

  // DO the currentAction and get status
  const rb = getRulebookFor(currentAction);
  const outcome: RuleOutcome = executeRulebook(rb, noun, actor, noun, secondNoun);
  console.log(verb, "is done:", outcome);

  // update trees
  if (outcome == "failed") updatePlansOnFailure(todo);
  else updatePlansOnSuccess(actor, noun, secondNoun);
}

function main() {
  const Rose: Character = {
    name: "Rose",
    buttons: [],
    think: () => {},
    goals: [],
  };
  Rose.goals.push({ action: Exiting(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
  characters.push(Rose);
  console.log(stringify(characters));
  /// init end

  const next = whatTheyAreTryingToDoNow(Rose);
  console.log("Her next is", stringifyAttempt(next));

  // go
  doThing(next, Rose);

  console.log(stringify(characters));

  // doThing(Exiting, Rose, undefined, undefined);

  // console.log(JSON.stringify(characters, undefined, 4));

  // doThing(Exiting, Rose, undefined, undefined);

  // console.log(JSON.stringify(characters, undefined, 4));
}

//First after an actor doing something (this is update plans on success rule):
const updatePlansOnSuccess = (actor: Character, noun: Noun | undefined, secondNoun: Noun | undefined) => {
  let thisAttempt = whatTheyWillDoNext(actor);
  if (!thisAttempt) return makeNoDecision; // nothing to do, always succeeds
  if (currentAction == thisAttempt.action) thisAttempt.status = "successful";
  return makeNoDecision;
};

//} First after not an actor doing something (this is update plans on failure rule):
const updatePlansOnFailure = (thisAttempt: Attempt) => {
  //console.log("updatePlansOnFailure");
  // let thisAttempt = whatTheyWillDoNext(actor);
  // if (!thisAttempt) {
  //   console.log("Update plans on failure -- nothing to do");
  //   return;
  // }
  console.log("Update plans on failure", stringifyAttempt(thisAttempt));
  const actor = thisAttempt.action.actor;
  const noun = thisAttempt.action.directObject;
  const secondNoun = thisAttempt.action.indirectObject;
  // TODO what's the next line for?????
  // if (currentAction != thisAttempt.action) thisAttempt = undefined as any;
  //const solution = attempts().filter(attempt => attempt.status == "successful" && attempt.fulfills == thisAttempt);
  const solution = thisAttempt.fullfilledBy.filter(a => a.status == "successful");
  //if (a successful attempt (called solution) fulfills thisAttempt) {
  if (solution.length > 0) {
    if (reasonActionFailed != thisAttempt.meddlingCheckRule) thisAttempt.status = "partly successful";
  }
  console.log(solution.length, "partial solutions found");
  const outcome = whenHinderedBy(reasonActionFailed!, actor, noun, secondNoun); //	follow when hindered by rules for reason action failed;
  console.log("circumventions", outcome, thisAttempt.fullfilledBy);
  if (outcome == pretendItWorked) thisAttempt.status = "successful";
  else if (thisAttempt.fullfilledBy.length == 0) thisAttempt.status = "failed";
  else if (thisAttempt.fullfilledBy.length > 0) thisAttempt.status = "partly successful";
  return makeNoDecision;
};

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

//////////

const Waiting = (actor: Character): Action => ({ verb: "wait", actor });
const Exiting = (actor: Character): Action => ({ verb: "exit", actor });
const Taking = (actor: Character, noun: Noun): Action => ({ verb: "take", directObject: noun, actor });
const TakingOff = (actor: Character, noun: Noun): Action => ({ verb: "take off", directObject: noun, actor });
const Opening = (actor: Character, noun: Noun): Action => ({ verb: "open", directObject: noun, actor });
const Closing = (actor: Character, noun: Noun): Action => ({ verb: "close", directObject: noun, actor });
const Dropping = (actor: Character, noun: Noun): Action => ({ verb: "drop", directObject: noun, actor });
const AskingFor = (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
  verb: "ask for",
  actor,
  directObject: noun,
  indirectObject: secondNoun,
});
const PuttingOn = (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
  verb: "put on",
  actor,
  directObject: noun,
  indirectObject: secondNoun,
});

const whenHinderedBy = (r: Rule<any>, actor: Character, noun: Noun | undefined, secondNoun: Noun | undefined): RuleOutcome => {
  // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
  if (actor == player) return "failed";

  console.log("RULE NAME", r.name);

  switch (r.name) {
    case "cant wear whats not held":
      if (noun) weCouldTry(actor, Taking(actor, noun));
      break;
    case "cant wave whats not held":
      if (noun) weCouldTry(actor, Taking(actor, noun));
      break;
    case "cant show what you havent got":
      if (noun) weCouldTry(actor, Taking(actor, noun));
      break;
    case "cant give what you havent got":
      if (noun) weCouldTry(actor, Taking(actor, noun));
      break;
    case "cant take what youre inside":
      weCouldTry(actor, Exiting(actor));
      break;
    case "cant enter closed containers":
      if (noun) weCouldTry(actor, Opening(actor, noun));
      break;
    //  case "cant exit closed containers": weCouldTry(actor,Opening (personAsked.holder));break;
    case "cant insert into closed containers":
      if (secondNoun) weCouldTry(actor, Opening(actor, secondNoun));
      break;
    //  case "cant search closed opaque containers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening(noun));break;
    case "cantlockwhatsopen":
      weCouldTry(actor, Closing(actor, "whatever"));
      break;
    case "cant enter something carried":
      if (noun) weCouldTry(actor, Dropping(actor, noun));
      break;
    case "cant put onto something being carried":
      if (secondNoun) weCouldTry(actor, Dropping(actor, secondNoun));
      if (noun && secondNoun) weCouldTry(actor, PuttingOn(actor, noun, secondNoun));
      break;
    case "cant drop clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(actor, noun));
      break;
    case "cant put clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(actor, noun));
      break;
    //  case "cant take peoples possessions": weCouldTry(actor,AskingFor(  noun.holder,  noun));break;
    case "cant insert clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(actor, noun));
      break;
    case "cant give clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(actor, noun));
      break;
    case "carrying requirements":
      if (noun) weCouldTry(actor, Taking(actor, noun));
      break;
    default:
      return pretendItWorked;
  }
  return makeNoDecision;
};

/////////////////

main();
