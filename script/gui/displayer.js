/* --- IMPORTS --- */
//import Position from "./position.js";
import Game from "../game/game.js";
import Canvas from "./canvas.js";

/* --- EXPORTS --- */
export { Displayer as default };

/*--- CONFIGURATION --- */
const DisplayerConfiguration = {
  slotWidth: 15,
  slotHeight: 15,
};
// Object.freeze(DisplayerConfiguration);

/* --- CONSTANTS --- */
const PLAYER_OUTLINE = "black";
const PLAYER_COLORS = ["blue", "green", "red"];

const PAUSE_TEXT = "Pause";
const PAUSE_FONT = "bold 32px Cursive";
const PAUSE_COLOR = "red";
const GAME_OVER_TEXT = "Game Over";
const GAME_OVER_FONT = "bold 32px Cursive";
const GAME_OVER_COLOR = "blue";
const GAME_WIN_TEXT = "You Won!";
const GAME_WIN_FONT = "bold 32px Cursive";
const GAME_WIN_COLOR = "blue";

/*
 * CLASS: Displayer
 *****************************************************************************/
const Displayer = class {
  #canvas = null;

  static CONFIGURATION = DisplayerConfiguration;

  /* --- C'TOR: constructor --- */
  constructor(canvas) {
    this.#canvas = new Canvas(canvas);
  }

  /* --- METHOD: clear --- */
  clear() {
    this.#canvas.clear();
  }

  /* --- METHOD: displayNone --- */
  displayNone() {
    this.clear();
  }

  /* --- METHOD: displayIdle --- */
  displayIdle() {
    const imageSource = document.querySelector("#cover-image");
    this.#canvas.fillCanvas("teal");
    this.#canvas.backgroundImage(imageSource);
  }

  /* --- METHOD: displayPlaying --- */
  displayPlaying(gstate) {
    if (!(gstate instanceof Game.State)) {
      throw TypeError(`input ${gstate} is not a Game.State object`);
    }
    // console.log(gstate);

    // chaser hides runner
    const positions = gstate.positions;
    for (let index = positions.length - 1; index >= 0; index--) {
      this.#displayPlayer(index, positions[index]);
    }
    if (positions[0].isEqualTo(positions[positions.length - 1])) {
      this.#displayPlayer(
        positions.length - 1,
        positions[positions.length - 1]
      );
    }
  }

  /* --- METHOD: #getSlotSize --- */
  #getSlotSize() {
    return [
      Displayer.CONFIGURATION.slotWidth,
      Displayer.CONFIGURATION.slotHeight,
    ];
  }

  /* --- METHOD: #displayPlayer --- */
  #displayPlayer(index, pos) {
    const [slotWidth, slotHeight] = this.#getSlotSize();
    const [x, y] = [
      pos.x * slotWidth + slotWidth / 2,
      pos.y * slotHeight + slotHeight / 2,
    ];
    const radius = Math.min(slotWidth, slotHeight) / 2;
    const fillStyle = PLAYER_COLORS[index];
    this.#canvas.fillStrokeCircle(x, y, radius, fillStyle, PLAYER_OUTLINE);
  }

  /* --- METHOD: #announce --- */
  #announce(text, font, color) {
    const [width, height] = this.#canvas.getSize();
    const textWidth = this.#canvas.measureText(text, font).width;
    this.#canvas.fillText(
      text,
      (width - textWidth) / 2,
      height / 2,
      font,
      color
    );
  }

  /* --- METHOD: displayPaused --- */
  displayPaused() {
    this.#announce(PAUSE_TEXT, PAUSE_FONT, PAUSE_COLOR);
  }

  /* --- METHOD: displayGameOver --- */
  displayGameOver() {
    this.#announce(GAME_OVER_TEXT, GAME_OVER_FONT, GAME_OVER_COLOR);
  }

  /* --- METHOD: displayGameWin --- */
  displayGameWin() {
    this.#announce(GAME_WIN_TEXT, GAME_WIN_FONT, GAME_WIN_COLOR);
  }
};
