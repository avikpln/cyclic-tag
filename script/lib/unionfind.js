/* --- EXPORTS --- */
export { WQUPC as default };

/*
 * CLASS: WQUPC
 *****************************************************************************/
// NOTE: Implementation of the union-find DS: weighted QU + path compression.
const WQUPC = class {
  #id = null;
  #size = null;

  // INIT: Initialize union-find data structure with N objects (0 to N-1).
  /* --- C'TOR: constructor --- */
  constructor(N) {
    this.#id = [];
    this.#size = [];
    for (let i = 0; i < N; i++) {
      this.#id.push(i);
      this.#size.push(1);
    }
  }

  // UNION: Add connection between p and q.
  /* --- METHOD: union --- */
  union(p, q) {
    const i = this.#root(p);
    const j = this.#root(q);
    if (i == j) {
      return;
    }
    if (this.#size[i] <= this.#size[j]) {
      this.#id[i] = j;
      this.#size[j] += this.#size[i];
    } else {
      this.#id[j] = i;
      this.#size[i] += this.#size[j];
    }
  }

  // FIND: Component identifier for p (0 to N-1).
  /* --- METHOD: find --- */
  find(p) {
    return this.#root(p);
  }

  // CONNECTED: Are p and q in the same component?
  /* --- METHOD: connected --- */
  connected(p, q) {
    return this.find(p) == this.find(q);
  }

  // COUNT: Number of components.
  /* --- METHOD: count --- */
  count() {
    return this.getConnectedComponents().length;
  }

  /* --- METHOD: getConnectedComponents --- */
  getConnectedComponents() {
    var disjointSets = {};
    for (let p = 0; p < this.#id.length; p++) {
      const i = this.find(p);
      if (!(i in disjointSets)) {
        disjointSets[i] = new Set();
      }
      disjointSets[i].add(p);
    }

    var connectedComponents = [];
    for (let key in disjointSets) {
      connectedComponents.push(disjointSets[key]);
    }
    return connectedComponents;
  }

  /* --- METHOD: #root --- */
  #root(i) {
    // Two-pass implementation.
    let j = i; // save original
    while (i != this.#id[i]) {
      i = this.#id[i];
    }

    while (j != i) {
      const temp = this.#id[j];
      this.#id[j] = i;
      j = temp;
    }

    // // Simpler one-pass variant. (OK in practice)
    // while (i != this.#id[i]) {
    //  	this.#id[i] = this.#id[this.#id[i]];
    //  	i = this.#id[i];
    // }

    return i;
  }
};
