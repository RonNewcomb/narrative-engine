/** https://github.com/i7/extensions/blob/master/Ron%20Newcomb/Problem-Solving%20Characters.i7x */

type Button = any;

interface Character {
  buttons: Button[];
  think: () => {};
  //act: Act;

  goals: Attempt;
}

const characters: Character[] = [];

interface WhyHowNode {
  parent?: WhyHowNode;
  node: Attempt;
}

interface Action {
  verb: Verb;
  directObject?: Noun;
  indirectObject?: Noun;
  actor?: Character;
}

const Waiting: Action = { verb: "wait" };

interface Attempt {
  action: Action;
  status: "untried" | "failed" | "partly successful" | "successful";
  meddlingCheckRule: Rule<any>;
  fulfills?: Attempt; //  .parent
}

type Verb = string;
type Noun = string;

interface Planner {
  database: Option[];
}

interface Option extends Action {}

let reasonActionFailed: Rule<any> | undefined;
let personAsked: Character;
let currentAction: Action;
let player: Character;

function weCouldTry(actor: Character, suggestion: Action) {
  let thisAttempt = whatTheyAreTryingToDoNow(actor); //  whatactortryingtoaccomplishnow;
  let circumvention = {} as Attempt;
  circumvention.action = suggestion;
  circumvention.action.actor = actor;
  circumvention.status = "untried";
  if (thisAttempt == actor.goals) {
    thisAttempt = {} as Attempt;
    thisAttempt.action = currentAction;
    thisAttempt.action.actor = actor;
    thisAttempt.status = "untried";
    thisAttempt.fulfills = actor.goals;
    thisAttempt.meddlingCheckRule = reasonActionFailed!;
    actor.goals.status = "untried";
  }
  circumvention.fulfills = thisAttempt;
}

const makeNoDecision: undefined = undefined;
type RuleOutcome = "success" | "failed" | typeof makeNoDecision;
type Rule<T> = ((x: T, noun: Noun, secondNoun: Noun) => RuleOutcome) & { name?: string };

interface Rulebook<T> {
  rules: Rule<T>[];
}

function attempts(): Attempt[] {
  return [];
}

const dontPlanForPlayer: Rule<Character> = () => {
  // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
  if (personAsked == player) return "failed";
};

const updatePlansOnSuccess: Rule<Character> = (actor: Character, noun: Noun, secondNoun: Noun) => {
  //First after an actor doing something (this is update plans on success rule):
  let thisAttempt: Attempt = whatTheyWillDoNext(actor);
  if (currentAction == thisAttempt.action) thisAttempt.status = "successful";
  return makeNoDecision;
};

const updatePlansOnFailure: Rule<Character> = (actor: Character, noun: Noun, secondNoun: Noun) => {
  //} First after not an actor doing something (this is update plans on failure rule):
  let thisAttempt: Attempt | undefined = whatTheyWillDoNext(actor);
  // TODO what's the next line for?????
  // if ( currentAction != thisAttempt.action )		 thisAttempt = undefined  ;
  const solution = attempts().filter(attempt => attempt.status == "successful" && attempt.fulfills == thisAttempt);
  //if (a successful attempt (called solution) fulfills thisAttempt) {
  if (solution.length > 0) {
    if (reasonActionFailed != thisAttempt.meddlingCheckRule) thisAttempt.status = "partly successful";
  }
  const outcome = whenHinderedBy(reasonActionFailed!, actor, noun, secondNoun); //	follow when hindered by rules for reason action failed;
  if (outcome == pretendItWorked) thisAttempt.status = "successful";
  else if (!attempts().some(a => a.fulfills == thisAttempt))
    //else if (no attempts fulfill thisAttempt)
    thisAttempt.status = "failed";
  return makeNoDecision;
};

const hindered = (it: Attempt) =>
  (it.status == "failed" || it.status == "untried") &&
  attempts().some(at => at.fulfills == it && at.status == "untried") &&
  !attempts().some(at => at.fulfills == it && at.status == "successful");
