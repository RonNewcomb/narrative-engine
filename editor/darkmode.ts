function toggleDarkMode() {
  const el = document.getElementById("darkmode")! as HTMLStyleElement;
  el.disabled = !el.disabled;
}

const el = document.createElement("style");
el.id = "darkmode";
el.innerHTML = `
      html {
        filter: invert(1) hue-rotate(180deg);
      }
      body {
        background-color: white;
      }

      /* Re-invert media so they look normal */
      img,
      video,
      iframe,
      canvas {
        filter: invert(1) hue-rotate(180deg);
      }
`;
document.head.appendChild(el);
if (!window.matchMedia("(prefers-color-scheme: dark)").matches) toggleDarkMode();
