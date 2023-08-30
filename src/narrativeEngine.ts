import type { AbstractActionDefinition, ActionDefinition, Noun } from "./actions";
import type { Attempt } from "./attempts";
import { createMyBelief, initializeDesireables, type ShouldBe } from "./beliefs";
import { author, type Character } from "./characters";
import { console_log, produceParagraphs } from "./paragraphs";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import type { Desireable } from "./resources";
import { createScene, type Scene } from "./scenes";
import { playStory, type Story } from "./story";

export { createMyBelief, weCouldTry, type ActionDefinition, type Attempt, type Character, type Desireable, type ShouldBe, type Story };

export function createMyGoal<N extends Noun, SN extends Noun>(
  definition: AbstractActionDefinition<N, SN>,
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

export async function main(
  characters: Character[],
  actionset: ActionDefinition<any, any>[],
  desireables: Desireable[],
  getPlayerInput: (story: Story, viewpointCharacter: Character) => Promise<Attempt | undefined>
) {
  // sanitize setup
  for (const character of characters) if (!character.goals) character.goals = [];
  for (const character of characters) for (const goal of character.goals) if (!goal.actor || goal.actor == author) goal.actor = character;
  const desireablesRecord = initializeDesireables(desireables);

  // debug
  produceParagraphs(characters);

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene(todo.character, todo.action!));

  if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console_log(initialScenes.length + " initial scenes");
  const initialScene: Scene = initialScenes[0];

  // GO
  const theEnd = await playStory(characters, actionset, desireablesRecord, getPlayerInput, initialScene);

  return theEnd;
}
