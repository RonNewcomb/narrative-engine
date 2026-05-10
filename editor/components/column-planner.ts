import "./intfic-record";
import { render as chapters } from "./planners/chapters-scenes";
import { render as characters } from "./planners/character-list";
import { render as settings } from "./planners/settings-list";
import { render as trash } from "./planners/trash-bin";

document.addEventListener("DOMContentLoaded", () => render());

const columnPlanner: any = {};
(window as any).columnPlanner = columnPlanner;

let column: HTMLDivElement;

function render() {
  column = document.getElementById("plannr")! as HTMLDivElement;
  column.innerHTML = `
<intfic-record></intfic-record>
<chapters-scenes></chapters-scenes>
<character-list></character-list>
<settings-list></settings-list>
<trash-bin></trash-bin>
`;
  chapters();
  characters();
  settings();
  trash();
}
