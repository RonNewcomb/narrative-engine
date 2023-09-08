import { ActionResult, ActionResults, isActionDefinition, type ActionDefinition } from "./actions";
import { createAttempt, createGoal, type Attempt } from "./attempts";
import { createBelief, initializeDesireables, type ShouldBe } from "./beliefs";
import { author, isCharacter, type Character } from "./characters";
import { attachMainMenu } from "./layout";
import { console_log, stringify } from "./paragraphs";
import { save as autosave, load } from "./persistence";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { can, cant } from "./rulebooks";
import { ScenePosition, ScenePositions, SceneType, createScene, isScene, type Scene } from "./scenes";
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

export type Advice = (
  story: Story,
  viewpoint: Character,
  scene: Scene,
  scenePosition: ScenePosition,
  actionResult: ActionResult | undefined
) => string | false;

export async function narrativeEngine(
  characters: Character[],
  actions: ActionDefinition<any, any>[],
  desireables: Desireable[],
  narrativeAdvices: any[][],
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
  for (const rule of narrativeAdvices) {
    if (!rule || !Array.isArray(rule) || rule.length == 0) throw "A narrative advice is empty.";
    if (typeof rule[rule.length - 1] !== "string") throw "The last item in an advice isn't text.";
  }

  const stoppingPoint: SolicitPlayerInput = async (...rest: Parameters<SolicitPlayerInput>): ReturnType<SolicitPlayerInput> => {
    autosave();
    return getPlayerInput ? getPlayerInput(...rest) : undefined;
  };

  const narrationRules: Advice[] = narrativeAdvices
    .filter(n => Array.isArray(n) && n.length > 0)
    .map(n => {
      const text = n.pop(); // text is string or function returning string?

      return (
        story: Story,
        viewpoint: Character,
        scene: Scene,
        scenePosition: ScenePosition,
        actionResult: ActionResult | undefined
      ): string | false => {
        for (const condition of n) {
          if (isCharacter(condition))
            if (viewpoint == condition) continue;
            else return false;
          else if (isScene(condition))
            if (scene == condition) continue;
            else return false;
          else if (isActionDefinition(condition))
            if (scene.pulse.definition == condition) continue;
            else return false;
          else if (typeof condition === "string") {
            if (ScenePositions.includes(condition as any))
              if (scenePosition == condition) continue;
              else return false;
            else if (ActionResults.includes(condition as any))
              if (actionResult == condition) continue;
              else return false;
          } else throw `Unknown condition ${condition}`;
        }
        return text;
      };
    });

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
  const theEnd = await playStory(characters, actions, desireablesRecord, notableScenes, narrationRules, stoppingPoint, initialScene);

  return theEnd;
}
