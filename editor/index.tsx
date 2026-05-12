import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DarkMode } from "./components/buttons/dark-mode";
import { SpeechToText } from "./components/buttons/microphone-button";
import { MobileEditor } from "./components/buttons/mobile-editor-button";
import { PlayButton } from "./components/buttons/play-button";
import { PublishButton } from "./components/buttons/publish-button";
import { CodeEditor } from "./components/column-editor";
import { Planner } from "./components/column-planner";
import { Player } from "./components/column-player";
import { ErrBar } from "./components/err-bar";
import { FileOpenSave } from "./components/file-opensave";
import { MirrorwayLogo } from "./components/MirrorwayLogo";
import { Project, ProjectProvider } from "./components/services/useProject";

export function App() {
  return (
    <ProjectProvider>
      <Editor />
    </ProjectProvider>
  );
}

function Editor() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [source, setSource] = useState("");

  const handleSaveFileEvent = (e?: { detail: string }) => {
    const source = e?.detail;
    if (!source) return;
    setSource(source);
  };

  const handleLoadFileEvent = (project?: Project) => {
    const source = project?.initialText;
    if (!source) return;
    setSource(source);
  };

  return (
    <>
      <header>
        <MirrorwayLogo />
        <FileOpenSave onSave={handleSaveFileEvent} onLoad={handleLoadFileEvent} onError={setError} />
        <div className="action-row">
          <MobileEditor />
          <PlayButton onClick={setSource} />
          <PublishButton onError={setError} />
          <SpeechToText />
          <DarkMode />
        </div>
      </header>
      <main>
        <Planner />
        <CodeEditor />
        <Player source={source} onError={setError} />
      </main>
      <footer>
        <ErrBar e={error} />
      </footer>
    </>
  );
}

// setTimeout(() => {
//   const content = window.view.state.doc.toString();
//   if (content) dispatchEvent(new CustomEvent(LoadFileEvent, { detail: content, bubbles: true, cancelable: true }));
// }, 0);

createRoot(document.getElementsByTagName("mirror-way")[0]).render(<App />); // index.html
