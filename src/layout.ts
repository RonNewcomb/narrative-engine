export function div(children?: HTMLElement[], attrs?: Partial<HTMLDivElement>): HTMLDivElement {
  return element("div", attrs, children) as HTMLDivElement;
}

export function element(tagName: string, attrs?: Partial<HTMLElement>, children?: HTMLElement[]): HTMLElement {
  const el = document.createElement(tagName);
  if (attrs) Object.keys(attrs).forEach(attr => ((el as any)[attr] = (attrs as any)[attr]));
  if (children) children.forEach(child => el.appendChild(child));
  return el;
}
