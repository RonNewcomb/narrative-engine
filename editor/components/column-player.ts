import { parse, SyntaxError } from "../../system3/parser.js";
import { underlineError } from "./underline.js";

export function play(source: string) {
  const playerWindow = (document.getElementById("player-frame")! as HTMLIFrameElement).contentWindow as Window;
  if (!playerWindow || !playerWindow.interpreter) return console.log("Interpreter warming up...");
  try {
    const ast = parse(source);
    playerWindow.interpreter(ast);
    underlineError();
  } catch (e) {
    if (e instanceof SyntaxError) {
      const err = e as unknown as PeggySyntaxError;
      console.log("expected", err.expected, "found", err.found, "at", err.location);
      console.log(source.slice(err.location.start.offset, err.location.start.offset + 40));
      renderErrbar(JSON.stringify(e));
      underlineError(err.location.start.offset, err.location.start.offset + 40);
    } else {
      console.error("PEGGY:", e);
      renderErrbar(JSON.stringify(e));
    }
    throw e;
  }
}

export function playPublished(url: string) {
  render(url);
}

function emptyErrbar() {
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML = "";
  footer.removeEventListener("click", emptyErrbar);
}

function renderErrbar(e: string) {
  if (!e) emptyErrbar();
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML = "<button type='button' style='border:0'>" + e + "</button>";
  footer.addEventListener("click", emptyErrbar);
}

interface PeggySyntaxError {
  name: "SyntaxError";
  expected: { type: string }[];
  found: string;
  location: {
    source?: string;
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}

function render(src: string = "/runtime/index.html") {
  document.getElementById("player")!.innerHTML = `<iframe id="player-frame" src="${src}" width="100%" height="100%"></iframe>`;
}

document.addEventListener("DOMContentLoaded", () => render());
