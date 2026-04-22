async function animate(navElement: HTMLElement): Promise<string> {
  return new Promise(resolve => {
    function prepareNav(navElement: HTMLElement) {
      navElement.classList.add("slidepanel");
      for (let i = 0; i < navElement.children.length; i++) {
        const responseWrapperDiv = navElement.children[i];
        const button = responseWrapperDiv.children[0];
        button.addEventListener("click", ev => choose(ev, responseWrapperDiv, navElement));
      }
      return navElement;
    }

    const panels = [prepareNav(navElement)];
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

    function getTitle() {
      return Array.from(slidingWindow.children)
        .map(panel => {
          const responseWrapperDiv = panel.getElementsByClassName("selected")[0];
          const button = responseWrapperDiv?.children?.[0];
          return button?.textContent || "";
        })
        .join("");
    }

    function choose(event: Event, responseWrapperDiv: Element, navElement: HTMLElement) {
      event.preventDefault();
      Array.from(navElement.children).forEach(child => {
        if (child !== responseWrapperDiv) child.classList.remove("selected");
        else child.classList.add("selected");
      });

      // make new slide
      const newNavElement = responseWrapperDiv.children?.[1]?.cloneNode(true) as HTMLElement | undefined;
      if (!newNavElement) return whenFinished();
      console.log("slidingwindows", slidingWindow.children.length, "panesls", slidingWindow.children[0]);
      slidingWindow.replaceChildren(...Array.from(slidingWindow.children).slice(0, currentSlide + 1));
      slidingWindow.appendChild(prepareNav(newNavElement));
      console.log("slidingwindows", slidingWindow.children.length, "panesls");

      title.innerText = getTitle();

      // nav to new slide
      nextSlide();
    }

    function whenFinished() {
      const title = getTitle();
      console.log({ title });
      resolve(title);

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
