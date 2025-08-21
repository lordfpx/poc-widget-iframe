/*
_availability.js
*/

(function (window, document, E, undefined) {
  "use strict";

  const pluginName = "eAvailability";
  const attr = "data-e-availability";
  const defaults = {
    service: "",
    wordings: {
      available: "",
      unavailable: "",
      soon: "",
    },
  };

  const _display = function (ewt) {
    const node = document.createElement("p");
    let string = "";

    if (ewt < 3) {
      node.classList.add("u-color-success");
      string = this.settings.wordings.available;
    } else if (ewt > 6) {
      node.classList.add("u-color-grey");
      string = this.settings.wordings.unavailable;
    } else {
      node.classList.add("u-color-warning");
      string = `${this.settings.wordings.soon} <b>${ewt} min</b>`;
    }

    node.innerHTML = string;
    this.el.appendChild(node);
    this.el.hidden = false;
  };

  const _request = function () {
    var request = new XMLHttpRequest();

    this.el.innerHTML = "";
    this.el.hidden = true;

    request.open("GET", this.settings.service, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        // la réponse est en secondes, convertion en minutes
        const ewt = Math.floor(JSON.parse(request.response).ewt / 60);
        _display.call(this, ewt);
      }
    };

    request.send();
  };

  const _onModalOpened = function (ev) {
    const modalName = this.modalNode.eModal.settings.target;

    // si la modale ouverte est celle contenant le composant
    if (ev.detail.instance.settings.target === modalName) {
      _request.call(this);
    }
  };

  const Plugin = function () {
    this.modalNode = null;
  };

  Plugin.prototype = {
    init: function () {
      this.modalNode = this.el.closest("[data-e-modal]");

      this.modalNode
        ? document.addEventListener("modal.open", _onModalOpened.bind(this))
        : _request.call(this);
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});
