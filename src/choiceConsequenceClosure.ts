import { ReflectUpon } from "./actions";
import { Attempt, createAttempt } from "./attempts";
import { ShouldBe } from "./beliefs";
import { Character } from "./character";
import { createScene, type Scene } from "./scene";
import { story } from "./story";

export interface ForeShadowing {
  character: Character;
  belief: ShouldBe;
  news: Attempt;
}

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
  consequences: ConsequenceWithForeshadowedNewsProvingAgency[];
  closure: ClosureFromInteriorReflection;
}

export function createSceneSet(
  choice: Choi6eWithForeshadowing,
  consequences?: ConsequenceWithForeshadowedNewsProvingAgency[],
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  let alreadyKnown = story.sceneStack.find(ccc => ccc.choice.scene == choice.scene);
  if (alreadyKnown) return alreadyKnown;
  alreadyKnown = story.sceneStack.find(ccc => ccc.closure.scene == choice.scene);
  if (alreadyKnown) return alreadyKnown;
  alreadyKnown = story.sceneStack.find(ccc => ccc.consequences?.find(c => c.scene == choice.scene));
  if (alreadyKnown) return alreadyKnown;
  console.log("-- new scene set");
  const actor = choice.scene.actor;
  const news = choice.scene.pulse;
  const reflect = createAttempt(actor, ReflectUpon, news, undefined, news);
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequences: consequences || [],
    closure: closure || {
      scene: createScene(choice.scene.actor, reflect),
    },
  };
  story.sceneStack.push(ccc);
  return ccc;
}
