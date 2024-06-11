/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */

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
    scaleWidth = 1,
    scaleHeight = 1,
    flip = false,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, value: 0, elapsed: 0 };
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
    this.scaleWidth = scaleWidth;
    this.scaleHeight = scaleHeight;
    this.flip = flip;
  }

  draw(context) {
    context.save();
    context.globalAlpha = this.opacity;
    const centerX = this.position.x + this.width * this.scaleWidth / 2;
    const centerY = this.position.y + this.height * this.scaleHeight / 2;
    context.translate(centerX, centerY);
    context.rotate(this.rotation);
    context.translate(-centerX, -centerY);

    if (this.flip) {
      context.translate(centerX, centerY);
      context.scale(-1, 1);
      context.translate(-centerX, -centerY);
    }

    const scaledWidth = this.width * this.scaleWidth;
    const scaledHeight = this.height * this.scaleHeight;
    const offsetY = (scaledHeight - this.height) / 2; // Определяем смещение по вертикали
    context.drawImage(
      this.image,
      this.frames.value * this.width,
      0,
      this.width,
      this.height,
      this.position.x,
      // Используем смещение по вертикали для корректного отображения спрайта
      this.position.y - offsetY,
      scaledWidth,
      scaledHeight,
    );

    context.restore();

    if (this.animate) {
      this.frames.elapsed += 1;
      if (this.frames.elapsed % this.frames.hold === 0) {
        this.frames.value = (this.frames.value + 1) % this.frames.max;
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
    scaleWidth = 1,
    scaleHeight = 1,
    flip = true, // значение по умолчанию true
  }) {
    super({
      position,
      image,
      frames,
      context,
      sprites,
      animate,
      rotation,
      scaleWidth,
      scaleHeight,
      flip: !isEnemy && flip, // flip только если не враг
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
  }

  attack({ attack, recipient, renderedSprites }) {
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

    if (recipient.health < 0) recipient.health = 0;

    switch (attack.name) {
      case 'Fireball': {
        audio.initFireball.play(); // проигрывание звука при касте
        const fireballImage = new Image(); // создание спрайта для огненного шара
        fireballImage.src = './assets/Images/fireball.png';
        const fireball = new Sprite({
          position: {
            x: this.position.x + 40, // точка появления огненного шара
            y: this.position.y + 40, // снаряд игрока косо летит в цель? - этот параметр фиксить
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

        gsap.to(fireball.position, { // выбор точки полёта проджект тайла (враг)
          x: recipient.position.x + 40, // снаряд игрока косо летит в цель? - этот параметр фиксить
          y: recipient.position.y + 40,
          onComplete: () => {
            // Враг получает удар
            audio.fireballHit.play(); // проигрывание звука при попадании
            gsap.to(healthBar, {
              width: `${recipient.health}%`, // уменьшение здоровья
            });

            gsap.to(recipient.position, { // анимация нанесения удара обидчиком
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, { // анимация получения удара жертвой
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });

        break;
      }
      case 'Waterball': {
        if (this.isEnemy) {
          rotation = 3;
        } else {
          rotation = 0;
        }

        audio.initFireball.play(); // проигрывание звука при касте

        const timeline = gsap.timeline({
          onComplete: () => {
            const waterballImage = new Image(); // создание спрайта для водного шара
            waterballImage.src = './assets/newImages/somalma/waterball.png';
            const waterball = new Sprite({
              position: {
                x: this.position.x + (this.isEnemy ? 0 : 60),
                y: this.position.y + (this.isEnemy ? 0 : 60),
              },
              image: waterballImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 2,
              scaleWidth: 2,
            });

            renderedSprites.splice(1, 0, waterball);

            gsap.to(waterball.position, { // выбор точки полёта проджектайла (враг)
              x: recipient.position.x + (this.isEnemy ? 0 : 40),
              y: recipient.position.y + (this.isEnemy ? 0 : 40),
              onComplete: () => {
                // Враг получает удар
                audio.fireballHit.play(); // проигрывание звука при попадании
                gsap.to(healthBar, {
                  width: `${recipient.health}%`, // уменьшение здоровья
                });

                gsap.to(recipient.position, { // анимация нанесения удара обидчиком
                  x: recipient.position.x + 10,
                  yoyo: true,
                  repeat: 5,
                  duration: 0.08,
                });

                gsap.to(recipient, { // анимация получения удара жертвой
                  opacity: 0,
                  repeat: 5,
                  yoyo: true,
                  duration: 0.08,
                });
                renderedSprites.splice(1, 1);
              },
            });
          },
        });

        // Анимация увеличения высоты монстра
        timeline.to(this, {
          scaleHeight: 1.5,
          duration: 0.3,
        });

        // Анимация уменьшения высоты монстра
        timeline.to(this, {
          scaleHeight: 1,
          duration: 0.3,
        });

        break;
      }
      case 'Coconut': {
        audio.initCoconut.play(); // проигрывание звука при касте

        // Анимация тряски монстра
        const timeline = gsap.timeline({
          onComplete: () => {
            // Создаем спрайт кокоса после завершения тряски
            const coconutImage = new Image(); // создание спрайта для кокосика
            coconutImage.src = './assets/newImages/somalma/coconut.png';
            const coconut = new Sprite({
              position: {
                x: this.position.x + 40, // точка появления кокоса
                y: this.position.y + 40,
              },
              image: coconutImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
            });

            renderedSprites.splice(1, 0, coconut);

            gsap.to(coconut.position, { // выбор точки полёта кокоса
              x: recipient.position.x + 40,
              y: recipient.position.y + 40,
              onComplete: () => {
                // Враг получает удар
                audio.coconutHit.play(); // проигрывание звука при попадании
                gsap.to(healthBar, {
                  width: `${recipient.health}%`, // уменьшение здоровья
                });

                gsap.to(recipient.position, { // анимация нанесения удара обидчиком
                  x: recipient.position.x + 10,
                  yoyo: true,
                  repeat: 5,
                  duration: 0.08,
                });

                gsap.to(recipient, { // анимация получения удара жертвой
                  opacity: 0,
                  repeat: 5,
                  yoyo: true,
                  duration: 0.08,
                });
                renderedSprites.splice(1, 1);
              },
            });
          },
        });

        timeline.to(this.position, {
          x: this.position.x + 50,
          y: this.position.y + 50,
          repeat: 5,
          yoyo: true,
          duration: 0.08,
        });

        break;
      }
      case 'poisonous_Spit': {
        const timeline = gsap.timeline({
          onComplete: () => {
            audio.initFireball.play(); // проигрывание звука при касте
            // Анимация прыжка завершена, запускаем анимацию плевка
            const poisonballImage = new Image(); // создание спрайта для огненного шара
            poisonballImage.src = './assets/newImages/jabba script/acid spit.png';
            const poisonball = new Sprite({
              position: {
                x: this.position.x + (this.isEnemy ? 30 : 30),
                y: this.position.y + (this.isEnemy ? -30 : 30),
              },
              image: poisonballImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 2,
              scaleWidth: 2,
            });

            renderedSprites.splice(1, 0, poisonball);

            gsap.to(poisonball.position, {
              x: recipient.position.x + (this.isEnemy ? 30 : 20),
              y: recipient.position.y + (this.isEnemy ? 30 : 20),
              onComplete: () => {
                // Враг получает удар
                audio.fireballHit.play(); // проигрывание звука при попадании
                gsap.to(healthBar, {
                  width: `${recipient.health}%`, // уменьшение здоровья
                });

                gsap.to(recipient.position, { // анимация нанесения удара обидчиком
                  x: recipient.position.x + 10,
                  yoyo: true,
                  repeat: 5,
                  duration: 0.08,
                });

                gsap.to(recipient, { // анимация получения удара жертвой
                  opacity: 0,
                  repeat: 5,
                  yoyo: true,
                  duration: 0.08,
                });
                renderedSprites.splice(1, 1);
              },
            });
          },
        });
        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }
        timeline.to(this.position, {
          x: this.position.x - movementDistance * 6,
          y: this.position.y + movementDistance * 2,
          duration: 0.4,
        });
        if (this.isEnemy) {
          timeline.to(this.position, {
            x: this.position.x + 0,
            y: this.position.y + movementDistance * 2,
            duration: 0.2,
            ease: 'Power2.easeOut',
          });
        } else {
          timeline.to(this.position, {
            x: this.position.x + 0,
            y: this.position.y - movementDistance * 2,
            duration: 0.2,
            ease: 'Power2.easeOut',
          });
        }
        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          ease: 'Bounce.easeOut',
        });

        break;
      }
      case 'java_Slash': {
        const timeline = gsap.timeline();

        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }

        if (this.isEnemy) {
          rotation = 5;
        } else {
          rotation = 0;
        }

        // Жабка берет разгон
        timeline.to(this.position, {
          x: this.position.x - movementDistance * 6,
          y: this.position.y + movementDistance * 2,
          duration: 0.5,
        });

        // Жабка бежит на стартовую позицию
        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          onComplete: () => {
            audio.tackleHit.play(); // проигрывание звука при попадании
            gsap.to(healthBar, {
              width: `${recipient.health}%`, // уменьшение здоровья
            });
            // Создаем спрайт удара
            const javaSlashImage = new Image();
            javaSlashImage.src = './assets/newImages/jabba script/java slash.png';
            const javaSlash = new Sprite({
              position: {
                x: this.position.x,
                y: this.position.y,
              },
              image: javaSlashImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 5,
              scaleWidth: 5,
            });

            // Добавляем спрайт удара
            renderedSprites.push(javaSlash);

            // Анимация удара
            gsap.to(javaSlash.position, {
              x: this.position.x + (this.isEnemy ? -0 : 0),
              y: this.position.y - (this.isEnemy ? -0 : 0),
              duration: 0.3,
              onComplete: () => {
                renderedSprites.pop(); // Удаляем спрайт удара после завершения
              },
            });
          },
        });

        break;
      }
      case 'Tackle': {
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
      }
      default:
        console.log('Что-то не так');
    }
  }
}

// класс для плиточек коллизий
// 48, так как карта состоит из тайлов размером 12 на 12 и увеличенные в 4 раза при экспорте
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
    this.context.fillStyle = 'rgba(255, 0, 0, 0.5'; // цвет границ. Полезно для отладки
    this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export { Sprite, Boundary, Monster };

/*

Очень классная реализация анимации вылетающего на бегу снаряда

case 'java_Slash': {
  const timeline = gsap.timeline({
    onComplete: () => {
      // Враг получает удар
      audio.tackleHit.play(); // проигрывание звука при попадании
      gsap.to(healthBar, {
        width: `${recipient.health}%`, // уменьшение здоровья
      });

      gsap.to(recipient.position, { // анимация нанесения удара обидчиком
        x: recipient.position.x + 10,
        yoyo: true,
        repeat: 5,
        duration: 0.08,
      });

      gsap.to(recipient, { // анимация получения удара жертвой
        opacity: 0,
        repeat: 5,
        yoyo: true,
        duration: 0.08,
      });
    },
  });

  let movementDistance = 80;
  if (this.isEnemy) {
    movementDistance = -80;
  }

  // Жабка берет разгон
  timeline.to(this.position, {
    x: this.position.x - movementDistance * 6,
    y: this.position.y + movementDistance * 2,
    duration: 0.5,
  });

  // Жабка бежит на стартовую позицию и наносит удар
  timeline.to(this.position, {
    x: this.position.x,
    y: this.position.y,
    duration: 0.2,
    onStart: () => {
      // Создаем спрайт удара
      const javaSlashImage = new Image();
      javaSlashImage.src = './assets/newImages/jabba script/java slash.png';
      const javaSlash = new Sprite({
        position: {
          x: this.position.x,
          y: this.position.y,
        },
        image: javaSlashImage,
        frames: {
          max: 4,
          hold: 10,
        },
        animate: true,
        rotation,
        scaleHeight: 5,
        scaleWidth: 5,
      });

      // Добавляем спрайт удара
      renderedSprites.splice(1, 0, javaSlash);

      // Анимация удара
      gsap.to(javaSlash.position, {
        x: recipient.position.x,
        y: recipient.position.y,
        duration: 0.3,
        onComplete: () => {
          renderedSprites.splice(1, 1); // Удаляем спрайт удара после завершения
        },
      });
    },
  });

  break;
}
*/
