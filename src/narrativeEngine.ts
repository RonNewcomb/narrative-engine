import type { ActionDefinition } from "./actions";
import { createAttempt, createGoal, type Attempt } from "./attempts";
import { createBelief, initializeDesireables, type ShouldBe } from "./beliefs";
import { author, type Character } from "./characters";
import { attachMainMenu } from "./layout";
import { console_log, stringify } from "./paragraphs";
import { save as autosave, load } from "./persistence";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { can, cant } from "./rulebooks";
import { SceneType, createScene, type Scene } from "./scenes";
import { spelling } from "./spellcheck";
import { playStory, type SolicitPlayerInput, type Story } from "./story";
import { titleScreen, type iFictionRecord } from "./treatyOfBabel";

export {
  can,
  cant,
  createAttempt,
  createBelief,
  createGoal,
  spelling,
  weCouldTry,
  type ActionDefinition,
  type Attempt,
  type Character,
  type Desireable,
  type Resource,
  type Scene,
  type SceneType,
  type ShouldBe,
  type SolicitPlayerInput,
  type Story,
  type iFictionRecord,
};

export async function narrativeEngine(
  characters: Character[],
  actions: ActionDefinition<any, any>[],
  desireables: Desireable[],
  narration: any[][],
  notableScenes?: SceneType[],
  getPlayerInput?: SolicitPlayerInput
) {
  // sanitize setup
  for (const character of characters) if (!character.goals) character.goals = [];
  for (const character of characters) for (const goal of character.goals!) if (!goal.actor || goal.actor == author) goal.actor = character;
  const desireablesRecord = initializeDesireables(desireables);
  if (!notableScenes) notableScenes = [];
  for (const scene of notableScenes) Object.freeze(scene);
  for (const action of actions) Object.freeze(action);
  for (const character of characters) Object.freeze(character);

  const stoppingPoint: SolicitPlayerInput = async (...rest: Parameters<SolicitPlayerInput>): ReturnType<SolicitPlayerInput> => {
    autosave();
    return getPlayerInput ? getPlayerInput(...rest) : undefined;
  };

  // const narrationRules: ((story: Story, viewpoint: Character, scene: Scene, scenePosition: "begin" | "mid" | "end") => string | false)[] =
  //   narration.map(n => {
  //     const text = n.pop();
  //     return (story: Story, viewpoint: Character, scene: Scene, scenePosition: "begin" | "mid" | "end") => {
  //       for (const condition of n) {
  //         if (condition instanceof Character && viewpoint != condition) return false;
  //         if (condition instanceof Scene && scene != condition) return false;
  //         if (condition instanceof ActionDefinition && scene.pulse.definition != condition) return false;
  //         if (typeof condition == "string" && scenePosition != condition) return false;
  //       }
  //     };
  //   });

  // debug
  console_log(stringify(characters));

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene(todo.action!));

  //if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console_log(initialScenes.length + " initial scenes");
  const initialScene: Scene = initialScenes[0];

  attachMainMenu();

  // is a game already in progress?
  if (!load()) await titleScreen();

  // GO
  const theEnd = await playStory(characters, actions, desireablesRecord, notableScenes, stoppingPoint, initialScene);

  return theEnd;
}
