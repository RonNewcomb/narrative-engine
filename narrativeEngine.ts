type Button = any;

interface Character {
  name: string;
  buttons: Button[];
  think: () => void;
  //act: Act;

  goals: Attempt;
}

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

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
interface Attempt {
  action: Action;
  status: "untried" | "failed" | "partly successful" | "successful";
  meddlingCheckRule?: Rule<any>;
  fulfills?: Attempt; //  .parent
}

type Verb = string;
type Noun = string;

interface Planner {
  database: Option[];
}

interface Option extends Action {}

const characters: Character[] = [];
const globalAttemptList: Attempt[] = [];

function attempts(): Attempt[] {
  return globalAttemptList;
}

let reasonActionFailed: Rule<any> | undefined;
let personAsked: Character;
let currentAction: Action;
let player: Character;

function weCouldTry(actor: Character, suggestion: Action): Attempt {
  let thisAttempt = whatTheyAreTryingToDoNow(actor); //  whatactortryingtoaccomplishnow;
  let circumvention = {} as Attempt;
  globalAttemptList.push(circumvention);
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
    globalAttemptList.push(thisAttempt);
  }
  circumvention.fulfills = thisAttempt;
  return circumvention;
}

const makeNoDecision: undefined = undefined;
type RuleOutcome = "success" | "failed" | typeof makeNoDecision;
type Rule<T> = ((x: T, noun: Noun | undefined, secondNoun: Noun | undefined, actor?: Character) => RuleOutcome) & { name?: string };
const pretendItWorked: RuleOutcome = "success";

interface Rulebook<T> {
  rules: Rule<T>[];
}

