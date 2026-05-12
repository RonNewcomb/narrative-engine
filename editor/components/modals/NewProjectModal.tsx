import { useState } from "react";
import { iFictionRecord } from "../../publisher/iFictionRecord";
import { getFreshIntficRecord, IntficRecord } from "../planners/intfic-record";
import { modal } from "../services/modal";

export async function showNewProjectDialog() {
  const biblio = await modal<iFictionRecord | undefined>(X => <NewProjectDialog onDone={X} />);
  return biblio;
}

function NewProjectDialog({ onDone }: { onDone: (x?: iFictionRecord) => void }) {
  const [newBib, setBib] = useState(() => getFreshIntficRecord().story.bibliographic);

  return (
    <>
      <p>Only the title is really necessary. A working title is fine too, you can change these values later.</p>
      <div>
        <IntficRecord bib={newBib} onChange={setBib} />
      </div>
      <div style={{ display: "flex", justifyContent: "spaceAround", padding: "1em" }}>
        <button className="savebutton" type="button" onClick={() => onDone(undefined)}>
          Nevermind
        </button>
        <button className="savebutton" type="button" onClick={() => onDone()}>
          Create
        </button>
      </div>
    </>
  );
}
