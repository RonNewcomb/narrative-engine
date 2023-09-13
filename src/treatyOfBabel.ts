import { button, div } from "./layout";
import { publishHTML } from "./paragraphs";

const tool = "Tin Book";

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
      group?: typeof tool;
      forgiveness?: string;
      description: string;
      series?: string;
      seriesnumber?: string | number;
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
      generator: typeof tool;
      generatorversion: string;
      originated: string; // yyyy-mm-dd
    };
  };
}

export async function titleScreen(story: iFictionRecord["story"]["bibliographic"]) {
  return new Promise<HTMLElement>(resolve => {
    publishHTML(div([], { innerText: story.title, className: "b" }));
    publishHTML(div([], { innerText: `${story.headline} by ${story.author}` }));
    publishHTML(
      div([], { innerText: `Release 1 / Serial number ${story.firstpublished.toString().replace(/-/g, "").slice(2, 8)} / ${tool}` })
    );
    publishHTML(div([], { innerText: " " }));
    publishHTML(div([], { innerText: " " }));
    const btn = button({ className: "playerChoiceButton", innerText: "Open", onclick: () => resolve(panel) });
    const panel = div([btn]);
    btn.style.margin = "0 0 2.4em 0";
    publishHTML(panel);
  }).then(panel => {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    // panel.style.display = "none";
  });
}
