import bjson from "../../publisher/about.json";
import type { iFictionRecord } from "../../publisher/iFictionRecord";

export type Bibliographic = iFictionRecord["story"]["bibliographic"];

export function getFreshIntficRecord(): iFictionRecord {
  return { ...bjson } as iFictionRecord;
}

export function IntficRecord({
  open = true,
  bib,
  onChange,
}: {
  open?: boolean;
  bib?: Bibliographic;
  onChange?: (bib: Bibliographic) => void;
}) {
  if (!bib) return <intfic-record></intfic-record>;

  const fields = keys.map(key => (
    <div key={key} style={{ textAlign: "right", textTransform: "capitalize" }}>
      {key}:
      <input
        type="text"
        name={key}
        value={getValue(key, bib)}
        onChange={e => {
          setValue(key, bib, e.target.value);
          onChange?.(bib);
        }}
        style={{ width: "16em" }}
      />
    </div>
  ));
  return (
    <intfic-record>
      <details style={{ fontSize: "smaller" }} open={open}>
        <summary>
          {bib.title} by {bib.author}{" "}
        </summary>
        <div>{fields}</div>
      </details>
    </intfic-record>
  );

  // const els = document.getElementsByTagName("intfic-record");
  // for (const el of els) {
  //   el.innerHTML = txt;
  //   el.children[0].addEventListener("toggle", e => {
  //     if ((e.target as HTMLDetailsElement)?.open || isRendering) return;
  //     isRendering = true;
  //     render(false);
  //     isRendering = false;
  //   });
  // }
}

const keys = [
  "title",
  "author",
  "language",
  "headline",
  "firstpublished",
  "description",
  "genre",
  "forgiveness",
  "series",
  "seriesnumber",
  "url",
  "authoremail",
] as const;

type BiblioInfo = iFictionRecord["story"]["bibliographic"];

function getValue(key: string, obj: BiblioInfo): string {
  if (key == "url") return obj.contacts?.url || "";
  if (key == "authoremail") return obj.contacts?.authoremail || "";
  return (obj as any)[key] || "";
}

function setValue(key: string, obj: BiblioInfo, val: string) {
  if (!obj.contacts) obj.contacts = {};
  if (key == "url") return (obj.contacts.url = val);
  if (key == "authoremail") return (obj.contacts.authoremail = val);
  (obj as any)[key] = val;
}
