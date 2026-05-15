import { useProject } from "../services/useProject";

export interface Place {
  name: string;
}

const fields = [
  "location",
  "role in story",
  "related characters",
  "season",
  "unique features",
  "description",
  "sights",
  "sounds",
  "smells",
];

function piecesOf(pl: Place) {
  const retval = fields.map(f => (
    <div>
      ${f}: ${(pl as any)[f] ?? ""}
    </div>
  ));
  // retval.unshift(pl.name);
  return retval;
}

export function SettingsList() {
  const project = useProject();
  const places = project?.project?.record.places || [];

  return (
    <settings-list>
      <style>{`
    settings-list { display: block }
    settings-list .indent { margin-left: 1em }
`}</style>
      <details>
        <summary>🗺️ Places</summary>
        {places.map(c => (
          <details className="indent">
            <summary>${c.name}</summary>
            <div>${piecesOf(c)}</div>
          </details>
        ))}
      </details>
    </settings-list>
  );
}
