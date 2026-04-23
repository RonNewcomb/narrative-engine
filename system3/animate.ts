import { div, paragraph, element } from "./layout";
import "./animate.css";

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
    const panels = [createPanelFromMenuTemplate(topMenu)];
    const slidingWindow = div(panels, { className: "slidingWindow" });
    const title = paragraph([], { className: "title", innerText: "" });
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

    let shouldTitle = " ";
    function shouldDisplay(menu: MenuPanelElement): MenuElement | false {
      if (!menu) return false;
      const pushed = Array.from(menu.childNodes).find(button => button.classList.contains("selected"));
      if (!pushed) return menu;
      for (const child of pushed.childNodes) {
        switch (child.nodeType) {
          case Node.TEXT_NODE:
            const words = child as Text;
            shouldTitle += words.textContent || "";
            break;
          case Node.ELEMENT_NODE:
            const submenu = child as MenuElement;
            const subsubmenu = shouldDisplay(submenu);
            if (subsubmenu) return subsubmenu;
            break;
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

      const nextMenu = shouldDisplay(panels[currentSlide]);
      title.innerText = shouldTitle;
      if (!nextMenu) return finished();
      displayMenu(nextMenu);
      nextSlide();
    }

    function finished() {
      console.log({ shouldTitle });
      resolve(shouldTitle);

      container.classList.add("exit");
      setTimeout(() => {
        choicesLandingSpot.removeChild(container);
      }, 200); // match transition time in interface.CSS, .playerChoices, transition
    }
  });
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
