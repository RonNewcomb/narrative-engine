import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CodeEditor } from "./components/column-editor";
import { Planner } from "./components/column-planner";
import { play, Player } from "./components/column-player";
import { DarkMode } from "./components/dark-mode";
import { ErrBar } from "./components/err-bar";
import { FileOpenSave } from "./components/file-opensave";
import { MirrorwayLogo } from "./components/MirrorwayLogo";
import { MobileEditor } from "./components/mobile-editor";
import { PlayButton } from "./components/play-button";
import { PublishButton } from "./components/publish-button";
import { Project, ProjectProvider, useProject } from "./components/services/useProject";
import { SpeechToText } from "./components/speech-to-text";

export function App() {
  return (
    <ProjectProvider>
      <Editor />
    </ProjectProvider>
  );
}

function Editor() {
  const project = useProject();
  const [error, setError] = useState<string | undefined>(undefined);

  const handleNewProject = (about: Project) => {
    project.setProject(about);
  };

  const handleSaveFileEvent = (e?: { detail: string }) => {
    const source = e?.detail;
    if (!source) return;
    play(source);
  };

  const handleLoadFileEvent = (e?: { detail: string }) => {
    const source = e?.detail;
    if (!source) return;
    play(source);
  };

  return (
    <mirrorway-editor>
      <header>
        <MirrorwayLogo />
        <FileOpenSave onSave={handleSaveFileEvent} onLoad={handleLoadFileEvent} onError={setError} onNew={handleNewProject} />
        <div className="action-row">
          <MobileEditor />
          <PlayButton />
          <PublishButton />
          <SpeechToText />
          <DarkMode />
        </div>
      </header>
      <main>
        <Planner />
        <CodeEditor />
        <Player />
      </main>
      <footer>
        <ErrBar e={error} />
      </footer>
    </mirrorway-editor>
  );
}

// setTimeout(() => {
//   const content = window.view.state.doc.toString();
//   if (content) dispatchEvent(new CustomEvent(LoadFileEvent, { detail: content, bubbles: true, cancelable: true }));
// }, 0);

createRoot(document.getElementsByTagName("mirrorway-app")[0]).render(<App />); // index.html
