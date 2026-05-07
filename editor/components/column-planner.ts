export {};

document.addEventListener("DOMContentLoaded", () => render());

const columnPlanner: any = {};
(window as any).columnPlanner = columnPlanner;

let column: HTMLDivElement;

function render() {
  column = document.getElementById("plannr")! as HTMLDivElement;
  column.innerHTML = `<intfic-record></intfic-record>`;
}
