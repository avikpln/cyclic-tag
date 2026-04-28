/* --- EXPORTS --- */
export { Direction as default, flipDirection };

/*
 * ENUM: Direction
 *****************************************************************************/
const Direction = {
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT",
};
Object.freeze(Direction);

/* --- FUNCTION: flipDirection --- */
const flipDirection = function (direction) {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    default:
      throw TypeError(`direction: ${direction} is not of type Direction`);
  }
};
