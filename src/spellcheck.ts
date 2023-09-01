const correctionsList: Record<string, string> = {};

export function spelling(misspellings: Record<string, string | string[]>): void {
  // TODO check for same typo with multiple corrections
  for (const proper of Object.keys(misspellings)) {
    const typos: string[] = Array.isArray(misspellings[proper]) ? (misspellings[proper] as string[]) : ([misspellings[proper]] as string[]);
    for (const typo of typos) if (!correctionsList[typo]) correctionsList[typo] = proper;
  }
}

/** changes the text per the corrections list */
export function spellcheck(text: string): string {
  const words = text.split(/\b/);
  return words.map(word => correctionsList[word] || word).join(" ");
}
