export interface Information {}

export function produceParagraphs(information: Information): string {
  return JSON.stringify(information);
}
