import { findLocalIp } from "../system3/assets/findLocalIP";
import { speechToText } from "./speech-to-text";

findLocalIp(document.getElementById("qr")!);

const startButton = document.getElementById("startButton")!;

const handlers = speechToText({
  outputDiv: document.getElementById("output")!,
  onStart: () => (startButton.textContent = "Listening..."),
  onStop: () => (startButton.textContent = "Listen."),
});
if (handlers) {
  startButton!.addEventListener("click", e => {
    const state = handlers.onToggle();
    if (state) startButton.classList.add("pulse");
    else startButton.classList.remove("pulse");
  });
  document.getElementById("shareButton")!.addEventListener("click", handlers.onShare);
  document.getElementById("copyButton")!.addEventListener("click", handlers.onCopyToClipboard);
}
