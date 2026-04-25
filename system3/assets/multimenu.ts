import { element } from "./layout";
import "./multimenu.css";

export interface MenuElement extends HTMLDivElement {
  childNodes: NodeListOf<ResponseButtonElement>;
}

export interface MenuPanelElement extends MenuElement {}

export interface ResponseButtonElement extends Omit<HTMLButtonElement, "children"> {
  parentElement: MenuElement;
  childNodes: NodeListOf<Text | MenuElement>;
}

export interface Result {
  chosen: string;
  goingTo?: string;
}

export async function multimenu(topMenu: MenuElement): Promise<Result> {
  return new Promise(resolve => {
    const publishedElement = document.getElementById("published")!;
    publishedElement.removeChild(topMenu);

    const command = element<HTMLDivElement>("past-choice", { innerText: " " });
    publishedElement.appendChild(command);

    const slidingWindow = element<HTMLDivElement>("sliding-window", {}, [createPanelFromMenuTemplate(topMenu, choose)]);
    const container = element<HTMLDivElement>("container-menus", {}, [slidingWindow]);
    publishedElement.appendChild(container);

    let goingTo = "";
    let currentSlide = 0;

    onSwipe = function (n: number) {
      currentSlide = Math.max(currentSlide + n, slidingWindow.childElementCount - 1);
      slidingWindow.style.left = `calc(-${currentSlide * 100}% - ${currentSlide * 2}em)`; // 2em is the flex-gap
    };
    onSwipe(currentSlide); // init

    function getCommand(panels: MenuPanelElement[], withHashtags = false): string {
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
          if (withHashtags && child.nodeType == Node.ELEMENT_NODE && (child as Element).tagName === "GO-TO") {
            goingTo = child.textContent;
          }
        }
      }
      return retval.join("");
    }

    function shouldDisplayMenu(menu: MenuPanelElement): MenuElement | false {
      if (!menu) return false;
      const pushed = Array.from(menu.childNodes).find(button => button.classList.contains("selected"));
      if (!pushed) return menu;
      for (const child of pushed.childNodes) {
        if (child.nodeType == Node.ELEMENT_NODE && (child as Element).tagName === "NAV") {
          const submenu = child as MenuElement;
          const menuToDisplay = shouldDisplayMenu(submenu);
          if (menuToDisplay) return menuToDisplay;
        }
      }
      return false;
    }

    function displayMenu(menu: MenuElement) {
      const panel = createPanelFromMenuTemplate(menu, choose);
      const slides = Array.from(slidingWindow.children)
        .slice(0, currentSlide + 1)
        .concat(panel);
      slidingWindow.replaceChildren(...slides);
      onSwipe(+1);
    }

    function choose(event: Event) {
      event.preventDefault();

      const pushedButton = event.currentTarget as ResponseButtonElement;
      for (const button of pushedButton.parentElement!.childNodes) button.classList.remove("selected");
      pushedButton.classList.add("selected");

      const panels = Array.from(container.childNodes[0]!.childNodes) as MenuPanelElement[];
      command.innerText = getCommand(panels).trim();

      const nextMenu = shouldDisplayMenu(panels[currentSlide]);
      if (nextMenu) return displayMenu(nextMenu);

      const chosen = getCommand(panels, true);
      console.log({ chosen, goingTo });
      resolve({ chosen, goingTo });

      container.classList.add("exit");
      setTimeout(() => publishedElement.removeChild(container), 200); // match transition time in CSS for container
    }
  });
}

function createPanelFromMenuTemplate(menu: MenuElement, choose: EventListener): MenuPanelElement {
  const panel = menu.cloneNode(true) as MenuPanelElement;
  panel.classList.add("menu-panel");
  for (const button of panel.childNodes) {
    button.addEventListener("click", choose);
    button.classList.remove("selected");
  }
  return panel;
}

// touch swipe support

let touchstartX = 0;
let onSwipe: (dir: number) => void;

document.addEventListener("touchstart", e => (touchstartX = e.changedTouches[0].screenX));

document.addEventListener("touchend", e => {
  const touchendX = e.changedTouches[0].screenX;
  const diff = touchendX - touchstartX;
  touchstartX = 0;
  if (Math.abs(diff) < 40) return;
  onSwipe?.(diff < 0 ? +1 : -1);
});
