export function render() {
  const elements = document.getElementsByTagName("trash-bin");
  for (const el of elements) {
    el.innerHTML = `
<style>
    trash-bin { display: block }
</style>
<details>
<summary>🗑️ Scraps</summary>
</details>`;
  }
}
