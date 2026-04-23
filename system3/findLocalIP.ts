export function findLocalIp(logInfo = true) {
  return new Promise<string[]>((resolve, reject) => {
    window.RTCPeerConnection = window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection;
    if (typeof window.RTCPeerConnection == "undefined") return reject("WebRTC not supported by browser");

    const pc = new RTCPeerConnection();
    const ips: string[] = [];

    pc.createDataChannel("");

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(err => reject(err));

    // called multiple times, then called once more with nothing
    pc.onicecandidate = event => {
      if (!event || !event.candidate) {
        // All ICE candidates have been sent.
        if (ips.length == 0) return reject("WebRTC disabled or restricted by browser");
        return resolve(ips);
      }

      const parts = event.candidate.candidate.split(" ");
      const [base, componentId, protocol, priority, ip, port, , type, ...attr] = parts;
      const component = ["rtp", "rtpc"];

      if (!ips.some(e => e == ip)) ips.push(ip);

      if (!logInfo) return;

      const obj = {
        candidate: base.split(":")[1],
        componentId: componentId,
        component: component[+componentId - 1],
        protocol: protocol,
        priority: priority,
        ip: ip,
        port: port,
        type: type,
      };
      // console.log(obj);
      // console.log(event.candidate);
    };
  });
}

findLocalIp()
  .then(async ips => {
    ips = (ips || []).concat(location.hostname);
    console.log(ips);
    if (!ips) return console.log("No IPs");
    ips = ips.filter(ip => ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/));
    if (!ips.length) return console.log("No IP addresses; mobile can't connect to a localhost address");
    return new Promise<string[]>(resolve => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js";
      script.addEventListener("load", () => resolve(ips));
      document.body.appendChild(script);
    });
  })
  .then(ips => {
    if (!ips) return;
    const ip = ips[0];
    if (!ip || !ip.match(/^\d+\.\d+\.\d+\.\d+$/)) return console.log("local ip " + ip);
    const port = location.port ? `:${location.port}` : "";
    const addy = `${location.protocol}//${ip}${port}`;
    document.getElementById("ip")!.innerText = addy;
    new QRCode(document.getElementById("qrcode")!, {
      text: addy,
      width: 128,
      height: 128,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  });

declare const QRCode: {
  new (element: HTMLElement, options: any): void;
  CorrectLevel: Record<string, string>;
};
