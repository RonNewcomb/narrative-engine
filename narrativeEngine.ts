/// <reference path="planningTree.ts"/>

interface ShouldBe extends Resource {
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
  goals: Attempt<any, any>[];
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
interface Attempt<N = Resource, SN = Resource> extends Resource {
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

type Verb = string;
type Noun = Desireable;

type RuleWithOutcome<N, SN> = ((attempt: Attempt<N, SN>) => RuleOutcome) & { name?: string };
type Rule<N, SN> = ((attempt: Attempt<N, SN>) => void) & { name?: string };

type RuleOutcome = "success" | "failed" | undefined;
const makeNoDecision: RuleOutcome = undefined;
const pretendItWorked: RuleOutcome = "success";

interface Rulebook<N, SN> {
  rules: Rule<N, SN>[];
}
interface RulebookWithOutcome<N, SN> {
  rules: RuleWithOutcome<N, SN>[];
}

interface AbstractActionDefinition<N = Resource, SN = Resource> {
  verb: Verb;
  rulebooks?: {
    check?: RulebookWithOutcome<N, SN>;
    moveDesireables?: (attempt: Attempt<N, SN>) => ShouldBeStatement[];
    news?: Rulebook<N, SN>;
  };
}

interface ActionDefinition<N = Noun, SN = Noun> extends AbstractActionDefinition<Noun, Noun> {}

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

function stringifyAction(act: Attempt | undefined): string {
  if (!act) return "[no act]";
  const nounName = act.noun?.["name"] || act.noun;
  const noun2Name = act.secondNoun?.["name"] || act.secondNoun;
  const rearrange = act.verb.includes("_");
  const predicate = rearrange ? act.verb.replace("_", nounName || "") : act.verb;
  return (act.actor?.name || "") + " " + predicate + " " + (noun2Name || "") + (rearrange ? "" : " " + (nounName || ""));
}

function stringifyAttempt(attempt: Attempt | undefined): string {
  if (!attempt) return "[no attempt]";
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
function doThingAsAScene(thisAttempt: Attempt, viewpointCharacter: Character): RuleOutcome {
  doThing(thisAttempt, viewpointCharacter);

  while (thisAttempt.status == "partly successful") {
    let subAttempt = whatTheyAreTryingToDoNowRegarding(thisAttempt.actor, thisAttempt);
    console.log("same scene, now", stringifyAttempt(subAttempt));
    if (subAttempt) doThing(subAttempt, viewpointCharacter);
    else {
      console.log("Stuck:", stringifyAttempt(thisAttempt));
      break;
    }
  }

  return thisAttempt.status == "successful" ? "success" : thisAttempt.status == "failed" ? "failed" : "failed";
}

/** performs the action */
function doThing(thisAttempt: Attempt, viewpointCharacter: Character): Attempt["status"] {
  // DO the currentAction and get status
  const outcome = executeRulebook(thisAttempt);
  console.log(thisAttempt.verb, "is done:", outcome);

  thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";

  // update trees to record result
  if (thisAttempt.status == "partly successful")
    console.log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));

  return thisAttempt.status;
}

function createAttempt<N extends Resource, SN extends Resource>(
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

const author: Character = {
  name: "myself",
  beliefs: [],
  goals: [],
};

function createMyGoal<N extends Noun, SN extends Noun>(
  definition: AbstractActionDefinition<N, SN>,
  noun?: N,
  secondNoun?: SN
): Attempt<N, SN> {
  const circumvention: Attempt<N, SN> = {
    verb: definition.verb,
    actor: author,
    definition,
    noun,
    secondNoun,
    status: "untried",
    //meddlingCheckRule: undefined,
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

function main(characters: Character[], actionset: ActionDefinition<any, any>[]) {
  // sanitize setup
  for (let character of characters) for (let goal of character.goals) if (goal.actor == author) goal.actor = character;

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene(todo.character, todo.action!));

  if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console.log(initialScenes.length, "initial scenes");
  const initialScene: Scene = initialScenes[0];

  // GO
  playStory(initialScene, characters, actionset);

  // debug
  produceParagraphs(characters);
}