// there are untried attempts which fulfill it && there are no successful attempts which fulfill it;
const moot = (it: Attempt) =>
  it.status == "untried" && attempts().some(at => ["successful", "partly successful"].includes(at.fulfills?.status || "")); //  it fulfills an [already] successful attempt || it fulfills a partly successful attempt));
const inTheFuture = (it: Attempt) => it.status == "untried" && attempts().every(at => at.fulfills?.status == "successful"); // it does not fulfill an [already] successful attempt;
const inThePresent = (it: Attempt) => hindered(it);
const inThePast = (it: Attempt) =>
  it.status == "successful" ||
  it.status == "partly successful" ||
  (it.status == "failed" && !attempts().some(at => at.status == "untried" && at.fulfills == it)); //there are no untried attempts which fulfill it);
const couldveBeen = (it: Attempt) => moot(it);
const isTopLevel = (it: Attempt) => !it.fulfills; // someone plans the cause of it  // it fulfills no higher goal
const busy = (actor: Character) => !quiescent(actor);
const quiescent = (actor: Character) => attempts().every(at => at.fulfills == actor.goals && inThePast(at)); // all attempts which [could possibly] fulfill goals of actor are in past;

// function executeRulebook<T>(rulebook:Rulebook<T >, on: T):RuleOutcome{
//     for(const rule of rulebook.rules) {
//         const outcome = rule(on);
//         if (!!outcome)return outcome;
//     }
//     return makeNoDecision;
// }

const Taking = (noun: Noun): Action => ({ verb: "take", directObject: noun });
const TakingOff = (noun: Noun): Action => ({ verb: "take off", directObject: noun });
const Opening = (noun: Noun): Action => ({ verb: "open", directObject: noun });
const Closing = (noun: Noun): Action => ({ verb: "close", directObject: noun });
const Dropping = (noun: Noun): Action => ({ verb: "drop", directObject: noun });
const AskingFor = (noun: Noun, secondNoun: Noun): Action => ({ verb: "ask for", directObject: noun, indirectObject: secondNoun });
const PuttingOn = (noun: Noun, secondNoun: Noun): Action => ({ verb: "put on", directObject: noun, indirectObject: secondNoun });

const whenHinderedBy = (r: Rule<any>, actor: Character, noun: Noun, secondNoun: Noun): RuleOutcome => {
  switch (r.name) {
    case "cant wear whats not held":
      weCouldTry(actor, Taking(noun));
      break;
    case "cant wave whats not held":
      weCouldTry(actor, Taking(noun));
      break;
    case "cant show what you havent got":
      weCouldTry(actor, Taking(noun));
      break;
    case "cant give what you havent got":
      weCouldTry(actor, Taking(noun));
      break;
    case "cant take what youre inside":
      weCouldTry(actor, { verb: "exit" });
      break;
    case "cant enter closed containers":
      weCouldTry(actor, Opening(noun));
      break;
    //  case "cant exit closed containers": weCouldTry(actor,Opening (personAsked.holder));break;
    case "cant insert into closed containers":
      weCouldTry(actor, Opening(secondNoun));
      break;
    //  case "cant search closed opaque containers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening(noun));break;
    case "cant lock whats open":
      weCouldTry(actor, Closing(noun));
      break;
    case "cant enter something carried":
      weCouldTry(actor, Dropping(noun));
      break;
    case "cant put onto something being carried":
      weCouldTry(actor, Dropping(secondNoun));
      weCouldTry(actor, PuttingOn(noun, secondNoun));
      break;
    case "cant drop clothes being worn":
      weCouldTry(actor, TakingOff(noun));
      break;
    case "cant put clothes being worn":
      weCouldTry(actor, TakingOff(noun));
      break;
    //  case "cant take peoples possessions": weCouldTry(actor,AskingFor(  noun.holder,  noun));break;
    case "cant insert clothes being worn":
      weCouldTry(actor, TakingOff(noun));
      break;
    case "cant give clothes being worn":
      weCouldTry(actor, TakingOff(noun));
      break;

    case "carrying requirements":
      weCouldTry(actor, Taking(noun));
      break;
    default:
      return pretendItWorked;
  }
};

