import { parse, SyntaxError } from "../system3/parser.js";

export function play(source: string) {
  const playerWindow = (document.getElementById("player-frame")! as HTMLIFrameElement).contentWindow as Window;
  const footer = document.getElementsByTagName("footer")[0];
  try {
    const ast = parse(source);
    playerWindow.interpreter(ast);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // @ts-ignore
      const at = e.location;
      // @ts-ignore
      console.log("expected", e.expected, "found", e.found, "at", at);
      console.log(source.slice(at.start.offset, at.start.offset + 40));
      footer.innerHTML = "<div>" + JSON.stringify(e) + "</div>";
    } else {
      console.error("CAUGHT", e);
      footer.innerHTML = "<div>" + JSON.stringify(e) + "</div>";
    }

    throw e;
  }
}

function render() {
  document.getElementById("player")!.innerHTML = '<iframe id="player-frame" src="/runtime/index.html" width="100%" height="100%"></iframe>';
}

document.addEventListener("DOMContentLoaded", () => render());
