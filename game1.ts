/// <reference path="./iPlot.ts" />
/// <reference path="./produceParagraphs.ts" />
/// <reference path="./narrativeEngine.ts" />

///////////////

const desireables: Desireable[] = [
  { name: "Rose's inheritance" },
  { name: "Legitamacy in the eyes of the court" },
  { name: "to be at Harrenfall before the 12th" },
  { name: "door key", isKey: true },
  { name: "door", isLocked: true },
];

////////////////

const Waiting: ActionDefinition = {
  verb: "wait",
  //  create: (actor: Character) => makeAttemptObject(Waiting, actor),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Exiting: ActionDefinition = {
  verb: "exit",
  //  create: (actor: Character) => makeAttemptObject(Exiting, actor),
  rulebooks: {
    check: {
      rules: [
        attempt => {
          const door = desireables.find(d => d.name == "door");
          if (!door) throw "door??";
          if (!door.isLocked) return "success";
          weCouldTry(attempt.actor, Unlocking, door, undefined, attempt);
          return "failed";
        },
      ],
    },
    moveDesireables: { rules: [] },
    news: { rules: [] },
  },
};

const Taking: ActionDefinition = {
  verb: "take",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(Taking, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const TakingOff: ActionDefinition = {
  verb: "take off",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(TakingOff, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Opening: ActionDefinition = {
  verb: "open",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(Opening, actor, noun),
  rulebooks: {
    check: {
      rules: [
        // attempt => {
        //   if (!attempt.directObject) {
        //     return weCouldTry(attempt.actor,  Unlocking, attempt.noun,undefined, attempt);
        //   }
        //   return "success";
        // },
        attempt => (attempt.noun?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "success"),
      ],
    },
    moveDesireables: { rules: [] },
    news: { rules: [] },
  },
};

const Closing: ActionDefinition = {
  verb: "close",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(Closing, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with",
  //  create: (actor: Character, door: Noun, key: Noun) => makeAttemptObject(Unlocking, actor, door, key),
  rulebooks: {
    check: {
      rules: [
        //        attempt=> !attempt.secondNoun?.isKey ? weCouldTry() : "success",
      ],
    },
    moveDesireables: {
      rules: [
        attempt => {
          attempt.noun!.isLocked = false;
        },
      ],
    },
    news: {
      rules: [
        a => {
          const door = desireables.find(d => d.name == "door");
          console.log("door is", door);
        },
      ],
    },
  },
};

const Locking: ActionDefinition = {
  verb: "lock",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(Locking, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Dropping: ActionDefinition = {
  verb: "wait",
  //  create: (actor: Character, noun: Noun) => makeAttemptObject(Dropping, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const AskingFor: ActionDefinition = {
  verb: "asking _ for",
  //  create: (actor: Character, otherPerson: Noun, thing: Noun) => makeAttemptObject(AskingFor, actor, otherPerson, thing),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const PuttingOn: ActionDefinition = {
  verb: "putting _ on",
  //  create: (actor: Character, noun: Noun, secondNoun: Noun) => makeAttemptObject(PuttingOn, actor, noun, secondNoun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

/////////////////

const Rose: Character = {
  name: "Rose",
  shoulds: [],
  think: () => {},
  goals: [],
};
Rose.goals.push(createGoal(Rose, Exiting));

////////////

main(Rose);
