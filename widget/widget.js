(function () {
  function initToggle(root) {
    var btn = root.querySelector(".c-engieWidget__button");
    var panel = root.querySelector(".c-engieWidget__details");
    if (!btn || !panel) return;

    function set(open) {
      panel.hidden = !open;
      btn.textContent = open ? "Voir moins" : "Voir plus";
    }

    btn.addEventListener("click", function () {
      set(panel.hidden);
    });
    set(false);
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var title = params.get("data-title") || "Offre ENGIE";
    var titleNode = document.querySelector(".c-engieWidget__title");
    if (titleNode) titleNode.textContent = title;

    initToggle(document);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
