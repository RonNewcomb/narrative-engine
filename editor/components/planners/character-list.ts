export interface Resource {}

export interface Desireable extends Resource, Record<string | symbol, any> {
  name: string;
  number?: number;
  owner?: Character;
}

export interface Topic extends Resource {
  topic: string;
}

export interface ShouldBe extends Resource {
  property: string;
  ofDesireable: Desireable;
  shouldBe: "should be" | "should NOT be";
  toValue: any | any[];
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
export interface Attempt extends Resource {
  verb: string;
  noun?: Resource;
  secondNoun?: Resource;
  actor: Character;
  status: "untried" | "didn't" | "trying" | "did";
  //   fulfills: Attempt<any, any> | undefined; // .parent
  //   fullfilledBy: Attempt<any, any>[]; // .children
  //   consequences?: ConsequenceWithForeshadowedNewsProvingAgency[];
}

export interface Character extends Resource {
  name: string;
  beliefs: ShouldBe[];
  goals?: Attempt[];
}

const fields = [
  "age, location",
  "role in story",
  "description",
  "personality",
  "occupation",
  "habits/mannerisms",
  "background",
  "internal conflicts",
];

let characters: Character[] = [];

export function setCharacters(ch?: Character[]) {
  characters = ch ?? [];
  render();
}

function goalsOf(goals: Character["goals"]) {
  return (
    goals
      ?.map(
        attempt =>
          `<div>${attempt.actor} ${attempt.verb} ${attempt.noun} ${attempt.secondNoun} ${attempt.status ? `(${attempt.status})` : ""}</div>`,
      )
      .join("") || ""
  );
}

function beliefsOf(b: Character["beliefs"]) {
  const retval = b.map(belief => `<div>${belief.property} of ${belief.ofDesireable} should ${belief.shouldBe} ${belief.toValue} </div>`);
  retval.unshift(
    `<div><input name='property' value=""/> of <input name='ofDesireable' value=""/> should <select name='shouldBe' value=""><option>be</option><option>not be</option></select> <input name='toValue' value=""/></div>`,
  );
  return retval.join("");
}

function piecesOf(ch: Character) {
  const retval = fields.map(f => `<div>${f}: ${(ch as any)[f] ?? ""}</div>`);
  retval.unshift(beliefsOf(ch.beliefs));
  retval.unshift(goalsOf(ch.goals));
  return retval.join("");
}

export function render() {
  const elements = document.getElementsByTagName("character-list");

  for (const el of elements) {
    el.innerHTML =
      `
<style>
    character-list { display: block }
    character-list .indent { margin-left: 1em }
</style>
<details>
<summary>🎭 Characters</summary>
` +
      characters.map(c => `<details class="indent"><summary>${c.name}</summary><div>${piecesOf(c)}</div></details>`).join("") +
      `</details>
        `;
  }
}
