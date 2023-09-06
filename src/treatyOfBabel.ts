import { div, element } from "./layout";
import { publish, publishHTML, publishStyled } from "./paragraphs";

export interface iFictionRecord {
  story: {
    identification: {
      ifid: string[];
      format: "html";
    };
    bibliographic: {
      title: string;
      author: string;
      language: string;
      headline: string;
      firstpublished: string | number;
      genre?: string;
      group: "The Narrative Engine";
      forgiveness?: string;
      description: string;
      series?: string;
      seriesnumber: string | number;
      resources?: {
        auxiliary?: {
          leafname?: string;
          description?: string;
        }[];
      };
      contacts?: {
        url?: string;
        authoremail?: string;
      };
      cover?: {
        format?: string;
        height?: string | number;
        width?: string | number;
        description?: string;
      };
    };
    colophon?: {
      generator: "The Narrative Engine";
      generatorversion: string;
      originated: string; // yyyy-mm-dd
    };
  };
}

export async function titleScreen() {
  return new Promise<HTMLElement>(resolve => {
    publishStyled({ fontWeight: "bold" }, "Untitled Story");
    publish(`An Interactive Fiction by Story Author`);
    publish(`Release 1 / Serial number ${new Date().toISOString().replace(/-/g, "").slice(2, 8)} / Tin Book`);
    publish(" ");
    publish(" ");
    const button = element<HTMLButtonElement>("button", {
      type: "button",
      className: "playerChoiceButton",
      innerText: "Open",
      onclick: () => resolve(panel),
    });
    const panel = div([button]);
    publishHTML(panel);
  }).then(panel => {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    // panel.style.display = "none";
  });
}
