import type { ShouldBe } from "./beliefs";
import type { Character } from "./character";
import type { News } from "./news";

export interface Resource {}

export interface Desireable extends Record<string, any>, Resource {
  name: string;
  number?: number;
  owner?: Character;
}

export function isButtonPushed(news: News, belief: ShouldBe): boolean {
  const changeStatements = news.definition.rulebooks?.moveDesireables?.(news) || [];
  if (!changeStatements || !changeStatements.length) return false;
  for (const statement of changeStatements) {
    if (statement[0] != belief.property && (statement[0] || belief.property)) continue; // they differ and either/both are a truthy value
    if (statement[1] != belief.ofDesireable) continue;
    // if (statement[2] != belief.toValue) return true;
    // if (statement[3] != belief.toValue) return true;
    return true;
  }
  return false;
}
