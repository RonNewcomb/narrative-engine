import type { Attempt, Character, Story } from "./narrativeEngine";

export async function getPlayerChoices(story: Story, viewpointCharacter: Character): Promise<Attempt | undefined> {
  return undefined;
}

export function setPlayerInputCSS(css: string): void {}
