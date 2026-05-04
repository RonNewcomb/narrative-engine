import "./column-editor";
import { play } from "./column-player";
import "./dark-mode";
import { LoadFileEvent, SaveFileEvent } from "./file-opensave";
import "./speech-to-text";
import { initSpeech2Text } from "./speech-to-text";
import "./underline";

// document.addEventListener("DOMContentLoaded", () => console.log("DOMContentLoaded"));

addEventListener(SaveFileEvent, customEvent => {
  console.log("heard Saved");
  const e = customEvent as CustomEvent;
  const source = e.detail;
  console.log("Send to player-column");
  play(source);
});

addEventListener(LoadFileEvent, customEvent => {
  console.log("heard Loaded");
  const e = customEvent as CustomEvent;
  const source = e.detail;
  console.log("Send to player-column");
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
