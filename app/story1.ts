import { getPlayerChoices } from "../interface/playerInputStyle1";
import {
  ActionDefinition,
  Attempt,
  Character,
  Desireable,
  News,
  Noun,
  ReceivingImportantNews,
  ReflectUpon,
  Resource,
  SceneType,
  ShouldBe,
  begin,
  can,
  cant,
  cause,
  choose,
  consider,
  createBelief,
  createGoal,
  did,
  feel,
  foresee,
  narrativeEngine,
  speak,
  spelling,
  stringifyAction,
  stringifyAttempt,
  trying,
  weCouldTry,
} from "../src/narrativeEngine";
import bibliographic from "./bibliographic.json";

///////////////

const doorkey: Desireable = { name: "door key", isKey: true };
const door: Desireable = { name: "door", isLocked: true };
const inheritance: Desireable = { name: "Rose's inheritance" };
const legitimacy: Desireable = { name: "legitimacy in the eyes of the court" };
const appointment: Desireable = { name: "to be at Harrenfall before the 12th" };

////////////////

const Exiting: ActionDefinition = {
  verb: "exit",
  can: [attempt => (!door.isLocked ? can : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
  change: attempt => [["location", attempt.actor, "=", "out"]],
};

const Waiting: ActionDefinition = {
  verb: "wait",
};

const Taking: ActionDefinition = {
  verb: "take _",
  change: attempt => [["owned", attempt.noun!, "=", true]],
};

const Dropping: ActionDefinition = {
  verb: "drop _",
  change: attempt => [["owned", attempt.noun!, "=", false]],
};

const Opening: ActionDefinition = {
  verb: "open _",
  can: [attempt => ((attempt.noun as any)?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : can)],
  change: attempt => [["isOpen", attempt.noun!, "=", true]],
};

const Closing: ActionDefinition = {
  verb: "close _",
  change: attempt => [["isOpen", attempt.noun!, "=", false]],
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with _",
  can: [
    // attempt => (attempt.secondNoun?.isKey ? can : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
  ],
  change: attempt => [["isLocked", attempt.noun!, "=", false]],
};

const Locking: ActionDefinition = {
  verb: "lock _ with _",
  can: [
    // // second noun must be key
    // attempt => (attempt.secondNoun?.isKey ? can : weCouldTry(attempt.actor, Realizing, doorkey, undefined, attempt)),
    // need to own key
    attempt =>
      !attempt.secondNoun
        ? cant
        : (attempt.secondNoun as any)?.owner == attempt.actor
        ? can
        : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt),
  ],
  change: attempt => [["isLocked", attempt.noun!, "=", true]],
};

const AskingFor: ActionDefinition = {
  verb: "ask _ for _",
};

/////////////////

const Rose: Character = {
  name: "Rose",
  beliefs: [],
  goals: [createGoal(Exiting)],
};

const Zafra: Character = {
  name: "Zafra",
  beliefs: [createBelief("isLocked", door, "=", true)],
};

////////////

const storyStart: SceneType = {
  match: ({ actor, verb }, story) => verb == Exiting.verb && actor == Rose,
  beginning: () => "Rose wanted to escape the confines of her birth.",
};

////////////

spelling({ the: ["teh", "hte"], receiving: "receiveing" });

///////

const narration = [
  [Rose, did, Exiting, speak, `"Finally, teh way is open. I'm free," said Rose.`],
  [Rose, trying, Exiting, speak, `"I'll have to find another way."`],
  [storyStart, begin, Rose, Exiting, `Scenic opening.`],
  [Rose, did, Exiting, choose, "Rose left, never to return."],
  [Rose, trying, Exiting, feel, `But her way was blocked by something.`],
  [
    trying,
    consider,
    (attempt: Attempt) => {
      const nextSteps = attempt.fullfilledBy.map(x => stringifyAction(x, { ing: true, omitActor: true })).join(", or ");
      if (nextSteps) return `${attempt.actor.name} could try ${nextSteps}.`;
      else return "";
    },
  ],
  [ReflectUpon, did, (attempt: Attempt<Attempt<Resource, Resource>, Noun>) => `${attempt.actor.name} reflected.`],
  [
    foresee,
    (attempt: Attempt) => {
      if (!attempt.consequences) return "";
      return attempt.consequences.map(c => `((But ${c.foreshadow!.character.name} won't like ${stringifyAction(c.foreshadow!.news)}.))`);
    },
  ],
  [cause, (attempt: Attempt) => `MOTIVATION: ${stringifyAttempt(attempt)}.`],
  [Zafra, ReceivingImportantNews, feel, (attempt: Attempt<News, ShouldBe>) => `"${stringifyAction(attempt.noun)} is bad news."`],
];

//////////////

narrativeEngine(
  bibliographic,
  [Rose, Zafra],
  [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor],
  [inheritance, legitimacy, appointment, doorkey, door],
  narration,
  [storyStart],
  getPlayerChoices
);
