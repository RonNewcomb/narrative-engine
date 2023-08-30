import {
  ActionDefinition,
  Character,
  Desireable,
  SceneRulebook,
  createMyBelief,
  createMyGoal,
  narrativeEngine,
  weCouldTry,
} from "./narrativeEngine";
import { getPlayerChoices } from "./playerInputStyle0";

const doorkey: Desireable = { name: "door key", isKey: true };
const door: Desireable = { name: "door", isLocked: true };

const desireables: Desireable[] = [
  { name: "Rose's inheritance" },
  { name: "Legitimacy in the eyes of the court" },
  { name: "to be at Harrenfall before the 12th" },
  doorkey,
  door,
];

////////////////

const Exiting: ActionDefinition = {
  verb: "exit",
  rulebooks: {
    check: {
      rules: [attempt => (!door.isLocked ? "success" : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
    },
  },
};

const Waiting: ActionDefinition = { verb: "wait" };

const Taking: ActionDefinition = {
  verb: "take",
  rulebooks: {
    moveDesireables: attempt => [["owned", attempt.noun!, "=", true]],
  },
};

const Dropping: ActionDefinition = {
  verb: "drop",
  rulebooks: {
    moveDesireables: attempt => [["owned", attempt.noun!, "=", false]],
  },
};

const Opening: ActionDefinition = {
  verb: "open",
  rulebooks: {
    check: {
      rules: [
        // attempt => (attempt.noun ? "successful" : weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt)),
        attempt => (attempt.noun?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "success"),
      ],
    },
    moveDesireables: attempt => [["isOpen", attempt.noun!, "=", true]],
  },
};

const Closing: ActionDefinition = {
  verb: "close",
  rulebooks: {
    moveDesireables: attempt => [["isOpen", attempt.noun!, "=", false]],
  },
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with",
  rulebooks: {
    check: {
      rules: [
        // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
      ],
    },
    moveDesireables: attempt => [["isLocked", attempt.noun!, "=", false]],
  },
};

const Locking: ActionDefinition = {
  verb: "lock _ with",
  rulebooks: {
    check: {
      rules: [
        // // second noun must be key
        // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
        // need to own key
        attempt =>
          !attempt.secondNoun
            ? "failed"
            : attempt.secondNoun?.owner == attempt.actor
            ? "success"
            : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt),
      ],
    },
    moveDesireables: attempt => [["isLocked", attempt.noun!, "=", true]],
  },
};

const AskingFor: ActionDefinition = { verb: "asking _ for" };

/////////////////

const Rose: Character = {
  name: "Rose",
  beliefs: [],
  goals: [createMyGoal(Exiting)],
};

const Zafra: Character = {
  name: "Zafra",
  beliefs: [createMyBelief("isLocked", door, "=", true)],
  goals: [],
};

////////////

const storyStart: SceneRulebook = {
  viewpoint: Rose,
  action: a => a.verb == Exiting.verb,
  beginning: (viewpoint, attempt) => "Rose wanted to escape the confines of her birth.",
};

////////////

narrativeEngine(
  [Rose, Zafra],
  [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor],
  desireables,
  [storyStart],
  getPlayerChoices
);
