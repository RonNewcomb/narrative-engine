import { modal } from "../services/modal";

export interface Scene {
  title?: string;
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

function SceneDialog({ scene, onDone }: { scene: Scene; onDone: (x?: Scene) => void }) {
  return (
    <>
      <div>
        <div>
          <span>title</span>
          <input name="title" value={scene["title"]} onChange={e => (scene["title"] = e.target.value)} />
        </div>
        <div>
          <span>character</span>
          <input name="character" value={scene["character"]} onChange={e => (scene["character"] = e.target.value)} />
        </div>
        <div>
          <span>motivating Belief</span>
          <input name="motivatingBelief" value={scene["motivatingBelief"]} onChange={e => (scene["motivatingBelief"] = e.target.value)} />
        </div>
        <div>
          <span>Action Being Attempted</span>
          <input
            name="actionBeingAttempted"
            value={scene["actionBeingAttempted"]}
            onChange={e => (scene["actionBeingAttempted"] = e.target.value)}
          />
        </div>
        <div>
          <span>Beliefs Leading To This Method</span>
          <input
            name="beliefsLeadingToThisMethod"
            value={scene["beliefsLeadingToThisMethod"]}
            onChange={e => (scene["beliefsLeadingToThisMethod"] = e.target.value)}
          />
        </div>
        <div>
          <span>where When</span>
          <input name="whereWhen" value={scene["whereWhen"]} onChange={e => (scene["whereWhen"] = e.target.value)} />
        </div>
        <div>
          <span>sights Sounds Smells</span>
          <input
            name="sightsSoundsSmells"
            value={scene["sightsSoundsSmells"]}
            onChange={e => (scene["sightsSoundsSmells"] = e.target.value)}
          />
        </div>
        <div>
          <span>settings Mood</span>
          <input name="settingsMood" value={scene["settingsMood"]} onChange={e => (scene["settingsMood"] = e.target.value)} />
        </div>
        <div>
          <span>narrators Tone</span>
          <input name="narratorsTone" value={scene["narratorsTone"]} onChange={e => (scene["narratorsTone"] = e.target.value)} />
        </div>
        <div>
          <span>challenges</span>
          <input name="challenges" value={scene["challenges"]} onChange={e => (scene["challenges"] = e.target.value)} />
        </div>
        <div>
          <span>interaction Style</span>
          <input name="interactionStyle" value={scene["interactionStyle"]} onChange={e => (scene["interactionStyle"] = e.target.value)} />
        </div>
        <div>
          <span>end</span>
          <input name="end" value={scene["end"]} onChange={e => (scene["end"] = e.target.value)} />
        </div>
        <div>
          <span>consequences</span>
          <input name="consequences" value={scene["consequences"]} onChange={e => (scene["consequences"] = e.target.value)} />
        </div>
        <div>
          <span>others Beliefs Violated</span>
          <input
            name="othersBeliefsViolated"
            value={scene["othersBeliefsViolated"]}
            onChange={e => (scene["othersBeliefsViolated"] = e.target.value)}
          />
        </div>
        <div>
          <span>knowledge Imparted</span>
          <input
            name="knowledgeImparted"
            value={scene["knowledgeImparted"]}
            onChange={e => (scene["knowledgeImparted"] = e.target.value)}
          />
        </div>
        <div>
          <span>foreshadowed</span>
          <input name="foreshadowed" value={scene["foreshadowed"]} onChange={e => (scene["foreshadowed"] = e.target.value)} />
        </div>
        <div>
          <span>symbols</span>
          <input name="symbols" value={scene["symbols"]} onChange={e => (scene["symbols"] = e.target.value)} />
        </div>
        <div>
          <span>future Reflections</span>
          <input
            name="futureReflections"
            value={scene["futureReflections"]}
            onChange={e => (scene["futureReflections"] = e.target.value)}
          />
        </div>
        <div>
          <span>final Interaction</span>
          <input name="finalInteraction" value={scene["finalInteraction"]} onChange={e => (scene["finalInteraction"] = e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "spaceAround", padding: "1em" }}>
        <button className="savebutton" type="button" onClick={() => onDone(undefined)}>
          Nevermind
        </button>
        <button className="savebutton" type="button" onClick={() => onDone(scene)}>
          Save
        </button>
      </div>
    </>
  );
}
