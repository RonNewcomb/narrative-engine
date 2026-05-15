import { useState } from "react";
import { Bibliographic, iFictionRecord } from "../../publisher/iFictionRecord";
import { getFreshIntficRecord, IntficRecord } from "../planners/intfic-record";
import { modal } from "../services/modal";

export async function showNewProjectDialog(suggestedTitle?: string) {
  const biblio = await modal<iFictionRecord | undefined>(X => <NewProjectDialog title={suggestedTitle} onDone={X} />);
  return biblio;
}

function NewProjectDialog({ title, onDone }: { title?: string; onDone: (x?: iFictionRecord) => void }) {
  const [ific, setIfic] = useState(() => {
    const x = getFreshIntficRecord();
    if (title) x.story.bibliographic.title = title;
    console.log({ title });
    return x;
  });

  const updateBib = (bib: Bibliographic) => {
    setIfic(fic => {
      fic.story.bibliographic = bib;
      return { ...fic };
    });
  };

  return (
    <>
      <p>Only the title is really necessary. A working title is fine too, you can change these values later.</p>
      <div>
        <IntficRecord bib={ific.story.bibliographic} onChange={updateBib} />
      </div>
      <div style={{ display: "flex", justifyContent: "spaceAround", padding: "1em" }}>
        <button className="actionButton" type="button" onClick={() => onDone(undefined)}>
          Nevermind
        </button>
        <button className="actionButton" type="button" onClick={() => onDone(ific)}>
          Create
        </button>
      </div>
    </>
  );
}
