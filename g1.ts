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

const Waiting: ActionDefinition = { verb: "wait" };

const Exiting: ActionDefinition = {
  verb: "exit",
  rulebooks: {
    check: {
      rules: [attempt => (!door.isLocked ? "success" : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
    },
  },
};

const Taking: ActionDefinition = { verb: "take" };

const TakingOff: ActionDefinition = { verb: "take off" };

const Opening: ActionDefinition = {
  verb: "open",
  rulebooks: {
    check: {
      rules: [
        // attempt => (attempt.noun ? "successful" : weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt)),
        attempt => (attempt.noun?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "success"),
      ],
    },
  },
};

const Closing: ActionDefinition = { verb: "close" };

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

const Locking: ActionDefinition = { verb: "lock" };

const Dropping: ActionDefinition = { verb: "wait" };

const AskingFor: ActionDefinition = { verb: "asking _ for" };

const PuttingOn: ActionDefinition = { verb: "putting _ on" };

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

main(Rose, Zafra);
