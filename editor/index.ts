import "./components/column-editor";
import { play } from "./components/column-player";
import "./components/dark-mode";
import { LoadFileEvent, SaveFileEvent } from "./components/file-opensave";
import "./components/play-button";
import "./components/publish-button";
import "./components/speech-to-text";
import { initSpeech2Text } from "./components/speech-to-text";
import "./components/underline";

addEventListener(SaveFileEvent, customEvent => {
  const e = customEvent as CustomEvent;
  const source = e.detail;
  play(source);
});

addEventListener(LoadFileEvent, customEvent => {
  const e = customEvent as CustomEvent;
  const source = e.detail;
  play(source);
});

setTimeout(() => {
  const content = window.view.state.doc.toString();
  if (content) dispatchEvent(new CustomEvent(LoadFileEvent, { detail: content, bubbles: true, cancelable: true }));
}, 0);

function speechToEditor(speech: string) {
  if (!speech || !speech.trim()) return;
  const text = " " + speech;
  const cursor = window.view.state.selection.main.head; // Get current cursor position
  window.view.dispatch({
    changes: {
      from: cursor,
      to: cursor, // 'from' and 'to' being the same means it's an insertion
      insert: text,
    },
    // Optional: move cursor to the end of the inserted text
    selection: { anchor: cursor + text.length },
    scrollIntoView: true,
  });
}

document.addEventListener("DOMContentLoaded", () => initSpeech2Text(speechToEditor));
