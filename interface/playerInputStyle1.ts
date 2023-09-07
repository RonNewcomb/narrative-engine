import { div, element, paragraph } from "../src/layout";
import {
  createAttempt,
  type ActionDefinition,
  type Attempt,
  type Character,
  type Resource,
  type Scene,
  type Story,
} from "../src/narrativeEngine";
import { stringifyNoun } from "../src/paragraphs";

interface SlideDeck {
  currentSlide: number;
  container: HTMLDivElement;
  title: HTMLDivElement;
  slidingWindow: HTMLDivElement;
  panels: {
    container: () => HTMLDivElement;
  }[];
  context: {
    viewpointCharacter: Character;
    scene?: Scene;
  };
  answers: {
    action?: ActionDefinition<Resource, Resource>;
    nouns: Resource[];
  };
}

export async function getPlayerChoices(
  story: Story,
  viewpointCharacter: Character,
  scene: Scene | undefined
): Promise<Attempt | undefined> {
  return new Promise(awaited => {
    // pre-existing wrapper
    const published = document.getElementById("published")!;

    async function whenFinished() {
      // returns to the story
      const attempt = slides.answers.action
        ? createAttempt<Resource, Resource>(
            viewpointCharacter,
            slides.answers.action,
            slides.answers.nouns[0],
            slides.answers.nouns[1],
            undefined
          )
        : undefined;
      awaited(attempt);

      // animate closing
      slides.container.classList.add("exit");
      await new Promise(r => setTimeout(r, 1500)); // match transition time in interface.CSS

      // closes the choiceBox
      published.removeChild(slides.container);
    }

    const setSlide = (slides: SlideDeck) => {
      const i = slides.currentSlide;
      if (!slides.panels[i]) return whenFinished();
      const newPanel = slides.panels[i].container();
      newPanel.className = "slidepanel";
      slides.slidingWindow.replaceChild(newPanel, slides.slidingWindow.childNodes[i]);
      slides.slidingWindow.style.left = `calc(-${i * 100}% - ${i * 2}em)`; // 2em is the flex-gap
    };

    const nextSlide = (slides: SlideDeck) => {
      slides.currentSlide++;
      setSlide(slides);
    };

    const prevSlide = (slides: SlideDeck) => {
      if (slides.currentSlide == 0) return;
      slides.currentSlide--;
      setSlide(slides);
    };

    const decidePanels = (slides: SlideDeck) => {
      slides.answers.nouns = []; // reset
      slides.panels = [slides.panels[0]]; // reset other panels
      const action = slides.answers.action;
      if (!action) return whenFinished();
      const numNouns = action.verb.match(/_/g)?.length || 0;
      for (let i = 0; i < numNouns; i++) slides.panels.push({ container: () => createNounPanel(slides, story, i, nextSlide) });
      nextSlide(slides);
    };

    const slides: SlideDeck = {
      currentSlide: 0,
      container: div([], { className: "playerChoices" }),
      title: paragraph([], { className: "title", innerText: viewpointCharacter.name + " will..." }),
      slidingWindow: div([], { className: "slidingWindow" }),
      panels: [
        { container: () => createVerbPanel(slides, story, decidePanels) },
        // { container: () => createNounPanel(slides, story, 0, nextSlide) },
        // { container: () => createNounPanel(slides, story, 1, nextSlide) },
      ],
      context: { viewpointCharacter, scene },
      answers: { action: undefined, nouns: [] },
    };
    published.appendChild(slides.container);
    slides.container.appendChild(slides.title);
    slides.container.appendChild(slides.slidingWindow);
    slides.slidingWindow.appendChild(div([], { className: "slidepanel" }));
    slides.slidingWindow.appendChild(div([], { className: "slidepanel" }));
    slides.slidingWindow.appendChild(div([], { className: "slidepanel" })); // need more?
    setSlide(slides);
    swipeNotify = (dir: "next" | "prev") => (dir == "prev" ? prevSlide(slides) : undefined);
  });
}

function createVerbPanel(slides: SlideDeck, story: Story, next: (slides: SlideDeck) => void): HTMLDivElement {
  const container = div([], { className: "slidepanel" });
  // loop through whole palette
  for (const action of story.actionset) {
    // const verb = action.verb.charAt(0).toUpperCase() + action.verb.slice(1).replace(/_/g, "...");
    const verb = action.verb.replace(/_/g, "...");
    const button = element<HTMLButtonElement>("button", {
      type: "button",
      innerText: verb,
      onclick: () => {
        slides.answers.action = action;
        next(slides);
      },
    });
    const line = div([button]);
    container.appendChild(line);
  }
  return container;
}

function createNounPanel(slides: SlideDeck, story: Story, nth: number, next: (slides: SlideDeck) => void): HTMLDivElement {
  let verb = slides.answers.action!.verb;
  for (let i = 0; i < slides.answers.nouns.length; i++) verb = verb.replace("_", stringifyNoun(slides.answers.nouns[i]));
  verb = verb.replace(/_/g, "...");
  slides.title.innerText = slides.context.viewpointCharacter.name + " will " + verb;

  const container = div([], { className: "slidepanel" });
  for (const character of story.characters) {
    const button = element<HTMLButtonElement>("button", {
      type: "button",
      innerText: character.name,
      onclick: () => {
        slides.answers.nouns[nth] = character;
        next(slides);
      },
    });
    const line = div([button]);
    container.appendChild(line);
  }
  const keys = Object.getOwnPropertySymbols(story.desireables);
  for (const key of keys) {
    const desire = story.desireables[key];

    const button = element<HTMLButtonElement>("button", {
      type: "button",
      innerText: desire.name,
      onclick: () => {
        slides.answers.nouns[nth] = desire;
        next(slides);
      },
    });
    const line = div([button]);
    container.appendChild(line);
  }
  return container;
}

let touchstartX = 0;
let swipeNotify = (dir: "next" | "prev") => {};

document.addEventListener("touchstart", e => (touchstartX = e.changedTouches[0].screenX));

document.addEventListener("touchend", e => {
  const touchendX = e.changedTouches[0].screenX;
  const diff = touchendX - touchstartX;
  touchstartX = 0;
  if (Math.abs(diff) < 40) return;
  swipeNotify(diff < 0 ? "next" : "prev");
});
