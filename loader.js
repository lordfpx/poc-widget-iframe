(function () {
  var MSG_TYPE = "ENGIE_WIDGET_HEIGHT";

  // Utilitaire: déterminer le targetOrigin pour le handshake
  function computeTargetOriginForIframe(frame) {
    var sb = (frame.getAttribute("sandbox") || "").split(/\s+/);
    var hasSameOrigin = sb.includes("allow-same-origin");
    try {
      return hasSameOrigin ? new URL(frame.src).origin : "null";
    } catch (_) {
      return "null";
    }
  }

  // Construit la query string à partir des data-* du host
  function paramsFromHost(host) {
    var p = new URLSearchParams();
    Array.prototype.forEach.call(host.attributes, (a) => {
      if (!a.name.startsWith("data-")) return;
      if (a.name === "data-e-widget" || a.name === "data-e-widget-loaded")
        return;
      p.set(a.name, a.value);
    });
    return p;
  }

  // Monte toutes les iframes
  document.querySelectorAll("[data-e-widget]").forEach((host) => {
    if (host.dataset.eWidgetLoaded) return;
    host.dataset.eWidgetLoaded = "true";

    var id = `ew-${Math.random().toString(36).slice(2)}`;
    var src = "https://pr8zd6.csb.app/docs/index.html";

    var params = paramsFromHost(host);
    params.set("ewid", id);
    var finalSrc = src + (params.toString() ? "?" + params.toString() : "");

    var sandbox =
      host.getAttribute("data-sandbox") || "allow-scripts allow-same-origin";

    var iframe = document.createElement("iframe");
    iframe.src = finalSrc;
    iframe.setAttribute(
      "title",
      host.getAttribute("data-title") || "Widget ENGIE"
    );
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("sandbox", sandbox);
    iframe.setAttribute("data-ewidget-id", id);
    iframe.style.width = "100%";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.height = "0px";
    iframe.style.transition = "height .2s ease-in-out";
    iframe.style.willChange = "height";

    // --- MessageChannel : port dédié pour cette iframe
    var ch = new MessageChannel();
    // Réception des hauteurs côté parent via port1
    ch.port1.onmessage = function (evt) {
      var d = evt.data;
      if (!d || d.type !== MSG_TYPE || d.id !== id) return;
      if (typeof d.height === "number" && d.height >= 0) {
        iframe.style.height = d.height + "px";
      }
    };

    // Quand l’iframe est prête, on lui envoie le port2
    iframe.addEventListener("load", () => {
      var targetOrigin = computeTargetOriginForIframe(iframe); // "https://…", ou "null" si sandbox sans same-origin
      try {
        iframe.contentWindow.postMessage(
          { type: "ENGIE_INIT_PORT", id: id },
          targetOrigin,
          [ch.port2] // transfert du port
        );
      } catch (e) {
        // Si l'UA refuse (rare), on peut ignorer: l'iframe restera sans port
        // et donc ne postera pas de hauteur.
        console.warn("ENGIE: échec d'envoi de port au widget", e);
      }
    });

    host.replaceWith(iframe);
  });
})();
