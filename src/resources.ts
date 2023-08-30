import type { Character } from "./characters";

export interface Resource {}

export interface Desireable extends Record<string | symbol, any>, Resource {
  name: string;
  number?: number;
  owner?: Character;
}
