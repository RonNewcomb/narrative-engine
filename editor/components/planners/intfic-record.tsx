import { useState } from "react";
import bjson from "../../publisher/about.json";
import type { Bibliographic, iFictionRecord } from "../../publisher/iFictionRecord";

export function IntficRecord({
  open = true,
  bib,
  onChange,
}: {
  open?: boolean;
  bib?: Bibliographic;
  onChange?: (bib: Bibliographic) => void;
}) {
  const [dum, setDummy] = useState(1);
  if (!bib) return <intfic-record></intfic-record>;

  function getValue(key: string, obj: Bibliographic): string {
    if (key == "url") return obj.contacts?.url || "";
    if (key == "authoremail") return obj.contacts?.authoremail || "";
    return (obj as any)[key] || "";
  }

  function setValue(key: string, obj: Bibliographic, val: string) {
    setDummy(dum + 1);
    if (!obj.contacts) obj.contacts = {};
    if (key == "url") return (obj.contacts.url = val);
    if (key == "authoremail") return (obj.contacts.authoremail = val);
    (obj as any)[key] = val;
  }

  const fields = keys.map(key => (
    <div key={key} style={{ textAlign: "right", textTransform: "capitalize" }}>
      {key}:
      <input
        type="text"
        name={key}
        defaultValue={getValue(key, bib)}
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
          {bib.title} by {bib.author}
        </summary>
        <div>{fields}</div>
      </details>
    </intfic-record>
  );
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

export function getFreshIntficRecord(): iFictionRecord {
  return { ...bjson } as iFictionRecord;
}
