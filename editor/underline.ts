import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";

const addUnderline = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
});
const removeUnderline = StateEffect.define();

const underlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (let e of tr.effects)
      if (e.is(addUnderline)) {
        decorations = decorations.update({
          add: [underlineMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removeUnderline)) {
        return Decoration.none;
      }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f),
});

const underlineMark = Decoration.mark({ class: "cm-underline" });
const underlineTheme = EditorView.baseTheme({
  ".cm-underline": {
    textDecoration: "underline 3px red",

    // textDecoration: "none",
    // backgroundImage: "linear-gradient(to right, #ff0000, #ffffff) !important",
    // backgroundRepeat: "no-repeat",
    // backgroundSize: "100% 3px" /* Control the thickness of the underline */,
    // backgroundPosition: "0 100%" /* Position the line at the bottom */,
  },
});

export function underlineError(from?: number, to?: number) {
  if (typeof from !== "number") return window.view.dispatch({ effects: removeUnderline.of(null) });

  let effects: StateEffect<unknown>[] = [addUnderline.of({ from, to: to ?? from + 1 })];
  if (!effects.length) return false;

  // one-time register
  if (!window.view.state.field(underlineField, false)) effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));

  window.view.dispatch({ effects });
  return true;
}
window.underlineError = underlineError;
