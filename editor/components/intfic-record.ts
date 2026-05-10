import bjson from "../publisher/about.json";
import type { iFictionRecord } from "../publisher/iFictionRecord";

document.addEventListener("DOMContentLoaded", () => render());

let biblio = bjson as iFictionRecord;

export function getFreshIntficRecord(): iFictionRecord {
  return { ...bjson } as iFictionRecord;
}

export function newIntficRecord(): iFictionRecord {
  biblio = getFreshIntficRecord();
  render(true, biblio.story.bibliographic);
  return biblio;
}

export function getIntficRecord(): iFictionRecord {
  return biblio;
}

export function setIntficRecord(r: iFictionRecord) {
  biblio = r;
  render(false, biblio.story.bibliographic);
}

(window as any).biblio = {
  updatefield(key: string, value: string) {
    setValue(key, biblio.story.bibliographic, value);
    // console.log({ key, value });
    // render();
  },
};
let isRendering = false;

export function render(open = true, bib?: BiblioInfo) {
  if (!bib) bib = biblio.story.bibliographic;
  const fields = keys.map(
    key => `
      <div style="text-align:right;text-transform:capitalize">
        ${key}: 
        <input 
          type="text" 
          name="${key}" 
          value='${getValue(key, bib) || ""}' 
          onchange="biblio.updatefield('${key}', this.value)"
          style="width:16em"
          />
      </div>`,
  );
  const txt = `
    <details ${open && "open"} style='font-size: smaller'>
      <summary> ${bib.title} by ${bib.author} </summary>
      <div>${fields.join("")}</div>
    </details>
`;

  const els = document.getElementsByTagName("intfic-record");
  for (const el of els) {
    el.innerHTML = txt;
    el.children[0].addEventListener("toggle", e => {
      if ((e.target as HTMLDetailsElement)?.open || isRendering) return;
      isRendering = true;
      render(false);
      isRendering = false;
    });
  }
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

function getValue(key: string, obj: BiblioInfo) {
  if (key == "url") return obj.contacts?.url;
  if (key == "authoremail") return obj.contacts?.authoremail;
  return obj[key as keyof BiblioInfo];
}

function setValue(key: string, obj: BiblioInfo, val: string) {
  if (!obj.contacts) obj.contacts = {};
  if (key == "url") return (obj.contacts.url = val);
  if (key == "authoremail") return (obj.contacts.authoremail = val);
  (obj as any)[key] = val;
}
