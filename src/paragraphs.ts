import type { Attempt } from "./attempts";

export interface Information {}

export function produceParagraphs(information: Information): string {
  const paragraph = stringify(information);
  console_log(paragraph);
  return paragraph;
}

export let console_log: (...data: any[]) => void = console.log;
export let console_error: (...data: any[]) => void = console.error;

export function stringify(obj: any): string {
  return JSON.stringify(
    obj,
    (key, value) =>
      key == "actor" && !!value
        ? `\\\\${value.name}`
        : key == "fulfills" && !!value
        ? "\\\\<backlink>"
        : key == "definition"
        ? undefined
        : value,
    4
  );
}

export function stringifyAction(act: Attempt | undefined): string {
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
  return (act.actor?.name || "") + " " + predicate + " " + (noun2Name || "") + (rearrange ? "" : " " + (nounName || ""));
}

export function stringifyAttempt(attempt: Attempt | undefined): string {
  if (!attempt) return "[no attempt]";
  return stringifyAction(attempt) + " (" + attempt.status + ")";
}
