interface IForeshadow {}

interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "ignore" | "prolong";
  foreshadow: IForeshadow;
}
interface ForeshadowedNewsProvesAgency {
  foreshadow: IForeshadow;
}
interface ClosureFromInteriorReflection {}

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
    consequence: consequence || { foreshadow: choice.foreshadow },
    closure: closure || {},
  };
  tracking.push(ccc);
  return ccc;
}

function getCCC(searchParameters: any): ChoiceConsequenceClosure[] {
  return tracking.filter(ccc => ccc.choice == searchParameters.choice);
}
