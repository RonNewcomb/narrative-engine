export function emptyErrbar() {
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML = "";
  footer.removeEventListener("click", emptyErrbar);
}

export function renderErrbar(e?: string) {
  if (!e) return emptyErrbar();
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML = "<button type='button' style='border:0'>" + e + "</button>";
  footer.addEventListener("click", emptyErrbar);
}
