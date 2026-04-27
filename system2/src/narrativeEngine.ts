import { ReceivingImportantNews, ReflectUpon, type ActionDefinition, type Noun } from "./actions";
import { debug, toAdvice } from "./advice";
import { createAttempt, createGoal, did, didnt, doThingAsAScene, trying, untried, type Attempt } from "./attempts";
import { createBelief, initializeDesireables, shouldBe, type ShouldBe } from "./beliefs";
import { narrator, type Character } from "./characters";
import { hydrateMainMenu } from "./layout";
import type { News } from "./news";
import { console_log, publishStyled, stringify, stringifyAction, stringifyAttempt } from "./paragraphs";
import { load, save } from "./persistence";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { can, cant, cause, choose, consider, feel, flinch, foresee, move, review, speak, type CanOrCantOrTryThese } from "./rulebooks";
import { begin, createScene, end, mid, type Scene, type SceneType } from "./scenes";
import { spelling } from "./spellcheck";
import { playStory, type SolicitPlayerInput, type Story } from "./story";
import { titleScreen, type iFictionRecord } from "./treatyOfBabel";

export {
  ReceivingImportantNews,
  ReflectUpon,
  begin,
  can,
  cant,
  cause,
  choose,
  consider,
  createAttempt,
  createBelief,
  createGoal,
  debug,
  did,
  didnt,
  doThingAsAScene,
  end,
  feel,
  flinch,
  foresee,
  mid,
  move,
  publishStyled,
  review,
  shouldBe,
  speak,
  spelling,
  stringify,
  stringifyAction,
  stringifyAttempt,
  trying,
  untried,
  weCouldTry,
  type ActionDefinition,
  type Attempt,
  type CanOrCantOrTryThese,
  type Character,
  type Desireable,
  type News,
  type Noun,
  type Resource,
  type Scene,
  type SceneType,
  type ShouldBe,
  type SolicitPlayerInput,
  type Story,
  type iFictionRecord,
};

export async function narrativeEngine(
  story: iFictionRecord["story"]["bibliographic"],
  characters: Character[],
  actions: ActionDefinition<any, any>[],
  desireables: Desireable[],
  narrativeAdvices: any[][],
  notableScenes?: SceneType[],
  getPlayerInput?: SolicitPlayerInput
) {
  // sanitize setup
  for (const character of characters) if (!character.goals) character.goals = [];
  for (const character of characters) for (const goal of character.goals!) if (!goal.actor || goal.actor == narrator) goal.actor = character;
  const desireablesRecord = initializeDesireables(desireables);
  if (!notableScenes) notableScenes = [];
  for (const scene of notableScenes) Object.freeze(scene);
  for (const action of actions) Object.freeze(action);
  for (const character of characters) Object.freeze(character);
  for (const rule of narrativeAdvices) {
    if (!rule || !Array.isArray(rule) || rule.length == 0) throw "A narrative advice is empty.";
    if (!["string", "function"].includes(typeof rule[rule.length - 1])) throw "The last item in an advice isn't text or text function.";
  }

  // debug
  console_log(stringify(characters));

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene(todo.action!));

  //if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console_log(initialScenes.length + " initial scenes");

  const narrationRules = toAdvice(narrativeAdvices);
  const stoppingPoint: SolicitPlayerInput = async (...rest: Parameters<SolicitPlayerInput>): ReturnType<SolicitPlayerInput> => {
    save();
    const turn0 = getPlayerInput ? await getPlayerInput(...rest) : undefined;
    if (turn0) publishStyled(turn0.actor, turn0?.definition, { className: "b" }, stringifyAction(turn0) + ".");
    return turn0;
  };
  const initialScene: Scene = initialScenes[0];

  hydrateMainMenu();

  // is a game already in progress?
  if (!load()) await titleScreen(story);

  // GO
  const theEnd = await playStory(characters, actions, desireablesRecord, notableScenes, narrationRules, stoppingPoint, initialScene);

  return theEnd;
}
