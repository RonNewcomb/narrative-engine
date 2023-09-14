import type { Attempt } from "./attempts";
import type { ShouldBe } from "./beliefs";
import { Character, narrator } from "./characters";
import { element, paragraph } from "./layout";
import { ActionDefinition } from "./narrativeEngine";
import { Topic } from "./resources";
import { spellcheck } from "./spellcheck";

export let console_log: (...data: any[]) => void = (...texts: any[]): void => {
  console.log(...texts);
  // const text = texts.join(" ");
  // const container = paragraph([], { className: "hidedebug", innerText: text });
  // document.getElementById("published")!.appendChild(container);
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
  if (!act.verb) throw Error(`Unknown action ${stringify(act)}`);
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

let previousOwner: Character = narrator;
let previousAction: ActionDefinition<any, any> | Topic | undefined = undefined;

export function publish(owner: typeof previousOwner, action: typeof previousAction, ...texts: any[]): void {
  console.log(...texts);
  const text = spellcheck(texts.join(" "));
  if (owner != previousOwner || action != previousAction) {
    const container = paragraph([], {
      innerText: text,
      title: `${owner.name || "?"} ${(action as ActionDefinition)?.verb || (action as Topic)?.topic || "?"}`,
    });
    publishHTML(container);
    previousOwner = owner;
    previousAction = action;
  } else {
    const container = document.getElementById("published")!.lastElementChild as HTMLElement;
    container.innerText += "  " + text;
  }
}

export function publishStyled(
  owner: typeof previousOwner,
  action: typeof previousAction,
  style: Partial<HTMLSpanElement["style"]> & { className?: string },
  ...texts: any[]
): void {
  console.log(...texts);
  const text = spellcheck(texts.join(" "));
  if (owner != previousOwner || action != previousAction) {
    const container = paragraph([], {
      innerText: text,
      title: `${owner.name || "?"} ${(action as ActionDefinition)?.verb || (action as Topic)?.topic || "?"}`,
    });
    for (const [key, value] of Object.entries(style)) container.style[key as any] = value as any;
    if (style.className) container.className = style.className;
    publishHTML(container);
    previousOwner = owner;
    previousAction = action;
  } else {
    const styledcontainer = element<HTMLSpanElement>("span", { innerText: text });
    for (const [key, value] of Object.entries(style)) styledcontainer.style[key as any] = value as any;
    if (style.className) styledcontainer.className = style.className;

    const container = document.getElementById("published")!.lastElementChild as HTMLElement;
    container.innerText += "  "; // TODO this is broke when we append AFTER some styledcontainer stuff
    container.appendChild(styledcontainer);
  }
}

export function publishHTML(element: HTMLElement): void {
  document.getElementById("published")!.appendChild(element);
}
