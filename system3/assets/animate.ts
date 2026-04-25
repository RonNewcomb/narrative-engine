import "./animate.css";
import { div, element, paragraph } from "./layout";

export interface MenuElement extends HTMLDivElement {
  childNodes: NodeListOf<ResponseButtonElement>;
}

export interface MenuPanelElement extends MenuElement {}

export interface ResponseButtonElement extends Omit<HTMLButtonElement, "children"> {
  parentElement: MenuElement;
  childNodes: NodeListOf<Text | MenuElement>;
}

export async function animate(topMenu: MenuElement): Promise<string> {
  return new Promise(resolve => {
    document.getElementById("published")!.removeChild(topMenu);

    const slidingWindow = div([createPanelFromMenuTemplate(topMenu)], { id: "slidingWindow", className: "slidingWindow" });
    const title = paragraph([], { className: "title", innerText: " " });
    const container = element<HTMLDivElement>("section", { className: "playerChoices" }, [title, slidingWindow]);
    const choicesLandingSpot = document.getElementById("choices")!;
    choicesLandingSpot.appendChild(container);

    let currentSlide = 0;
    const setSlide = () => (slidingWindow.style.left = `calc(-${currentSlide * 100}% - ${currentSlide * 2}em)`); // 2em is the flex-gap

    function nextSlide() {
      currentSlide++;
      setSlide();
    }

    function prevSlide() {
      if (currentSlide == 0) return;
      currentSlide--;
      setSlide();
    }

    setSlide();
    swipeNotify = (dir: "next" | "prev") => (dir == "prev" ? prevSlide() : undefined);

    function createPanelFromMenuTemplate(menu: MenuElement): MenuPanelElement {
      const panel = menu.cloneNode(true) as MenuPanelElement;
      panel.classList.add("slidepanel");
      for (const button of panel.childNodes) {
        button.addEventListener("click", choose);
        button.classList.remove("selected");
      }
      return panel;
    }

    function displayMenu(menu: MenuElement) {
      const panel = createPanelFromMenuTemplate(menu);
      const slides = Array.from(slidingWindow.children)
        .slice(0, currentSlide + 1)
        .concat(panel);
      slidingWindow.replaceChildren(...slides);
    }

    function getTitle(panels: MenuPanelElement[], withHashtags = false): string {
      if (!panels || panels.length === 0) return " ";
      const retval: string[] = [];
      for (const panel of panels) {
        const pushedButton = Array.from(panel.childNodes).find(button => button.classList.contains("selected"));
        if (!pushedButton) break;
        for (const child of pushedButton.childNodes) {
          if (child.nodeType == Node.TEXT_NODE) {
            const words = child as Text;
            retval.push(words.textContent || "");
          }
          if (withHashtags && child.nodeType == Node.ELEMENT_NODE && (child as Element).tagName === "HASH-TAG") {
            const hashtag = child as Element;
            retval.push(hashtag.textContent || "");
          }
        }
      }
      return retval.join("");
    }

    function shouldDisplay(menu: MenuPanelElement): MenuElement | false {
      if (!menu) return false;
      const pushed = Array.from(menu.childNodes).find(button => button.classList.contains("selected"));
      if (!pushed) return menu;
      for (const child of pushed.childNodes) {
        if (child.nodeType == Node.ELEMENT_NODE && (child as Element).tagName === "NAV") {
          const submenu = child as MenuElement;
          const menuToDisplay = shouldDisplay(submenu);
          if (menuToDisplay) return menuToDisplay;
        }
      }
      return false;
    }

    function selectReponse(pushedButton: ResponseButtonElement) {
      const allButtons = pushedButton.parentElement!;
      for (const button of allButtons.childNodes) button.classList.remove("selected");
      pushedButton.classList.add("selected");
    }

    function choose(event: Event) {
      event.preventDefault();

      // .currentTarget is what's in front of .addEventListener
      // .target is a child of currentTarget (or same) which actually got clicked
      const pushedButton = event.currentTarget as ResponseButtonElement;
      selectReponse(pushedButton);

      const panels = Array.from(document.getElementById("slidingWindow")!.childNodes) as MenuPanelElement[];
      title.innerText = getTitle(panels);

      const nextMenu = shouldDisplay(panels[currentSlide]);
      if (!nextMenu) return finished(panels);
      displayMenu(nextMenu);
      nextSlide();
    }

    function finished(panels: MenuPanelElement[]) {
      renderStoryNodeCommand(title.innerText, document.getElementById("published")!);
      const chosen = getTitle(panels, true);
      console.log({ chosen });
      resolve(chosen);

      container.classList.add("exit");
      setTimeout(() => {
        choicesLandingSpot.removeChild(container);
      }, 200); // match transition time in interface.CSS, .playerChoices, transition
    }
  });
}

function renderStoryNodeCommand(command: string, el: HTMLElement): void {
  const cmd = document.createElement("past-choice");
  cmd.innerText = command;
  el.appendChild(cmd);
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
