/* --- EXPORTS --- */
export { Position as default };

/*
 * CLASS: Position
 *****************************************************************************/
const Position = class {
  /* --- C'TOR: constructor --- */
  constructor(x, y) {
    if (!Number.isInteger(x)) {
      throw TypeError(`x argument ${x} is not an integer`);
    }
    if (!Number.isInteger(y)) {
      throw TypeError(`y argument ${y} is not an integer`);
    }
    this.x = x;
    this.y = y;
  }

  /* --- METHOD: isEqualTo --- */
  isEqualTo(that) {
    if (!(that instanceof Position)) {
      console.warn(`WARNING: Comparing Position with ${that}`);
      return false;
    }
    return this.x == that.x && this.y == that.y;
  }

  /* --- METHOD: clone --- */
  clone() {
    return new Position(this.x, this.y);
  }
};
