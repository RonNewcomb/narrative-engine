"use strict";
exports.__esModule = true;
var narrativeEngine_1 = require("./narrativeEngine");
var produceParagraphs_1 = require("./produceParagraphs");
///////////////
var desireables = [
    { name: "Rose's inheritance" },
    { name: "Legitamacy in the eyes of the court" },
    { name: "to be at Harrenfall before the 12th" },
];
////////////////
var Waiting = {
    verb: "wait",
    createAction: function (actor) { return ({ verb: Waiting.verb, actor: actor, definition: Waiting }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var Exiting = {
    verb: "exit",
    createAction: function (actor) { return ({ verb: Exiting.verb, actor: actor, definition: Exiting }); },
    rulebooks: {
        check: {
            rules: [
                function cantlockwhatsopen(action, attempt) {
                    if (false)
                        return "success";
                    (0, narrativeEngine_1.weCouldTry)(action.actor, Closing.createAction(action.actor, "whatever"), attempt);
                    return "failed";
                },
            ]
        },
        moveDesireables: { rules: [] },
        news: { rules: [] }
    }
};
var Taking = {
    verb: "take",
    createAction: function (actor, noun) { return ({ verb: Taking.verb, directObject: noun, actor: actor, definition: Taking }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var TakingOff = {
    verb: "take off",
    createAction: function (actor, noun) { return ({ verb: TakingOff.verb, directObject: noun, actor: actor, definition: TakingOff }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var Opening = {
    verb: "open",
    createAction: function (actor, noun) { return ({ verb: Opening.verb, directObject: noun, actor: actor, definition: Opening }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var Closing = {
    verb: "close",
    createAction: function (actor, noun) { return ({ verb: Closing.verb, directObject: noun, actor: actor, definition: Closing }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var Dropping = {
    verb: "wait",
    createAction: function (actor, noun) { return ({ verb: Dropping.verb, directObject: noun, actor: actor, definition: Dropping }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var AskingFor = {
    verb: "asking _ for",
    createAction: function (actor, noun, secondNoun) { return ({
        verb: AskingFor.verb,
        actor: actor,
        directObject: noun,
        indirectObject: secondNoun,
        definition: AskingFor
    }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
var PuttingOn = {
    verb: "putting _ on",
    createAction: function (actor, noun, secondNoun) { return ({
        verb: PuttingOn.verb,
        actor: actor,
        directObject: noun,
        indirectObject: secondNoun,
        definition: PuttingOn
    }); },
    rulebooks: { check: { rules: [] }, moveDesireables: { rules: [] }, news: { rules: [] } }
};
////////////////
narrativeEngine_1.WhenHinderedByRules.push(function (attempt, checkRuleThatFailedIt) {
    var actor = attempt.action.actor;
    var noun = attempt.action.directObject;
    var secondNoun = attempt.action.indirectObject;
    switch (checkRuleThatFailedIt.name) {
        case "cantwearwhatsnotheld":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantwavewhatsnotheld":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantshowwhatyouhaventgot":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantgivewhatyouhaventgot":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "canttakewhatyoureinside":
            (0, narrativeEngine_1.weCouldTry)(actor, Exiting.createAction(actor), attempt);
            break;
        case "cantenterclosedcontainers":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Opening.createAction(actor, noun), attempt);
            break;
        //  case "cantexitclosedcontainers": weCouldTry(actor,Opening.createAction(personAsked.holder));break;
        case "cantinsertintoclosedcontainers":
            if (secondNoun)
                (0, narrativeEngine_1.weCouldTry)(actor, Opening.createAction(actor, secondNoun), attempt);
            break;
        //  case "cantsearchclosedopaquecontainers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening.createAction(noun));break;
        case "cantlockwhatsopen":
            (0, narrativeEngine_1.weCouldTry)(actor, Closing.createAction(actor, "whatever"), attempt);
            break;
        case "cantentersomethingcarried":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Dropping.createAction(actor, noun), attempt);
            break;
        case "cantputontosomethingbeingcarried":
            if (secondNoun)
                (0, narrativeEngine_1.weCouldTry)(actor, Dropping.createAction(actor, secondNoun), attempt);
            if (noun && secondNoun)
                (0, narrativeEngine_1.weCouldTry)(actor, PuttingOn.createAction(actor, noun, secondNoun), attempt);
            break;
        case "cantdropclothesbeingworn":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "cantputclothesbeingworn":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        //  case "canttakepeoplespossessions": weCouldTry(actor,AskingFor.createAction(  noun.holder,  noun));break;
        case "cantinsertclothesbeingworn":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "cantgiveclothesbeingworn":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "carryingrequirements":
            if (noun)
                (0, narrativeEngine_1.weCouldTry)(actor, Taking.createAction(actor, noun), attempt);
            break;
        default:
            return narrativeEngine_1.pretendItWorked;
    }
    return narrativeEngine_1.makeNoDecision;
});
/////////////////
var Rose = {
    name: "Rose",
    shoulds: [],
    think: function () { },
    goals: []
};
////////////
function main() {
    Rose.goals.push({ action: Exiting.createAction(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
    narrativeEngine_1.characters.push(Rose);
    console.log((0, narrativeEngine_1.stringify)(narrativeEngine_1.characters));
    /// init end
    // go
    for (var turn = 1; turn < 3; turn++) {
        console.log("TURN", turn);
        for (var _i = 0, characters_1 = narrativeEngine_1.characters; _i < characters_1.length; _i++) {
            var character = characters_1[_i];
            var next = (0, narrativeEngine_1.whatTheyAreTryingToDoNow)(character);
            console.log("Their next action is", (0, narrativeEngine_1.stringifyAttempt)(next));
            (0, narrativeEngine_1.doThing)(next, character);
        }
    }
    console.log((0, narrativeEngine_1.stringify)(narrativeEngine_1.characters));
    (0, produceParagraphs_1.produceParagraphs)(narrativeEngine_1.characters);
}
main();
