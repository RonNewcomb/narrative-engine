import { ChaptersScenes } from "./planners/chapters-scenes";
import { CharacterList } from "./planners/character-list";
import { IntficRecord } from "./planners/intfic-record";
import { OtherFiles } from "./planners/other-files";
import { SettingsList } from "./planners/settings-list";
import { TrashBin } from "./planners/trash-bin";

export function Planner({ folder }: { folder?: FileSystemDirectoryHandle }) {
  return (
    <planner>
      <IntficRecord />
      <ChaptersScenes />
      <CharacterList />
      <SettingsList />
      <TrashBin />
      <OtherFiles folder={folder} />
    </planner>
  );
}
