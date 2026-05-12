import { useRef } from "react";
import { parse, SyntaxError } from "../publisher/parser.js";
import { underlineError } from "./services/underline";

export function Player({ src = "/runtime/index.html" }: { src?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  return (
    <player-frame>
      <iframe id="player-frame" ref={ref} src={src} width="100%" height="100%"></iframe>
    </player-frame>
  );
}

export function play(source: string) {
  const playerWindow = (document.getElementById("player-frame")! as HTMLIFrameElement).contentWindow as Window;
  if (!playerWindow || !playerWindow.interpreter) return console.log("Interpreter warming up...");
  try {
    const ast = parse(source);
    playerWindow.interpreter(ast);
    underlineError();
    renderErrbar();
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
