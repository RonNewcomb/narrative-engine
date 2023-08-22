interface Information {}

function produceParagraphs(information: Information): string {
  return JSON.stringify(information);
}
