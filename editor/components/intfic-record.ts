import type { iFictionRecord } from "../../system3/iFictionRecord";
import bjson from "../publisher/intfic.json";

document.addEventListener("DOMContentLoaded", () => render());

type BiblioInfo = iFictionRecord["story"]["bibliographic"];

const biblio = bjson as iFictionRecord; // TODO this is hard-coded default only

export function getIntficRecord() {
  return biblio;
}

let isRendering = false;

export function render(open = true) {
  const els = document.getElementsByTagName("intfic-record");
  const txt = bibliographica(open);
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

const handlers: any = {};
(window as any).biblio = handlers;

function bibliographica(open: boolean) {
  handlers.updatefield = (key: string, value: string) => {
    setValue(key, biblio.story.bibliographic, value);
    // console.log({ key, value });
    // render();
  };
  const fields = keys.map(
    key => `
      <div style="text-align:right;text-transform:capitalize">
        ${key}: 
        <input 
          type="text" 
          name="${key}" 
          value="${getValue(key, biblio.story.bibliographic) || ""}" 
          onchange="biblio.updatefield('${key}', this.value)"
          style="width:17em"
          />
      </div>`,
  );
  return `
    <details ${open && "open"} class='biblio'>
      <summary> ${biblio.story.bibliographic.title} by ${biblio.story.bibliographic.author} </summary>
      <div>${fields.join("")}</div>
    </details>
  `;
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
