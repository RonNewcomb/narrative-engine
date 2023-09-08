import { restart } from "./persistence";

type Attributes<T extends HTMLElement> = Partial<Omit<T, "style">> & { style?: Partial<CSSStyleDeclaration> };

export function button(attrs?: Attributes<HTMLButtonElement>): HTMLButtonElement {
  const btn = element("button", attrs) as HTMLButtonElement;
  btn.type = attrs?.type || "button";
  return btn;
}

export function div(children?: HTMLElement[], attrs?: Attributes<HTMLDivElement>): HTMLDivElement {
  return element("div", attrs, children) as HTMLDivElement;
}

export function paragraph(children?: HTMLElement[], attrs?: Attributes<HTMLParagraphElement>): HTMLParagraphElement {
  return element("p", attrs, children) as HTMLParagraphElement;
}

export function element<T extends HTMLElement>(tagName: string, attrs?: Attributes<T>, children?: HTMLElement[]): T {
  const el = document.createElement(tagName) as T;
  if (attrs) (Object.keys(attrs) as (keyof T)[]).forEach(attr => (el[attr] = (attrs as any)[attr]));
  if (attrs && attrs.style) Object.keys(attrs.style).forEach(css => (el.style[css as any] = (attrs.style as any)[css]));
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
  button({ className: "mainMenuButton", innerText: "Sync with Cloud..." }),
];

const icon = `<div style="
    position: relative;
    top: 37px;
    left: 11px;
    font-size: xx-large;
    opacity: 0.4;
">...</div>`;

export function attachMainMenu() {
  const getFlyout = () => document.getElementsByClassName("overlay")[0] as HTMLDivElement;
  const cornerIcon = div([], { className: "mainmenuicon", innerHTML: icon, onclick: () => (getFlyout().style.display = "block") });
  const mainMenuFlyout = div(mainMenuItems, { className: "mainmenuflyout", onclick: () => (getFlyout().style.display = "none") });
  const mainMenuOverlay = div([mainMenuFlyout], { className: "overlay", onclick: () => (getFlyout().style.display = "none") });
  const mainMenu = div([cornerIcon, mainMenuOverlay]);
  document.body.appendChild(mainMenu);
}
