import { findLocalIp } from "./findLocalIP";
import "./layout.css";

type Attributes<T extends HTMLElement> = Partial<Omit<T, "style">> & { style?: Partial<CSSStyleDeclaration> };

export function div(children?: HTMLElement[], attrs?: Attributes<HTMLDivElement>): HTMLDivElement {
  return element("div", attrs, children) as HTMLDivElement;
}

export function paragraph(children?: HTMLElement[], attrs?: Attributes<HTMLParagraphElement>): HTMLParagraphElement {
  return element("p", attrs, children) as HTMLParagraphElement;
}

export function buttonMake(
  label: any,
  onclick: (e: Event) => void,
  children?: HTMLElement[],
  attrs?: Attributes<HTMLButtonElement>,
): HTMLButtonElement {
  return element("button", { ...attrs, onclick, innerText: label, type: "button" }, children) as HTMLButtonElement;
}

export function element<T extends HTMLElement>(tagName: string, attrs?: Attributes<T>, children?: HTMLElement[]): T {
  const el = document.createElement(tagName) as T;
  if (attrs) (Object.keys(attrs) as (keyof T)[]).forEach(attr => (el[attr] = (attrs as any)[attr]));
  if (attrs && attrs.style) Object.keys(attrs.style).forEach(css => (el.style[css as any] = (attrs.style as any)[css]));
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}

const layout = `
<aside id="cornerMenu">
    <button id="open-main-menu-btn" type="button">...</button>
    <div id="main-menu-overlay">
    <nav id="main-menu-flyout" role="dialog" aria-modal="true">
        <button class="mainMenuButton" id="undo-btn" type="button">Undo</button>
        <button class="mainMenuButton" id="restart-btn" type="button">Restart</button>
        <button class="mainMenuButton" id="sync-btn" type="button">Sync with Cloud...</button>
        <div><span id="ip"></span></div>
        <div id="qrcode"></div>
    </nav>
    </div>
</aside>
<main id="published"></main>
<div id="choices"></div>`;

document.body.insertAdjacentHTML("beforeend", layout);

function clickTo(id: string, handler: (e: Event) => void) {
  var el = document.getElementById(id);
  if (el) el.onclick = handler;
}
function hydrateMainMenu() {
  var showFlyout = function (e: Event) {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "block";
  };
  var hideFlyout = function (e: Event) {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "none";
  };
  clickTo("open-main-menu-btn", showFlyout);
  clickTo("main-menu-flyout", hideFlyout);
  clickTo("main-menu-overlay", hideFlyout);
  clickTo("undo-btn", () => confirm("Are you sure you wish to undo?"));
  clickTo("sync-btn", () => {});
  clickTo("restart-btn", function () {
    if (!confirm("Are you sure you wish to restart?")) return;
    // TODO: implement restart
    window.location.reload();
  });
}
hydrateMainMenu();

findLocalIp();
