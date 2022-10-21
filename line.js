class Line {
  constructor(core) {
    this.core = core;
    this.isLineCompleted = false;
    this.temporaryMouseCoordinates = {};

    this.points = [];
  }

  slope() {
    let slope;
    if (
      (this.isLineCompleted
        ? this.points[1].x
        : this.temporaryMouseCoordinates.x) !== this.points[0].x
    )
      slope =
        ((this.isLineCompleted
          ? this.points[1].y
          : this.temporaryMouseCoordinates.y) -
          this.points[0].y) /
        ((this.isLineCompleted
          ? this.points[1].x
          : this.temporaryMouseCoordinates.x) -
          this.points[0].x);
    else slope = false;

    return slope;
  }

  onLine(x) {
    if (this.isLineCompleted)
      return this.points[0].x <= x && x <= this.points[1].x;
    else
      return (
          (this.points[0].x <= x && x <= this.temporaryMouseCoordinates.x) ||
          (x <= this.points[0].x && this.temporaryMouseCoordinates.x <= x)
      );
  }

  intY() {
    if (
      this.points[0].x ===
      (this.isLineCompleted
        ? this.points[1].x
        : this.temporaryMouseCoordinates.x)
    )
      return this.points[0].x === 0 ? 0 : false;
    if (
      this.points[0].y ===
      (this.isLineCompleted
        ? this.points[1].y
        : this.temporaryMouseCoordinates.y)
    )
      return this.points[0].y;
    return this.points[0].y - this.slope() * this.points[0].x;
  }

  onLineCollide(line) {
    if (this.slope() === line.slope()) return false;
    const intersect = {};
    intersect.x = (line.intY() - this.intY()) / (this.slope() - line.slope());
    intersect.y = this.slope() * intersect.x + this.intY();
    return intersect;
  }

  checkCollide(context) {
    for (let j = 0; j < this.core.lines.length && this.core.lines[j] !== this; j++) {
      let line = this.core.lines[j];
      if (line instanceof Line) {
        let xPoint = this.onLineCollide(line);
        if (this.onLine(xPoint.x) && line.onLine(xPoint.x)) {
          this.drawDot(context, "Red", xPoint.x, xPoint.y, 3);
        }
      }
    }
  }

  draw(context) {
    switch (this.points.length) {
      //Проведення лінії
      case 1:
        if (this.core.mouseCoordinates) {
          this.drawLine(
            context,
            "Black",
            this.points[0].x,
            this.points[0].y,
            this.core.mouseCoordinates.x,
            this.core.mouseCoordinates.y
          );
          if (!this.isLineCompleted) {
            this.checkCollide(context);
          }
        }
        break;
      //Лінія залишається на полотні
      case 2:
        context.strokeStyle = "Black";
        this.drawLine(
          context,
          "Black",
          this.points[0].x,
          this.points[0].y,
          this.points[1].x,
          this.points[1].y
        );
        this.checkCollide(context);
        break;
    }
  }

  update() {
    this.temporaryMouseCoordinates = this.core.mouseCoordinates;
    if (this.core.click && this.points.length < 2) {
      if (this.points.length === 0 || this.core.click.x > this.points[0].x)
        this.points.push(this.core.click);
      else this.points.splice(0, 0, this.core.click);

      if (this.points.length === 2) {
        this.core.addLine(new Line(this.core));
        this.isLineCompleted = true;
        this.core.isLineDrawing = false;
      }

      this.core.click = null;
    }
  }

  drawLine(context, color, moveToX, moveToY, lineToX, lineToY) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(moveToX, moveToY);
    context.lineTo(lineToX, lineToY);
    context.stroke();
    context.closePath();
  }
  //Створення точки на лініях
  drawDot(context, color, pointX, pointY, size) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(
      Math.round(pointX),
      Math.round(pointY),
      size,
      0 * Math.PI,
      2 * Math.PI
    );
    context.fill();
    context.closePath();
  }
  //Стирає з красивою анімацією
  clear() {
    if (!this.points.length > 0) return;

    let decreaseForX = 0;
    let decreaseForY = 0;
    let increaseForX = 0;
    let increaseForY = 0;
    const runForMilliseconds = 3000;
    const runEveryMilliseconds = 50;
    const divider = runForMilliseconds / runEveryMilliseconds;
    const middle = {
      x: (this.points[0].x + this.points[1].x) / 2,
      y: (this.points[0].y + this.points[1].y) / 2,
    };

    if (this.points[1].x > middle.x || this.points[1].y > middle.y) {
      decreaseForX = (this.points[1].x - middle.x) / divider;
      decreaseForY = (this.points[1].y - middle.y) / divider;
    }
    if (this.points[0].x < middle.x || this.points[0].y < middle.y) {
      increaseForX = (this.points[0].x - middle.x) / divider;
      increaseForY = (this.points[0].y - middle.y) / divider;
    }

    var interval = setInterval(() => {
      this.points[0].x -= increaseForX;
      this.points[0].y -= increaseForY;
      this.points[1].x -= decreaseForX;
      this.points[1].y -= decreaseForY;
      this.core.update();
    }, runEveryMilliseconds);

    setTimeout(() => {
      clearInterval(interval);
    }, runForMilliseconds);
  }
}
