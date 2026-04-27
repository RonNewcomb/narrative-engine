import type { Character } from "./characters";

export interface Resource {}

export interface Desireable extends Resource, Record<string | symbol, any> {
  name: string;
  number?: number;
  owner?: Character;
}

export interface Topic extends Resource {
  topic: string;
}
