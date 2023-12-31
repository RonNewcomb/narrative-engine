import type { NewsSensitivity } from "./news";
import type { Desireable, Resource } from "./resources";
import type { Story } from "./story";

export const shouldBe = "=";
export const shouldBeIn = "in";

export interface ShouldBe extends Resource {
  property: string;
  ofDesireable: Desireable;
  shouldBe: typeof shouldBe | typeof shouldBeIn;
  toValue: any | any[];
  /** default to Success */
  sensitivity?: NewsSensitivity;
}

export type ShouldBeStatement = [
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"]
];

const hiddenPermanentName = Symbol("__name");

export function moveDesireable(
  story: Story,
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"]
) {
  const propName: symbol = ofDesireable[hiddenPermanentName];
  const desireable: Desireable = story.desireables[propName] || ofDesireable; // hack if you really need those symbols
  switch (shouldBe) {
    case shouldBe:
      desireable[property] = toValue;
      return;
    // case shouldBeIn:
    //   if (!Array.isArray(toValue)) toValue = [];
    // if (Array.isArray(toValue) && !toValue.includes())  toValue.push(desireable[property]);
    //   return;
    default:
      throw "Unknown operation on desireable resource " + shouldBe;
  }
}

export function createBelief(
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"],
  sensitivity?: ShouldBe["sensitivity"]
): ShouldBe {
  const belief: ShouldBe = { property, ofDesireable, shouldBe, toValue, sensitivity };
  return belief;
}

export function initializeDesireables(desireables: Desireable[]): Record<symbol, Desireable> {
  for (const desireable of desireables) desireable[hiddenPermanentName] = Symbol();

  const desireablesRecord = desireables.reduce((all, desireable) => {
    all[desireable[hiddenPermanentName]] = desireable;
    return all;
  }, {} as Record<symbol, Desireable>);

  return desireablesRecord;
}
