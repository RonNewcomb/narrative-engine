var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var makeNoDecision = undefined;
var pretendItWorked = "success";
///////////////
var characters = [];
var reasonActionFailed;
var personAsked;
var player;
var Waiting = {
    verb: "wait",
    createAction: function (actor) { return ({ verb: Waiting.verb, actor: actor, definition: Waiting }); },
    rulebook: { rules: [] }
};
var Exiting = {
    verb: "exit",
    createAction: function (actor) { return ({ verb: Exiting.verb, actor: actor, definition: Exiting }); },
    rulebook: {
        rules: [
            function cantlockwhatsopen() {
                return "failed";
            },
        ]
    }
};
var Taking = {
    verb: "take",
    createAction: function (actor, noun) { return ({ verb: Taking.verb, directObject: noun, actor: actor, definition: Taking }); },
    rulebook: { rules: [] }
};
var TakingOff = {
    verb: "take off",
    createAction: function (actor, noun) { return ({ verb: TakingOff.verb, directObject: noun, actor: actor, definition: TakingOff }); },
    rulebook: { rules: [] }
};
var Opening = {
    verb: "open",
    createAction: function (actor, noun) { return ({ verb: Opening.verb, directObject: noun, actor: actor, definition: Opening }); },
    rulebook: { rules: [] }
};
var Closing = {
    verb: "close",
    createAction: function (actor, noun) { return ({ verb: Closing.verb, directObject: noun, actor: actor, definition: Closing }); },
    rulebook: { rules: [] }
};
var Dropping = {
    verb: "wait",
    createAction: function (actor, noun) { return ({ verb: Dropping.verb, directObject: noun, actor: actor, definition: Dropping }); },
    rulebook: { rules: [] }
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
    rulebook: { rules: [] }
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
    rulebook: { rules: [] }
};
/////////// debug
function stringify(obj) {
    return JSON.stringify(obj, function (key, value) {
        return key == "actor" && !!value
            ? "\\\\".concat(value.name)
            : key == "fulfills" && !!value
                ? "\\\\<backlink>"
                : key == "definition"
                    ? undefined
                    : value;
    }, 4);
}
function stringifyAction(act) {
    var _a;
    return (((_a = act.actor) === null || _a === void 0 ? void 0 : _a.name) || "") + " " + act.verb + " " + (act.indirectObject || "") + " " + (act.directObject || "");
}
function stringifyAttempt(attempt) {
    return stringifyAction(attempt.action) + " (" + attempt.status + ")";
}
function printAttempt(attempt) {
    console.log("  '" + stringifyAttempt(attempt) + '"');
}
//////////// action machinery
function executeRulebook(act) {
    var rulebook = act.definition.rulebook;
    for (var _i = 0, _a = rulebook.rules; _i < _a.length; _i++) {
        var rule = _a[_i];
        var outcome = rule(act.directObject, act.indirectObject, act.actor);
        if (outcome == "failed")
            reasonActionFailed = rule;
        if (!!outcome)
            return outcome;
    }
    return makeNoDecision;
}
/** performs the action */
function doThing(thisAttempt, actor) {
    if (!thisAttempt)
        throw "no TODO";
    if (!actor)
        throw "no ACTOR";
    personAsked = actor;
    reasonActionFailed = undefined;
    // DO the currentAction and get status
    var outcome = executeRulebook(thisAttempt.action);
    console.log(thisAttempt.action.verb, "is done:", outcome);
    // update trees to record result
    if (outcome != "failed") {
        thisAttempt.status = "successful";
    }
    else {
        console.log("Update plans on failure", stringifyAttempt(thisAttempt));
        var solution = thisAttempt.fullfilledBy.filter(function (a) { return a.status == "successful"; });
        if (solution.length > 0) {
            if (reasonActionFailed != thisAttempt.meddlingCheckRule)
                thisAttempt.status = "partly successful";
        }
        console.log(solution.length, "partial solutions found");
        var outcome_1 = whenHinderedBy(thisAttempt, reasonActionFailed); //	follow when hindered by rules for reason action failed;
        console.log("circumventions outcome:", outcome_1, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));
        thisAttempt.status = outcome_1 == pretendItWorked ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
    }
    return makeNoDecision;
}
/////////// Planner AI
var hindered = function (it) {
    return (it.status == "failed" || it.status == "partly successful") &&
        it.fullfilledBy.filter(function (at) { return at.status == "untried"; }).length > 0 &&
        it.fullfilledBy.filter(function (at) { return at.status == "successful"; }).length == 0;
};
// attempts().some(at => at.fulfills == it && at.status == "untried") &&
// !attempts().some(at => at.fulfills == it && at.status == "successful");
// there are untried attempts which fulfill it && there are no successful attempts which fulfill it;
var moot = function (it) { return it.status == "untried" && it.fulfills && ["successful", "partly successful"].includes(it.fulfills.status); };
//attempts().some(at => ["successful", "partly successful"].includes(at.fulfills?.status || ""));
//  it fulfills an [already] successful attempt || it fulfills a partly successful attempt));
var inTheFuture = function (it) { return it.status == "untried" && (!it.fulfills || inTheFuture(it.fulfills)); }; // attempts().every(at => at.fulfills?.status == "successful"); // it does not fulfill an [already] successful attempt;
var inThePresent = function (it) { return hindered(it); };
var inThePast = function (it) {
    return it.status == "successful" ||
        it.status == "partly successful" ||
        (it.status == "failed" && it.fullfilledBy.filter(function (at) { return at.status == "untried"; }).length == 0);
};
// !attempts().some(at => at.status == "untried" && at.fulfills == it)); //there are no untried attempts which fulfill it);
var couldveBeen = function (it) { return moot(it); };
//const isTopLevel = (it: Attempt) => !it.fulfills; // someone plans the cause of it  // it fulfills no higher goal
var busy = function (actor) { return !quiescent(actor); };
var quiescent = function (actor) { return actor.goals.filter(function (at) { return !inThePast(at); }).length > 0; };
//attempts().every(at => at.fulfills == actor.goals && inThePast(at)); // all attempts which [could possibly] fulfill goals of actor are in past;
var confusedAboutTiming;
// const whyTheyDid = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inThePast(act);
//   return act.fulfills;
// };
// const whyTheyWill = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inTheFuture(act);
//   return act.fulfills;
// };
// const whyTheyAre = (actor: Character, act: Attempt): Attempt | undefined => {
//   confusedAboutTiming = !inThePresent(act);
//   return act.fulfills;
// };
// const howTheydid = (actor: Character, act: Attempt): Attempt => {
//   confusedAboutTiming = !inThePast(act);
//   if (confusedAboutTiming) return howTheyWill(actor, act);
//   let method = attempts().find(at => at.status == "successful" && at.fulfills == act);
//   //if there is a successful attempt (called method) which fulfills act,
//   if (method) return method;
//   method = attempts().find(at => at.status == "partly successful" && at.fulfills == act);
//   // if there is a partly successful attempt (called method) which fulfills act,
//   if (method) return method;
//   return act; //[ action was so simple and straightforward there is no "how" ]
// };
// const howTheyWill = (actor: Character, act: Attempt): Attempt => {
//   confusedAboutTiming = inThePast(act);
//   let choices = howTheyCan(actor, act);
//   for (const detail of choices) if (hindered(detail)) return howTheyWill(actor, detail);
//   for (const detail of choices) if (detail.status == "untried") return detail;
//   return actor.goals;
// };
var howTheyCan = function (actor, act) {
    //[	return list of not in past attempts which fulfill act.]
    var options = act.fullfilledBy.filter(function (a) { return !inThePast(a); });
    console.log("  Q: How can", actor.name, stringifyAttempt(act));
    console.log("  A:", options.map(stringifyAttempt));
    return options;
    // let choices = [] as Attempt[];
    // const list = attempts().filter(at => !inThePast(at) && at.fulfills == act); // not in past attempts which fulfill act
    // for (const item of list) choices.push(item);
    // console.log("  choices are", choices.map(stringifyAttempt));
    // return choices;
};
// const howTheyCould = (actor: Character, act: Attempt): Attempt[] => {
//   //[	return list of attempts which fulfill act.]
//   let choices = [] as Attempt[];
//   const list = attempts().filter(at => at.fulfills == act); //for(const item  of  attempts which fulfill act )
//   for (const item of list) choices.push(item);
//   return choices;
// };
// const howTheyCouldHave = (actor: Character, act: Attempt): Attempt[] => {
//   //	[return fixed list of could've been attempts which fulfill act.]
//   let choices = [] as Attempt[];
//   const list = attempts().filter(at => couldveBeen(at) && at.fulfills == act); //for(const item  of  couldvebeen attempts which fulfill act)
//   for (const item of list) choices.push(item);
//   return choices;
// };
var whatTheyAreTryingToDoNow = function (actor) {
    var thisAct = actor.goals[0];
    // let details:Attempt|undefined = thisAct;// thisAct.fullfilledBy.find(at => inThePresent(at));
    var details = actor.goals[0];
    while (details) {
        //	while a hindered attempt (called details) fulfills thisAct:
        thisAct = details;
        details = thisAct.fullfilledBy.find(function (at) { return inThePresent(at); });
    }
    console.log("  Q: What is", actor.name, "trying to do now?");
    console.log("  A: " + stringifyAttempt(thisAct));
    return thisAct; // [the most finely detailed, and hindered,]
};
var whatTheyWillDoNext = function (actor) {
    var choices = howTheyCan(actor, whatTheyAreTryingToDoNow(actor));
    var untried = choices.find(function (item) { return item.status == "untried"; });
    //actor.goals.action = Waiting;
    console.log("  Q: What will", actor.name, "do next?");
    console.log("  A: ", untried ? stringifyAttempt(untried) : "No options.");
    return untried; //actor.goals; // of actor. ["I don't know"]
};
// const whichActionFromTheAgendaOf = (act: Action, performer: Character): Attempt | undefined => {
//   act.actor = performer;
//   let mostRecentAnswer: Attempt | undefined = undefined;
//   for (const item of attempts()) if (act == item.action) mostRecentAnswer = item;
//   return mostRecentAnswer;
// };
/** attaches a suggestion to the tree */
function weCouldTry(actor, suggestion, thisAttempt) {
    console.log(actor.name, "could try", stringifyAction(suggestion), "before", stringifyAttempt(thisAttempt));
    var circumvention = {
        action: __assign(__assign({}, suggestion), { actor: actor }),
        status: "untried",
        fulfills: thisAttempt,
        fullfilledBy: []
    };
    thisAttempt.fullfilledBy.push(circumvention);
    return circumvention;
}
var whenHinderedBy = function (attempt, checkRuleThatFailedIt) {
    var actor = attempt.action.actor;
    var noun = attempt.action.directObject;
    var secondNoun = attempt.action.indirectObject;
    // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
    if (actor == player)
        return "failed";
    console.log("RULE NAME", checkRuleThatFailedIt.name);
    switch (checkRuleThatFailedIt.name) {
        case "cantwearwhatsnotheld":
            if (noun)
                weCouldTry(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantwavewhatsnotheld":
            if (noun)
                weCouldTry(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantshowwhatyouhaventgot":
            if (noun)
                weCouldTry(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "cantgivewhatyouhaventgot":
            if (noun)
                weCouldTry(actor, Taking.createAction(actor, noun), attempt);
            break;
        case "canttakewhatyoureinside":
            weCouldTry(actor, Exiting.createAction(actor), attempt);
            break;
        case "cantenterclosedcontainers":
            if (noun)
                weCouldTry(actor, Opening.createAction(actor, noun), attempt);
            break;
        //  case "cantexitclosedcontainers": weCouldTry(actor,Opening.createAction(personAsked.holder));break;
        case "cantinsertintoclosedcontainers":
            if (secondNoun)
                weCouldTry(actor, Opening.createAction(actor, secondNoun), attempt);
            break;
        //  case "cantsearchclosedopaquecontainers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening.createAction(noun));break;
        case "cantlockwhatsopen":
            weCouldTry(actor, Closing.createAction(actor, "whatever"), attempt);
            break;
        case "cantentersomethingcarried":
            if (noun)
                weCouldTry(actor, Dropping.createAction(actor, noun), attempt);
            break;
        case "cantputontosomethingbeingcarried":
            if (secondNoun)
                weCouldTry(actor, Dropping.createAction(actor, secondNoun), attempt);
            if (noun && secondNoun)
                weCouldTry(actor, PuttingOn.createAction(actor, noun, secondNoun), attempt);
            break;
        case "cantdropclothesbeingworn":
            if (noun)
                weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "cantputclothesbeingworn":
            if (noun)
                weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        //  case "canttakepeoplespossessions": weCouldTry(actor,AskingFor.createAction(  noun.holder,  noun));break;
        case "cantinsertclothesbeingworn":
            if (noun)
                weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "cantgiveclothesbeingworn":
            if (noun)
                weCouldTry(actor, TakingOff.createAction(actor, noun), attempt);
            break;
        case "carryingrequirements":
            if (noun)
                weCouldTry(actor, Taking.createAction(actor, noun), attempt);
            break;
        default:
            return pretendItWorked;
    }
    return makeNoDecision;
};
/////////////////
function main() {
    var Rose = {
        name: "Rose",
        buttons: [],
        think: function () { },
        goals: []
    };
    Rose.goals.push({ action: Exiting.createAction(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
    characters.push(Rose);
    console.log(stringify(characters));
    /// init end
    // go
    for (var turn = 1; turn < 3; turn++) {
        console.log("TURN", turn);
        for (var _i = 0, characters_1 = characters; _i < characters_1.length; _i++) {
            var character = characters_1[_i];
            var next = whatTheyAreTryingToDoNow(character);
            console.log("Their next action is", stringifyAttempt(next));
            doThing(next, character);
        }
    }
    console.log(stringify(characters));
}
main();
