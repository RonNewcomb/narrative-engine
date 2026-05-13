import { useEffect, useState } from "react";
import { Scene, showSceneDialog } from "../modals/SceneDialog";
import { useProject } from "../services/useProject";

export function ChaptersScenes() {
  const { project } = useProject();
  const [scenes, setScenesState] = useState(project?.record.scenes || []);
  useEffect(() => {
    setScenesState(project?.record.scenes || []);
  }, [project]);

  const setScenes = (scenes: Scene[]) => {
    project!.record.scenes = scenes;
    setScenesState([...scenes]);
  };

  const addScene = async () => {
    const newScene = await showSceneDialog();
    if (!newScene) return;
    scenes.push(newScene);
    setScenes(scenes);
  };

  const editScene = async (scene: Scene) => {
    const changes = await showSceneDialog(scene);
    if (!changes) return;
    const at = scenes.indexOf(scene);
    scenes[at] = changes;
    setScenes(scenes);
  };

  return (
    <chapters-scenes>
      <style>{`
    chapters-scenes { display: block }
    chapters-scenes .indent { margin-left: 1em; }
    chapters-scenes .indent .indent { margin-left: 1em; }
`}</style>
      <details>
        <summary style={{}}>
          <span>📕 Scenes</span>{" "}
          <button style={{ float: "right" }} onClick={() => addScene()}>
            Add Scene
          </button>
        </summary>
        {scenes.map((scene, i) => (
          <details key={i} className="indent">
            <summary>📈 {scene.title}</summary>
            <div onClick={() => editScene(scene)}>{JSON.stringify(scene, undefined, 2)}</div>
          </details>
        ))}
      </details>
    </chapters-scenes>
  );
}
