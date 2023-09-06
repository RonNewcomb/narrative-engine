import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import { div } from "./layout";
import { spellcheck } from "./spellcheck";

export let console_log: (...data: any[]) => void = (...texts: any[]): void => {
  console.log(...texts);
  const text = texts.join(" ");
  const container = div([], { className: "hidedebug", innerText: text });
  document.getElementById("published")!.appendChild(container);
};

export let console_error: (...data: any[]) => void = console.error;

export function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) =>
      key == "viewpoint" && !!value
        ? `\\\\${value.name}`
        : key == "actor" && !!value
        ? `\\\\${value.name}`
        : key == "fulfills" && !!value
        ? "\\\\.."
        : key == "definition"
        ? undefined
        : value,
    4
  );
}

export function stringifyBelief(belief: ShouldBe): string {
  return "the " + belief.property + " of " + stringifyNoun(belief.ofDesireable) + " should remain " + belief.toValue;
}

export function stringifyNoun(noun: any): string {
  const nounName: string = !noun
    ? ""
    : typeof noun === "string"
    ? noun
    : (noun as any).name
    ? "the " + (noun as any).name
    : (noun as any).verb
    ? stringifyAction(noun as Attempt, { ing: true })
    : (noun as any).ofDesireable
    ? stringifyBelief(noun as ShouldBe)
    : stringify(noun);
  return nounName;
}

export function stringifyAction(
  act: Attempt | undefined,
  options: { omitActor?: boolean; ing?: boolean; withStatus?: boolean } = {}
): string {
  if (!act) return "nothing";
  const nounName: string = stringifyNoun(act.noun);
  const noun2Name: string = stringifyNoun(act.secondNoun);
  let rearrange: boolean = act.verb.includes("_");
  let predicate: string = rearrange ? act.verb.replace("_", nounName || "") : act.verb;
  const rearrange2: boolean = act.verb.includes("_");
  predicate = predicate.replace("_", noun2Name || "");
  const predicating = options.ing ? predicate.replace(/(\w+)/, "$1ing") : predicate;
  const retval =
    (options.omitActor ? "" : (act.actor?.name || "") + " ") +
    (options.withStatus ? act.status + " " : "") +
    predicating +
    (rearrange2 ? "" : " " + noun2Name || "") +
    (rearrange ? "" : " " + (nounName || ""));
  return retval.trim();
}

export function stringifyAttempt(
  attempt: Attempt | undefined,
  options: { omitActor?: boolean; ing?: boolean; withStatus?: boolean } = {}
): string {
  return stringifyAction(attempt, { withStatus: true, ...options });
}

export function publish(...texts: any[]): void {
  console.log(...texts);
  const text = spellcheck(texts.join(" "));
  const container = div([], { innerText: text });
  document.getElementById("published")!.appendChild(container);
}

export function publishStyled(style: Partial<HTMLSpanElement["style"]>, ...texts: any[]): void {
  console.log(...texts);
  const text = spellcheck(texts.join(" "));
  const container = div([], { innerText: text });
  for (const [key, value] of Object.entries(style)) container.style[key as any] = value as any;
  document.getElementById("published")!.appendChild(container);
}

export function publishHTML(element: HTMLElement): void {
  document.getElementById("published")!.appendChild(element);
}
