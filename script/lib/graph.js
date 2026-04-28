/* --- EXPORTS --- */
export { Graph as default };

/*
 * CLASS: Graph
 *****************************************************************************/
const Graph = class {
  #adjList = null;

  /* --- C'TOR: constructor --- */
  constructor(n) {
    if (!Number.isInteger(n) || n < 0) {
      // NOTE: Empty graph is allowed.
      throw TypeError(`number of vertices should be a nonnegative integer`);
    }
    this.n = n;
    this.#adjList = {};
  }

  /* --- METHOD: hasEdge --- */
  hasEdge(u, v) {
    this.validateVertex(u);
    this.validateVertex(v);
    return u in this.#adjList && this.#adjList[u].has(v);
  }

  /* --- METHOD: addDirectedEdge --- */
  addDirectedEdge(u, v) {
    if (this.hasEdge(u, v)) {
      console.warn(`WARNING: edge (${u},${v}) already exists`);
      return;
    }
    if (!(u in this.#adjList)) {
      this.#adjList[u] = new Set();
    }
    this.#adjList[u].add(v);
  }

  /* --- METHOD: removeDirectedEdge --- */
  removeDirectedEdge(u, v) {
    if (!this.hasEdge(u, v)) {
      throw new GraphValueError(`edge (${u},${v}) doesn't exist`);
    }
    this.#adjList[u].delete(v);
  }

  /* --- METHOD: addEdge --- */
  addEdge(u, v) {
    this.addDirectedEdge(u, v);
    this.addDirectedEdge(v, u);
  }

  /* --- METHOD: removeEdge --- */
  removeEdge(u, v) {
    this.removeDirectedEdge(u, v);
    this.removeDirectedEdge(v, u);
  }

  /* --- METHOD: size --- */
  size() {
    return this.n;
  }

  /* --- METHOD: neighbors --- */
  neighbors(u) {
    this.validateVertex(u);
    return u in this.#adjList ? Array.from(this.#adjList[u]) : [];
  }

  /* --- METHOD: V --- */
  V() {
    const vertices = [];
    for (let i = 0; i < this.size(); i++) {
      vertices.push(i);
    }
    return vertices;
  }

  /* --- METHOD: E --- */
  E() {
    const edges = [];
    this.#adjList.forEach((u) => edges.concat(Object.keys(this.#adjList[u])));
    return edges;
  }

  /* --- METHOD: validateVertex --- */
  validateVertex(obj) {
    if (!Number.isInteger(obj) || obj < 0 || obj > this.size()) {
      const message = `object ${JSON.stringify(obj)} is not a valid vertex`;
      throw TypeError(message);
    }
  }
};

/* --- AUX: toString --- */
Graph.prototype.toString = function graphToString() {
  const stringBuilder = [];
  stringBuilder.push(`[`);
  this.V().forEach((u) => {
    stringBuilder.push(`${u}: {`);
    const adjList = this.neighbors(u);
    if (adjList.length > 0) {
      adjList.forEach((v) => {
        stringBuilder.push(`${v}`);
        stringBuilder.push(`, `);
      });
      stringBuilder.pop(); // to remove the last ", "
    }
    stringBuilder.push(`}`);
    stringBuilder.push(`, `);
  });
  stringBuilder.pop(); // to remove the last ", "
  stringBuilder.push(`]`);

  return stringBuilder.join("");
};
