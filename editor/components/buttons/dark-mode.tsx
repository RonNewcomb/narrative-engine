const darkCSS = `
html {
  filter: invert(1) hue-rotate(180deg);
}

body {
  background-color: white;
}

/* Re-invert media so they look normal */
img, video, iframe, canvas {
  filter: invert(1) hue-rotate(180deg);
}`;

const darkStyle = document.createElement("style");
darkStyle.id = "darkmode";
darkStyle.innerHTML = darkCSS;
document.head.appendChild(darkStyle);

function toggleDarkMode() {
  darkStyle.disabled = !darkStyle.disabled;
  localStorage.setItem("dark-mode", (!darkStyle.disabled).toString());
}

if ("false" == (localStorage.getItem("dark-mode") ?? (!window.matchMedia("(prefers-color-scheme: dark)").matches).toString()))
  toggleDarkMode();

export function DarkMode() {
  return (
    <dark-mode>
      <button type="button" aria-label="toggle dark mode" title="toggle dark mode" onClick={toggleDarkMode}>
        <svg width="24px" height="24px" viewBox="0 0 72 72">
          <g>
            <path fill="#FFFFFF" d="M36,45 v-36 a28,28 0 0 1 0 56 z" />
          </g>
          <g>
            <path d="M36,45 v-36 a28,28 0 0 0 0 56 z" />
            <circle cx="36" cy="36" r="28" fill="none" stroke="#000000" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </button>
    </dark-mode>
  );
}
