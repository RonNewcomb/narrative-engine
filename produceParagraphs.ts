interface Information {}

function produceParagraphs(information: Information): string {
  const paragraph = stringify(information);
  console.log(paragraph);
  return paragraph;
}
