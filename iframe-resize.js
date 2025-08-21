(function () {
  "use strict";

  const CONFIG = { STABLE_FRAMES: 2, QUIET_MS: 120 };

  // Params (id d'instance uniquement)
  const params = new URLSearchParams(location.search);
  const ewId = params.get("ewid") || "";

  // Port reçu du parent via MessageChannel
  let port = null;

  // Lecture de hauteur robuste
  const root = document.body;
  function readHeight() {
    const height = Math.max(root.scrollHeight, root.offsetHeight);
    return Math.ceil(height);
  }

  // Envoi via le port (déduplication)
  let lastPosted = -1;
  function post(height) {
    if (!port) return; // on attend le handshake
    if (height <= 0 || height === lastPosted) return;
    lastPosted = height;
    port.postMessage({ type: "ENGIE_WIDGET_HEIGHT", id: ewId, height });
  }

  // Stabilisation rAF + quiet time
  let raf = 0;
  let stableFrames = 0;
  let lastHeight = readHeight();
  let lastActivityTime = performance.now();

  function scheduleCheck() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const currentHeight = readHeight();
      const now = performance.now();
      if (currentHeight !== lastHeight) {
        lastHeight = currentHeight;
        stableFrames = 0;
        lastActivityTime = now;
      } else {
        stableFrames++;
      }

      const isQuiet = now - lastActivityTime >= CONFIG.QUIET_MS;
      const isStable = stableFrames >= CONFIG.STABLE_FRAMES;

      raf = 0;
      isQuiet && isStable ? post(lastHeight) : scheduleCheck();
    });
  }
  const activity = () => {
    if (!raf) scheduleCheck();
  };

  // Observateurs: resize / mutations / transitions / animations / fonts / load
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(activity);
    if (root) ro.observe(root);
  } else {
    window.addEventListener("resize", activity);
  }

  const mo = new MutationObserver(activity);
  mo.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  document.addEventListener("transitionstart", activity, true);
  document.addEventListener("transitionend", activity, true);
  document.addEventListener("animationstart", activity, true);
  document.addEventListener("animationend", activity, true);
  window.addEventListener("DOMContentLoaded", activity);
  window.addEventListener("load", activity);
  document.fonts?.ready?.then(activity).catch(() => {});

  // Handshake : récupérer le port de communication
  function onInit(e) {
    if (!e.data || e.data.type !== "ENGIE_INIT_PORT") return;
    // Récupère le port transféré
    var receivedPort = e.ports && e.ports[0];
    if (!receivedPort) return;

    port = receivedPort;
    port.start(); // démarre le port
    activity(); // première mesure dès qu'on a le port
    window.removeEventListener("message", onInit);
  }

  window.addEventListener("message", onInit);
})();
