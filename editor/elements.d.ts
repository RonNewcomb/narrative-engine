import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "other-files": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "dark-mode": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "publish-button": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "play-button": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "code-editor": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "scene-planner": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "intfic-record": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "mobile-editor": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "speech-to-text": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "file-opensave": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "mirrorway-logo": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "err-bar": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "mirrorway-editor": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "mirrorway-app": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "trash-bin": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "character-list": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "chapters-scenes": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "settings-list": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "player-frame": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "distraction-button": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "scene-dialog": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
