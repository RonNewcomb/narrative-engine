import { useMemo, useRef } from "react";
import { parse, SyntaxError } from "../publisher/parser.js";
import { underlineError } from "./services/underline";

export function Player({
  src = "/runtime/index.html",
  source,
  onError,
}: {
  src?: string;
  source: string;
  onError: (msg?: string) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  function play(source: string) {
    if (!ref.current) return console.log("Interpreter warming up...");
    const playerWindow = ref.current.contentWindow as Window;
    if (!playerWindow || !playerWindow.interpreter) return console.log("Interpreter warming up...");
    try {
      const ast = parse(source);
      playerWindow.interpreter(ast);
      underlineError();
      onError();
    } catch (e) {
      if (e instanceof SyntaxError) {
        const err = e as unknown as PeggySyntaxError;
        console.log("expected", err.expected, "found", err.found, "at", err.location);
        console.log(source.slice(err.location.start.offset, err.location.start.offset + 40));
        onError(JSON.stringify(e));
        underlineError(err.location.start.offset, err.location.start.offset + 40);
      } else {
        console.error("PEGGY:", e);
        onError(JSON.stringify(e));
      }
      throw e;
    }
  }

  useMemo(() => source && play(source), [source]);

  return (
    <player-frame>
      <iframe id="player-frame" ref={ref} src={src} width="100%" height="100%"></iframe>
    </player-frame>
  );
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
