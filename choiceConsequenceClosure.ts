interface IForeshadow {}

interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "ignore" | "prolong";
  foreshadow: IForeshadow;
  scene: Scene;
}
interface ForeshadowedNewsProvesAgency {
  foreshadow: IForeshadow;
  scene: Scene;
}
interface ClosureFromInteriorReflection {
  scene: Scene;
}

interface ChoiceConsequenceClosure {
  choice: Choi6eWithForeshadowing;
  consequence: ForeshadowedNewsProvesAgency;
  closure: ClosureFromInteriorReflection;
}

const tracking: ChoiceConsequenceClosure[] = [];

function createCCC(
  choice: Choi6eWithForeshadowing,
  consequence?: ForeshadowedNewsProvesAgency,
  closure?: ClosureFromInteriorReflection
): ChoiceConsequenceClosure {
  const ccc: ChoiceConsequenceClosure = {
    choice,
    consequence: consequence || { foreshadow: choice.foreshadow, scene: null as any },
    closure: closure || { scene: null as any },
  };
  tracking.push(ccc);
  return ccc;
}

function getCCC(searchFn: (ccc: ChoiceConsequenceClosure) => boolean): ChoiceConsequenceClosure[] {
  return tracking.filter(searchFn);
}
