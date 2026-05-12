import { createContext, ReactNode, useContext, useState } from "react";
import type { iFictionRecord } from "../../publisher/iFictionRecord";

export interface Project {
  record: iFictionRecord;
  sourceFile: FileSystemFileHandle;
  dirHandle: FileSystemDirectoryHandle;
  initialText: string;
  detail: string;
}

interface ProjectContextType {
  project: Project | undefined;
  setProject: (project: Project | undefined) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | undefined>(undefined);

  return <ProjectContext.Provider value={{ project, setProject }}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
