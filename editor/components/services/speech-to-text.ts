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

const style = document.createElement("style");
style.id = "speech-to-text";
style.innerHTML = pulseCSS;
document.head.appendChild(style);

interface ISpeechToText {
  onStart?: () => void;
  onStop?: () => void;
  onChange?: (text: string) => void;
}

interface ReturnSpeechToText {
  onToggle: () => boolean;
}

let usingLocal = false;

export function speechToText({ onStart, onStop, onChange }: ISpeechToText): ReturnSpeechToText | void {
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
