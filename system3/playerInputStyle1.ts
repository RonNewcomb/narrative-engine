type StoryNode = string | StoryOperation | StoryResponses;

type StoryOperation = {
  op: "if" | "did" | "didnt" | "unless";
  match: string;
  wrap: StoryNode[];
};

type StoryResponse = StoryNode[]; // each one is a button, possibly with a submenu

type StoryResponses = {
  op: "menu";
  responses: StoryResponse[];
};

type Story = StoryNode[];

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
  scene: Scene | undefined,
): Promise<Attempt | undefined> {
  return new Promise(resolve => {
    // pre-existing wrapper
    const choicesLandingSpot = document.getElementById("choices")!;

    async function whenFinished(slides: SlideDeck) {
      // returns to the story
      const attempt = slides.answers.action
        ? createAttempt<Resource, Resource>(
            viewpointCharacter,
            slides.answers.action,
            slides.answers.nouns[0],
            slides.answers.nouns[1],
            undefined,
          )
        : undefined;
      resolve(attempt);

      // // animate closing
      // slides.container.style.height = slides.container.clientHeight + "px";
      // await new Promise(r => setTimeout(r));
      // slides.container.style.height = "0px";  // required since inline css overrides the css class
      slides.container.classList.add("exit");
      await new Promise(r => setTimeout(r, 200)); // match transition time in interface.CSS, .playerChoices, transition

      // closes the choiceBox
      choicesLandingSpot.removeChild(slides.container);
    }

    const setSlide = (slides: SlideDeck) => {
      const i = slides.currentSlide;
      if (!slides.panels[i]) return whenFinished(slides);
      const newPanel = slides.panels[i].container();
      newPanel.className = "slidepanel"; // just in case
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
      if (!action) return whenFinished(slides);
      const numNouns = action.verb.match(/_/g)?.length || 0;
      for (let i = 0; i < numNouns; i++) slides.panels.push({ container: () => createNounPanel(slides, story, i, nextSlide) });
      nextSlide(slides);
    };

    const slides: SlideDeck = {
      currentSlide: 0,
      container: element<HTMLDivElement>("section", { className: "playerChoices" }),
      title: paragraph([], { className: "title", innerText: "" }),
      slidingWindow: div([], { className: "slidingWindow" }),
      panels: [
        { container: () => createVerbPanel(slides, story, decidePanels) },
        // { container: () => createNounPanel(slides, story, 0, nextSlide) },
        // { container: () => createNounPanel(slides, story, 1, nextSlide) },
      ],
      context: { viewpointCharacter, scene },
      answers: { action: undefined, nouns: [] },
    };
    choicesLandingSpot.appendChild(slides.container);
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
  const container = element<HTMLDivElement>("nav", { className: "slidepanel" });
  // loop through whole palette
  for (const action of story.actionset) {
    const button = buttonMake(action.verb.replace(/_/g, "..."), () => {
      slides.answers.action = action;
      next(slides);
    });
    container.appendChild(button);
  }
  return container;
}

function createNounPanel(slides: SlideDeck, story: Story, nth: number, next: (slides: SlideDeck) => void): HTMLDivElement {
  let verb = slides.answers.action!.verb;
  for (let i = 0; i < slides.answers.nouns.length; i++) verb = verb.replace("_", stringifyNoun(slides.answers.nouns[i]));
  verb = verb.replace(/_/g, "...");
  slides.title.innerText = slides.context.viewpointCharacter.name + " will " + verb;

  const container = element<HTMLDivElement>("nav", { className: "slidepanel" });

  const explicitOptions = nth == 0 ? slides.answers.action!.options1 : slides.answers.action!.options2;
  if (explicitOptions && explicitOptions.length) {
    for (const option of explicitOptions) {
      const button = buttonMake(option, () => {
        slides.answers.nouns[nth] = option;
        next(slides);
      });
      container.appendChild(button);
    }
    return container;
  }

  for (const character of story.characters) {
    const button = buttonMake(character.name, () => {
      slides.answers.nouns[nth] = character;
      next(slides);
    });
    container.appendChild(button);
  }

  const keys = Object.getOwnPropertySymbols(story.desireables);
  for (const key of keys) {
    const desire = story.desireables[key];
    const button = buttonMake(desire.name, () => {
      slides.answers.nouns[nth] = desire;
      next(slides);
    });
    container.appendChild(button);
  }
  return container;
}

// touch swipe support

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
