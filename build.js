var tracking = [];
function createCCC(choice, consequence, closure) {
    var ccc = {
        choice: choice,
        consequence: consequence || { foreshadow: choice.foreshadow },
        closure: closure || {}
    };
    tracking.push(ccc);
    return ccc;
}
function getCCC(searchParameters) {
    return tracking.filter(function (ccc) { return ccc.choice == searchParameters.choice; });
}
var makeNoDecision = undefined;
var pretendItWorked = "success";
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
    return (((_a = act.actor) === null || _a === void 0 ? void 0 : _a.name) || "") + " " + act.verb + " " + (act.secondNoun || "") + " " + (act.noun || "");
}
function stringifyAttempt(attempt) {
    return stringifyAction(attempt) + " (" + attempt.status + ")";
}
function printAttempt(attempt) {
    console.log("  '" + stringifyAttempt(attempt) + '"');
}
//////////// action machinery
function executeRulebook(attempt) {
    var _a;
    var rulebooks = attempt.definition.rulebooks;
    if (!rulebooks)
        return makeNoDecision;
    var outcome = makeNoDecision;
    if (rulebooks.check)
        for (var _i = 0, _b = rulebooks.check.rules || []; _i < _b.length; _i++) {
            var rule = _b[_i];
            var ruleResult = rule(attempt);
            if (ruleResult == "failed") {
                attempt.meddlingCheckRule = rule;
                outcome = ruleResult;
                break;
            }
        }
    if (rulebooks.moveDesireables && outcome != "failed") {
        var shouldBeStatements = rulebooks.moveDesireables(attempt);
        for (var _c = 0, shouldBeStatements_1 = shouldBeStatements; _c < shouldBeStatements_1.length; _c++) {
            var statement = shouldBeStatements_1[_c];
            moveDesireable.apply(void 0, statement);
        }
    }
    for (var _d = 0, _e = ((_a = rulebooks.news) === null || _a === void 0 ? void 0 : _a.rules) || [createNewsItem]; _d < _e.length; _d++) {
        var rule = _e[_d];
        var ruleResult = rule(attempt);
    }
    return outcome;
}
/** performs the action */
function doThing(thisAttempt, actor) {
    if (!thisAttempt)
        throw "no TODO";
    if (!actor)
        throw "no ACTOR";
    // DO the currentAction and get status
    var outcome = executeRulebook(thisAttempt);
    console.log(thisAttempt.verb, "is done:", outcome);
    // update trees to record result
    if (outcome != "failed") {
        thisAttempt.status = "successful";
    }
    else {
        console.log("Update plans on failure", stringifyAttempt(thisAttempt));
        // const solution = thisAttempt.fullfilledBy.filter(a => a.status == "successful");
        // if (solution.length > 0) {
        //   if (reasonActionFailed != thisAttempt.meddlingCheckRule) thisAttempt.status = "partly successful";
        // }
        // console.log(solution.length, "partial solutions found");
        // const outcome = whenHinderedBy(thisAttempt, reasonActionFailed!); //	follow when hindered by rules for reason action failed;
        console.log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));
        thisAttempt.status = outcome == pretendItWorked ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
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
    var thisAct = actor.goals.find(function (g) { return g.status == "partly successful"; }) || actor.goals.find(function (g) { return g.status == "untried"; });
    if (!thisAct)
        return undefined;
    if (thisAct.status == "untried")
        return thisAct;
    // let details:Attempt|undefined = thisAct;// thisAct.fullfilledBy.find(at => inThePresent(at));
    var previous = thisAct;
    while (thisAct) {
        //	while a hindered attempt (called details) fulfills thisAct:
        previous = thisAct;
        thisAct = previous.fullfilledBy.find(function (g) { return g.status == "partly successful"; });
        //if (!thisAct) thisAct = previous.fullfilledBy.find(g => g.status == "untried");
    }
    thisAct = previous.fullfilledBy.find(function (at) { return at.status == "successful"; })
        ? previous
        : previous.fullfilledBy.find(function (at) { return at.status == "untried"; });
    console.log("  Q: What is", actor.name, "trying to do now?");
    console.log("  A: " + (thisAct ? stringifyAttempt(thisAct) : "nothing"));
    return thisAct; // [the most finely detailed, and hindered,]
};
var whatTheyWillDoNext = function (actor) {
    var current = whatTheyAreTryingToDoNow(actor);
    var untried = !current ? undefined : howTheyCan(actor, current).find(function (item) { return item.status == "untried"; });
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
function weCouldTry(actor, definition, noun, secondNoun, failingAction) {
    console.log(actor.name, "could try", definition.verb, "before", stringifyAttempt(failingAction));
    var circumvention = {
        verb: definition.verb,
        actor: actor,
        definition: definition,
        noun: noun,
        secondNoun: secondNoun,
        status: "untried",
        meddlingCheckRule: undefined,
        fulfills: failingAction,
        fullfilledBy: []
    };
    failingAction.fullfilledBy.push(circumvention);
    return "failed";
}
function createGoal(actor, definition, noun, secondNoun) {
    var circumvention = {
        verb: definition.verb,
        actor: actor,
        definition: definition,
        noun: noun,
        secondNoun: secondNoun,
        status: "untried",
        meddlingCheckRule: undefined,
        fulfills: undefined,
        fullfilledBy: []
    };
    return circumvention;
}
//////////
function moveDesireable(resource, property, shouldBe, toValue) {
    switch (shouldBe) {
        case "=":
            resource[property] = toValue;
            return;
        default:
            throw "Unknown operation on desireable resource " + shouldBe;
    }
}
///////////
function main() {
    var characters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        characters[_i] = arguments[_i];
    }
    for (var turn = 1; turn < 5; turn++) {
        produceParagraphs(characters);
        console.log("TURN", turn);
        // characters act
        for (var _a = 0, characters_1 = characters; _a < characters_1.length; _a++) {
            var character = characters_1[_a];
            var next = whatTheyAreTryingToDoNow(character);
            console.log(character.name, "next action is", next ? stringifyAttempt(next) : "Nothing");
            if (next)
                doThing(next, character);
        }
        // react to news
        for (var _b = 0, currentTurnsNews_1 = currentTurnsNews; _b < currentTurnsNews_1.length; _b++) {
            var news = currentTurnsNews_1[_b];
            for (var _c = 0, characters_2 = characters; _c < characters_2.length; _c++) {
                var character = characters_2[_c];
                for (var _d = 0, _e = character.beliefs; _d < _e.length; _d++) {
                    var should = _e[_d];
                    if (isButtonPushed(news, should))
                        createScene(character, news);
                }
            }
        }
        // reset news
        if (currentTurnsNews.length) {
            oldNews.push.apply(oldNews, currentTurnsNews);
            currentTurnsNews = [];
        }
    }
    produceParagraphs(characters);
}
/////////
function createScene(character, news) {
    console.log("SCHEDULED SCENE for", character.name, "about", stringifyAction(news));
}
/// <reference path="./narrativeEngine.ts"/>
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
function createNewsItem(attempt) {
    var newsItem = __assign(__assign({}, attempt), { level: attempt.status == "untried" ? "suggested" : attempt.status });
    currentTurnsNews.push(newsItem);
    console.log("NEWS", newsItem);
    return newsItem;
}
var oldNews = [];
var currentTurnsNews = [];
function isButtonPushed(news, belief) {
    var _a, _b;
    var changeStatements = ((_b = (_a = news.definition.rulebooks) === null || _a === void 0 ? void 0 : _a.moveDesireables) === null || _b === void 0 ? void 0 : _b.call(_a, news)) || [];
    if (!changeStatements || !changeStatements.length)
        return false;
    for (var _i = 0, changeStatements_1 = changeStatements; _i < changeStatements_1.length; _i++) {
        var statement = changeStatements_1[_i];
        if (statement[0] != belief.resource)
            continue;
        if (statement[1] != belief.property)
            continue;
        // if (statement[2] != belief.toValue) return true;
        // if (statement[3] != belief.toValue) return true;
        return true;
    }
    return false;
}
/// <reference path="./narrativeEngine.ts"/>
function produceParagraphs(information) {
    var paragraph = stringify(information);
    console.log(paragraph);
    return paragraph;
}
/// <reference path="./iPlot.ts" />
/// <reference path="./produceParagraphs.ts" />
/// <reference path="./narrativeEngine.ts" />
///////////////
var doorkey = { name: "door key", isKey: true };
var door = { name: "door", isLocked: true };
var desireables = [
    { name: "Rose's inheritance" },
    { name: "Legitamacy in the eyes of the court" },
    { name: "to be at Harrenfall before the 12th" },
    doorkey,
    door,
];
////////////////
var Waiting = {
    verb: "wait"
};
var Exiting = {
    verb: "exit",
    rulebooks: {
        check: {
            rules: [
                function (attempt) {
                    if (!door.isLocked)
                        return "success";
                    weCouldTry(attempt.actor, Unlocking, door, undefined, attempt);
                    return "failed";
                },
            ]
        }
    }
};
var Taking = {
    verb: "take"
};
var TakingOff = {
    verb: "take off"
};
var Opening = {
    verb: "open",
    rulebooks: {
        check: {
            rules: [
                // attempt => {
                //   if (!attempt.directObject) {
                //     return weCouldTry(attempt.actor,  Unlocking, attempt.noun,undefined, attempt);
                //   }
                //   return "success";
                // },
                function (attempt) { var _a; return (((_a = attempt.noun) === null || _a === void 0 ? void 0 : _a.isLocked) ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "success"); },
            ]
        }
    }
};
var Closing = {
    verb: "close"
};
var Unlocking = {
    verb: "unlock _ with",
    rulebooks: {
        check: {
            rules: [
            //        attempt=> !attempt.secondNoun?.isKey ? weCouldTry() : "success",
            ]
        },
        moveDesireables: function (attempt) { return [[attempt.noun, "isLocked", "=", false]]; }
    }
};
var Locking = {
    verb: "lock"
};
var Dropping = {
    verb: "wait"
};
var AskingFor = {
    verb: "asking _ for"
};
var PuttingOn = {
    verb: "putting _ on"
};
/////////////////
var Rose = {
    name: "Rose",
    beliefs: [],
    think: function () { },
    goals: []
};
Rose.goals.push(createGoal(Rose, Exiting));
var Zafra = {
    name: "Zafra",
    beliefs: [{ resource: door, property: "isLocked", shouldBe: "=", toValue: true }],
    think: function () { },
    goals: []
};
////////////
main(Rose, Zafra);