function getRulebookFor<T>(act: Action): Rulebook<T> {
  switch (act.verb) {
    case "wait":
      return { rules: [] };
    case "exit":
      return { rules: [() => "failed"] };
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

function doThing(todo: Action, actor: Character, noun?: Noun, secondNoun?: Noun) {
  personAsked = actor;
  reasonActionFailed = undefined;
  currentAction = todo;
  if (!todo) throw "no TODO";

  // DO the currentAction and get status
  const rb = getRulebookFor(currentAction);
  const outcome: RuleOutcome = executeRulebook(rb, noun, actor, noun, secondNoun);
  console.log(todo.verb, outcome);

  // update trees
  if (outcome == "failed") updatePlansOnFailure(actor, noun, secondNoun);
  else updatePlansOnSuccess(actor, noun, secondNoun);
}

function main() {
  const Rose: Character = {
    name: "Rose",
    buttons: [],
    think: () => {},
    goals: { action: { verb: "wait" }, status: "untried" },
  };
  characters.push(Rose);
  console.log(JSON.stringify(characters, undefined, 4));

  // go
  doThing(Exiting, Rose, undefined, undefined);

  console.log(JSON.stringify(characters, undefined, 4));

  doThing(Exiting, Rose, undefined, undefined);

  console.log(JSON.stringify(characters, undefined, 4));

  doThing(Exiting, Rose, undefined, undefined);

  console.log(JSON.stringify(characters, undefined, 4));
}

//First after an actor doing something (this is update plans on success rule):
const updatePlansOnSuccess: Rule<Character> = (actor: Character, noun: Noun | undefined, secondNoun: Noun | undefined) => {
  let thisAttempt: Attempt = whatTheyWillDoNext(actor);
  if (currentAction == thisAttempt.action) thisAttempt.status = "successful";
  return makeNoDecision;
};

//} First after not an actor doing something (this is update plans on failure rule):
const updatePlansOnFailure: Rule<Character> = (actor: Character, noun: Noun | undefined, secondNoun: Noun | undefined) => {
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

const Waiting: Action = { verb: "wait" };
const Exiting: Action = { verb: "exit" } as const;
const Taking = (noun: Noun): Action => ({ verb: "take", directObject: noun });
const TakingOff = (noun: Noun): Action => ({ verb: "take off", directObject: noun });
const Opening = (noun: Noun): Action => ({ verb: "open", directObject: noun });
const Closing = (noun: Noun): Action => ({ verb: "close", directObject: noun });
const Dropping = (noun: Noun): Action => ({ verb: "drop", directObject: noun });
const AskingFor = (noun: Noun, secondNoun: Noun): Action => ({ verb: "ask for", directObject: noun, indirectObject: secondNoun });
const PuttingOn = (noun: Noun, secondNoun: Noun): Action => ({ verb: "put on", directObject: noun, indirectObject: secondNoun });

const whenHinderedBy = (r: Rule<any>, actor: Character, noun: Noun | undefined, secondNoun: Noun | undefined): RuleOutcome => {
  // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
  if (actor == player) return "failed";

  switch (r.name) {
    case "cant wear whats not held":
      if (noun) weCouldTry(actor, Taking(noun));
      break;
    case "cant wave whats not held":
      if (noun) weCouldTry(actor, Taking(noun));
      break;
    case "cant show what you havent got":
      if (noun) weCouldTry(actor, Taking(noun));
      break;
    case "cant give what you havent got":
      if (noun) weCouldTry(actor, Taking(noun));
      break;
    case "cant take what youre inside":
      weCouldTry(actor, Exiting);
      break;
    case "cant enter closed containers":
      if (noun) weCouldTry(actor, Opening(noun));
      break;
    //  case "cant exit closed containers": weCouldTry(actor,Opening (personAsked.holder));break;
    case "cant insert into closed containers":
      if (secondNoun) weCouldTry(actor, Opening(secondNoun));
      break;
    //  case "cant search closed opaque containers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening(noun));break;
    case "cant lock whats open":
      if (noun) weCouldTry(actor, Closing(noun));
      break;
    case "cant enter something carried":
      if (noun) weCouldTry(actor, Dropping(noun));
      break;
    case "cant put onto something being carried":
      if (secondNoun) weCouldTry(actor, Dropping(secondNoun));
      if (noun && secondNoun) weCouldTry(actor, PuttingOn(noun, secondNoun));
      break;
    case "cant drop clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(noun));
      break;
    case "cant put clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(noun));
      break;
    //  case "cant take peoples possessions": weCouldTry(actor,AskingFor(  noun.holder,  noun));break;
    case "cant insert clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(noun));
      break;
    case "cant give clothes being worn":
      if (noun) weCouldTry(actor, TakingOff(noun));
      break;
    case "carrying requirements":
      if (noun) weCouldTry(actor, Taking(noun));
      break;
    default:
      return pretendItWorked;
  }
  return makeNoDecision;
};

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
  console.log("  How can", actor.name, stringifyAttempt(act));
  let choices = [] as Attempt[];
  const list = attempts().filter(at => !inThePast(at) && at.fulfills == act); // not in past attempts which fulfill act
  for (const item of list) choices.push(item);
  console.log("  choices are", choices.map(stringifyAttempt));
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
  console.log("  What is", actor.name, "trying to do now?");
  let thisAct = actor.goals;
  let details = attempts().find(at => hindered(at) && at.fulfills == thisAct);
  while (details) {
    //	while a hindered attempt (called details) fulfills thisAct:
    thisAct = details;
    details = attempts().find(at => hindered(at) && at.fulfills == thisAct);
  }
  printAttempt(thisAct);
  return thisAct; // [the most finely detailed, and hindered,]
};

function stringifyAction(act: Action): string {
  return (act.actor?.name || "") + " " + act.verb + " " + (act.indirectObject || "") + " " + (act.directObject || "");
}

function stringifyAttempt(attempt: Attempt): string {
  return stringifyAction(attempt.action) + " (" + attempt.status + ")";
}

function printAttempt(attempt: Attempt) {
  console.log("  '" + stringifyAttempt(attempt) + '"');
}

const whatTheyWillDoNext = (actor: Character): Attempt => {
  console.log("  What will", actor.name, "do next?");
  let choices = howTheyCan(actor, whatTheyAreTryingToDoNow(actor));
  for (const item of choices) if (item.status == "untried") return item;
  actor.goals.action = Waiting;
  printAttempt(actor.goals);
  return actor.goals; // of actor. ["I don't know"]
};

const whichActionFromTheAgendaOf = (act: Action, performer: Character): Attempt | undefined => {
  act.actor = performer;
  let mostRecentAnswer: Attempt | undefined = undefined;
  for (const item of attempts()) if (act == item.action) mostRecentAnswer = item;
  return mostRecentAnswer;
};

main();
