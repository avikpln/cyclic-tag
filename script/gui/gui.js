/* --- IMPORTS --- */
import Random from "../lib/random.js";
import Position from "../game/position.js";
import Direction, { flipDirection } from "../game/direction.js";
import Game from "../game/game.js";
import Events from "./events.js";
import Displayer from "./displayer.js";
import Timer from "./timer.js";

/* --- EXPORTS --- */
export { GUI as default };

/*--- CONFIGURATION --- */
const GUIConfiguration = {
  info: true,
  audio: true,
};
// Object.freeze(GUIConfiguration);

/* --- ENUM: GUIStatus --- */
const GUIStatus = {
  NONE: "NONE",
  IDLE: "IDLE",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  GAME_WIN: "GAME_WIN",
};
Object.freeze(GUIStatus);

/* --- CONSTANTS --- */
const CANVAS_SLOT_WIDTH = 15;
const CANVAS_SLOT_HEIGHT = 15;
const TIME_DELAY = 100; // milliseconds
const GO_DELAY = 50;
const STATUS_NONE_COLOR = "rgb(0, 0, 0, 0)";
const STATUS_RUNNING_COLOR = "lime";

/*
 * CLASS: GUI
 *****************************************************************************/
const GUI = class {
  #HTML = null;
  #displayer = null;
  #status = GUI.Status.NONE;
  #game = null;
  #timeJobId = null;
  #goJobId = null;

  static CONFIGURATION = GUIConfiguration;

  /* --- INNER: Status --- */
  static Status = GUIStatus;

  /// INIT

  /* --- C'TOR: constructor --- */
  constructor(load = true) {
    this.#init();
    if (load) this.load();
  }

  /* --- METHOD: #init --- */
  #init() {
    this.#setHTML();
    this.#configure();
    this.#setDisplay();
    this.#bindEvents();
  }

  /* --- METHOD: #configure --- */
  #configure() {
    Displayer.CONFIGURATION.slotWidth = CANVAS_SLOT_WIDTH;
    Displayer.CONFIGURATION.slotHeight = CANVAS_SLOT_HEIGHT;
    Game.CONFIGURATION.columns =
      this.#HTML.gameCanvas.width / CANVAS_SLOT_WIDTH;
    Game.CONFIGURATION.rows = this.#HTML.gameCanvas.height / CANVAS_SLOT_HEIGHT;
  }

  /// STATUS

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in GUI.Status); // sanity check
    GUI.#consoleInfo(`${this.#status} -> ${status}`);
    this.#status = status;
    this.#refresh();
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /// HTML

  /* --- METHOD: #setHTML --- */
  #setHTML() {
    this.#HTML = {};

    // panel buttons
    this.#HTML.playButton = document.querySelector("#play-btn");
    this.#HTML.pauseButton = document.querySelector("#pause-btn");
    this.#HTML.resetButton = document.querySelector("#reset-btn");
    this.#HTML.stopButton = document.querySelector("#stop-btn");

    // game status
    this.#HTML.gameStatus = document.querySelector("#game-status");

    // game canvas
    this.#HTML.gameCanvas = document.querySelector("#game-canvas");

    // audio
    this.#HTML.playAudio = document.querySelector("#play-audio");
    this.#HTML.pauseAudio = document.querySelector("#pause-audio");
    this.#HTML.resumeAudio = document.querySelector("#resume-audio");
    this.#HTML.gameoverAudio = document.querySelector("#gameover-audio");
    this.#HTML.gamewinAudio = document.querySelector("#gamewin-audio");
    this.#HTML.resetAudio = document.querySelector("#reset-audio");
    this.#HTML.stopAudio = document.querySelector("#stop-audio");
  }

  /// DISPLAY

  /* --- METHOD: #setDisplay --- */
  #setDisplay() {
    this.#displayer = new Displayer(this.#HTML.gameCanvas);
  }

  /* --- METHOD: #refresh --- */
  #refresh() {
    this.#refreshCanvasDisplay();
    this.#refreshStatusDisplay();
  }

  /* --- METHOD: #refreshCanvasDisplay --- */
  #refreshCanvasDisplay() {
    const status = this.getStatus();

    switch (status) {
      case GUI.Status.NONE:
        this.#displayNone();
        break;

      case GUI.Status.IDLE:
        this.#displayIdle();
        break;

      case GUI.Status.PLAYING:
        this.#displayPlaying();
        break;

      case GUI.Status.PAUSED:
        this.#displayPaused();
        break;

      case GUI.Status.GAME_OVER:
        this.#displayGameOver();
        break;

      case GUI.Status.GAME_WIN:
        this.#displayGameWin();
        break;

      default:
        console.assert(false); // sanity check
    }
  }

  /* --- METHOD: #displayNone --- */
  #displayNone() {
    this.#displayer.clear();
    this.#displayer.displayNone();
  }

  /* --- METHOD: #displayIdle --- */
  #displayIdle() {
    this.#displayer.clear();
    this.#displayer.displayIdle();
  }

  /* --- METHOD: #displayPlaying --- */
  #displayPlaying() {
    this.#displayer.clear();
    const gstate = this.#game.getState();
    this.#displayer.displayPlaying(gstate);
  }

  /* --- METHOD: #displayPaused --- */
  #displayPaused() {
    this.#displayer.displayPaused();
  }

  /* --- METHOD: #displayGameOver --- */
  #displayGameOver() {
    this.#displayPlaying();
    this.#displayer.displayGameOver();
  }

  /* --- METHOD: #displayGameWin --- */
  #displayGameWin() {
    this.#displayPlaying();
    this.#displayer.displayGameWin();
  }

  /* --- METHOD: #refreshStatusDisplay --- */
  #refreshStatusDisplay() {
    const status = this.getStatus();
    let statusColor = null;
    switch (status) {
      case GUI.Status.NONE:
        statusColor = STATUS_NONE_COLOR;
        break;

      case GUI.Status.IDLE:
      case GUI.Status.PLAYING:
      case GUI.Status.PAUSED:
      case GUI.Status.GAME_OVER:
      case GUI.Status.GAME_WIN:
        statusColor = STATUS_RUNNING_COLOR;
        break;

      default:
        console.assert(false); // sanity check
    }

    // update HTML & CSS
    this.#HTML.gameStatus.innerText = `Status: ${status}`;
    this.#HTML.gameStatus.style.color = statusColor;
  }

  /// EVENTS

  /* --- METHOD: #bindEvents --- */
  #bindEvents() {
    // disbale text selection
    document.onselectstart = new Function("return false;");

    // LOAD
    // NOTE: '() => this.load()' instead of 'this.load' to access this.
    Events.bindKey("l", () => this.load());

    // QUIT
    Events.bindKey("q", () => this.quit());

    // PLAY
    Events.bindKey("p", () => this.#play());
    Events.bindElement(this.#HTML.playButton, "click", () => this.#play());

    // PAUSE/RESUME
    Events.bindKey(" ", () => {
      const status = this.getStatus();
      if (status === GUI.Status.PLAYING) {
        this.#pause();
      } else if (status === GUI.Status.PAUSED) {
        this.#play();
      }
    });
    Events.bindElement(this.#HTML.pauseButton, "click", () => this.#pause());

    // RESET
    Events.bindKey("r", () => this.#reset());
    Events.bindElement(this.#HTML.resetButton, "click", () => this.#reset());

    // STOP
    Events.bindKey("s", () => this.#stop());
    Events.bindElement(this.#HTML.stopButton, "click", () => this.#stop());

    // ESCAPE
    Events.bindKey("Escape", () => {
      const status = this.getStatus();
      if (status === GUI.Status.IDLE) {
        this.quit();
      } else {
        this.#stop();
      }
    });

    // ... BIND HERE USER EVENTS ...
    const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    for (const key of arrowKeys) {
      Events.bindKey(key, () => {
        this.#processArrowKey(key);
      });
    }

    // NOTE: This also handles (non-concurrently) touch events.
    Events.bindElement(this.#HTML.gameCanvas, "click", (event) => {
      event.preventDefault();
      this.#processClick(event.clientX, event.clientY);
    });
  }

  /* --- METHOD: #tick --- */
  #tick() {
    const callback = () => {
      GUI.#consoleInfo(`TICK`);

      this.#move();
      // this.#game.step();
      this.#checkGameStatus();

      if (this.#game.getStatus() === Game.Status.PLAYING) {
        this.#timeJobId = Timer.setTimeout(callback, TIME_DELAY);
      }
    };
    this.#timeJobId = Timer.setTimeout(callback, TIME_DELAY);
  }

  /* --- METHOD: #tick --- */
  #tock() {
    Timer.clearTimeout(this.#timeJobId);
    this.#timeJobId = null;
  }

  /* --- METHOD: #terminateJobs --- */
  #terminateJobs() {
    this.#timeJobId !== null ? this.#tock() : {};
    this.#goJobId !== null ? this.#haltRandomPath() : {};
  }

  /* --- METHOD: #arrowKeyToDirection --- */
  #arrowKeyToDirection(key) {
    switch (key) {
      case "ArrowLeft":
        return Direction.LEFT;
      case "ArrowRight":
        return Direction.RIGHT;
      case "ArrowUp":
        return Direction.UP;
      case "ArrowDown":
        return Direction.DOWN;
      default:
        // return null;
        console.assert(false); // sanity check
    }
  }

  /* --- METHOD: #movePlayer --- */
  #movePlayer(index, direction) {
    this.#game.move(index, direction);
    this.#checkGameStatus();
  }

  /* --- METHOD: #processArrowKey --- */
  #processArrowKey(key) {
    if (this.getStatus() === GUI.Status.PLAYING) {
      this.#movePlayer(0, this.#arrowKeyToDirection(key));
    }
  }

  /* --- METHOD: #processClick --- */
  #processClick(clientX, clientY) {
    if (this.getStatus() !== GUI.Status.PLAYING || this.#goJobId !== null) {
      return;
    }

    // refine click
    const canvas = this.#HTML.gameCanvas;
    const rect = canvas.getBoundingClientRect();
    [clientX, clientY] = [clientX - rect.left, clientY - rect.top];
    if (clientX < 0 || clientX >= canvas.width) return;
    if (clientY < 0 || clientY >= canvas.height) return;

    // calculate destination
    const [rows, columns] = Game.getGridDimensions();
    const [cellWidth, cellHeight] = [
      Math.floor(canvas.width / columns),
      Math.floor(canvas.height / rows),
    ];
    const [posX, posY] = [
      Math.floor(clientX / cellWidth),
      Math.floor(clientY / cellHeight),
    ];
    const dst = new Position(posX, posY);

    // initiate random path
    this.#initiateRandomPath(dst);
  }

  /* --- METHOD: #getRandomMoveDirection --- */
  #getRandomMoveDirection(src, dst) {
    let axis;
    if (src.x == dst.x) {
      axis = 1;
    } else if (src.y == dst.y) {
      axis = 0;
    } else {
      axis = Random.flip();
    }

    let direction;
    const [rows, columns] = Game.getGridDimensions();
    if (axis == 0) {
      direction = src.x < dst.x ? Direction.RIGHT : Direction.LEFT;
      if (Game.CONFIGURATION.cyclic) {
        const dist = Math.abs(dst.x - src.x);
        if (dist > Math.floor(columns / 2)) {
          direction = flipDirection(direction);
        }
      }
    } else {
      // axis == 1
      direction = src.y < dst.y ? Direction.DOWN : Direction.UP;
      if (Game.CONFIGURATION.cyclic) {
        const dist = Math.abs(dst.y - src.y);
        if (dist > Math.floor(rows / 2)) {
          direction = flipDirection(direction);
        }
      }
    }
    return direction;
  }

  /* --- METHOD: #initiateRandomPath --- */
  #initiateRandomPath(dst) {
    const callback = () => {
      const src = this.#game.getPlayerPosition(0);
      if (this.getStatus() !== GUI.Status.PLAYING || src.isEqualTo(dst)) {
        this.#goJobId = null;
      } else {
        this.#movePlayer(0, this.#getRandomMoveDirection(src, dst));
        this.#goJobId = Timer.setTimeout(callback, GO_DELAY);
      }
    };

    this.#goJobId = Timer.setTimeout(callback, GO_DELAY);
  }

  /* --- METHOD: #haltRandomPath --- */
  #haltRandomPath() {
    if (this.#goJobId === null) return;
    Timer.clearTimeout(this.#goJobId);
    this.#goJobId = null;
  }

  /// LOAD/QUIT

  /* --- METHOD: load --- */
  load() {
    if (this.getStatus() !== GUI.Status.NONE) {
      GUI.#consoleInfo(`Already loaded`);
      return;
    }

    this.#game = new Game();
    this.#setStatus(GUI.Status.IDLE);
  }

  /* --- METHOD: quit --- */
  quit() {
    const status = this.getStatus();
    if (status === GUI.Status.NONE) {
      GUI.#consoleInfo(`Not loaded`);
      return;
    }

    if (status !== GUI.Status.IDLE) {
      this.#terminateJobs();
      this.#game.stop();
    }
    this.#game = null;
    this.#setStatus(GUI.Status.NONE);
  }

  /// PLAYING - PLAY/PAUSE/RESET/STOP

  /* --- METHOD: play --- */
  #play() {
    const status = this.getStatus();
    switch (status) {
      case GUI.Status.IDLE:
      case GUI.Status.PAUSED:
        break;
      default:
        GUI.#consoleInfo(`Got play request while in status ${status}`);
        return;
    }

    if (status === GUI.Status.IDLE) {
      this.#game.play();
      GUI.#playAudio(this.#HTML.playAudio);
    } else {
      GUI.#playAudio(this.#HTML.resumeAudio);
    }
    this.#tick();
    this.#setStatus(GUI.Status.PLAYING);
  }

  /* --- METHOD: pause --- */
  #pause() {
    const status = this.getStatus();
    if (status !== GUI.Status.PLAYING) {
      GUI.#consoleInfo(`Got pause request while in status ${status}`);
      return;
    }

    this.#terminateJobs();
    this.#setStatus(GUI.Status.PAUSED);
    GUI.#playAudio(this.#HTML.pauseAudio);
  }

  /* --- METHOD: reset --- */
  #reset() {
    const status = this.getStatus();
    switch (status) {
      case GUI.Status.PLAYING:
      case GUI.Status.PAUSED:
      case GUI.Status.GAME_OVER:
      case GUI.Status.GAME_WIN:
        break;
      default:
        GUI.#consoleInfo(`Got reset request while in status ${status}`);
        return;
    }

    this.#terminateJobs();
    this.#game.reset();
    this.#tick();
    this.#setStatus(GUI.Status.PLAYING);
    GUI.#playAudio(this.#HTML.resetAudio);
  }

  /* --- METHOD: stop --- */
  #stop() {
    const status = this.getStatus();
    switch (status) {
      case GUI.Status.PLAYING:
      case GUI.Status.PAUSED:
      case GUI.Status.GAME_OVER:
      case GUI.Status.GAME_WIN:
        break;
      default:
        GUI.#consoleInfo(`Got stop request while in status ${status}`);
        return;
    }

    this.#terminateJobs();
    this.#game.stop();
    this.#setStatus(GUI.Status.IDLE);
    GUI.#playAudio(this.#HTML.stopAudio);
  }

  /// GAME STATUS

  /* --- METHOD: #checkGameStatus --- */
  #checkGameStatus() {
    this.#game.checkWin();
    const gameStatus = this.#game.getStatus();
    if (gameStatus === Game.Status.GAME_WIN) {
      this.#terminateJobs();
      const winner = this.#game.getState().winner;
      if (winner == 0) {
        this.#gameWin();
      } else {
        this.#gameOver();
      }
      GUI.#consoleInfo(`Player ${winner} won the game`);
    } else {
      console.assert(gameStatus === Game.Status.PLAYING); // sanity check
      this.#refresh();
    }
  }

  /* --- METHOD: #gameOver --- */
  #gameOver() {
    this.#setStatus(GUI.Status.GAME_OVER);
    GUI.#playAudio(this.#HTML.gameoverAudio);
  }

  /* --- METHOD: #gameWin --- */
  #gameWin() {
    this.#setStatus(GUI.Status.GAME_WIN);
    GUI.#playAudio(this.#HTML.gamewinAudio);
  }

  /// AUXILIARY

  /* --- METHOD: #distance --- */
  #distance(pos1, pos2) {
    // Manhattan distance
    let distX = Math.abs(pos1.x - pos2.x);
    let distY = Math.abs(pos1.y - pos2.y);
    if (Game.CONFIGURATION.cyclic) {
      const [rows, columns] = Game.getGridDimensions();
      distX = Math.min(distX, columns - distX);
      distY = Math.min(distY, rows - distY);
    }
    return distX + distY;
  }

  /* --- METHOD: #doChase --- */
  #doChase(index, positions) {
    // flip a weighted coin
    const numPlayers = this.#game.getNumPlayers();
    const playerPos = positions[index];
    const runnerPos = positions[(index + 1) % numPlayers];
    const chaserPos = positions[(index + numPlayers - 1) % numPlayers];
    const distToRunner = this.#distance(playerPos, runnerPos);
    const distToChaser = this.#distance(playerPos, chaserPos);
    // NOTE: -1 so there is 0 probaility of chasing when player is one slot
    // away from its chaser.
    const pChase = (distToChaser - 1) / (distToChaser + distToRunner);
    return Random.getRandomUniform(0, 1) < pChase;
  }

  /* --- METHOD: #getMoveDirection --- */
  // TODO: This method is too long.
  #getMoveDirection(index, positions) {
    // chaser -> player -> runner
    const chase = this.#doChase(index, positions);
    const numPlayers = this.#game.getNumPlayers();
    const rivalIndex =
      (chase ? index + 1 : index + numPlayers - 1) % numPlayers;
    const rivalPos = positions[rivalIndex];

    // choose axis to move along
    const playerPos = positions[index];
    let axis = null;
    if (playerPos.x === rivalPos.x) {
      axis = 1; // y-axiz
    } else if (playerPos.y === rivalPos.y) {
      axis = 0; // x-axis
    } else {
      // flip a coin to decide axis
      axis = Random.flip();
    }

    // determine direction (initially as if chasing)
    const [rows, columns] = Game.getGridDimensions();
    let direction = null;
    if (axis === 0) {
      direction = playerPos.x < rivalPos.x ? Direction.RIGHT : Direction.LEFT;
      if (Game.CONFIGURATION.cyclic) {
        const dist = Math.abs(playerPos.x - rivalPos.x);
        if (dist > Math.floor(columns / 2)) {
          direction = flipDirection(direction);
        }
      }
    } else {
      // axis === 1
      direction = playerPos.y < rivalPos.y ? Direction.DOWN : Direction.UP;
      if (Game.CONFIGURATION.cyclic) {
        const dist = Math.abs(playerPos.y - rivalPos.y);
        if (dist > Math.floor(rows / 2)) {
          direction = flipDirection(direction);
        }
      }
    }

    return chase ? direction : flipDirection(direction);
  }

  /* --- METHOD: #move --- */
  #move() {
    // clone to base moves on original game state
    const gstate = this.#game.getState();
    for (let index = 1; index < this.#game.getNumPlayers(); index++) {
      const direction = this.#getMoveDirection(index, gstate.positions);
      this.#game.move(index, direction);
    }
  }

  /* --- METHOD: #consoleInfo --- */
  static #consoleInfo(message) {
    if (GUI.CONFIGURATION.info) {
      // const now = new Date(Date.now()).toLocaleTimeString();
      // const now = new Date(Date.now()).toUTCString();
      const now = new Date(Date.now()).toISOString();
      console.info(`INFO: [${now}] ${message}`);
    }
  }

  /* --- METHOD: #playAudio --- */
  static #playAudio(audio) {
    if (GUI.CONFIGURATION.audio) {
      audio.play();
    }
  }

  /// PLAYING - USER ACTIONS
  // ... PUT HERE METHODS TO HANDLE USER ACTIONS ...
};
