import * as random from "lib0/random";
import { yCollab } from "y-codemirror.next";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

export const usercolors = [
  { color: "#30bced", light: "#30bced33" },
  { color: "#6eeb83", light: "#6eeb8333" },
  { color: "#ffbc42", light: "#ffbc4233" },
  { color: "#ecd444", light: "#ecd44433" },
  { color: "#ee6352", light: "#ee635233" },
  { color: "#9ac2c9", light: "#9ac2c933" },
  { color: "#8acb88", light: "#8acb8833" },
  { color: "#1be7ff", light: "#1be7ff33" },
];
const userColor = usercolors[random.uint32() % usercolors.length];

let ydoc: Y.Doc;
let provider: WebrtcProvider;
let ytext: Y.Text;
let undoManager: Y.UndoManager;
let persistence: IndexeddbPersistence;

export function mobileSync(room: string = "mirrorway-new-work", content: string = "") {
  if (persistence) persistence.destroy();
  if (provider) provider.disconnect();
  if (undoManager) undoManager.destroy();
  if (ydoc) ydoc.destroy();

  ydoc = new Y.Doc();
  provider = new WebrtcProvider(room, ydoc);
  ytext = ydoc.getText(room);
  undoManager = new Y.UndoManager(ytext);
  provider.awareness.setLocalStateField("user", {
    name: "Anonymous " + Math.floor(Math.random() * 100),
    color: userColor.color,
    colorLight: userColor.light,
  });
  persistence = new IndexeddbPersistence(room, ydoc);
  persistence.on("synced", () => {
    console.log("Content loaded from local database");
  });
  return yCollab(ytext, provider.awareness, { undoManager });
}
