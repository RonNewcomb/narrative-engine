import type { Scene } from "../modals/SceneDialog";

export function SceneType({ scene, onClick }: { scene: Scene; onClick?: (scene: Scene) => void }) {
  const next = () => {
    if (!onClick) return;
    const i = stypes.findIndex(x => x[0] == scene.icon);
    scene.icon = stypes[(i + 1) % stypes.length][0];
    onClick({ ...scene });
  };

  return (
    <button type="button" style={{ fontSize: "x-large", backgroundColor: "transparent" }} className="notbutton" onClick={next}>
      {getSceneIcon(scene.icon)}
    </button>
  );
}

const stypes = [
  ["+", "📈"],
  ["-", "📉"],
  ["?", "💭"],
  ["!", "⚔️"],
  ["_", "🔀"],
  ["i", "🔎"],
  ["", "💬"],
];
const otherwise = stypes[stypes.length - 1];

export function getSceneIcon(type?: string): string {
  const x = stypes.find(x => x[0] == type) || otherwise;
  return x[1];
}
