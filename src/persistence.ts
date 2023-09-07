export function load(): boolean {
  // is a game already in progress?
  const storySoFar = localStorage.getItem("storySoFar");
  if (storySoFar) document.getElementById("published")!.innerHTML = storySoFar;
  return !!storySoFar;
}

export function save() {
  const storySoFar = document.getElementById("published")?.innerHTML || "";
  localStorage.setItem("storySoFar", storySoFar);
}

export function restart() {
  localStorage.setItem("storySoFar", "");
}
