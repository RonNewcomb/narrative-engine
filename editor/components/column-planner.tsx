import { Bibliographic } from "../publisher/iFictionRecord";
import { ChaptersScenes } from "./planners/chapters-scenes";
import { CharacterList } from "./planners/character-list";
import { IntficRecord } from "./planners/intfic-record";
import { OtherFiles } from "./planners/other-files";
import { SettingsList } from "./planners/settings-list";
import { TrashBin } from "./planners/trash-bin";
import { useProject } from "./services/useProject";

export function Planner() {
  const { project } = useProject();
  const biblio: Bibliographic | undefined = project?.record.story.bibliographic;

  return (
    <scene-planner>
      <style>{`
        scene-planner > * {
          padding-bottom: 1.5em;
        }
        scene-planner  summary {
          font-size: xx-large;
        }
      `}</style>
      <IntficRecord bib={biblio} />
      <ChaptersScenes />
      <CharacterList />
      <SettingsList />
      <TrashBin />
      <OtherFiles folder={project?.topFolder} />
    </scene-planner>
  );
}
