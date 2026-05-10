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
  const retval = fields.map(f => `<div>${f}: ${(pl as any)[f] ?? ""}</div>`);
  // retval.unshift(pl.name);
  return retval.join("");
}

let places: Place[] = [];

export function setPlaces(pl?: Place[]) {
  places = pl ?? [];
  render();
}

export function render() {
  const elements = document.getElementsByTagName("settings-list");
  for (const el of elements) {
    el.innerHTML =
      `
<style>
    settings-list { display: block }
    settings-list .indent { margin-left: 1em }
</style><details>
<summary>🗺️ Settings</summary>` +
      places.map(c => `<details class="indent"><summary>${c.name}</summary><div>${piecesOf(c)}</div></details>`).join("") +
      `</details>`;
  }
}
