const pulseCSS = `
.pulse {
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    stroke: black;
  }
  50% {
    transform: scale(1.3);
    stroke: red;
  }
  100% {
    transform: scale(1);
    stroke: black;
  }
}
speech-to-text {
  display: inline-block;
}`;

const icon = `
<button type="button" style="border:0" aria-label="toggle speech-to-writing mode">
  <svg fill="#000000" width="24px" height="24px" viewBox="-3 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M11.665 7.915v1.31a5.257 5.257 0 0 1-1.514 3.694 5.174 5.174 0 0 1-1.641 1.126 5.04 5.04 0 0 1-1.456.384v1.899h2.312a.554.554 0 0 1 0 1.108H3.634a.554.554 0 0 1 0-1.108h2.312v-1.899a5.045 5.045 0 0 1-1.456-.384 5.174 5.174 0 0 1-1.641-1.126 5.257 5.257 0 0 1-1.514-3.695v-1.31a.554.554 0 1 1 1.109 0v1.31a4.131 4.131 0 0 0 1.195 2.917 3.989 3.989 0 0 0 5.722 0 4.133 4.133 0 0 0 1.195-2.917v-1.31a.554.554 0 1 1 1.109 0zM3.77 10.37a2.875 2.875 0 0 1-.233-1.146V4.738A2.905 2.905 0 0 1 3.77 3.58a3 3 0 0 1 1.59-1.59 2.902 2.902 0 0 1 1.158-.233 2.865 2.865 0 0 1 1.152.233 2.977 2.977 0 0 1 1.793 2.748l-.012 4.487a2.958 2.958 0 0 1-.856 2.09 3.025 3.025 0 0 1-.937.634 2.865 2.865 0 0 1-1.152.233 2.905 2.905 0 0 1-1.158-.233A2.957 2.957 0 0 1 3.77 10.37z">
      </path>
    </g>
  </svg>
</button>`;

export function initSpeech2Text(onEmit: (text: string) => void) {
  const style = document.createElement("style");
  style.id = "speech-to-text";
  style.innerHTML = pulseCSS;
  document.head.appendChild(style);

  const el = document.getElementsByTagName("speech-to-text")[0];
  el.innerHTML = icon;

  const handlers = speechToText({
    onStart: () => el.classList.add("pulse"),
    onStop: () => el.classList.remove("pulse"),
    onChange: onEmit,
  });
  if (handlers) el.addEventListener("click", handlers.onToggle);
}

interface ISpeechToText {
  onStart?: () => void;
  onStop?: () => void;
  onChange?: (text: string) => void;
}

interface ReturnSpeechToText {
  onToggle: () => boolean;
}

let usingLocal = false;

function speechToText({ onStart, onStop, onChange }: ISpeechToText): ReturnSpeechToText | void {
  if (location.protocol !== "https:") return window.alert("Speech-to-text requires HTTPS protocol");
  let isListening = false;

  const SR =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;
  if (!SR) return window.alert("This browser does not support speech-to-text");

  const recognition = new SR();
  recognition.lang = navigator.language;
  recognition.continuous = true;
  recognition.processLocally = usingLocal;
  recognition.onstart = onStart || (() => 0);
  recognition.onend = onStop || (() => 0);
  recognition.onresult = onEmit;
  recognition.onend = () => onError(void 0);
  recognition.onerror = onError;

  function onError(e?: SpeechRecognitionErrorEvent) {
    if (e) console.error("Speech recognition error", e);
    isListening = false;
    onStop?.();
  }

  let nextIndexToEmit = 0;

  function onEmit(event: SpeechRecognitionEvent) {
    const lastIndex = event.results.length - 1;
    if (nextIndexToEmit > lastIndex) nextIndexToEmit = 0;
    const transcripts = [];
    for (; nextIndexToEmit <= lastIndex; nextIndexToEmit++) {
      const t = event.results[nextIndexToEmit];
      if (t) transcripts.push(t[0].transcript);
    }
    const transcript = transcripts.join(" ").trim();
    // console.log({ transcript, results: event.results });
    if (transcript) onChange?.(transcript);
  }

  function onToggle() {
    isListening ? recognition.stop() : recognition.start();
    isListening = !isListening;
    return isListening;
  }

  return {
    onToggle,
  };
}

export function useLocalRecognition(local: boolean = true): Promise<string | undefined> | string | undefined {
  usingLocal = local;
  if (!usingLocal) return "";
  const lang = navigator.language;
  const options: SpeechRecognitionOptions = { langs: [lang], processLocally: true };
  return SpeechRecognition.available(options).then(result => {
    if (result === "unavailable") return `${lang} is not available to download at this time. Sorry!`;
    if (result === "available") return undefined;
    console.log(`${lang} language pack is downloading...`);
    return SpeechRecognition.install(options).then(result => {
      if (!result) return `${lang} language pack failed to download. Try again later.`;
      return `${lang} language pack downloaded. Start recognition again.`;
    });
  });
}
