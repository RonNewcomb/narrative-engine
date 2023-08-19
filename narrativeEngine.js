var makeNoDecision = undefined;
var pretendItWorked = "success";
///////////////
var characters = [];
var reasonActionFailed;
var personAsked;
var currentAction;
var player;
///////////
function stringify(obj) {
    return JSON.stringify(obj, function (key, value) { return (key == "actor" && !!value ? "\\\\".concat(value.name) : key == "fulfills" && !!value ? "\\\\<backlink>" : value); }, 4);
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
////////////
function weCouldTry(actor, suggestion) {
    var thisAttempt = whatTheyAreTryingToDoNow(actor);
    console.log(actor.name, "could try", stringifyAction(suggestion), "before", stringifyAttempt(thisAttempt));
    var circumvention = {
        action: suggestion,
        status: "untried",
        fulfills: undefined,
        fullfilledBy: []
    };
    circumvention.action.actor = actor;
    if (thisAttempt == actor.goals[0]) {
        console.log("replacing toplevel goal");
        var newAttempt = {
            action: currentAction,
            status: "untried",
            fulfills: actor.goals[0],
            fullfilledBy: [],
            meddlingCheckRule: reasonActionFailed
        };
        newAttempt.action.actor = actor;
        thisAttempt = newAttempt;
        actor.goals[0].fullfilledBy.push(newAttempt);
        actor.goals[0].status = "untried";
    }
    thisAttempt.fullfilledBy.push(circumvention);
    circumvention.fulfills = thisAttempt;
    return circumvention;
}
function getRulebookFor(act) {
    switch (act.verb) {
        case "wait":
            return { rules: [] };
        case "exit":
            return {
                rules: [
                    function cantlockwhatsopen() {
                        return "failed";
                    },
                ]
            };
        default:
            return { rules: [] };
    }
}
function executeRulebook(rulebook, on, actor, noun, secondNoun) {
    for (var _i = 0, _a = rulebook.rules; _i < _a.length; _i++) {
        var rule = _a[_i];
        var outcome = rule(on, noun, secondNoun, actor);
        if (outcome == "failed")
            reasonActionFailed = rule;
        if (!!outcome)
            return outcome;
    }
    return makeNoDecision;
}
function doThing(todo, actor) {
    if (!todo)
        throw "no TODO";
    personAsked = actor;
    reasonActionFailed = undefined;
    currentAction = todo.action;
    var verb = currentAction.verb;
    var noun = currentAction.directObject;
    var secondNoun = currentAction.indirectObject;
    // DO the currentAction and get status
    var rb = getRulebookFor(currentAction);
    var outcome = executeRulebook(rb, noun, actor, noun, secondNoun);
    console.log(verb, "is done:", outcome);
    // update trees
    if (outcome == "failed")
        updatePlansOnFailure(todo);
    else
        updatePlansOnSuccess(actor, noun, secondNoun);
}
function main() {
    var Rose = {
        name: "Rose",
        buttons: [],
        think: function () { },
        goals: []
    };
    Rose.goals.push({ action: Exiting(Rose), status: "untried", fullfilledBy: [], fulfills: undefined });
    characters.push(Rose);
    console.log(stringify(characters));
    /// init end
    var next = whatTheyAreTryingToDoNow(Rose);
    console.log("Her next is", stringifyAttempt(next));
    // go
    doThing(next, Rose);
    console.log(stringify(characters));
    // doThing(Exiting, Rose, undefined, undefined);
    // console.log(JSON.stringify(characters, undefined, 4));
    // doThing(Exiting, Rose, undefined, undefined);
    // console.log(JSON.stringify(characters, undefined, 4));
}
//First after an actor doing something (this is update plans on success rule):
var updatePlansOnSuccess = function (actor, noun, secondNoun) {
    var thisAttempt = whatTheyWillDoNext(actor);
    if (!thisAttempt)
        return makeNoDecision; // nothing to do, always succeeds
    if (currentAction == thisAttempt.action)
        thisAttempt.status = "successful";
    return makeNoDecision;
};
//} First after not an actor doing something (this is update plans on failure rule):
var updatePlansOnFailure = function (thisAttempt) {
    //console.log("updatePlansOnFailure");
    // let thisAttempt = whatTheyWillDoNext(actor);
    // if (!thisAttempt) {
    //   console.log("Update plans on failure -- nothing to do");
    //   return;
    // }
    console.log("Update plans on failure", stringifyAttempt(thisAttempt));
    var actor = thisAttempt.action.actor;
    var noun = thisAttempt.action.directObject;
    var secondNoun = thisAttempt.action.indirectObject;
    // TODO what's the next line for?????
    // if (currentAction != thisAttempt.action) thisAttempt = undefined as any;
    //const solution = attempts().filter(attempt => attempt.status == "successful" && attempt.fulfills == thisAttempt);
    var solution = thisAttempt.fullfilledBy.filter(function (a) { return a.status == "successful"; });
    //if (a successful attempt (called solution) fulfills thisAttempt) {
    if (solution.length > 0) {
        if (reasonActionFailed != thisAttempt.meddlingCheckRule)
            thisAttempt.status = "partly successful";
    }
    console.log(solution.length, "partial solutions found");
    var outcome = whenHinderedBy(reasonActionFailed, actor, noun, secondNoun); //	follow when hindered by rules for reason action failed;
    console.log("circumventions", outcome, thisAttempt.fullfilledBy);
    if (outcome == pretendItWorked)
        thisAttempt.status = "successful";
    else if (thisAttempt.fullfilledBy.length == 0)
        thisAttempt.status = "failed";
    else if (thisAttempt.fullfilledBy.length > 0)
        thisAttempt.status = "partly successful";
    return makeNoDecision;
};
var hindered = function (it) {
    return (it.status == "failed" || it.status == "untried") &&
        !!it.fullfilledBy.filter(function (at) { return at.status == "untried"; }).length &&
        !it.fullfilledBy.filter(function (at) { return at.status == "successful"; }).length;
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
    var details = thisAct.fullfilledBy.find(function (at) { return inThePresent(at); });
    //let details = attempts().find(at => inThePresent(at) && at.fulfills == thisAct);
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
//////////
var Waiting = function (actor) { return ({ verb: "wait", actor: actor }); };
var Exiting = function (actor) { return ({ verb: "exit", actor: actor }); };
var Taking = function (actor, noun) { return ({ verb: "take", directObject: noun, actor: actor }); };
var TakingOff = function (actor, noun) { return ({ verb: "take off", directObject: noun, actor: actor }); };
var Opening = function (actor, noun) { return ({ verb: "open", directObject: noun, actor: actor }); };
var Closing = function (actor, noun) { return ({ verb: "close", directObject: noun, actor: actor }); };
var Dropping = function (actor, noun) { return ({ verb: "drop", directObject: noun, actor: actor }); };
var AskingFor = function (actor, noun, secondNoun) { return ({
    verb: "ask for",
    actor: actor,
    directObject: noun,
    indirectObject: secondNoun
}); };
var PuttingOn = function (actor, noun, secondNoun) { return ({
    verb: "put on",
    actor: actor,
    directObject: noun,
    indirectObject: secondNoun
}); };
var whenHinderedBy = function (r, actor, noun, secondNoun) {
    // First when hindered by (this is don't plan for player rule): if person asked is player, do nothing instead.
    if (actor == player)
        return "failed";
    console.log("RULE NAME", r.name);
    switch (r.name) {
        case "cant wear whats not held":
            if (noun)
                weCouldTry(actor, Taking(actor, noun));
            break;
        case "cant wave whats not held":
            if (noun)
                weCouldTry(actor, Taking(actor, noun));
            break;
        case "cant show what you havent got":
            if (noun)
                weCouldTry(actor, Taking(actor, noun));
            break;
        case "cant give what you havent got":
            if (noun)
                weCouldTry(actor, Taking(actor, noun));
            break;
        case "cant take what youre inside":
            weCouldTry(actor, Exiting(actor));
            break;
        case "cant enter closed containers":
            if (noun)
                weCouldTry(actor, Opening(actor, noun));
            break;
        //  case "cant exit closed containers": weCouldTry(actor,Opening (personAsked.holder));break;
        case "cant insert into closed containers":
            if (secondNoun)
                weCouldTry(actor, Opening(actor, secondNoun));
            break;
        //  case "cant search closed opaque containers": if (    noun == a closed opaque container ) weCouldTry(actor,Opening(noun));break;
        case "cantlockwhatsopen":
            weCouldTry(actor, Closing(actor, "whatever"));
            break;
        case "cant enter something carried":
            if (noun)
                weCouldTry(actor, Dropping(actor, noun));
            break;
        case "cant put onto something being carried":
            if (secondNoun)
                weCouldTry(actor, Dropping(actor, secondNoun));
            if (noun && secondNoun)
                weCouldTry(actor, PuttingOn(actor, noun, secondNoun));
            break;
        case "cant drop clothes being worn":
            if (noun)
                weCouldTry(actor, TakingOff(actor, noun));
            break;
        case "cant put clothes being worn":
            if (noun)
                weCouldTry(actor, TakingOff(actor, noun));
            break;
        //  case "cant take peoples possessions": weCouldTry(actor,AskingFor(  noun.holder,  noun));break;
        case "cant insert clothes being worn":
            if (noun)
                weCouldTry(actor, TakingOff(actor, noun));
            break;
        case "cant give clothes being worn":
            if (noun)
                weCouldTry(actor, TakingOff(actor, noun));
            break;
        case "carrying requirements":
            if (noun)
                weCouldTry(actor, Taking(actor, noun));
            break;
        default:
            return pretendItWorked;
    }
    return makeNoDecision;
};
/////////////////
main();
