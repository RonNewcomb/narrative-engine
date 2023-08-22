"use strict";
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
exports.__esModule = true;
exports.WhenHinderedByRules = exports.weCouldTry = exports.whatTheyWillDoNext = exports.whatTheyAreTryingToDoNow = exports.howTheyCan = exports.doThing = exports.printAttempt = exports.stringifyAttempt = exports.stringifyAction = exports.stringify = exports.characters = exports.pretendItWorked = exports.makeNoDecision = void 0;
exports.makeNoDecision = undefined;
exports.pretendItWorked = "success";
///////////////
exports.characters = [];
var reasonActionFailed;
var personAsked;
var player;
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
exports.stringify = stringify;
function stringifyAction(act) {
    var _a;
    return (((_a = act.actor) === null || _a === void 0 ? void 0 : _a.name) || "") + " " + act.verb + " " + (act.indirectObject || "") + " " + (act.directObject || "");
}
exports.stringifyAction = stringifyAction;
function stringifyAttempt(attempt) {
    return stringifyAction(attempt.action) + " (" + attempt.status + ")";
}
exports.stringifyAttempt = stringifyAttempt;
function printAttempt(attempt) {
    console.log("  '" + stringifyAttempt(attempt) + '"');
}
exports.printAttempt = printAttempt;
//////////// action machinery
function executeRulebook(act, attempt) {
    var rulebooks = act.definition.rulebooks;
    for (var _i = 0, _a = rulebooks.check.rules; _i < _a.length; _i++) {
        var rule = _a[_i];
        var outcome = rule(act, attempt);
        if (outcome == "failed")
            reasonActionFailed = rule;
        if (!!outcome)
            return outcome;
    }
    for (var _b = 0, _c = rulebooks.moveDesireables.rules; _b < _c.length; _b++) {
        var rule = _c[_b];
        var outcome = rule(act, attempt);
        if (outcome == "failed")
            reasonActionFailed = rule;
        if (!!outcome)
            return outcome;
    }
    for (var _d = 0, _e = rulebooks.news.rules; _d < _e.length; _d++) {
        var rule = _e[_d];
        var outcome = rule(act, attempt);
        // if (outcome == "failed") reasonActionFailed = rule;
        // if (!!outcome) return outcome;
    }
    return exports.makeNoDecision;
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
    var outcome = executeRulebook(thisAttempt.action, thisAttempt);
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
        thisAttempt.status = outcome_1 == exports.pretendItWorked ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
    }
    return exports.makeNoDecision;
}
exports.doThing = doThing;
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
exports.howTheyCan = howTheyCan;
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
exports.whatTheyAreTryingToDoNow = whatTheyAreTryingToDoNow;
var whatTheyWillDoNext = function (actor) {
    var choices = (0, exports.howTheyCan)(actor, (0, exports.whatTheyAreTryingToDoNow)(actor));
    var untried = choices.find(function (item) { return item.status == "untried"; });
    //actor.goals.action = Waiting;
    console.log("  Q: What will", actor.name, "do next?");
    console.log("  A: ", untried ? stringifyAttempt(untried) : "No options.");
    return untried; //actor.goals; // of actor. ["I don't know"]
};
exports.whatTheyWillDoNext = whatTheyWillDoNext;
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
exports.weCouldTry = weCouldTry;
exports.WhenHinderedByRules = [];
var whenHinderedBy = function (attempt, checkRuleThatFailedIt) {
    var actor = attempt.action.actor;
    // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
    if (actor == player)
        return "failed";
    console.log("RULE NAME", checkRuleThatFailedIt.name);
    for (var _i = 0, WhenHinderedByRules_1 = exports.WhenHinderedByRules; _i < WhenHinderedByRules_1.length; _i++) {
        var rules = WhenHinderedByRules_1[_i];
        var outcome = rules(attempt, checkRuleThatFailedIt);
        if (!!outcome)
            return outcome;
    }
    return exports.makeNoDecision;
};
