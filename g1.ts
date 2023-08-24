/// <reference path="./iPlot.ts" />
/// <reference path="./produceParagraphs.ts" />
/// <reference path="./narrativeEngine.ts" />

///////////////

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
        // second noun must be key
        attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
        // need to own key
        attempt =>
          attempt.secondNoun?.owner == attempt.actor
            ? "success"
            : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt),
      ],
    },
    moveDesireables: attempt => [["isLocked", attempt.noun!, "=", true]],
  },
};

const AskingFor: ActionDefinition = { verb: "asking _ for" };

const Realizing: ActionDefinition = {
  verb: "realizing",
  rulebooks: {
    check: {
      rules: [
        attempt => {
          console.log("Oh i need a ", attempt.noun?.name ?? attempt.noun);

          const action = findCounterAction(actionset, scene.news, scene.belief);
          if (action) weCouldTry(attempt.actor, action, attempt.noun, attempt.secondNoun, attempt);
          return "failed";
        },
      ],
    },
  },
};

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

const characters = [Rose, Zafra];
const actionset = [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, Realizing, AskingFor];

main(characters, actionset);
