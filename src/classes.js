import audio from './audio.js';

class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    context,
    sprites,
    animate = false,
    rotation = 0,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.context = context;
    this.image.src = image.src;
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.rotation = rotation;
  }

  draw(context) {
    context.save();
    context.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    context.rotate(this.rotation);
    context.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2,
    );
    context.globalAlpha = this.opacity;
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
    context.restore();

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

class Monster extends Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    context,
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
  }) {
    super({
      position,
      image,
      frames,
      context,
      sprites,
      animate,
      rotation,
    });
    this.health = 100;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }

  faint() {
    document.querySelector('#dialogueBox').innerHTML = `${this.name} fainted!`;
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    audio.battle.stop();
    audio.victory.play();
  }

  attack({ attack, recipient, renderedSprites }) { // Анимации атаки и получения урона
    document.querySelector('#dialogueBox').style.display = 'block';
    document.querySelector('#dialogueBox').innerHTML = `${this.name} used ${attack.name}`;

    let healthBar = '#enemyHealthBar';
    if (this.isEnemy) {
      healthBar = '#playerHealthBar';
    }

    let rotation = 1;
    if (this.isEnemy) {
      rotation = -2.2;
    }

    recipient.health -= attack.damage;

    switch (attack.name) {
      case 'Fireball':
        audio.initFireball.play();
        const fireballImage = new Image();
        fireballImage.src = './assets/Images/fireball.png';
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          rotation,
        });

        renderedSprites.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Враг получает удар
            audio.fireballHit.play();
            gsap.to(healthBar, {
              width: `${recipient.health}%`,
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });

        break;
      case 'Tackle':
        const timeline = gsap.timeline();

        let movementDistance = 20;
        if (this.isEnemy) {
          movementDistance = -20;
        }

        timeline.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              // Враг получает удар
              audio.tackleHit.play();
              gsap.to(healthBar, {
                width: `${recipient.health}%`,
              });

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x,
          });
        break;
      default:
        console.log('Что-то не так');
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
    this.context.fillStyle = 'rgba(255, 0, 0, 0.0';
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export { Sprite, Boundary, Monster };
