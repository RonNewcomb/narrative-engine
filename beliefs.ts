import { Desireable, Resource } from "./iPlot";
import { NewsSensitivity } from "./news";

export interface ShouldBe extends Resource {
  property: string;
  ofDesireable: Desireable;
  shouldBe: "=" | "in";
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

export function moveDesireable(
  property: ShouldBe["property"],
  ofDesireable: ShouldBe["ofDesireable"],
  shouldBe: ShouldBe["shouldBe"],
  toValue: ShouldBe["toValue"]
) {
  switch (shouldBe) {
    case "=":
      ofDesireable[property] = toValue;
      return;
    default:
      throw "Unknown operation on desireable resource " + shouldBe;
  }
}
