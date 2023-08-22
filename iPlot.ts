/// <reference path="./narrativeEngine.ts"/>

interface Desireable extends Record<string, any> {
  name: string;
  number?: number;
  owner?: Character;
}

interface WorldState {
  desireables: Desireable[];
}

interface News extends Attempt {
  age?: number; // #/turns?
}

function disagrees(character: Character, state: WorldState, recentActionLearned: News, desireablesAffected: Desireable[]) {
  return character.shoulds.filter(should => {});
}

function isButtonsPushed(character: Character, state: WorldState, recentActionLearned: News, desireablesAffected: Desireable[]): boolean {
  return character.shoulds.filter(should => {}).length > 0;
}
