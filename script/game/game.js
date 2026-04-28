/* --- IMPORTS --- */
import Random from "../lib/random.js";
import Position from "./position.js";
import Direction from "./direction.js";

/* --- EXPORTS --- */
export { Game as default };

/*--- CONFIGURATION --- */
const GameConfiguration = {
  columns: 20,
  rows: 20,
  cyclic: true,
};
// Object.freeze(GameConfiguration);

/* --- ENUM: GameStatus --- */
const GameStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
  GAME_WIN: "GAME_WIN",
};
Object.freeze(GameStatus);

/* --- CONSTANTS --- */
const MIN_NUM_PLAYERS = 3;
const MAX_NUM_PLAYERS = 3;

/*
 * CLASS: Game
 *****************************************************************************/
const Game = class {
  /// STATE
  #status = Game.Status.IDLE;
  #state = null;
  #numPlayers = null;

  static CONFIGURATION = GameConfiguration;

  /* --- INNER: Status --- */
  static Status = GameStatus;

  /* --- INNER: State --- */
  static State = class {
    constructor(positions, winner = undefined) {
      this.positions = positions;
      this.winner = winner;
    }
  };

  /* --- C'TOR: constructor --- */
  constructor(numPlayers = 3) {
    if (!Number.isInteger(numPlayers)) {
      throw TypeError(`object ${numPlayers} is not an integer`);
    }
    if (numPlayers < MIN_NUM_PLAYERS || numPlayers > MAX_NUM_PLAYERS) {
      const message = `nubmer of players is not in the range [${MIN_NUM_PLAYERS}, ${MAX_NUM_PLAYERS}]`;
      throw Error(message); // TODO: ValueError
    }
    this.#numPlayers = numPlayers;
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Game.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#cloneState();
  }

  /* --- METHOD: getNumPlayers --- */
  getNumPlayers() {
    return this.#numPlayers;
  }

  /* --- METHOD: getPlayerPosition --- */
  getPlayerPosition(index) {
    return this.#state.positions[index];
  }

  /* --- METHOD: getGridDimensions --- */
  static getGridDimensions() {
    return [Game.CONFIGURATION.rows, Game.CONFIGURATION.columns];
  }

  /// TRANSITION

  /* --- METHOD: play --- */
  play() {
    if (this.getStatus() !== Game.Status.IDLE) {
      console.error(`ERROR: Already started playing`);
      return;
    }
    this.#state = this.#getInitialState();
    this.#setStatus(Game.Status.PLAYING);
  }

  /* --- METHOD: reset --- */
  reset() {
    if (this.getStatus() !== Game.Status.IDLE) {
      this.stop();
    }
    this.play();
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getStatus() === Game.Status.IDLE) {
      console.error(`ERROR: Already stopped`);
      return;
    }
    this.#clear();
  }

  // ... PLACE HERE METHODS FOR TRANSITIONING BETWEEN CHANGES WHILE PLAYING ...
  // DON'T FORGET TO CHECK STATUS IN EACH METHOD!

  // /* --- METHOD: step --- */
  // step() {
  //   if (this.getStatus() === Game.Status.IDLE) {
  //     throw Error(`game is not playing`);
  //   }
  //   // TODO
  // }

  /* --- METHOD: move --- */
  move(index, direction) {
    if (this.getStatus() !== Game.Status.PLAYING) {
      console.error(`ERROR: Not playing`);
      return;
    }
    if (!this.#validatePlayerIndex(index)) {
      console.error(`ERROR: player index ${index}`);
      return;
    }
    if (!(direction in Direction)) {
      console.error(`ERROR: Invalid direction ${direction}`);
      return;
    }

    const currPos = this.#state.positions[index];
    this.#state.positions[index] = this.#getNextPosition(currPos, direction);
  }

  /* --- METHOD: checkWin --- */
  checkWin() {
    const numPlayers = this.getNumPlayers();
    const positions = this.#state.positions;
    for (let index = 0; index < numPlayers; index++) {
      const chaser = index;
      const runner = (index + 1) % numPlayers;
      if (positions[chaser].isEqualTo(positions[runner])) {
        this.#setStatus(Game.Status.GAME_WIN);
        this.#state.winner = index;
      }
    }
  }

  /// AUXILIARY

  /* --- METHOD: #clear --- */
  #clear() {
    this.#setStatus(Game.Status.IDLE);
    this.#state = null;
  }

  /* --- METHOD: #cloneState --- */
  #cloneState() {
    const state = this.#state;
    return new Game.State(
      state.positions.map((pos) => pos.clone()),
      state.winner
    );
  }

  /* --- METHOD: #getInitialState --- */
  #getInitialState() {
    return new Game.State(this.#getInitialPositions());
  }

  // ... PUT HERE ADDITIONAL AUXILIARY METHODS ...

  /* --- METHOD: #validatePlayerIndex --- */
  #validatePlayerIndex(index) {
    return (
      Number.isInteger(index) && index >= 0 && index < this.getNumPlayers()
    );
  }

  /* --- METHOD: #getInitialPositions --- */
  #getInitialPositions() {
    const choices = [];
    for (let x = 0; x < Game.CONFIGURATION.columns; x++) {
      for (let y = 0; y < Game.CONFIGURATION.rows; y++) {
        choices.push([x, y]);
      }
    }
    const chosen = Random.getRandomChoices(choices, this.getNumPlayers());
    const positions = chosen.map((xy) => new Position(xy[0], xy[1]));
    return positions;
  }

  /* --- METHOD: #getNextPosition --- */
  #getNextPosition(currPos, direction) {
    const [rows, columns] = Game.getGridDimensions();
    const nextPos = currPos.clone();
    switch (direction) {
      case Direction.UP:
        nextPos.y--;
        if (Game.CONFIGURATION.cyclic) {
          nextPos.y = (nextPos.y + rows) % rows;
        } else {
          nextPos.y = Math.max(nextPos.y, 0);
        }
        break;

      case Direction.RIGHT:
        nextPos.x++;
        if (Game.CONFIGURATION.cyclic) {
          nextPos.x = nextPos.x % columns;
        } else {
          nextPos.x = Math.min(nextPos.x, columns - 1);
        }
        break;

      case Direction.DOWN:
        nextPos.y++;
        if (Game.CONFIGURATION.cyclic) {
          nextPos.y = nextPos.y % rows;
        } else {
          nextPos.y = Math.min(nextPos.y, rows - 1);
        }
        break;

      case Direction.LEFT:
        nextPos.x--;
        if (Game.CONFIGURATION.cyclic) {
          nextPos.x = (nextPos.x + columns) % columns;
        } else {
          nextPos.x = Math.max(nextPos.x, 0);
        }
        break;

      default:
        console.assert(false); // sanity check
    }
    return nextPos;
  }
};
