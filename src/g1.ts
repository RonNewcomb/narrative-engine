import {
  ActionDefinition,
  Character,
  Desireable,
  SceneType,
  createBelief,
  createGoal,
  narrativeEngine,
  spelling,
  weCouldTry,
} from "./narrativeEngine";
import { getPlayerChoices } from "./playerInputStyle1";

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
    cant: {
      rules: [attempt => (!door.isLocked ? "continue" : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
    },
  },
};

const Waiting: ActionDefinition = { verb: "wait" };

const Taking: ActionDefinition = {
  verb: "take _",
  rulebooks: {
    change: attempt => [["owned", attempt.noun!, "=", true]],
  },
};

const Dropping: ActionDefinition = {
  verb: "drop _",
  rulebooks: {
    change: attempt => [["owned", attempt.noun!, "=", false]],
  },
};

const Opening: ActionDefinition = {
  verb: "open _",
  rulebooks: {
    cant: {
      rules: [
        // attempt => (attempt.noun ? "successful" : weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt)),
        attempt => ((attempt.noun as any)?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "continue"),
      ],
    },
    change: attempt => [["isOpen", attempt.noun!, "=", true]],
  },
};

const Closing: ActionDefinition = {
  verb: "close _",
  rulebooks: {
    change: attempt => [["isOpen", attempt.noun!, "=", false]],
  },
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with _",
  rulebooks: {
    cant: {
      rules: [
        // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
      ],
    },
    change: attempt => [["isLocked", attempt.noun!, "=", false]],
  },
};

const Locking: ActionDefinition = {
  verb: "lock _ with _",
  rulebooks: {
    cant: {
      rules: [
        // // second noun must be key
        // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
        // need to own key
        attempt =>
          !attempt.secondNoun
            ? "stop"
            : (attempt.secondNoun as any)?.owner == attempt.actor
            ? "continue"
            : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt),
      ],
    },
    change: attempt => [["isLocked", attempt.noun!, "=", true]],
  },
};

const AskingFor: ActionDefinition = { verb: "asking _ for _" };

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

spelling({ receiving: "receiveing", the: ["teh", "hte"] });

///////

narrativeEngine(
  [Rose, Zafra],
  [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor],
  desireables,
  [storyStart],
  getPlayerChoices
);
