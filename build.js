function createScene(type, actor, news, belief) {
    var scene = type == "reaction" ? { type: type, news: news, belief: belief, actor: actor } : { type: type, actor: actor };
    return scene;
}
///////////
var scenesTodo = [];
function scheduleScene(scene) {
    var character = scene.actor;
    console.log("SCHEDULED", scene.type, "SCENE for", character.name, "about", scene.type == "reaction" && stringifyAction(scene.news));
    scenesTodo.push(scene);
}
var sceneStack = [];
function createSceneSet(choice, consequence, closure) {
    var news = {};
    var belief = {};
    var ccc = {
        choice: choice,
        consequence: consequence || { foreshadow: choice.foreshadow, scene: createScene("reaction", choice.scene.actor, news, belief) },
        closure: closure || { scene: createScene("reflective", choice.scene.actor) }
    };
    sceneStack.push(ccc);
    return ccc;
}
function getNextScene() {
    var startScenes = sceneStack.filter(function (s) { return !s.choice.scene.isFinished; });
    if (startScenes.length)
        return startScenes[0].choice.scene;
    var midScenes = sceneStack.filter(function (s) { return !s.consequence.scene.isFinished; });
    if (midScenes.length)
        return midScenes[0].consequence.scene;
    var endScenes = sceneStack.filter(function (s) { return !s.closure.scene.isFinished; });
    if (endScenes.length)
        return endScenes.reverse()[0].closure.scene;
    return null;
}
function playStory(firstScene, characters, actionset) {
    var turn = 0;
    for (var currentScene = firstScene; currentScene != null; currentScene = getNextScene()) {
        produceParagraphs(characters);
        console.log("TURN", ++turn);
        // characters act // creates scene types of Action
        var news = playScene(currentScene, actionset);
        // react to news // creates scene types of Reaction
        runNewsCycle(news, currentScene, characters);
        if (turn > 7)
            break;
    }
}
/** outputs: scene success/failure/complication and news of what happened */
function playScene(scene, actionset) {
    var character = scene.actor;
    var sceneAction = whatTheyAreTryingToDoNow(character);
    console.log("BEGIN", scene.type, "SCENE:", character.name, sceneAction ? stringifyAttempt(sceneAction) : "Nothing");
    if (!sceneAction && scene.type == "reaction")
        sceneAction = realizingIssue(character, scene, actionset);
    if (!sceneAction)
        console.error("no action -- run AI to pick a scene-action that does/un-does the news? adjusts for it?");
    if (sceneAction)
        scene.result = doThing(sceneAction, character);
    scene.isFinished = true;
    return currentTurnsNews;
}
var RealizingProblem = {
    verb: "realizing",
    rulebooks: {
        check: {
            rules: [
                function (attempt) {
                    var _a;
                    console.log('"Oh i need a ', ((_a = attempt.noun) === null || _a === void 0 ? void 0 : _a.name) || attempt.noun, '."');
                    return makeNoDecision;
                },
            ]
        }
    }
};
function findActions(actionset, badNews, shouldBe) {
    var _a, _b;
    var retval = [];
    for (var _i = 0, actionset_1 = actionset; _i < actionset_1.length; _i++) {
        var action = actionset_1[_i];
        var effects = ((_b = (_a = action.rulebooks) === null || _a === void 0 ? void 0 : _a.moveDesireables) === null || _b === void 0 ? void 0 : _b.call(_a, badNews)) || [];
        for (var _c = 0, effects_1 = effects; _c < effects_1.length; _c++) {
            var e = effects_1[_c];
            if (shouldBe.property == e[0] && shouldBe.ofDesireable == e[1] && shouldBe.shouldBe == e[2] && shouldBe.toValue == e[3])
                retval.push(action);
        }
    }
    return retval;
}
function realizingIssue(character, scene, actionset) {
    var news = scene.news;
    var goal = createMyGoal(RealizingProblem, news.noun, news.secondNoun);
    goal.actor = character;
    character.goals.push(goal);
    var actions = findActions(actionset, scene.news, scene.belief);
    for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
        var action = actions_1[_i];
        weCouldTry(character, action, news.noun, news.secondNoun, goal);
    }
    return goal;
}
function runNewsCycle(newss, sceneJustFinished, characters) {
    for (var _i = 0, newss_1 = newss; _i < newss_1.length; _i++) {
        var news = newss_1[_i];
        for (var _a = 0, characters_1 = characters; _a < characters_1.length; _a++) {
            var character = characters_1[_a];
            for (var _b = 0, _c = character.beliefs; _b < _c.length; _b++) {
                var belief = _c[_b];
                if (isButtonPushed(news, belief)) {
                    var reactionScene = createScene("reaction", character, news, belief);
                    //scheduleScene(reactionScene);
                    createSceneSet({ scene: sceneJustFinished, foreshadow: {}, choice: "ally" }, { scene: reactionScene, foreshadow: {} });
                }
            }
        }
    }
    // reset news
    oldNews.push.apply(oldNews, currentTurnsNews);
    currentTurnsNews = [];
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
    var _a, _b, _c, _d;
    var rearrange = act.verb.includes("_");
    var predicate = rearrange ? act.verb.replace("_", ((_a = act.noun) === null || _a === void 0 ? void 0 : _a.name) || "") : act.verb;
    return (((_b = act.actor) === null || _b === void 0 ? void 0 : _b.name) || "") + " " + predicate + " " + (((_c = act.secondNoun) === null || _c === void 0 ? void 0 : _c.name) || "") + (rearrange ? "" : " " + (((_d = act.noun) === null || _d === void 0 ? void 0 : _d.name) || ""));
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
    thisAttempt.status = outcome != "failed" ? "successful" : thisAttempt.fullfilledBy.length > 0 ? "partly successful" : "failed";
    // update trees to record result
    if (thisAttempt.status == "partly successful")
        console.log("circumventions outcome:", outcome, ".  Could be fulfilled by:", thisAttempt.fullfilledBy.map(stringifyAttempt));
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
    console.log(actor.name, "could try", definition.verb, "before", failingAction && stringifyAttempt(failingAction));
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
    if (failingAction)
        failingAction.fullfilledBy.push(circumvention);
    else
        actor.goals.push(circumvention);
    return "failed";
}
var author = {
    name: "myself",
    beliefs: [],
    goals: []
};
function createMyGoal(definition, noun, secondNoun) {
    var circumvention = {
        verb: definition.verb,
        actor: author,
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
function createMyBelief(property, ofDesireable, shouldBe, toValue, sensitivity) {
    var belief = { property: property, ofDesireable: ofDesireable, shouldBe: shouldBe, toValue: toValue, sensitivity: sensitivity };
    return belief;
}
//////////
function moveDesireable(property, ofDesireable, shouldBe, toValue) {
    switch (shouldBe) {
        case "=":
            ofDesireable[property] = toValue;
            return;
        default:
            throw "Unknown operation on desireable resource " + shouldBe;
    }
}
///////////
function main(characters, actionset) {
    // sanitize setup
    for (var _i = 0, characters_2 = characters; _i < characters_2.length; _i++) {
        var character = characters_2[_i];
        for (var _a = 0, _b = character.goals; _a < _b.length; _a++) {
            var goal = _b[_a];
            if (goal.actor == author)
                goal.actor = character;
        }
    }
    // init
    var initialScenes = characters
        .map(function (character) { return ({ character: character, action: whatTheyAreTryingToDoNow(character) }); })
        .filter(function (todo) { return !!todo.action; })
        .map(function (todo) { return createScene("introduction", todo.character, todo.action); });
    if (!initialScenes.length)
        throw "cannot find first character and action. No one has a Goal.";
    console.log(initialScenes.length, "initial scenes");
    var initialScene = initialScenes[0];
    var ccc = {
        choice: "ally",
        foreshadow: {},
        scene: initialScene
    };
    createSceneSet(ccc);
    // GO
    playStory(initialScene, characters, actionset);
    // debug
    produceParagraphs(characters);
}
/////////
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
    //console.log("NEWS", newsItem);
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
        if (statement[0] != belief.property && (statement[0] || belief.property))
            continue; // they differ and either/both are a truthy value
        if (statement[1] != belief.ofDesireable)
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
    { name: "Legitimacy in the eyes of the court" },
    { name: "to be at Harrenfall before the 12th" },
    doorkey,
    door,
];
////////////////
var Exiting = {
    verb: "exit",
    rulebooks: {
        check: {
            rules: [function (attempt) { return (!door.isLocked ? "success" : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt)); }]
        }
    }
};
var Waiting = { verb: "wait" };
var Taking = {
    verb: "take",
    rulebooks: {
        moveDesireables: function (attempt) { return [["owned", attempt.noun, "=", true]]; }
    }
};
var Dropping = {
    verb: "drop",
    rulebooks: {
        moveDesireables: function (attempt) { return [["owned", attempt.noun, "=", false]]; }
    }
};
var Opening = {
    verb: "open",
    rulebooks: {
        check: {
            rules: [
                // attempt => (attempt.noun ? "successful" : weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt)),
                function (attempt) { var _a; return (((_a = attempt.noun) === null || _a === void 0 ? void 0 : _a.isLocked) ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : "success"); },
            ]
        },
        moveDesireables: function (attempt) { return [["isOpen", attempt.noun, "=", true]]; }
    }
};
var Closing = {
    verb: "close",
    rulebooks: {
        moveDesireables: function (attempt) { return [["isOpen", attempt.noun, "=", false]]; }
    }
};
var Unlocking = {
    verb: "unlock _ with",
    rulebooks: {
        check: {
            rules: [
            // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
            ]
        },
        moveDesireables: function (attempt) { return [["isLocked", attempt.noun, "=", false]]; }
    }
};
var Locking = {
    verb: "lock _ with",
    rulebooks: {
        check: {
            rules: [
                // // second noun must be key
                // attempt => (attempt.secondNoun?.isKey ? "success" : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
                // need to own key
                function (attempt) {
                    var _a;
                    return ((_a = attempt.secondNoun) === null || _a === void 0 ? void 0 : _a.owner) == attempt.actor
                        ? "success"
                        : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt);
                },
            ]
        },
        moveDesireables: function (attempt) { return [["isLocked", attempt.noun, "=", true]]; }
    }
};
var AskingFor = { verb: "asking _ for" };
/////////////////
var Rose = {
    name: "Rose",
    beliefs: [],
    goals: [createMyGoal(Exiting)]
};
var Zafra = {
    name: "Zafra",
    beliefs: [createMyBelief("isLocked", door, "=", true)],
    goals: []
};
////////////
main([Rose, Zafra], [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor]);
