import { ChaptersScenes } from "./planners/chapters-scenes";
import { CharacterList } from "./planners/character-list";
import { Bibliographic, IntficRecord } from "./planners/intfic-record";
import { OtherFiles } from "./planners/other-files";
import { SettingsList } from "./planners/settings-list";
import { TrashBin } from "./planners/trash-bin";
import { useProject } from "./services/useProject";

export function Planner() {
  const project = useProject();
  const biblio: Bibliographic | undefined = project?.project?.record.story.bibliographic;

  return (
    <planner>
      <IntficRecord bib={biblio} />
      <ChaptersScenes />
      <CharacterList />
      <SettingsList />
      <TrashBin />
      <OtherFiles folder={project.project?.dirHandle} />
    </planner>
  );
}
