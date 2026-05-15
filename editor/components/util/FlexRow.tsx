import type { PropsWithChildren } from "react";

export function FlexRow({ children }: PropsWithChildren<{}>) {
  return <div className="flex-row">{children}</div>;
}

const css = `
display: flex;
justify-content: space-between;
`;

const style = document.createElement("style");
style.id = "flexrow";
style.innerHTML = css;
document.head.appendChild(style);
