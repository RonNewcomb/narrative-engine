interface ShouldBe {
  property: string;
  ofDesireable: Desireable;
  shouldBe: "=" | "in";
  toValue: any | any[];
  /** default to Success */
  sensitivity?: NewsSensitivity;
}

type ShouldBeStatement = [
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"]
];

interface Character {
  name: string;
  beliefs: ShouldBe[];
  goals: Attempt[];
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
interface Attempt {
  verb: Verb;
  noun?: Noun;
  secondNoun?: Noun;
  actor: Character;
  definition: ActionDefinition;
  status: "untried" | "failed" | "partly successful" | "successful";
  meddlingCheckRule?: Rule | RuleWithOutcome;
  fulfills: Attempt | undefined; // .parent
  fullfilledBy: Attempt[]; // .children
}

type Verb = string;
type Noun = Desireable;

type RuleWithOutcome = ((attempt: Attempt) => RuleOutcome) & { name?: string };
type Rule = ((attempt: Attempt) => void) & { name?: string };

type RuleOutcome = "success" | "failed" | undefined;
const makeNoDecision: RuleOutcome = undefined;
const pretendItWorked: RuleOutcome = "success";

interface Rulebook {
  rules: Rule[];
}
interface RulebookWithOutcome {
  rules: RuleWithOutcome[];
}

interface ActionDefinition {
  verb: Verb;
  rulebooks?: {
    check?: RulebookWithOutcome;
    moveDesireables?: (attempt: Attempt) => ShouldBeStatement[];
    news?: Rulebook;
  };
}

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

function stringifyAction(act: Attempt): string {
  const rearrange = act.verb.includes("_");
  const predicate = rearrange ? act.verb.replace("_", act.noun?.name || "") : act.verb;
  return (act.actor?.name || "") + " " + predicate + " " + (act.secondNoun?.name || "") + (rearrange ? "" : " " + (act.noun?.name || ""));
}

function stringifyAttempt(attempt: Attempt): string {
  return stringifyAction(attempt) + " (" + attempt.status + ")";
}

function printAttempt(attempt: Attempt) {
  console.log("  '" + stringifyAttempt(attempt) + '"');
}

//////////// action machinery

function executeRulebook(attempt: Attempt): RuleOutcome {
  const rulebooks = attempt.definition.rulebooks;
  if (!rulebooks) return makeNoDecision;
  let outcome: RuleOutcome = makeNoDecision;
  if (rulebooks.check)
    for (const rule of rulebooks.check.rules || []) {
      const ruleResult = rule(attempt);
      if (ruleResult == "failed") {
        attempt.meddlingCheckRule = rule;
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
function doThing(thisAttempt: Attempt, actor: Character) {
  if (!thisAttempt) throw "no TODO";
  if (!actor) throw "no ACTOR";

  // DO the currentAction and get status
  const outcome = executeRulebook(thisAttempt);
  console.log(thisAttempt.verb, "is done:", outcome);

  thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";

  // update trees to record result
  if (thisAttempt.status == "partly successful")
    console.log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));

  return makeNoDecision;
}

/////////// Planner AI

const hindered = (it: Attempt) =>
  (it.status == "failed" || it.status == "partly successful") &&
  it.fullfilledBy.filter(at => at.status == "untried").length > 0 &&
  it.fullfilledBy.filter(at => at.status == "successful").length == 0;
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

const whatTheyAreTryingToDoNow = (actor: Character): Attempt | undefined => {
  let thisAct = actor.goals.find(g => g.status == "partly successful") || actor.goals.find(g => g.status == "untried");
  if (!thisAct) return undefined;
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
  console.log("  Q: What is", actor.name, "trying to do now?");
  console.log("  A: " + (thisAct ? stringifyAttempt(thisAct) : "nothing"));
  return thisAct; // [the most finely detailed, and hindered,]
};

const whatTheyWillDoNext = (actor: Character): Attempt | undefined => {
  const current = whatTheyAreTryingToDoNow(actor);
  const untried = !current ? undefined : howTheyCan(actor, current).find(item => item.status == "untried");
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
function weCouldTry(
  actor: Character,
  definition: ActionDefinition,
  noun: Noun | undefined,
  secondNoun: Noun | undefined,
  failingAction: Attempt | undefined
): "failed" {
  console.log(actor.name, "could try", definition.verb, "before", failingAction && stringifyAttempt(failingAction));
  const circumvention: Attempt = {
    verb: definition.verb,
    actor,
    definition,
    noun,
    secondNoun,
    status: "untried",
    meddlingCheckRule: undefined,
    fulfills: failingAction,
    fullfilledBy: [],
  };
  if (failingAction) failingAction.fullfilledBy.push(circumvention);
  else actor.goals.push(circumvention);
  return "failed";
}

const author: Character = {
  name: "myself",
  beliefs: [],
  goals: [],
};

function createMyGoal(definition: ActionDefinition, noun?: Noun, secondNoun?: Noun): Attempt {
  const circumvention: Attempt = {
    verb: definition.verb,
    actor: author,
    definition,
    noun,
    secondNoun,
    status: "untried",
    meddlingCheckRule: undefined,
    fulfills: undefined,
    fullfilledBy: [],
  };
  return circumvention;
}

function createMyBelief(
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"],
  sensitivity?: ShouldBe["sensitivity"]
): ShouldBe {
  const belief: ShouldBe = { property, ofDesireable, shouldBe, toValue, sensitivity };
  return belief;
}

//////////

function moveDesireable(
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"]
) {
  switch (shouldBe) {
    case "=":
      ofDesireable[property] = toValue;
      return;
    default:
      throw "Unknown operation on desireable resource " + shouldBe;
  }
}

///////////

function main(characters: Character[], actionset: ActionDefinition[]) {
  // sanitize setup
  for (let character of characters) for (let goal of character.goals) if (goal.actor == author) goal.actor = character;

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene("introduction", todo.character, todo.action as News));

  if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console.log(initialScenes.length, "initial scenes");
  const initialScene: Scene = initialScenes[0];

  const ccc: Choi6eWithForeshadowing = {
    choice: "ally",
    foreshadow: {},
    scene: initialScene,
  };
  createSceneSet(ccc);

  // GO
  playStory(initialScene, characters);

  // debug
  produceParagraphs(characters);
}

/////////

function findCounterAction(actionset: ActionDefinition[], attempt: Attempt, shouldBe: ShouldBe): ActionDefinition | undefined {
  for (const action of actionset) {
    const effects = action.rulebooks?.moveDesireables?.(attempt) || [];
    for (const e of effects)
      if (shouldBe.property == e[0] && shouldBe.ofDesireable == e[1] && shouldBe.shouldBe == e[2] && shouldBe.toValue == e[3])
        return action;
  }
  return undefined;
}
