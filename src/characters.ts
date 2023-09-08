import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import type { Resource } from "./resources";
import type { SolicitPlayerInput } from "./story";

export interface Character extends Resource {
  name: string;
  beliefs: ShouldBe[];
  goals?: Attempt<Resource, Resource>[];
  playersChoice?: SolicitPlayerInput;
}

export const author: Character = {
  name: "myself",
  beliefs: [],
  goals: [],
};

export function isCharacter(obj: any): boolean {
  return obj.name && obj.beliefs;
}
