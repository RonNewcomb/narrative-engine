export interface ISpeechToText {
  outputDiv: HTMLElement;
  onStart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onStop: ((this: SpeechRecognition, ev: Event) => any) | null;
}

export interface ReturnSpeechToText {
  onToggle: () => boolean;
  onShare: () => void;
  onCopyToClipboard: () => void;
}

export function speechToText({ outputDiv, onStart, onStop }: ISpeechToText): ReturnSpeechToText | void {
  if (location.protocol !== "https:") return window.alert("Speech-to-text requires HTTPS protocol");
  let toggle = false;

  const SR =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;
  if (!SR) return window.alert("This browser does not support speech-to-text");

  const recognition = new SR();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.onstart = onStart || (() => 0);
  recognition.onend = onStop || (() => 0);
  recognition.onresult = onEmit;

  function onEmit(event: SpeechRecognitionEvent) {
    const transcript = event.results[0][0].transcript;
    console.log({ transcript, results: event.results });
    outputDiv.textContent += transcript + ". ";
  }

  function onToggle() {
    if (!toggle) recognition.start();
    else recognition.stop();
    toggle = !toggle;
    return toggle;
  }

  function onShare() {
    if (!navigator.share) return;
    navigator
      .share({
        title: "Voice to Text",
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

(window as any).speechToText = speechToText;
