import type { Attempt } from "./attempts";

export let console_log: (...data: any[]) => void = (...texts: any[]): void => {
  console.log(...texts);
  const published = document.getElementById("published")!;
  const div = document.createElement("div");
  div.style.display = "none";
  const text = texts.join(" ");
  div.append(text);
  published.appendChild(div);
};

export let console_error: (...data: any[]) => void = console.error;

export function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) =>
      key == "actor" && !!value ? `\\\\${value.name}` : key == "fulfills" && !!value ? "\\\\.." : key == "definition" ? undefined : value,
    4
  );
}

export function stringifyAction(act: Attempt | undefined, omitActor: boolean = false): string {
  if (!act) return "[no act]";
  const nounName: string = !act.noun
    ? ""
    : typeof act.noun === "string"
    ? act.noun
    : (act.noun as any).name
    ? (act.noun as any).name
    : stringify(act.noun);
  const noun2Name: string = !act.secondNoun
    ? ""
    : typeof act.secondNoun === "string"
    ? act.secondNoun
    : (act.secondNoun as any).name
    ? (act.secondNoun as any).name
    : stringify(act.secondNoun);
  const rearrange: boolean = act.verb.includes("_");
  const predicate: string = rearrange ? act.verb.replace("_", nounName || "") : act.verb;
  return (omitActor ? "" : (act.actor?.name || "") + " ") + predicate + " " + (noun2Name || "") + (rearrange ? "" : " " + (nounName || ""));
}

export function stringifyAttempt(attempt: Attempt | undefined): string {
  if (!attempt) return "[no attempt]";
  return stringifyAction(attempt) + " (" + attempt.status + ")";
}

export function publish(...texts: any[]): void {
  console.log(...texts);
  const published = document.getElementById("published")!;
  const div = document.createElement("div");
  const text = texts.join(" ");
  div.append(text);
  published.appendChild(div);
}
