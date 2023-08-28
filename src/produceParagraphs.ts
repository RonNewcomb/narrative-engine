import { console_log, stringify } from "./debug";

export interface Information {}

export function produceParagraphs(information: Information): string {
  const paragraph = stringify(information);
  console_log(paragraph);
  return paragraph;
}
