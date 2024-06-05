class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    context,
    sprites,
    animate = false,
  }) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.context = context;

    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.animate = animate;
    this.sprites = sprites;
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height,
    );

    if (this.animate) {
      if (this.frames.max > 1) {
        this.frames.elapsed += 1;
      }
      // Нужно проверить ребятам скорость анимации.
      if (this.frames.elapsed % this.frames.hold === 0) {
        if (this.frames.val < this.frames.max - 1) { // У меня почему-то в три раза больше значение
          this.frames.val += 1; // потребовалось, чем в уроке. Странно
        } else {
          this.frames.val = 0;
        }
      }
    }
  }
}

// 48, так как текущая карта состоит из тайлов размером 12 на 12 и увеличенные в 4 раза при экспорте
class Boundary {
  static width = 48;

  static height = 48;

  constructor({ position, context }) {
    this.position = position;
    this.width = 48;
    this.height = 48;
    this.context = context;
  }

  draw() {
    this.context.fillStyle = 'rgba(255, 0, 0, 0.5';
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export { Sprite, Boundary };
