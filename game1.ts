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

////////////////

// WhenHinderedByRules.push((attempt: Attempt, checkRuleThatFailedIt: Rule): RuleOutcome => {
//   const actor: Character = attempt.action.actor;
//   const noun: Noun | undefined = attempt.action.directObject;
//   const secondNoun: Noun | undefined = attempt.action.indirectObject;

//   switch (checkRuleThatFailedIt.name) {
//     case "cantwearwhatsnotheld":
//       if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt,checkRuleThatFailedIt);
//       break;
//     case "cantwavewhatsnotheld":
//       if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt,checkRuleThatFailedIt);
//       break;
//     case "cantshowwhatyouhaventgot":
//       if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt,checkRuleThatFailedIt);
//       break;
//     case "cantgivewhatyouhaventgot":
//       if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt,checkRuleThatFailedIt);
//       break;
//     case "canttakewhatyoureinside":
//       weCouldTry(actor, Exiting.createAction(actor), attempt,checkRuleThatFailedIt);
//       break;
//     case "cantenterclosedcontainers":
//       if (noun) weCouldTry(actor, Opening.createAction(actor, noun), attempt,checkRuleThatFailedIt);
//       break;
//     //  case "cantexitclosedcontainers": weCouldTry(actor,Opening.createAction(personAsked.holder));break;
//     case "cantinsertintoclosedcontainers":
//       if (secondNoun) weCouldTry(actor, Opening.createAction(actor, secondNoun), attempt);
//       break;
//     //  case "cantsearchclosedopaquecontainers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening.createAction(noun));break;
//     case "cantlockwhatsopen":
//       weCouldTry(actor, Closing.createAction(actor, "whatever"), attempt);
//       break;
//     case "cantentersomethingcarried":
//       if (noun) weCouldTry(actor, Dropping.createAction(actor, noun), attempt);
//       break;
//     case "cantputontosomethingbeingcarried":
//       if (secondNoun) weCouldTry(actor, Dropping.createAction(actor, secondNoun), attempt);
//       if (noun && secondNoun) weCouldTry(actor, PuttingOn.createAction(actor, noun, secondNoun), attempt);
//       break;
//     case "cantdropclothesbeingworn":
//       if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
//       break;
//     case "cantputclothesbeingworn":
//       if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
//       break;
//     //  case "canttakepeoplespossessions": weCouldTry(actor,AskingFor.createAction(  noun.holder,  noun));break;
//     case "cantinsertclothesbeingworn":
//       if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
//       break;
//     case "cantgiveclothesbeingworn":
//       if (noun) weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
//       break;
//     case "carryingrequirements":
//       if (noun) weCouldTry(actor, Taking.createAction(actor, noun), attempt);
//       break;
//     default:
//       return pretendItWorked;
//   }
//   return makeNoDecision;
// });

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
  console.log(stringify(characters));
  /// init end

  // go
  for (let turn = 1; turn < 3; turn++) {
    console.log("TURN", turn);
    for (let character of characters) {
      const next = whatTheyAreTryingToDoNow(character);
      console.log("Their next action is", stringifyAttempt(next));
      doThing(next, character);
    }
  }

  console.log(stringify(characters));
  produceParagraphs(characters);
}

console.log("running main");
main();
