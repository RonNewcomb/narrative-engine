import type { ActionDefinition, Noun } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import { createBelief, initializeDesireables, type ShouldBe } from "./beliefs";
import { author, type Character } from "./characters";
import { console_log, stringify } from "./paragraphs";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable, Resource } from "./resources";
import { SceneType, createScene, type Scene } from "./scenes";
import { spelling } from "./spellcheck";
import { playStory, type SolicitPlayerInput, type Story } from "./story";

export {
  createAttempt,
  createBelief,
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
};

export function createGoal<N extends Noun, SN extends Noun>(
  definition: ActionDefinition<N, SN>,
  noun?: N,
  secondNoun?: SN
): Attempt<N, SN> {
  const circumvention: Attempt<N, SN> = {
    verb: definition.verb,
    actor: author,
    definition,
    noun,
    secondNoun,
    status: "untried",
    fulfills: undefined,
    fullfilledBy: [],
  };
  return circumvention;
}

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
