import type { Scene } from "../modals/SceneDialog";

export function SceneType({ scene, onClick }: { scene: Scene; onClick?: (scene: Scene) => void }) {
  const next = () => {
    console.log(scene.type);
    const i = stypes.findIndex(x => x[0] == scene.type);
    scene.type = stypes[i + 1]?.[0] || "";
    console.log({ i, type: scene.type });
    onClick?.({ ...scene });
  };

  return (
    <span className="notbutton" onClick={next}>
      {getSceneIcon(scene.type)}
    </span>
  );
}

const stypes = [
  ["", "⛖"],
  ["+", "📈"],
  ["-", "📉"],
];

export function getSceneIcon(type?: string): string {
  const x = stypes.find(x => x[0] == type) || stypes[0];
  return x[1];
}
