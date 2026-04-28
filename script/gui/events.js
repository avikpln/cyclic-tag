/* --- EXPORTS --- */
export { Events as default };

/*
 * CLASS: Events
 *****************************************************************************/
const Events = class {
  static #keyCallbacks = null;

  /* --- METHOD: #getKeyCallbacks --- */
  static #getKeyCallbacks() {
    // SINGLETON
    if (Events.#keyCallbacks === null) {
      Events.#keyCallbacks = {};
      window.addEventListener("keydown", (event) => {
        if (event.key in this.#keyCallbacks) {
          this.#keyCallbacks[event.key]();
        }
      });
    }
    return this.#keyCallbacks;
  }

  /* --- METHOD: bindKey --- */
  static bindKey(key, callback) {
    console.assert(typeof key === "string"); // sanity check
    console.assert(typeof callback === "function"); // sanity check

    Events.#getKeyCallbacks()[key] = callback;
  }

  /* --- METHOD: unbindKey --- */
  static unbindKey(key) {
    console.assert(typeof key === "string"); // sanity check
    console.assert(key in Events.#getKeyCallbacks()); // sanity check

    delete Events.#getKeyCallbacks()[key];
  }

  /* --- METHOD: bindElement --- */
  static bindElement(element, event, callback) {
    console.assert(element instanceof HTMLElement); // sanity check
    console.assert(typeof event === "string"); // sanity check
    console.assert(typeof callback === "function"); // sanity check

    element.addEventListener(event, callback);
  }

  /* --- METHOD: unbindElement --- */
  static unbindElement(element, event, callback) {
    console.assert(element instanceof HTMLElement); // sanity check
    console.assert(typeof event === "string"); // sanity check
    console.assert(typeof callback === "function"); // sanity check

    element.removeEventListener(event, callback);
  }
};
