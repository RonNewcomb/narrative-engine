import { useProject } from "../services/useProject";

export function ChaptersScenes() {
  const project = useProject();
  const chapters = project?.project?.record.chapters || [];

  return (
    <chapters-scenes>
      <style>{`
    chapters-scenes { display: block }
    chapters-scenes .indent { margin-left: 1em; }
    chapters-scenes .indent .indent { margin-left: 1em; }
`}</style>
      <details>
        <summary>📕 Manuscript</summary>
        {chapters.map(chapter => (
          <details className="indent">
            <summary>📒 Chapter:</summary>
            {chapter.scenes.map(scene => (
              <details className="indent">
                <summary>📈 ${scene}</summary>${scene}:
              </details>
            ))}
          </details>
        ))}
      </details>
    </chapters-scenes>
  );
}
