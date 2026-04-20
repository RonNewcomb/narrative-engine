const layout = `
<aside id="cornerMenu">
    <button id="open-main-menu-btn" type="button">...</button>
    <div id="main-menu-overlay">
    <nav id="main-menu-flyout" role="dialog" aria-modal="true">
        <button class="mainMenuButton" id="undo-btn" type="button">Undo</button>
        <button class="mainMenuButton" id="restart-btn" type="button">Restart</button>
        <button class="mainMenuButton" id="sync-btn" type="button">Sync with Cloud...</button>
        <div><span id="ip"></span></div>
        <div id="qrcode"></div>
    </nav>
    </div>
</aside>
<main id="published"></main>
<nav id="choices"></nav>`;

document.body.insertAdjacentHTML("beforeend", layout);

function clickTo(id: string, handler: (e: Event) => void) {
  var el = document.getElementById(id);
  if (el) el.onclick = handler;
}
function hydrateMainMenu() {
  var showFlyout = function (e: Event) {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "block";
  };
  var hideFlyout = function (e: Event) {
    e.stopPropagation();
    document.getElementById("main-menu-overlay")!.style.display = "none";
  };
  clickTo("open-main-menu-btn", showFlyout);
  clickTo("main-menu-flyout", hideFlyout);
  clickTo("main-menu-overlay", hideFlyout);
  clickTo("undo-btn", () => confirm("Are you sure you wish to undo?"));
  clickTo("sync-btn", () => {});
  clickTo("restart-btn", function () {
    if (!confirm("Are you sure you wish to restart?")) return;
    // TODO: implement restart
    window.location.reload();
  });
}
hydrateMainMenu();

// Signal that layout is ready
window.dispatchEvent(new Event("layoutReady"));
