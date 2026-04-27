import { findLocalIp } from "../system3/assets/findLocalIP";
import { speechToText } from "./speech-to-text";

findLocalIp(document.getElementById("qr")!);

const startButton = document.getElementById("startButton")!;

const handlers = speechToText({
  outputDiv: document.getElementById("output")!,
  onStart: () => {
    startButton.classList.add("pulse");
    startButton.textContent = "Listening...";
  },
  onStop: () => {
    startButton.classList.remove("pulse");
    startButton.textContent = "Listen.";
  },
});
if (handlers) {
  startButton!.addEventListener("click", handlers.onToggle);
  document.getElementById("shareButton")!.addEventListener("click", handlers.onShare);
  document.getElementById("copyButton")!.addEventListener("click", handlers.onCopyToClipboard);
}
