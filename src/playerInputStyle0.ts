import type { Attempt, Character, Story } from "./narrativeEngine";

export async function getPlayerChoices(story: Story, viewpointCharacter: Character): Promise<Attempt | undefined> {
  return undefined;
}

export async function setPlayerInputCSS(css: string) {}
