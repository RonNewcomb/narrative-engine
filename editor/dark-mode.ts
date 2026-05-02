function toggleDarkMode() {
  const el = document.getElementById("darkmode")! as HTMLStyleElement;
  el.disabled = !el.disabled;
  localStorage.setItem("dark-mode", (!el.disabled).toString());
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
img, video, iframe, canvas {
  filter: invert(1) hue-rotate(180deg);
}`;
document.head.appendChild(el);

const mode = localStorage.getItem("dark-mode");
if (mode === null) if (!window.matchMedia("(prefers-color-scheme: dark)").matches) toggleDarkMode();
if (mode == "false") toggleDarkMode();

const icon = `
<svg width="24px" height="24px" viewBox="0 0 72 72" title="light/dark mode" onclick="toggleDarkMode()">
  <g><path fill="#FFFFFF" d="M36,45 v-36 a28,28 0 0 1 0 56 z" /></g>
  <g>
    <path d="M36,45 v-36 a28,28 0 0 0 0 56 z" />
    <circle cx="36" cy="36" r="28" fill="none" stroke="#000000" stroke-linejoin="round" stroke-width="2" />
  </g>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.getElementsByTagName("dark-mode");
  for (const el of elements) el.innerHTML = icon;
});
