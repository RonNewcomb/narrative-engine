import { useMemo, useState } from "react";
import { SceneType } from "../buttons/SceneType";
import { modal } from "../services/modal";

export interface Scene {
  characterAttemptingSomething?: string;
  icon?: string; // type
  motivatingBelief?: string;
  beliefsLeadingToThisMethod?: string;

  // beginning
  whereWhen?: string;
  sightsSoundsSmells?: string;
  settingsMood?: string;
  narratorsTone?: string;

  // middle
  challenges?: string;
  interactionStyle?: string;

  // ending
  end?: string; // success, failure, deferred
  consequences?: string; // beliefs changed or violated
  othersBeliefsViolated?: string;
  knowledgeImparted?: string;
  foreshadowed?: string;
  symbols?: string;
  futureReflections?: string;
  finalInteraction?: string;
}

export async function showSceneDialog(original?: Scene) {
  const working = { ...(original || {}) };
  const scene = await modal<Scene | undefined>(X => <SceneDialog scene={working} onDone={X} />);
  return scene;
}

function SceneDialog({ scene: s, onDone }: { scene: Scene; onDone: (x?: Scene) => void }) {
  const [scene, setScene] = useState(s);
  useMemo(() => {
    if (s != scene) setScene(s);
  }, [s]);

  const change = () => {
    setScene({ ...scene });
  };

  const save = () => {
    change();
    onDone(scene);
  };

  return (
    <scene-dialog onBlur={change}>
      <style>{`
      scene-dialog textarea {
        width: 100%;
        field-sizing: content;
        min-height: lh;
        margin-bottom: 0.7em;
      }
      scene-dialog button.x {
        float: right;
        border: 0;
        background-color: transparent;
        font-size: large;
        opacity: 0.5;
      }
      `}</style>
      <h3>
        <SceneType scene={scene} onClick={setScene} /> {scene.characterAttemptingSomething || "Purpose for this Scene:"}
        <button type="button" className="x" onClick={() => onDone(undefined)}>
          X
        </button>
      </h3>
      <div>
        <span>Character and Attempt</span>
        <textarea
          name="actionBeingAttempted"
          placeholder='Scene title: Who is the "star" of this scene and what are they trying to accomplish by the end of it?'
          required
          defaultValue={scene.characterAttemptingSomething}
          onChange={e => (scene.characterAttemptingSomething = e.target.value)}
        />
      </div>
      <div>
        <span>It's Because They Believe This</span>
        <textarea
          name="motivatingBelief"
          placeholder="What belief of theirs was violated by a previous scene? What's motivating them here?"
          required
          defaultValue={scene.motivatingBelief}
          onChange={e => (scene.motivatingBelief = e.target.value)}
        />
      </div>
      <div>
        <span>How: Of All Possible Methods, Why This One?</span>
        <textarea
          name="beliefsLeadingToThisMethod"
          placeholder="There's several ways to go about things. Why this way? Maybe the violated belief rests atop deeper beliefs, which may not be completely true? Or is it just a question of ability, either real or imagined?"
          defaultValue={scene.beliefsLeadingToThisMethod}
          onChange={e => (scene.beliefsLeadingToThisMethod = e.target.value)}
        />
      </div>

      <h3>First Paragraphs</h3>
      <div>
        <span>Who Where When</span>
        <textarea
          name="whereWhen"
          placeholder="Basic task: orient the reader. How much time has passed since the previous scene? Who's present? Where are we?"
          defaultValue={scene.whereWhen}
          onChange={e => (scene.whereWhen = e.target.value)}
        />
      </div>
      <div>
        <span>Sights Sounds Smells</span>
        <textarea
          name="sightsSoundsSmells"
          placeholder="How is this particular place different from others of its kind? How is it different from the last time we visited it?"
          defaultValue={scene.sightsSoundsSmells}
          onChange={e => (scene.sightsSoundsSmells = e.target.value)}
        />
      </div>
      <div>
        <span>Setting's Mood</span>
        <textarea
          name="settingsMood"
          placeholder="Does the place seem dour? Inviting? Scary? Promising? Does it feel like a mugging will take place here, or business conducted, or is this somewhere you can take kids?"
          defaultValue={scene.settingsMood}
          onChange={e => (scene.settingsMood = e.target.value)}
        />
      </div>
      <div>
        <span>Narrator's Tone</span>
        <textarea
          name="narratorsTone"
          placeholder="Regardless how the setting seems to the reader, how does the viewpoint character or narrator feel about the place? What's the character's mood? Is it at odds with the environment or match it?"
          defaultValue={scene.narratorsTone}
          onChange={e => (scene.narratorsTone = e.target.value)}
        />
      </div>

      <h3>Mid-scene</h3>
      <div>
        <span>Challenges</span>
        <textarea
          name="challenges"
          placeholder="Whatever the character is about to do won't be easy, or else it wouldn't have a whole scene dedicated to it. Several problems and workarounds present themselves. For example:&#10;&#10;Problem #1:&#10;&#10;Problem #2:&#10;&#10;Problem #3:&#10;&#10;"
          defaultValue={scene.challenges}
          onChange={e => (scene.challenges = e.target.value)}
        />
      </div>
      <div>
        <span>Interaction Style</span>
        <textarea
          name="interactionStyle"
          placeholder="The mid-scene is usually where most of the reader's choices happen. The kinds of choices depend upon the problems to be tackled above."
          defaultValue={scene.interactionStyle}
          onChange={e => (scene.interactionStyle = e.target.value)}
        />
      </div>

      <h3>How Does the Scene End?</h3>
      <div>
        <span>Success, Failure, or Deferred? Multiple outcomes?</span>
        <textarea
          name="end"
          placeholder="Does the character succeed? Fully? Was any failure total or just requires more effort later? What follow-up scenes are suggested? Do the reader's mid-scene choices have a say in this?"
          defaultValue={scene.end}
          onChange={e => (scene.end = e.target.value)}
        />
      </div>
      <div>
        <span>Any Final Interactivity Point?</span>
        <textarea
          name="finalInteraction"
          placeholder="Does the reader make any final choices now that the scene is ending? Go to a new place? Attend a mental checklist? Prepare for a later confrontation?"
          defaultValue={scene.finalInteraction}
          onChange={e => (scene.finalInteraction = e.target.value)}
        />
      </div>

      <h3>Consequences Lead to More Scenes</h3>
      <div>
        <span>Others Spurred to Action, Perhaps A Minor Belief Was Violated</span>
        <textarea
          name="othersBeliefsViolated"
          placeholder="If the character changed something, this may make others take notice or act. Sometimes knowledge of the character even attempting something causes a reaction. Who all was concerned that this scene happened?"
          defaultValue={scene.othersBeliefsViolated}
          onChange={e => (scene.othersBeliefsViolated = e.target.value)}
        />
      </div>
      <div>
        <span>Anyone learn something impactful?</span>
        <textarea
          name="knowledgeImparted"
          placeholder="Even if nothing seemed to change, perhaps someone knows someone else is interested in something."
          defaultValue={scene.knowledgeImparted}
          onChange={e => (scene.knowledgeImparted = e.target.value)}
        />
      </div>
      <div>
        <span>Anything foreshadowed to reader?</span>
        <textarea
          name="foreshadowed"
          placeholder="Show the reader, if not directly, their choices matter. Even if a character or situation doesn't give much away, the narration can let the reader know their choices are having an impact."
          defaultValue={scene.foreshadowed}
          onChange={e => (scene.foreshadowed = e.target.value)}
        />
      </div>
      <div>
        <span>Any symbols established or altered?</span>
        <textarea
          name="symbols"
          placeholder="Game state is more than the physical items in one's pockets, and not everything can be news. Represent game state symbolically. There is no high score display."
          defaultValue={scene.symbols}
          onChange={e => (scene.symbols = e.target.value)}
        />
      </div>
      <div>
        <span>Any Character Reflections on this action?</span>
        <textarea
          name="futureReflections"
          placeholder="A character makes choices, suffers consequences, then must reflect upon it. A scene of interiority or internal conflict is a major draw of written art. Now add interactivity. Does this scene need a later reflective scene?"
          defaultValue={scene.futureReflections}
          onChange={e => (scene.futureReflections = e.target.value)}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-evenly", padding: "1em", width: "100%" }}>
        <button className="x" type="button" onClick={() => onDone(undefined)}>
          Nevermind
        </button>
        <button className="actionButton" type="button" onClick={save}>
          Save
        </button>
      </div>
    </scene-dialog>
  );
}
