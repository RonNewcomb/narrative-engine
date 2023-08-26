/// <reference path="./narrativeEngine.ts"/>

interface Information {}

function produceParagraphs(information: Information): string {
  const paragraph = stringify(information);
  console_log(paragraph);
  return paragraph;
}
