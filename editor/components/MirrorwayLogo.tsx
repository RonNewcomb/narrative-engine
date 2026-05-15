import { useProject } from "./services/useProject";

export function MirrorwayLogo() {
  const { project } = useProject();
  if (project?.record?.story?.bibliographic?.title) document.title = project?.record?.story?.bibliographic?.title + " - Mirrorway";
  else document.title = "Mirrorway";
  return <mirrorway-logo> Mirrorway </mirrorway-logo>;
}