const pretendItWorked = "success";

let confusedAboutTiming: boolean;

const whyTheyDid = (actor: Character, act: Attempt): Attempt | undefined => {
  confusedAboutTiming = inThePast(act);
  return act.fulfills;
};

const whyTheyWill = (actor: Character, act: Attempt): Attempt | undefined => {
  confusedAboutTiming = inTheFuture(act);
  return act.fulfills;
};

const whyTheyAre = (actor: Character, act: Attempt): Attempt | undefined => {
  confusedAboutTiming = inThePresent(act);
  return act.fulfills;
};

const howTheydid = (actor: Character, act: Attempt): Attempt => {
  confusedAboutTiming = !inThePast(act);
  if (confusedAboutTiming) return howTheyWill(actor, act);
  let method = attempts().find(at => at.status == "successful" && at.fulfills == act);
  //if there is a successful attempt (called method) which fulfills act,
  if (method) return method;
  method = attempts().find(at => at.status == "partly successful" && at.fulfills == act);
  // if there is a partly successful attempt (called method) which fulfills act,
  if (method) return method;
  return act; //[ action was so simple and straightforward there is no "how" ]
};

const howTheyWill = (actor: Character, act: Attempt): Attempt => {
  confusedAboutTiming = inThePast(act);
  let choices = howTheyCan(actor, act);
  for (const detail of choices) if (hindered(detail)) return howTheyWill(actor, detail);
  for (const detail of choices) if (detail.status == "untried") return detail;
  return actor.goals;
};

const howTheyCan = (actor: Character, act: Attempt): Attempt[] => {
  //[	return list of not in past attempts which fulfill act.]
  let choices = [] as Attempt[];
  const list = attempts().filter(at => !inThePast(at) && at.fulfills == act); // not in past attempts which fulfill act
  for (const item of list) choices.push(item);
  return choices;
};

const howTheyCould = (actor: Character, act: Attempt): Attempt[] => {
  //[	return list of attempts which fulfill act.]
  let choices = [] as Attempt[];
  const list = attempts().filter(at => at.fulfills == act); //for(const item  of  attempts which fulfill act )
  for (const item of list) choices.push(item);
  return choices;
};

const howTheyCouldHave = (actor: Character, act: Attempt): Attempt[] => {
  //	[return fixed list of could've been attempts which fulfill act.]
  let choices = [] as Attempt[];
  const list = attempts().filter(at => couldveBeen(at) && at.fulfills == act); //for(const item  of  couldvebeen attempts which fulfill act)
  for (const item of list) choices.push(item);
  return choices;
};

const whatTheyAreTryingToDoNow = (actor: Character): Attempt => {
  let thisAct = actor.goals;
  let details = attempts().find(at => hindered(at) && at.fulfills == thisAct);
  while (details) {
    //	while a hindered attempt (called details) fulfills thisAct:
    thisAct = details;
    details = attempts().find(at => hindered(at) && at.fulfills == thisAct);
  }
  return thisAct; // [the most finely detailed, and hindered,]
};

const whatTheyWillDoNext = (actor: Character): Attempt => {
  let choices = howTheyCan(actor, whatTheyAreTryingToDoNow(actor));
  for (const item of choices) if (item.status == "untried") return item;
  actor.goals.action = Waiting;
  return actor.goals; // of actor. ["I don't know"]
};

const whichActionFromTheAgendaOf = (act: Action, performer: Character): Attempt | undefined => {
  act.actor = performer;
  let mostRecentAnswer: Attempt | undefined = undefined;
  for (const item of attempts()) if (act == item.action) mostRecentAnswer = item;
  return mostRecentAnswer;
};
