import type { Attempt } from "./actions";

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
  const nounName = act.noun?.name || act.noun;
  const noun2Name = act.secondNoun?.name || act.secondNoun;
  const rearrange = act.verb.includes("_");
  const predicate = rearrange ? act.verb.replace("_", nounName || "") : act.verb;
  return (act.actor?.name || "") + " " + predicate + " " + (noun2Name || "") + (rearrange ? "" : " " + (nounName || ""));
}

export function stringifyAttempt(attempt: Attempt | undefined): string {
  if (!attempt) return "[no attempt]";
  return stringifyAction(attempt) + " (" + attempt.status + ")";
}

export function printAttempt(attempt: Attempt) {
  console_log("  '" + stringifyAttempt(attempt) + '"');
}
