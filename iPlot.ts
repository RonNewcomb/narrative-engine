import type { Attempt, Character } from "./narrativeEngine";

export interface Desireable {
  name: string;
  number?: number;
  owner?: Character;
}

export interface WorldState {
  desireables: Desireable[];
}

export interface News extends Attempt {
  age?: number; // #/turns?
}

export function disagrees(character: Character, state: WorldState, recentActionLearned: News, desireablesAffected: Desireable[]) {
  return character.shoulds.filter(should => {});
}

export function isButtonsPushed(
  character: Character,
  state: WorldState,
  recentActionLearned: News,
  desireablesAffected: Desireable[]
): boolean {
  return character.shoulds.filter(should => {}).length > 0;
}
