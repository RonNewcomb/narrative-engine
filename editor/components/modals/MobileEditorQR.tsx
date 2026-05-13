// import { modal } from "../services/modal";

// export async function showMobileEditorQRDialog() {
//   const biblio = await modal<void>(X => <MobileEditorQR close={X} />);
//   return biblio;
// }

// function MobileEditorQR({ close }: { close: () => void }) {
//   return (
//     <dialog closedby="any">
//       <div className="wrapper">
//         <div>Aim your mobile's camera or QR-code reader at the code below to connect to the mobile editor.</div>
//         <div className="qrcode"></div>
//       </div>
//     </dialog>
//   );
// }

const dialog: HTMLDialogElement = document.createElement("dialog");
dialog.setAttribute("closedby", "any");
dialog.id = "mobile-editor-dialog";
dialog.innerHTML = `
<div class="wrapper">
  <div>
    Aim your mobile's camera or QR-code reader at the code below to connect to the mobile editor.
  </div>
  <div class="qrcode">
  </div>
</div>`;
document.body.appendChild(dialog);
const qrDiv: HTMLDivElement = document.querySelector("#mobile-editor-dialog .qrcode")!;

let qrcodeRenderer = false;

async function getQrRenderer(): Promise<boolean> {
  return new Promise<any>(resolve => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js";
    script.addEventListener("load", () => resolve(true));
    document.body.appendChild(script);
  }).catch(e => {
    const msg = "Cannot load QR library.  " + JSON.stringify(e);
    dialog.replaceChildren(msg);
    dialog.showModal();
    console.log(msg);
    return false;
  });
}

export async function serveMobile(ips?: string[]) {
  ips = (ips || []).concat(location.hostname);
  ips = ips.filter(ip => ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/));
  if (!ips.length) {
    const msg = "No IP address for 192.168.x.x so mobile can't connect";
    dialog.replaceChildren(msg);
    dialog.showModal();
    return console.log(msg);
  }

  if (!qrcodeRenderer) qrcodeRenderer = await getQrRenderer();

  if (!ips || !qrcodeRenderer) return;
  const ip = ips[0];
  if (!ip || !ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    if (!ip.includes("192.168")) {
      const msg = "Address is not 192.168 local.";
      dialog.replaceChildren(msg);
      dialog.showModal();
      return console.log(msg);
    }
  }
  const port = location.port ? `:${location.port}` : "";
  const subfolder = location.href.includes("/runtime") ? "/runtime/index.html" : "/editor-mobile/index.html";
  const addy = `${location.protocol}//${ip}${port}${subfolder}`;

  qrDiv.replaceChildren();
  new QRCode(qrDiv, {
    text: addy,
    width: 128,
    height: 128,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H,
  });
  dialog.showModal();
}

declare const QRCode: {
  new (element: HTMLElement, options: any): void;
  CorrectLevel: Record<string, string>;
};
