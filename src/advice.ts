import { ActionResults, isActionDefinition } from "./actions";
import { isCharacter } from "./characters";
import { ConsequenceWithForeshadowedNewsProvingAgency } from "./consequences";
import { Attempt, Scene, SceneType, Story } from "./narrativeEngine";
import { stringify } from "./paragraphs";
import { ScenePositions, isScene, isSceneType } from "./scenes";

/** a function that given world state, will publish its text based on conditions */
export interface Advice {
  (
    action: Attempt,
    scene: Scene,
    story: Story,
    consequences: ConsequenceWithForeshadowedNewsProvingAgency[] | undefined,
    nextSteps: Attempt[] | undefined
  ): string | TextGenerator;
}

/** last argument of an Advice if it isn't a string. Same inputs as the advice, meaning, basically the whole world */
export interface TextGenerator {
  (
    action: Attempt,
    scene: Scene,
    story: Story,
    consequences: ConsequenceWithForeshadowedNewsProvingAgency[] | undefined,
    nextSteps: Attempt[] | undefined
  ): string;
}

export const debug = "debug";

export function toAdvice(narrativeAdvices: any[][]): Advice[] {
  const advices: Advice[] = narrativeAdvices
    .filter(n => Array.isArray(n) && n.length > 0)
    .map<Advice>(untypedTuple => {
      const text: string | Advice = untypedTuple.pop(); // text is string or function returning string?
      const advice: Advice = (action: Attempt, scene: Scene, story: Story): string | TextGenerator => {
        let d = false;
        // loop through all tuple items (except the last) and if the tuple doesn't apply here, return ""
        for (const condition of untypedTuple) {
          if (typeof condition === "string") {
            if (d) console.warn("IS STRING", condition);
            if (condition == debug) {
              d = true;
            } else if (ScenePositions.includes(condition as any)) {
              if (d) console.warn("IS SCENE POSITION", condition, scene.position);
              if (scene.position != condition) return "";
            } else if (ActionResults.includes(condition as any)) {
              if (d) console.warn("IS ACTION RESULT", condition, action.status);
              if (action.status != condition) return "";
            } else throw `Unknown string ${condition} in ${stringify(untypedTuple)}`;
          } else if (isCharacter(condition)) {
            if (d) console.warn("IS CHARACTER", condition);
            if (scene.viewpoint != condition) return "";
          } else if (isScene(condition)) {
            if (d) console.warn("IS SCENE", condition);
            if (scene != condition) return "";
          } else if (isActionDefinition(condition)) {
            if (d) console.warn("IS ACTION", condition);
            if (scene.pulse.definition != condition) return "";
          } else if (isSceneType(condition)) {
            if (d) console.warn("IS SCENETYPE", condition);
            if (!(condition as SceneType).match(scene.pulse, story)) return "";
          } else throw `Unknown thing ${stringify(condition)} in ${stringify(untypedTuple)}`;
        }
        return typeof text == "function" ? (text as TextGenerator) : text;
      };

      return advice;
    });
  return advices;
}

export function textGen(textFn: TextGenerator | string, ...rest: Parameters<Advice>): string {
  return typeof textFn === "function" ? textFn(...rest) : textFn;
}
