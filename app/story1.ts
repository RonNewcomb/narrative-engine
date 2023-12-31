import { getPlayerChoices } from "../interface/playerInputStyle1";
import {
  ActionDefinition,
  Attempt,
  CanOrCantOrTryThese,
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
  didnt,
  doThingAsAScene,
  feel,
  foresee,
  narrativeEngine,
  publishStyled,
  shouldBe,
  speak,
  spelling,
  stringifyAction,
  stringifyAttempt,
  trying,
  weCouldTry,
} from "../src/narrativeEngine";
import bibliographic from "./bibliographic.json";

//////////

type positioning = "rock" | "paper" | "scissors" | "";
const positions = ["rock", "paper", "scissors"];

///////////////

const doorkey: Desireable = { name: "door key", isKey: true };
const door: Desireable = { name: "door", isLocked: true };
const inheritance: Desireable = { name: "Rose's inheritance" };
const legitimacy: Desireable = { name: "legitimacy in the eyes of the court" };
const appointment: Desireable = { name: "to be at Harrenfall before the 12th" };
const rook: Desireable = { name: "rook", pins: "" as positioning };
const pawn: Desireable = { name: "pawn", at: "rock" as positioning };

////////////////

const Aim: ActionDefinition<positioning> = {
  verb: "aim at _",
  options1: positions,
  change: attempt => [["pins", rook, shouldBe, attempt.noun]],
};

const Zig: ActionDefinition = {
  verb: "zig",
  change: attempt => [["at", pawn, shouldBe, pawn.at == "rock" ? "paper" : "scissors"]],
};

const Zag: ActionDefinition = {
  verb: "zag",
  change: attempt => [["at", pawn, shouldBe, pawn.at == "rock" ? "scissors" : "paper"]],
};

const Exiting: ActionDefinition = {
  verb: "exit",
  can: [attempt => (!door.isLocked ? can : weCouldTry(attempt.actor, Unlocking, door, undefined, attempt))],
  change: attempt => [["location", attempt.actor, shouldBe, "out"]],
};

const Waiting: ActionDefinition = {
  verb: "wait",
};

const Taking: ActionDefinition<Desireable> = {
  verb: "take _",
  change: attempt => [
    ["owned", attempt.noun!, shouldBe, true],
    ["owner", attempt.noun!, shouldBe, attempt.actor],
  ],
};

const Dropping: ActionDefinition = {
  verb: "drop _",
  change: attempt => [
    ["owned", attempt.noun!, shouldBe, false],
    ["owner", attempt.noun!, shouldBe, undefined],
  ],
};

const Opening: ActionDefinition = {
  verb: "open _",
  can: [attempt => ((attempt.noun as any)?.isLocked ? weCouldTry(attempt.actor, Unlocking, attempt.noun, undefined, attempt) : can)],
  change: attempt => [["isOpen", attempt.noun!, shouldBe, true]],
};

const Closing: ActionDefinition = {
  verb: "close _",
  change: attempt => [["isOpen", attempt.noun!, shouldBe, false]],
};

const Unlocking: ActionDefinition = {
  verb: "unlock _ with _",
  can: [
    // attempt => (attempt.secondNoun?.isKey ? can : weCouldTry(attempt.actor, Taking, attempt.secondNoun, undefined, attempt)),
  ],
  change: attempt => [["isLocked", attempt.noun!, shouldBe, false]],
};

const Locking: ActionDefinition<Desireable, Desireable> = {
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
  change: attempt => [["isLocked", attempt.noun!, shouldBe, true]],
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
  beliefs: [createBelief("isLocked", door, shouldBe, true)],
};

////////////

const storyStart: SceneType = {
  match: ({ actor, definition }, story) => definition == Exiting && actor == Rose,
  beginning: () => "Rose wanted to escape the confines of her birth.",
};

const otherRose: SceneType = {
  match: ({ actor, definition }, story) => actor == Rose,
  middle: async (texts, attempt, story, scene) => {
    let result: CanOrCantOrTryThese = cant;

    const action = await getPlayerChoices(story, scene.viewpoint, scene);
    if (action) {
      if (action) publishStyled(action.actor, action?.definition, { className: "b" }, stringifyAction(action) + ".");
      result = await doThingAsAScene(action, scene, story);
    }

    return result;
  },
};

const zLocking: SceneType = {
  match: ({ actor, definition }, story) => {
    return definition == Locking && actor == Zafra;
  },
  beginning: () => "Zafra wonders how to reverse the change.",
  middle: async (texts, attempt, story, scene) => {
    let result: CanOrCantOrTryThese = cant;
    while (rook.pins != pawn.at) {
      const action = await getPlayerChoices(story, scene.viewpoint, scene);
      if (action) {
        if (action) publishStyled(action.actor, action?.definition, { className: "b" }, stringifyAction(action) + ".");
        result = await doThingAsAScene(action, scene, story);
      }
    }
    return result;
  },
};

const weakDoor: SceneType = {
  match: ({ actor, definition, noun: news, secondNoun: belief }, story) =>
    definition == ReceivingImportantNews && actor == Zafra && (belief as ShouldBe).ofDesireable == door,
  beginning: () => "Zafra wonders how to reverse the change.",
  middle: async (texts, attempt, story, scene) => {
    let result: CanOrCantOrTryThese = cant;
    while (rook.pins != pawn.at) {
      const action = await getPlayerChoices(story, scene.viewpoint, scene);
      if (action) {
        if (action) publishStyled(action.actor, action?.definition, { className: "b" }, stringifyAction(action) + ".");
        result = await doThingAsAScene(action, scene, story);
      }
    }
    return result;
  },
};

////////////

spelling({ the: ["teh", "hte"], receiving: "receiveing", taking: "takeing" });

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
      return nextSteps ? `${attempt.actor.name} could try ${nextSteps}.` : "";
    },
  ],
  [ReflectUpon, did, (attempt: Attempt<Attempt<Resource, Resource>, Noun>) => `${attempt.actor.name} reflected.`],
  [
    foresee,
    ({ consequences }: Attempt) =>
      consequences?.map(c => `((But ${c.foreshadow!.character.name} won't like ${stringifyAction(c.foreshadow!.news)}.))`) || "",
  ],
  [cause, (attempt: Attempt) => `MOTIVATION: ${stringifyAttempt(attempt)}.`],
  [Zafra, ReceivingImportantNews, feel, (attempt: Attempt<News, ShouldBe>) => `"${stringifyAction(attempt.noun)} is bad news."`],
  [Taking, did, (attempt: Attempt<Desireable>) => `${attempt.actor.name} took ${attempt.noun!.name}. `],
  [Taking, didnt, (attempt: Attempt<Desireable>) => `${attempt.actor.name} couldn't get ${attempt.noun!.name}. `],
];

//////////////

narrativeEngine(
  bibliographic,
  [Rose, Zafra],
  [Waiting, Exiting, Taking, Dropping, Locking, Unlocking, Opening, Closing, AskingFor, Aim, Zig, Zag],
  [inheritance, legitimacy, appointment, doorkey, door],
  narration,
  [zLocking, storyStart, weakDoor, otherRose],
  getPlayerChoices
);
