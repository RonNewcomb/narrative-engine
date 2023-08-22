export interface IForeshadow {}

export interface Choi6eWithForeshadowing {
  choice: "ally" | "support" | "defuse" | "escalate" | "ignore" | "prolong";
  foreshadow: IForeshadow;
}
export interface ForeshadowedNewsProvesAgency {
  foreshadow: IForeshadow;
}
export interface ClosureFromInteriorReflection {}

export interface ChoiceConsequenceClosure {
  choice: Choi6eWithForeshadowing;
  consequence: ForeshadowedNewsProvesAgency;
  closure: ClosureFromInteriorReflection;
}

const tracking: ChoiceConsequenceClosure[] = [];

export function createCCC(
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

export function getCCC(searchParameters: any): ChoiceConsequenceClosure[] {
  return tracking.filter(ccc => ccc.choice == searchParameters.choice);
}
