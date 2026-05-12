import { useProject } from "../services/useProject";

export type Resource = string;

export interface ShouldBe {
  property: string;
  ofDesireable: Resource;
  shouldBe: "should be" | "should NOT be";
  toValue: any | any[];
}

/** An action which has failed.  Attempts record which Check rule prevented the action and whether the action could or should be re-attempted later.
 *  For a re-attempt to be successful, certain pre-requisites need to be 'fulfilled' (a relation) by other actions, so the same Check rule doesn't
 *  simply stop the action again. */
export interface Attempt {
  verb: string;
  noun?: Resource;
  secondNoun?: Resource;
  actor: Character;
  status: "untried" | "didn't" | "trying" | "did";
  //   fulfills: Attempt<any, any> | undefined; // .parent
  //   fullfilledBy: Attempt<any, any>[]; // .children
  //   consequences?: ConsequenceWithForeshadowedNewsProvingAgency[];
}

export interface Character {
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

function goalsOf(goals: Character["goals"]) {
  return (
    goals?.map(attempt => (
      <div>
        {attempt.actor.name} {attempt.verb} {attempt.noun} {attempt.secondNoun} {attempt.status ? `(${attempt.status})` : ""}
      </div>
    )) || []
  );
}

function beliefsOf(b: Character["beliefs"]) {
  const retval = b.map(belief => (
    <div>
      {belief.property} of {belief.ofDesireable} should {belief.shouldBe} {belief.toValue}
    </div>
  ));
  retval.unshift(
    <div>
      <input name="property" value="" /> of <input name="ofDesireable" value="" /> should{" "}
      <select name="shouldBe" value="">
        <option>be</option>
        <option>not be</option>
      </select>{" "}
      <input name="toValue" value="" />
    </div>,
  );
  return retval;
}

function piecesOf(ch: Character) {
  const retval = fields.map(f => (
    <div>
      {f}: {(ch as any)[f] ?? ""}
    </div>
  ));
  retval.unshift(...beliefsOf(ch.beliefs));
  retval.unshift(...goalsOf(ch.goals));
  return retval;
}

export function CharacterList() {
  const project = useProject();
  const characters = project?.project?.record.characters || [];

  return (
    <character-list>
      <style>{`
    character-list { display: block }
    character-list .indent { margin-left: 1em }
    `}</style>
      <details>
        <summary>🎭 Characters</summary>
        {characters.map(c => (
          <details className="indent">
            <summary>{c.name}</summary>
            <div>{piecesOf(c)}</div>
          </details>
        ))}
      </details>
    </character-list>
  );
}
