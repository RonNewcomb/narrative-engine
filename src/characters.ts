import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import type { Resource } from "./resources";

export interface Character extends Resource {
  name: string;
  beliefs: ShouldBe[];
  goals: Attempt<any, any>[];
}

export const author: Character = {
  name: "myself",
  beliefs: [],
  goals: [],
};
