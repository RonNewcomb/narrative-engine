const chapters = [{ scenes: ["scene 1"] }];

function scenesOf(ch: { scenes: string[] }) {
  return ch.scenes.map(c => `<details class="indent"><summary>📈 ${c}</summary>${c}: </details>`).join("");
}

export function render() {
  const elements = document.getElementsByTagName("chapters-scenes");

  const cs = chapters.map(c => `<details class="indent"><summary>📒 Chapter:</summary>${scenesOf(c)}</details>`).join("");

  for (const el of elements) {
    el.innerHTML =
      `
<style>
    chapters-scenes { display: block }
    chapters-scenes .indent { margin-left: 1em; }
    chapters-scenes .indent .indent { margin-left: 1em; }
</style>
<details>
  <summary>📕 Manuscript</summary>` +
      cs +
      `</details>`;
  }
}
