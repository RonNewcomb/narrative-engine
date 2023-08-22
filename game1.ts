/// <reference path="./iPlot.ts" />
/// <reference path="./produceParagraphs.ts" />
/// <reference path="./narrativeEngine.ts" />

///////////////

const desireables: Desireable[] = [
  { name: "Rose's inheritance" },
  { name: "Legitamacy in the eyes of the court" },
  { name: "to be at Harrenfall before the 12th" },
];

////////////////

const Waiting: ActionDefinition = {
  verb: "wait",
  createAction: (actor: Character): Action => ({ verb: Waiting.verb, actor, definition: Waiting }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Exiting: ActionDefinition = {
  verb: "exit",
  createAction: (actor: Character): Action => ({ verb: Exiting.verb, actor, definition: Exiting }),
  rulebooks: {
    check: {
      rules: [
        function cantlockwhatsopen(action: Action, attempt: Attempt) {
          if (false) return "success";
          weCouldTry(action.actor, Closing.createAction(action.actor, "whatever"), attempt);
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
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Taking.verb, directObject: noun, actor, definition: Taking }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const TakingOff: ActionDefinition = {
  verb: "take off",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: TakingOff.verb, directObject: noun, actor, definition: TakingOff }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Opening: ActionDefinition = {
  verb: "open",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Opening.verb, directObject: noun, actor, definition: Opening }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Closing: ActionDefinition = {
  verb: "close",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Closing.verb, directObject: noun, actor, definition: Closing }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const Dropping: ActionDefinition = {
  verb: "wait",
  createAction: (actor: Character, noun: Noun): Action => ({ verb: Dropping.verb, directObject: noun, actor, definition: Dropping }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const AskingFor: ActionDefinition = {
  verb: "asking _ for",
  createAction: (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
    verb: AskingFor.verb,
    actor,
    directObject: noun,
    indirectObject: secondNoun,
    definition: AskingFor,
  }),
  rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } },
};

const PuttingOn: ActionDefinition = {
  verb: "putting _ on",
  createAction: (actor: Character, noun: Noun, secondNoun: Noun): Action => ({
    verb: PuttingOn.verb,
    actor,
    directObject: noun,
    indirectObject: secondNoun,
    definition: PuttingOn,
  }),
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
  Rose.goals.push({ action: Exiting.createAction(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
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
