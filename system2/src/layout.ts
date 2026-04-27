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

const debugOn = ".debug { display: block; }";
const debugOff = ".debug { display: none; }";
let isDebugOn = false;
document.head.appendChild(element<HTMLStyleElement>("style", { id: "debug-style", innerText: debugOff }));
(window as any).toggleDebug = (e?: Event) => {
  isDebugOn = !isDebugOn;
  document.getElementById("debug-style")!.innerText = isDebugOn ? debugOn : debugOff;
  (e?.target as any)?.scrollIntoViewIfNeeded();
};

export function clickTo(id: string, handler: (this: GlobalEventHandlers, ev: MouseEvent) => any) {
  const el = document.getElementById(id);
  if (el) el.onclick = handler;
}

export function hydrateMainMenu() {
  const showFlyout = (e: MouseEvent) => {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "block";
  };
  const hideFlyout = (e: MouseEvent) => {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "none";
  };
  clickTo("open-main-menu-btn", showFlyout);
  clickTo("main-menu-flyout", hideFlyout);
  clickTo("main-menu-overlay", hideFlyout);
  clickTo("undo-btn", () => confirm("Are you sure you wish to undo?"));
  clickTo("sync-btn", () => {});
  clickTo("restart-btn", () => {
    if (!confirm("Are you sure you wish to restart?")) return;
    restart();
    window.location.reload();
  });
}
