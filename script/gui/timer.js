/* --- EXPORTS --- */
export { Timer as default };

/*
 * CLASS: Timer
 *****************************************************************************/
const Timer = class {
  static #idCounter = 1;
  static #jobs = {};

  /* --- METHOD: setTimeout --- */
  static setTimeout(callback, milliseconds) {
    // NOTE: Argument validation is delegated to window.
    const jobId = Timer.#generateJobId();
    this.#jobs[jobId] = window.setTimeout(callback, milliseconds);
    return jobId;
  }

  /* --- METHOD: clearTimeout --- */
  static clearTimeout(jobId) {
    if (!(jobId in this.#jobs)) {
      console.warn(`WARNING: Given job ID ${jobId} to clear does not exist`);
    }
    window.clearTimeout(this.#jobs[jobId]);
    delete this.#jobs[jobId];
  }

  /* --- METHOD: generateId --- */
  static #generateJobId() {
    const id = Timer.#idCounter;
    Timer.#idCounter += 1;
    return id;
  }
};
