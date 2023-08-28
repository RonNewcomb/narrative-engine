import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";

export interface Character {
  name: string;
  beliefs: ShouldBe[];
  goals: Attempt<any, any>[];
}

export const author: Character = {
  name: "myself",
  beliefs: [],
  goals: [],
};
