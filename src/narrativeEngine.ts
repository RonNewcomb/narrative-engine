import type { ActionDefinition } from "./actions";
import { createAttempt, createGoal, type Attempt } from "./attempts";
import { createBelief, initializeDesireables, type ShouldBe } from "./beliefs";
import { author, type Character } from "./characters";
import { console_log, stringify } from "./paragraphs";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { can, cant } from "./rulebooks";
import { SceneType, createScene, type Scene } from "./scenes";
import { spelling } from "./spellcheck";
import { playStory, type SolicitPlayerInput, type Story } from "./story";
import type { iFictionRecord } from "./treatyOfBabel";

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
  type SceneType,
  type ShouldBe,
  type SolicitPlayerInput,
  type Story,
  type iFictionRecord,
};

export async function narrativeEngine(
  characters: Character[],
  actionset: ActionDefinition<any, any>[],
  desireables: Desireable[],
  notableScenes?: SceneType[],
  getPlayerInput?: (story: Story, viewpointCharacter: Character) => Promise<Attempt | undefined>
) {
  // sanitize setup
  for (const character of characters) if (!character.goals) character.goals = [];
  for (const character of characters) for (const goal of character.goals!) if (!goal.actor || goal.actor == author) goal.actor = character;
  const desireablesRecord = initializeDesireables(desireables);

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

  // GO
  const theEnd = await playStory(
    characters,
    actionset,
    desireablesRecord,
    notableScenes || [],
    getPlayerInput || (async () => undefined),
    initialScene
  );

  return theEnd;
}
