import { restart } from "./persistence";

export function button(attrs?: Partial<HTMLButtonElement>): HTMLButtonElement {
  const btn = element("button", attrs) as HTMLButtonElement;
  btn.type = attrs?.type || "button";
  return btn;
}

export function div(children?: HTMLElement[], attrs?: Partial<HTMLDivElement>): HTMLDivElement {
  return element("div", attrs, children) as HTMLDivElement;
}

export function paragraph(children?: HTMLElement[], attrs?: Partial<HTMLParagraphElement>): HTMLParagraphElement {
  return element("p", attrs, children) as HTMLParagraphElement;
}

export function element<T extends HTMLElement>(tagName: string, attrs?: Partial<T>, children?: HTMLElement[]): T {
  const el = document.createElement(tagName) as T;
  if (attrs) Object.keys(attrs).forEach(attr => ((el as any)[attr] = (attrs as any)[attr]));
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

let debugMode = false;
function toggleDebug(e?: Event) {
  if (debugMode) document.querySelectorAll(".hidedebug").forEach(el => (el.className = "showdebug"));
  else document.querySelectorAll(".showdebug").forEach(el => (el.className = "hidedebug"));
  debugMode = !debugMode;
  (e?.target as any)?.scrollIntoViewIfNeeded();
}
toggleDebug();
toggleDebug();
(window as any).toggleDebug = toggleDebug;

const mainMenuItems: HTMLButtonElement[] = [
  button({ className: "mainMenuButton", innerText: "Undo", onclick: () => confirm("Are you sure you wish to undo?") }),
  button({ className: "mainMenuButton", innerText: "Restart", onclick: () => confirm("Are you sure you wish to restart?") && restart() }),
  button({ className: "mainMenuButton", innerText: "Sync with..." }),
];

const icon = `
<svg style="left: 8px; top: 44px; position: relative;" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="26" height="26" viewBox="0,0,256,256">
  <g fill="#brown" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M0,9v2h50v-2zM0,24v2h50v-2zM0,39v2h50v-2z"></path></g></g>
</svg>`;

export function attachMainMenu() {
  const getFlyout = () => document.getElementsByClassName("overlay")[0] as HTMLDivElement;
  const cornerIcon = div([], { className: "mainmenuicon", innerHTML: icon, onclick: () => (getFlyout().style.display = "block") });
  const mainMenuFlyout = div(mainMenuItems, { className: "mainmenuflyout", onclick: () => (getFlyout().style.display = "none") });
  const mainMenuOverlay = div([mainMenuFlyout], { className: "overlay", onclick: () => (getFlyout().style.display = "none") });
  const mainMenu = div([cornerIcon, mainMenuOverlay]);
  document.body.appendChild(mainMenu);
}
