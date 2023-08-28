import { ReflectUpon } from "./actions";
import { createAttempt } from "./attempts";
import { createScene, type Scene } from "./scene";
import { story } from "./story";

export interface ForeShadowing {}

export interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "prolong" | "ignore";
  foreshadow?: ForeShadowing;
  scene: Scene;
}

export interface ConsequenceWithForeshadowedNewsProvingAgency {
  foreshadow?: ForeShadowing;
  scene: Scene;
}

export interface ClosureFromInteriorReflection {
  scene: Scene;
}

export interface ChoiceConsequenceClosure {
  choice: Choi6eWithForeshadowing;
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency;
  closure: ClosureFromInteriorReflection;
}

export function createSceneSet(
  choice: Choi6eWithForeshadowing,
  consequence?: ConsequenceWithForeshadowedNewsProvingAgency,
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  const actor = choice.scene.actor;
  const news = choice.scene.pulse;
  const reflect = createAttempt(actor, ReflectUpon, news, undefined, news);
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequence,
    closure: closure || {
      scene: createScene(choice.scene.actor, reflect),
    },
  };
  story.sceneStack.push(ccc);
  return ccc;
}
