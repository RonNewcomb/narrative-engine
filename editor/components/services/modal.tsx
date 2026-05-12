import {
  CSSProperties,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  JSX,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export type CloseTheModalFn<T> = (returnValue: T) => void;

let setOpenModals: Dispatch<SetStateAction<ReactNode[]>> = () => [];
let modalRefs: HTMLElement[] = [];
let dismissalDelay = 0;
let exitCss = "";

const defaultOverlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: "100vw",
  overflow: "auto",
  backgroundColor: "rgba(0,0,0,0.5)",
};

const defaultModalStyle: CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  translate: "-50%",
};

const focusable = "input,select,textarea,button,a[href],[tabindex]:not([tabindex='-1'])";

///////////////////////////

export interface ModalProviderProps {
  /** without background color the modal will default to transparent backing */
  backgroundColor: CSSProperties["backgroundColor"] | "";
  /** style used on the modal itself. Accepts a function which gives the values it was going to use. */
  style?: CSSProperties | ((old: CSSProperties) => CSSProperties);
  /** css classes to place on the modal */
  className?: string;
  /** style used on the overlay. Accepts a function which gives the values it was going to use. */
  overlayStyle?: CSSProperties | ((old: CSSProperties) => CSSProperties);
  /** css classes to place on the overlay */
  overlayClassName?: string;
  /** milliseconds to wait until removing modal from DOM; allows exit animations to play out */
  msDismissDelay?: number;
  /** CSS class to add to modal on dismissal */
  exitClassName?: string;
}

/**
 * Wrap your App in this provider for the modal() function to work.
 * Uses a separate component to avoid re-rendering App.
 */
export function ModalProvider({ children, ...props }: PropsWithChildren<ModalProviderProps>) {
  console.log("ModalProvider");
  return (
    <modal-provider>
      {children}
      <ModalsList {...props} />
    </modal-provider>
  );
}

/**
 * split off from ModalProvider so when pop happens ModalProvider is not re-rendered, only this is
 */
function ModalsList({
  msDismissDelay,
  style,
  className,
  overlayClassName,
  overlayStyle,
  backgroundColor,
  exitClassName,
}: ModalProviderProps) {
  console.log("ModalsList");
  const [modals, setModals] = useState<ReactNode[]>([]);

  setOpenModals = setModals;
  dismissalDelay = msDismissDelay || 0;
  exitCss = exitClassName || "";

  useEffect(focusManagement, [modals.length]);

  // CSS
  const userModalStyle = typeof style === "function" ? style(defaultModalStyle) : style;
  const userOverlayStyle = typeof overlayStyle === "function" ? overlayStyle(defaultOverlayStyle) : overlayStyle;
  const finalModalStyle = { ...defaultModalStyle, backgroundColor, ...(userModalStyle || {}) };
  const finalOverlayStyle = { ...defaultOverlayStyle, ...(userOverlayStyle || {}) };

  return modals.map((m, i) => (
    <modal-overlay style={finalOverlayStyle} className={overlayClassName || ""} key={i}>
      <the-modal style={finalModalStyle} className={className || ""} ref={captureRef(i)}>
        {m}
      </the-modal>
    </modal-overlay>
  ));
}

/**
 * useEffect happens "after the return statement"
 */
function focusManagement() {
  const el = modalRefs[modalRefs.length - 1];
  if (!el) return;
  el.querySelector<HTMLElement>(focusable)?.focus?.(); // autofocus 1st element
  const onFocus = (e: FocusEvent) => !el.contains(e.target as HTMLElement) && el.querySelector<HTMLElement>(focusable)?.focus?.();
  document.body.addEventListener("focusin", onFocus); // fence focus to modal
  return () => document.body.removeEventListener("focusin", onFocus);
}

/**
 * ref capture happens late like useEffect
 * stable reference so ref={..} doesn't keep re-calling it
 */
function captureRef(i: number) {
  return function (htmlElement: HTMLElement | null) {
    if (htmlElement) {
      modalRefs[i] = htmlElement;
    }
    return () => {
      modalRefs.pop();
    };
  };
}

/**
 * Displays the given React component as a modal dialog.
 *
 * Example usage:
 *
 * `const answer = await modal<T>(close => <YourComponent onSubmit={close} />);`
 *
 * Choose one of your component's `onSomething` functions to send your result into the `close` function, which will resolve the promise and close the modal.
 *
 * Meaning, if your callback was named `onSubmit` and your component eventually calls `onSubmit(value)`, where `value` is of type `T`, then
 * the value is threaded through the close-modal function and lands in your variable `answer`.
 *
 * @template T the type of `answer`; the type of the modal's result. This should NOT be a promise so remember to `await`.
 * @param functionThatReturnsAComponent a function that accepts the close function and returns a react component that uses it.
 * @returns A promise of T which will be the value given to the `close` function
 */
export function modal<T>(functionThatReturnsAComponent: (close: CloseTheModalFn<T>) => JSX.Element): Promise<T> {
  return new Promise(resolve => {
    setOpenModals(list => [
      ...list,
      functionThatReturnsAComponent(modalResult => {
        resolve(modalResult);
        setTimeout(() => setOpenModals(old => old.slice(0, old.length - 1)), dismissalDelay);
        if (exitCss) modalRefs[modalRefs.length - 1]?.classList?.add(exitCss);
        //htmlElement?.addEventListener("transitionend", () => htmlElement.remove(), { once: true });
      }),
    ]);
  });
}

// allow HTML5 custom elements above
declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "modal-provider": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "modal-overlay": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "the-modal": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
