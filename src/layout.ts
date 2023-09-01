export function div(children?: HTMLElement[], attrs?: Partial<HTMLDivElement>): HTMLDivElement {
  return element("div", attrs, children) as HTMLDivElement;
}

export function element(tagName: string, attrs?: Partial<HTMLElement>, children?: HTMLElement[]): HTMLElement {
  const el = document.createElement(tagName);
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
