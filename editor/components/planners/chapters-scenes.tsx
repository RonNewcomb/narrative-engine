import { useState } from "react";
import { Scene, showSceneDialog } from "../modals/SceneDialog";
import { useProject } from "../services/useProject";

export interface Chapter {
  scenes: Scene[];
}

export function ChaptersScenes() {
  const { project } = useProject();
  const [chapters, setChapters] = useState(project?.record.chapters || [{ scenes: [] }]);

  const addChapter = () => setChapters(old => [...old, { scenes: [] }]);

  const addScene = async (chapter?: Chapter) => {
    const newScene = await showSceneDialog();
    if (!newScene) return;
    chapter?.scenes.push(newScene);
    setChapters(old => [...old]);
  };

  const editScene = async (chapter: Chapter, scene: Scene) => {
    const changes = await showSceneDialog(scene);
    if (!changes) return;
    const at = chapter.scenes.indexOf(scene);
    chapter.scenes[at] = changes;
    setChapters(old => [...old]);
  };

  return (
    <chapters-scenes>
      <style>{`
    chapters-scenes { display: block }
    chapters-scenes .indent { margin-left: 1em; }
    chapters-scenes .indent .indent { margin-left: 1em; }
`}</style>
      <details>
        <summary>📕 Manuscript</summary>
        {chapters.map((chapter, i) => (
          <details key={i} className="indent">
            <summary>📒 Chapter:</summary>
            {chapter.scenes.map((scene, i) => (
              <details key={i} className="indent">
                <summary>📈 {scene.title}</summary>
                <div onClick={() => editScene(chapter, scene)}>{JSON.stringify(scene, undefined, 2)}</div>
              </details>
            ))}
            <button onClick={() => addScene(chapter)}>Add Scene</button>
          </details>
        ))}
        <button onClick={addChapter}>Add Chapter</button>
      </details>
    </chapters-scenes>
  );
}
