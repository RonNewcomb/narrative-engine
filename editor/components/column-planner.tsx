import { useMemo, useState } from "react";
import { ChaptersScenes } from "./planners/chapters-scenes";
import { CharacterList } from "./planners/character-list";
import { IntficRecord } from "./planners/intfic-record";
import { OtherFiles } from "./planners/other-files";
import { SettingsList } from "./planners/settings-list";
import { TrashBin } from "./planners/trash-bin";
import { useProject } from "./services/useProject";

export function Planner() {
  const { project } = useProject();
  const [biblio, setBiblio] = useState(project?.record?.story?.bibliographic);
  useMemo(() => {
    if (biblio != project?.record.story.bibliographic) setBiblio(project?.record.story.bibliographic);
  }, [project]);

  return (
    <scene-planner>
      <style>{`
        scene-planner > * {
          padding-bottom: 1.5em;
        }
        scene-planner > *:not(intfic-record) > details > summary {
          font-size: xx-large;
        }
      `}</style>
      <IntficRecord bib={biblio} open={false} onChange={setBiblio} />
      <ChaptersScenes />
      <CharacterList />
      <SettingsList />
      <TrashBin />
      <OtherFiles />
    </scene-planner>
  );
}
