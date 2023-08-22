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

function ActionFactory(def: ActionDefinition, actor: Character, noun?: Noun, secondNoun?: Noun): Attempt {
  const action: Attempt = {
    verb: def.verb,
    definition: def,
    noun: noun,
    secondNoun: secondNoun,
    actor: actor,
    status: "untried",
    meddlingCheckRule: undefined,
    fulfills: undefined,
    fullfilledBy: [],
  };
  return action;
}

const Waiting: ActionDefinition = {
  verb: "wait",
  create: (actor: Character) => ActionFactory(Waiting, actor),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Exiting: ActionDefinition = {
  verb: "exit",
  create: (actor: Character) => ActionFactory(Exiting, actor),
  rulebooks: {
    check: {
      rules: [
        attempt => {
          const door = desireables.find(d => d.name == "door");
          if (!door) throw "door??";
          if (!door.isLocked) return "success";
          weCouldTry(attempt.actor, Unlocking.create(attempt.actor, door), attempt);
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
  create: (actor: Character, noun: Noun) => ActionFactory(Taking, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const TakingOff: ActionDefinition = {
  verb: "take off",
  create: (actor: Character, noun: Noun) => ActionFactory(TakingOff, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Opening: ActionDefinition = {
  verb: "open",
  create: (actor: Character, noun: Noun) => ActionFactory(Opening, actor, noun),
  rulebooks: {
    check: {
      rules: [
        // attempt => {
        //   if (!attempt.directObject) {
        //     return weCouldTry(attempt.actor, Unlocking.create(attempt.actor, attempt.directObject), attempt);
        //   }
        //   return "success";
        // },
        attempt => (attempt.noun?.isLocked ? weCouldTry(attempt.actor, Unlocking.create(attempt.actor, attempt.noun), attempt) : "success"),
      ],
    },
    moveDesireables: { rules: [] },
    news: { rules: [] },
  },
};

const Closing: ActionDefinition = {
  verb: "close",
  create: (actor: Character, noun: Noun) => ActionFactory(Closing, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with",
  create: (actor: Character, door: Noun, key: Noun) => ActionFactory(Unlocking, actor, door, key),
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
          return "success";
        },
      ],
    },
    news: {
      rules: [
        a => {
          const door = desireables.find(d => d.name == "door");
          console.log("door is", door);
          return "success";
        },
      ],
    },
  },
};

const Locking: ActionDefinition = {
  verb: "lock",
  create: (actor: Character, noun: Noun) => ActionFactory(Locking, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Dropping: ActionDefinition = {
  verb: "wait",
  create: (actor: Character, noun: Noun) => ActionFactory(Dropping, actor, noun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const AskingFor: ActionDefinition = {
  verb: "asking _ for",
  create: (actor: Character, otherPerson: Noun, thing: Noun) => ActionFactory(AskingFor, actor, otherPerson, thing),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const PuttingOn: ActionDefinition = {
  verb: "putting _ on",
  create: (actor: Character, noun: Noun, secondNoun: Noun) => ActionFactory(PuttingOn, actor, noun, secondNoun),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

/////////////////

const Rose: Character = {
  name: "Rose",
  shoulds: [],
  think: () => {},
  goals: [],
};

////////////

function main() {
  Rose.goals.push(Exiting.create(Rose));
  characters.push(Rose);
  /// init end

  // go
  for (let turn = 1; turn < 4; turn++) {
    produceParagraphs(characters);
    console.log("TURN", turn);
    for (let character of characters) {
      const next = whatTheyAreTryingToDoNow(character);
      console.log("Their next action is", next ? stringifyAttempt(next) : "Nothing");
      if (next) doThing(next, character);
    }
  }

  produceParagraphs(characters);
}

main();
