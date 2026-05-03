import "./column-editor";
import { play } from "./column-player";
import "./dark-mode";
import { LoadFileEvent, SaveFileEvent } from "./file-opensave";
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
