import type { Advice } from "./advice";
import { ActionDefinition, Character, Desireable, Scene, ShouldBe } from "./narrativeEngine";

export function parse(source: string) {
  // characters, actions, beliefs, desireables, scenes, tagged narration
  const characters: Character[] = [];
  const actions: ActionDefinition[] = [];
  const beliefs: ShouldBe[] = [];
  const desireables: Desireable[] = [];
  const scenes: Scene[] = [];
  const texts: Advice[] = [];

  for (let word = source.replace(/\b.*\b/, ""); word; word = source.replace(/\b.*\b/, "")) {
    switch (word.toLowerCase()) {
      case "character":
        const character = parseCharacter(source);
        if (character) characters.push(character);
        break;
      case "action":
        const action = parseAction(source);
        if (action) actions.push(action);
        break;
      case "belief":
        const belief = parseBelief(source);
        if (belief) beliefs.push(belief);
        break;
      case "desireable":
        const desireable = parseDesireable(source);
        if (desireable) desireables.push(desireable);
        break;
      case "scene":
        const scene = parseScene(source);
        if (scene) scenes.push(scene);
        break;
      case "text":
        const text = parseText(source);
        if (text) texts.push(text);
        break;
      case " ":
      case "\n":
      case "\t":
      case "\r":
        break;
      default:
        console.error(`found word ${word} instead of one of character, action, belief, desireable, scene, or some tagged text`);
    }
  }
  return {
    characters,
    actions,
    desireables,
    scenes,
    texts,
  };
}

export function parseCharacter(source: string): undefined | Character {
  return undefined;
}
export function parseAction(source: string): undefined | ActionDefinition {
  return undefined;
}
export function parseBelief(source: string): undefined | ShouldBe {
  return undefined;
}
export function parseDesireable(source: string): undefined | Desireable {
  return undefined;
}
export function parseScene(source: string): undefined | Scene {
  return undefined;
}
export function parseText(source: string): undefined | Advice {
  return undefined;
}
