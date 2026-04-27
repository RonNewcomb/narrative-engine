import { AuthoringTool, iFictionRecord } from "../common/iFictionRecord";
import { button, div } from "./layout";
import { publishHTML } from "./paragraphs";

export { type iFictionRecord };

export async function titleScreen(story: iFictionRecord["story"]["bibliographic"]) {
  return new Promise<HTMLElement>(resolve => {
    publishHTML(div([], { innerText: story.title, className: "b" }));
    publishHTML(div([], { innerText: `${story.headline} by ${story.author}` }));
    publishHTML(
      div([], {
        innerText: `Release 1 / Serial number ${story.firstpublished.toString().replace(/-/g, "").slice(2, 8)} / ${AuthoringTool}`,
      })
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
