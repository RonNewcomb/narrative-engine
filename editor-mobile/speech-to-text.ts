export interface ISpeechToText {
  outputDiv: HTMLElement;
  onStart?: () => void;
  onStop?: () => void;
}

export interface ReturnSpeechToText {
  onToggle: () => boolean;
  onShare: () => void;
  onCopyToClipboard: () => void;
}

let usingLocal = false;

export function speechToText({ outputDiv, onStart, onStop }: ISpeechToText): ReturnSpeechToText | void {
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

  function onEmit(event: SpeechRecognitionEvent) {
    const transcript = event.results[0][0].transcript;
    console.log({ transcript, results: event.results });
    outputDiv.textContent += transcript + ". ";
  }

  function onToggle() {
    isListening ? recognition.stop() : recognition.start();
    isListening = !isListening;
    return isListening;
  }

  function onShare() {
    if (!navigator.share) return;
    navigator
      .share({
        title: document.title || "Speech to Text",
        text: outputDiv.textContent,
      })
      .then(() => console.log("Successful share"))
      .catch(error => console.log("Error sharing", error));
  }

  function onCopyToClipboard() {
    navigator.clipboard?.writeText(outputDiv.textContent);
  }

  return {
    onToggle,
    onShare,
    onCopyToClipboard,
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

(window as any).speechToText = speechToText;
(window as any).useLocalRecognition = useLocalRecognition;
