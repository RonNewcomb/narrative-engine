import { AbstractActionDefinition, ActionDefinition, Attempt, Noun } from "./actions";
import { ShouldBe } from "./beliefs";
import { Character, author } from "./character";
import { console_log } from "./debug";
import type { Desireable } from "./iPlot";
import { weCouldTry, whatTheyAreTryingToDoNow } from "./planningTree";
import { produceParagraphs } from "./produceParagraphs";
import { Scene, createScene } from "./scene";
import { playStory } from "./story";

export { ActionDefinition, Character, Desireable, weCouldTry };

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
    //meddlingCheckRule: undefined,
    fulfills: undefined,
    fullfilledBy: [],
  };
  return circumvention;
}

export function createMyBelief(
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"],
  sensitivity?: ShouldBe["sensitivity"]
): ShouldBe {
  const belief: ShouldBe = { property, ofDesireable, shouldBe, toValue, sensitivity };
  return belief;
}

///////////

export function main(characters: Character[], actionset: ActionDefinition<any, any>[]) {
  // sanitize setup
  for (let character of characters) for (let goal of character.goals) if (goal.actor == author) goal.actor = character;

  // init
  const initialScenes: Scene[] = characters
    .map(character => ({ character, action: whatTheyAreTryingToDoNow(character) }))
    .filter(todo => !!todo.action)
    .map(todo => createScene(todo.character, todo.action!));

  if (!initialScenes.length) throw "cannot find first character and action. No one has a Goal.";
  console_log(initialScenes.length, "initial scenes");
  const initialScene: Scene = initialScenes[0];

  // GO
  playStory(initialScene, characters, actionset);

  // debug
  produceParagraphs(characters);
}
