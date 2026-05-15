import { useState } from "react";
import { SceneType } from "../buttons/SceneType";
import { modal } from "../services/modal";

export interface Scene {
  title?: string;
  type?: string;
  character?: string;
  motivatingBelief?: string;
  actionBeingAttempted?: string;
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

  const save = () => {
    scene.title = `${scene.character || "someone"} ${scene.actionBeingAttempted || "tries something"}`;
    onDone(scene);
  };

  return (
    <>
      <style>{`
      the-modal input { min-width: 40em; }
      `}</style>
      <h3>
        Basics - <SceneType scene={scene} onClick={setScene} />
        {scene.character || ""} {scene.actionBeingAttempted || ""}
      </h3>
      <div>
        <span>Character </span>
        <input
          name="character"
          placeholder='Who is the "star" of this scene?'
          required
          defaultValue={scene["character"]}
          onChange={e => (scene["character"] = e.target.value)}
        />
        <span> will be attempting to </span>
        <input
          name="actionBeingAttempted"
          placeholder="What are they trying to accomplish throughout this whole scene?"
          required
          defaultValue={scene["actionBeingAttempted"]}
          onChange={e => (scene["actionBeingAttempted"] = e.target.value)}
        />
        <span> because they believe </span>
        <input
          name="motivatingBelief"
          placeholder="What belief of theirs was violated by a previous scene?"
          required
          defaultValue={scene["motivatingBelief"]}
          onChange={e => (scene["motivatingBelief"] = e.target.value)}
        />
        .
        <div>
          <span>Beliefs Leading To This Method</span>
          <input
            name="beliefsLeadingToThisMethod"
            placeholder="Maybe the violated belief rests atop deeper beliefs, which may not be completely true?"
            defaultValue={scene["beliefsLeadingToThisMethod"]}
            onChange={e => (scene["beliefsLeadingToThisMethod"] = e.target.value)}
          />
        </div>
      </div>

      <h3>First Paragraphs</h3>
      <div>
        <span>Who Where When</span>
        <input name="whereWhen" defaultValue={scene["whereWhen"]} onChange={e => (scene["whereWhen"] = e.target.value)} />
      </div>
      <div>
        <span>Sights Sounds Smells</span>
        <input
          name="sightsSoundsSmells"
          defaultValue={scene["sightsSoundsSmells"]}
          onChange={e => (scene["sightsSoundsSmells"] = e.target.value)}
        />
      </div>
      <div>
        <span>Setting's Mood</span>
        <input name="settingsMood" defaultValue={scene["settingsMood"]} onChange={e => (scene["settingsMood"] = e.target.value)} />
      </div>
      <div>
        <span>Narrator's Tone</span>
        <input name="narratorsTone" defaultValue={scene["narratorsTone"]} onChange={e => (scene["narratorsTone"] = e.target.value)} />
      </div>

      <h3>Mid-scene</h3>
      <div>
        <span>challenges</span>
        <input name="challenges" defaultValue={scene["challenges"]} onChange={e => (scene["challenges"] = e.target.value)} />
      </div>
      <div>
        <span>interaction Style</span>
        <input
          name="interactionStyle"
          defaultValue={scene["interactionStyle"]}
          onChange={e => (scene["interactionStyle"] = e.target.value)}
        />
      </div>

      <h3>End of Scene</h3>
      <div>
        <span>Success, Failure, or Deferred? Multiple outcomes per interactivity?</span>
        <input name="end" defaultValue={scene["end"]} onChange={e => (scene["end"] = e.target.value)} />
      </div>
      <div>
        <span>Any Final Interactivity Style? Chooses next scene? Creates to-do? Prepares for later scene?</span>
        <input
          name="finalInteraction"
          defaultValue={scene["finalInteraction"]}
          onChange={e => (scene["finalInteraction"] = e.target.value)}
        />
      </div>

      <h3>Consequences Lead to More Scenes</h3>
      <div>
        <span>Others Spurred to Action; Beliefs Violated</span>
        <input
          name="othersBeliefsViolated"
          defaultValue={scene["othersBeliefsViolated"]}
          onChange={e => (scene["othersBeliefsViolated"] = e.target.value)}
        />
      </div>
      <div>
        <span>knowledges gained</span>
        <input
          name="knowledgeImparted"
          defaultValue={scene["knowledgeImparted"]}
          onChange={e => (scene["knowledgeImparted"] = e.target.value)}
        />
      </div>
      <div>
        <span>anything foreshadowed to reader?</span>
        <input name="foreshadowed" defaultValue={scene["foreshadowed"]} onChange={e => (scene["foreshadowed"] = e.target.value)} />
      </div>
      <div>
        <span>any symbols established or altered?</span>
        <input name="symbols" defaultValue={scene["symbols"]} onChange={e => (scene["symbols"] = e.target.value)} />
      </div>
      <div>
        <span>Any Character Reflections on this action?</span>
        <input
          name="futureReflections"
          defaultValue={scene["futureReflections"]}
          onChange={e => (scene["futureReflections"] = e.target.value)}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-evenly", padding: "1em", width: "100%" }}>
        <button className="actionButton" type="button" onClick={() => onDone(undefined)}>
          Nevermind
        </button>
        <button className="actionButton" type="button" onClick={save}>
          Save
        </button>
      </div>
    </>
  );
}
