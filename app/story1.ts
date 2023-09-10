import { getPlayerChoices } from "../interface/playerInputStyle1";
import {
  ActionDefinition,
  Character,
  Desireable,
  SceneType,
  begin,
  can,
  cant,
  createBelief,
  createGoal,
  debug,
  did,
  narrativeEngine,
  spelling,
  trying,
  weCouldTry,
} from "../src/narrativeEngine";

///////////////

const doorkey: Desireable = { name: "door key", isKey: true };
const door: Desireable = { name: "door", isLocked: true };
const inheritance: Desireable = { name: "Rose's inheritance" };
const legitimacy: Desireable = { name: "legitimacy in the eyes of the court" };
const appointment: Desireable = { name: "to be at Harrenfall before the 12th" };

////////////////

const Exiting: ActionDefinition = {
  verb: "exit",
  can: [attempt => (!door.isLocked ? can : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
  change: attempt => [["location", attempt.actor, "=", "out"]],
  narrate: [attempt => (attempt.status == did ? "Rose left, never to return." : `But her way was blocked by something.`)],
};

const Waiting: ActionDefinition = {
  verb: "wait",
};

const Taking: ActionDefinition = {
  verb: "take _",
  change: attempt => [["owned", attempt.noun!, "=", true]],
};

const Dropping: ActionDefinition = {
  verb: "drop _",
  change: attempt => [["owned", attempt.noun!, "=", false]],
};

const Opening: ActionDefinition = {
  verb: "open _",
  can: [attempt => ((attempt.noun as any)?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : can)],
  change: attempt => [["isOpen", attempt.noun!, "=", true]],
};

const Closing: ActionDefinition = {
  verb: "close _",
  change: attempt => [["isOpen", attempt.noun!, "=", false]],
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with _",
  can: [
    // attempt => (attempt.secondNoun?.isKey ? can : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
  ],
  change: attempt => [["isLocked", attempt.noun!, "=", false]],
};

const Locking: ActionDefinition = {
  verb: "lock _ with _",
  can: [
    // // second noun must be key
    // attempt => (attempt.secondNoun?.isKey ? can : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
    // need to own key
    attempt =>
      !attempt.secondNoun
        ? cant
        : (attempt.secondNoun as any)?.owner == attempt.actor
        ? can
        : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt),
  ],
  change: attempt => [["isLocked", attempt.noun!, "=", true]],
};

const AskingFor: ActionDefinition = {
  verb: "ask _ for _",
};

/////////////////

const Rose: Character = {
  name: "Rose",
  beliefs: [],
  goals: [createGoal(Exiting)],
};

const Zafra: Character = {
  name: "Zafra",
  beliefs: [createBelief("isLocked", door, "=", true)],
};

////////////

const storyStart: SceneType = {
  match: ({ actor, verb }, story) => verb == Exiting.verb && actor == Rose,
  beginning: () => "Rose wanted to escape the confines of her birth.",
};

////////////

spelling({ the: ["teh", "hte"], receiving: "receiveing" });

///////

const narration = [
  [Rose, did, Exiting, `"Finally, teh way is open. I'm free," said Rose.`],
  [Rose, trying, Exiting, `"I'll have to find another way."`],
  [debug, storyStart, begin, Rose, Exiting, `Scenic opening.`],
];

//////////////

narrativeEngine(
  [Rose, Zafra],
  [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor],
  [inheritance, legitimacy, appointment, doorkey, door],
  narration,
  [storyStart],
  getPlayerChoices
);
