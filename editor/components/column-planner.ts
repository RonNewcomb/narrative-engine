import { render as chapters } from "./planners/chapters-scenes";
import { render as characters } from "./planners/character-list";
import "./planners/intfic-record";
import { render as intfic } from "./planners/intfic-record";
import { render as settings } from "./planners/settings-list";
import { render as trash } from "./planners/trash-bin";

document.addEventListener("DOMContentLoaded", () => renderPlanner());

export function renderPlanner() {
  const column = document.getElementById("plannr")! as HTMLDivElement;
  column.innerHTML = `
<intfic-record></intfic-record>
<chapters-scenes></chapters-scenes>
<character-list></character-list>
<settings-list></settings-list>
<trash-bin></trash-bin>
<other-files></other-files>
`;
  intfic();
  chapters();
  characters();
  settings();
  trash();
}
