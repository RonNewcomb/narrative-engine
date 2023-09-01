import { ReflectUpon } from "./actions";
import { createAttempt, type Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import type { Character } from "./characters";
import { News } from "./news";
import { createScene, type Scene } from "./scenes";
import type { Story } from "./story";

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
  story: Story,
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
  const actor = choice.scene.viewpoint;
  const news = choice.scene.pulse;
  const reflect = createAttempt(actor, ReflectUpon, news, undefined, news);
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequences: consequences || [],
    closure: closure || { scene: createScene(reflect) },
  };
  story.sceneStack.push(ccc);
  return ccc;
}

export function isButtonPushed(news: News, belief: ShouldBe): boolean {
  const changeStatements = news.definition.rulebooks?.change?.(news) || [];
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
