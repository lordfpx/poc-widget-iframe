/*
_contactCollapse.js
*/

(function (window, document, E, undefined) {
  "use strict";

  const PLUGIN_NAME = "eContactCollapse";
  const ATTR = "data-e-contactcollapse";
  const ATTR_PANEL = `${ATTR}-panel`;
  const ATTR_PANELCONTENT = `${ATTR}-panelcontent`;
  const ATTR_BTN = `${ATTR}-btn`;
  const DEFAULTS = {};

  const _handleClick = function () {
    this.isOpened = !this.isOpened;
    this.el.classList.toggle("is-opened", this.isOpened);
    this.nodes.panel.inert = !this.isOpened;

    if (this.isOpened) {
      this.nodes.panelcontent.focus({ preventScroll: true });
    }
  };

  function Plugin() {
    this.isOpened = false;
  }

  Plugin.prototype = {
    init: function () {
      this.nodes = {
        btn: this.el.querySelector(`[${ATTR_BTN}]`),
        panel: this.el.querySelector(`[${ATTR_PANEL}]`),
        panelcontent: this.el.querySelector(`[${ATTR_PANELCONTENT}]`),
      };

      this.nodes.btn.addEventListener("click", _handleClick.bind(this));
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    E.factory.createPlugin(PLUGIN_NAME, ATTR, DEFAULTS, Plugin);
  });
})(window, document, window.E || {});
