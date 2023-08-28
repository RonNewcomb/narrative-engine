import type { AbstractActionDefinition, ActionDefinition, Noun } from "./actions";
import type { Attempt } from "./attempts";
import { createMyBelief, type ShouldBe } from "./beliefs";
import { author, type Character } from "./character";
import type { Desireable } from "./iPlot";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import { console_log, produceParagraphs } from "./produceParagraphs";
import { createScene, type Scene } from "./scene";
import { playStory } from "./story";

export { createMyBelief, weCouldTry, type ActionDefinition, type Character, type Desireable, type ShouldBe };

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

export function main(characters: Character[], actionset: ActionDefinition<any, any>[]) {
  // sanitize setup
  for (const character of characters) if (!character.goals) character.goals = [];
  for (const character of characters) for (const goal of character.goals) if (!goal.actor || goal.actor == author) goal.actor = character;

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
  playStory(initialScene, characters, actionset);
}