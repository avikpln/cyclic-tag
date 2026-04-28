/* --- METHOD: EXPORTS --- */
export { Canvas as default };

/*
 * CLASS: Canvas
 *****************************************************************************/
const Canvas = class {
  #context = null;

  /* --- C'TOR: constructor --- */
  constructor(canvas) {
    if (!(canvas instanceof HTMLElement) || canvas.tagName !== "CANVAS") {
      throw TypeError(`input ${canvas} is not an HTML canvas element`);
    }
    // if (!canvas.getContext || !(this.#context = canvas.getContext("2d"))) {
    //   throw Error(`failed to load canvas context`);
    // }
    this.#context = canvas.getContext("2d");
    // this.#context.lineWidth = 1;
  }

  /* --- METHOD: getSize --- */
  getSize() {
    return [this.#context.canvas.width, this.#context.canvas.height];
  }

  /* --- METHOD: clear --- */
  clear() {
    const canvas = this.#context.canvas;
    this.#context.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* --- METHOD: #stroke --- */
  #stroke(strokeStyle) {
    this.#context.strokeStyle = strokeStyle;
    this.#context.stroke();
  }

  /* --- METHOD: #fill --- */
  #fill(fillStyle) {
    this.#context.fillStyle = fillStyle;
    this.#context.fill();
  }

  /// GLOBALS

  /* --- METHOD: setLineWidth --- */
  setLineWidth(lineWidth) {
    // NOTE: Argument validation is delegated to context.
    this.#context.lineWidth = lineWidth;
  }

  /* --- METHOD: setGlobalAlpha --- */
  setGlobalAlpha(globalAlpha) {
    this.#context.globalAlpha = globalAlpha;
  }

  /* --- METHOD: setCompositeMethod --- */
  setCompositeMethod(method) {
    // source-over, source-in, source-out, source-atop, lighter, xor,
    // destination-over, destination-in, destination-out, destination-atop,
    // darker, copy
    this.#context.globalCompositeOperation = method;
  }

  /// LINES

  /* --- METHOD: strokeLine --- */
  strokeLine(x1, y1, x2, y2, strokeStyle) {
    const ctx = this.#context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    this.#stroke();
  }

  /// RECTANGLES

  /* --- METHOD: strokeRect --- */
  strokeRect(x, y, width, height, strokeStyle) {
    this.#context.strokeStyle = strokeStyle;
    this.#context.strokeRect(x, y, width, height);
  }

  /* --- METHOD: fillRect --- */
  fillRect(x, y, width, height, fillStyle) {
    this.#context.fillStyle = fillStyle;
    this.#context.fillRect(x, y, width, height);
  }

  /* --- METHOD: fillStrokeRect --- */
  fillStrokeRect(x, y, width, height, fillStyle, strokeStyle) {
    this.fillRect(x, y, width, height, fillStyle);
    this.strokeRect(x, y, width, height, strokeStyle);
  }

  /* --- METHOD: fillCanvas --- */
  fillCanvas(fillStyle) {
    const [width, height] = this.getSize();
    this.fillRect(0, 0, width, height, fillStyle);
  }

  /// POLYLINES/POLYGONS

  /* --- METHOD: #setPolylinePath --- */
  #setPolylinePath(points, close) {
    // TODO: Validate points is an array of points.
    const ctx = this.#context;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    if (close) {
      ctx.closePath();
    }
  }

  /* --- METHOD: strokePolyline --- */
  strokePolyline(points, strokeStyle) {
    this.#setPolylinePath(points, false);
    this.#stroke(strokeStyle);
  }

  /* --- METHOD: strokePolygon --- */
  strokePolygon(points, strokeStyle) {
    this.#setPolylinePath(points, true);
    this.#stroke(strokeStyle);
  }

  /* --- METHOD: fillPolygon --- */
  fillPolygon(points, fillStyle) {
    this.#setPolylinePath(points, true);
    this.#fill(fillStyle);
  }

  /* --- METHOD: fillStrokePolyline --- */
  fillStrokePolyline(points, fillStyle, strokeStyle, close = false) {
    this.fillPolygon(points, fillStyle);
    this.strokePolyline(points, strokeStyle, close);
  }

  /// CIRCLES

  /* --- METHOD: strokeCircle --- */
  strokeCircle(x, y, radius, strokeStyle) {
    this.strokeArc(x, y, radius, 0, 2 * Math.PI, strokeStyle);
  }

  /* --- METHOD: fillCircle --- */
  fillCircle(x, y, radius, fillStyle) {
    this.fillArc(x, y, radius, 0, 2 * Math.PI, fillStyle);
  }

  /* --- METHOD: fillStrokeCircle --- */
  fillStrokeCircle(x, y, radius, fillStyle, strokeStyle) {
    this.fillCircle(x, y, radius, fillStyle);
    this.strokeCircle(x, y, radius, strokeStyle);
  }

  /// ARCS

  /* --- METHOD: #setArcPath --- */
  #setArcPath(x, y, radius, sAngle, eAngle, close) {
    const ctx = this.#context;
    ctx.beginPath();
    ctx.arc(x, y, radius, sAngle, eAngle);
    if (close) {
      ctx.closePath();
    }
  }

  /* --- METHOD: strokeArc --- */
  strokeArc(x, y, radius, sAngle, eAngle, strokeStyle, close = false) {
    this.#setArcPath(x, y, radius, sAngle, eAngle, strokeStyle, close);
    this.#stroke(strokeStyle);
  }

  /* --- METHOD: fillArc --- */
  fillArc(x, y, radius, sAngle, eAngle, fillStyle) {
    this.#setArcPath(x, y, radius, sAngle, eAngle, true);
    this.#fill(fillStyle);
  }

  /* --- METHOD: fillStrokeArc --- */
  fillStrokeArc(
    x,
    y,
    radius,
    sAngle,
    eAngle,
    fillStyle,
    strokeStyle,
    close = false
  ) {
    this.fillArc(x, y, radius, sAngle, eAngle, fillStyle);
    this.strokeArc(x, y, radius, sAngle, eAngle, strokeStyle, close);
  }

  /// BEZIER CURVES

  /* --- METHOD: #setBezierCurvePath --- */
  #setBezierCurvePath(sp, cp1, cp2, ep, close) {
    // TODO: Validate that sp, cp1, cp2, ep, are points.
    const ctx = this.#context;
    ctx.beginPath();
    ctx.moveTo(sp[0], sp[1]);
    ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], ep[0], ep[1]);
    if (close) {
      ctx.closePath();
    }
  }

  /* --- METHOD: strokeBezierCurve --- */
  strokeBezierCurve(sp, cp1, cp2, ep, strokeStyle, close = false) {
    this.#setBezierCurvePath(sp, cp1, cp2, ep, close);
    this.#stroke(strokeStyle);
  }

  /* --- METHOD: fillBezierCurve --- */
  fillBezierCurve(sp, cp1, cp2, ep, fillStyle) {
    this.#setBezierCurvePath(sp, cp1, cp2, ep, true);
    this.#fill(fillStyle);
  }

  /* --- METHOD: fillStrokeBezierCurve --- */
  fillStrokeBezierCurve(
    sp,
    cp1,
    cp2,
    ep,
    fillStyle,
    strokeStyle,
    close = false
  ) {
    this.fillBezierCurve(sp, cp1, cp2, ep, fillStyle);
    this.strokeBezierCurve(sp, cp1, cp2, ep, strokeStyle, close);
  }

  /// QUADRATIC CURVES

  /* --- METHOD: #setQuadraticCurvePath --- */
  #setQuadraticCurvePath(sp, cp1, cp2, ep, close) {
    // TODO: Validate that sp, cp1, cp2, ep, are points.
    const ctx = this.#context;
    ctx.beginPath();
    ctx.moveTo(sp[0], sp[1]);
    ctx.quadraticCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], ep[0], ep[1]);
    if (close) {
      ctx.closePath();
    }
  }

  /* --- METHOD: strokeQuadraticCurve --- */
  strokeQuadraticCurve(sp, cp1, cp2, ep, strokeStyle, close = false) {
    this.#setQuadraticCurvePath(sp, cp1, cp2, ep, close);
    this.#stroke(strokeStyle);
  }

  /* --- METHOD: fillQuadraticCurve --- */
  fillQuadraticCurve(sp, cp1, cp2, ep, fillStyle) {
    this.#setQuadraticCurvePath(sp, cp1, cp2, ep, true);
    this.#fill(fillStyle);
  }

  /* --- METHOD: fillStrokeQuadraticCurve --- */
  fillStrokeQuadraticCurve(
    sp,
    cp1,
    cp2,
    ep,
    fillStyle,
    strokeStyle,
    close = false
  ) {
    this.fillQuadraticCurve(sp, cp1, cp2, ep, fillStyle);
    this.strokeQuadraticCurve(sp, cp1, cp2, ep, strokeStyle, close);
  }

  /// TEXT

  /* --- METHOD: measureText --- */
  measureText(text, font) {
    const ctx = this.#context;
    ctx.save();
    ctx.font = font;
    const result = ctx.measureText(text);
    ctx.restore();
    return result;
  }

  /* --- METHOD: strokeText --- */
  strokeText(text, x, y, font, strokeStyle) {
    const ctx = this.#context;
    ctx.font = font;
    ctx.strokeStyle = strokeStyle;
    ctx.strokeText(text, x, y);
  }

  /* --- METHOD: fillText --- */
  fillText(text, x, y, font, fillStyle) {
    const ctx = this.#context;
    ctx.font = font;
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
  }

  /* --- METHOD: fillStrokeText --- */
  fillStrokeText(text, x, y, font, fillStyle, strokeStyle) {
    this.fillText(text, x, y, font, fillStyle);
    this.strokeText(text, x, y, font, strokeStyle);
  }

  /// IMAGE

  /* -- drawImage --- */
  drawImage(imageSource, x, y, width, height) {
    this.#context.drawImage(imageSource, x, y, width, height);
  }

  /* -- backgroundImage --- */
  backgroundImage(imageSource) {
    const [width, height] = this.getSize();
    this.#context.drawImage(imageSource, 0, 0, width, height);
  }

  /// GRADIENT

  /* -- getLinearGradient --- */
  getLinearGradient(x0, y0, x1, y1, stops) {
    // TODO: Validate stops is an array of stops.
    const linearGrad = this.#context.createLinearGradient(x0, y0, x1, y1);
    for (const stop of stops) {
      linearGrad.addColorStop(stop[0], stop[1]);
    }
    return linearGrad;
  }

  /* -- getRadialGradient --- */
  getRadialGradient(x0, y0, r0, x1, y1, r1, stops) {
    // TODO: Validate stops is an array of stops.
    const radGrad = this.#context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for (const stop of stops) {
      radGrad.addColorStop(stop[0], stop[1]);
    }
    return radGrad;
  }
};
