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
    const centerX = this.position.x + (this.width * this.scaleWidth) / 2;
    const centerY = this.position.y + (this.height * this.scaleHeight) / 2;
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

    let rotation = 0;

    recipient.health -= attack.damage;

    if (recipient.health < 0) recipient.health = 0;

    switch (attack.name) {
      case 'Waterball': {
        rotation = this.isEnemy ? 3 : 0;

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
        audio.tackleHit.play(); // Проигрывание звука при атаке
        gsap.to(healthBar, {
          width: `${recipient.health}%`, // Уменьшение здоровья
        });

        // Анимация подпрыгивания
        gsap.to(this.position, {
          y: this.position.y - 200, // Подпрыгивание
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Создаем спрайт javaSlash
            const javaSlashImage = new Image();
            javaSlashImage.src = './assets/newImages/jabba script/java slash.png';
            const javaSlash = new Sprite({
              position: {
                x: recipient.position.x - 70, // Увеличение смещения влево
                y: recipient.position.y + 20, // Позиция Y врага с учетом смещения вниз
              },
              image: javaSlashImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              scaleHeight: 5,
              scaleWidth: 5,
            });

            // Добавляем спрайт javaSlash
            renderedSprites.push(javaSlash);

            // Удаляем спрайт javaSlash после завершения анимации удара
            setTimeout(() => {
              renderedSprites.pop();
            }, 300); // Продолжительность анимации удара
          },
        });

        break;
      }

      case 'FireBolt': {
        rotation = this.isEnemy ? 3 : 0;

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

            // Анимация возвращения на исходную позицию
            gsap.to(this.position, {
              x: initialPosition.x,
              y: initialPosition.y,
              duration: 0.5,
            });
          },
        });

        let distance = 80;
        if (this.isEnemy) {
          distance = -80;
        }

        // Анимация полёта (постарался чёт сделать))
        timeline.to(this.position, {
          motionPath: {
            path: [
              { x: this.position.x, y: this.position.y },
              // Дополнительная точка для дуги влево
              { x: this.position.x - distance / 2, y: this.position.y - distance / 4 },
              { x: this.position.x - distance, y: this.position.y },
              // Дополнительная точка для дуги вправо
              { x: this.position.x - distance / 2, y: this.position.y + distance / 4 },
              { x: this.position.x, y: this.position.y },
            ],
            curviness: 1,
            autoRotate: true,
          },
          duration: 1, // Длительность анимации
          ease: 'power1.inOut',
        });

        // бежит на стартовую позицию и наносит удар
        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          onStart: () => {
            // Создаем спрайт удара
            const FireBoltImage = new Image();
            FireBoltImage.src = './assets/newImages/kelpish/fire bolt.png';
            const FireBolt = new Sprite({
              position: {
                x: this.position.x,
                y: this.position.y + (this.isEnemy ? 100 : 100),
              },
              image: FireBoltImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation: 0,
              scaleHeight: 2,
              scaleWidth: 2,
            });

            // Добавляем спрайт удара
            renderedSprites.splice(1, 0, FireBolt);

            // Анимация удара
            gsap.to(FireBolt.position, {
              x: recipient.position.x,
              y: recipient.position.y + 100,
              duration: 0.3,
              onComplete: () => {
                renderedSprites.splice(1, 1);
              },
            });
          },
        });

        break;
      }
      case 'IcyArrow': {
        rotation = this.isEnemy ? 3 : 0;

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

        let distance = 80;
        if (this.isEnemy) {
          distance = -80;
        }

        // Анимация полёта
        timeline.to(this.position, {
          motionPath: {
            path: [
              { x: this.position.x, y: this.position.y },
              { x: this.position.x + distance / 2, y: this.position.y - distance / 4 },
              { x: this.position.x + distance, y: this.position.y },
              { x: this.position.x + distance / 2, y: this.position.y + distance / 4 },
              { x: this.position.x, y: this.position.y },
            ],
            curviness: 1,
            autoRotate: true,
          },
          duration: 1, // Длительность анимации
          ease: 'power1.inOut',
        });

        // бежит на стартовую позицию и наносит удар
        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          onStart: () => {
            // Создаем спрайт удара
            const IcyArrowImage = new Image();
            IcyArrowImage.src = './assets/newImages/kelpish/icy arrow.png';
            const IcyArrow = new Sprite({
              position: {
                x: this.position.x + (this.isEnemy ? 100 : 40),
                y: this.position.y + (this.isEnemy ? 80 : 100),
              },
              image: IcyArrowImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation: 0,
              scaleHeight: 1,
              scaleWidth: 1,
            });

            // Добавляем спрайт удара
            renderedSprites.splice(1, 0, IcyArrow);

            // Анимация удара
            gsap.to(IcyArrow.position, {
              x: recipient.position.x,
              y: recipient.position.y + 100, // Смещение вниз на 100 пикселей
              duration: 0.5,
              onComplete: () => {
                renderedSprites.splice(1, 1); // Удаляем спрайт удара после завершения
              },
            });
          },
        });

        break;
      }
      case 'EarthBump': {
        const EarthBumpImage = new Image();
        EarthBumpImage.src = './assets/newImages/muscletache/earth bump.png';
        const EarthBump = new Sprite({
          position: {
            x: recipient.position.x,
            y: recipient.position.y,
          },
          image: EarthBumpImage,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          // rotation: 90, // Убираем поворот
          scaleHeight: 3, // Уменьшаем размер
          scaleWidth: 3, // Уменьшаем размер
        });
        renderedSprites.push(EarthBump);

        // Сохраняем начальную позицию
        const initialPosition = { x: this.position.x, y: this.position.y };

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

            // Удаляем спрайт удара после завершения анимации
            renderedSprites.splice(renderedSprites.indexOf(EarthBump), 1);
          },
        });

        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }

        timeline.to(this.position, {
          x: this.position.x - movementDistance * 6,
          y: this.position.y + movementDistance * 2,
          duration: 0.5,
        });

        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          onStart: () => {
            gsap.to(EarthBump.position, {
              y: recipient.position.y + 50,

              duration: 0.3,
            });
          },
          onComplete: () => {
            gsap.to(this.position, {
              x: initialPosition.x,
              duration: 0.5,
            });
          },
        });

        break;
      }
      case 'Punch': {
        const timeline = gsap.timeline();

        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }

        rotation = this.isEnemy ? 5 : 0;

        timeline.to(this.position, {
          y: this.position.y - 200,
          duration: 0.2,
          ease: 'power2.inOut',
          onStart: () => {
          },
          onComplete: () => {
          // Создаем спрайт Punch
            const PunchImage = new Image();
            PunchImage.src = './assets/newImages/muscletache/punch.png';
            const Punch = new Sprite({
              position: {
                x: recipient.position.x + (this.isEnemy ? 40 : 0),
                y: recipient.position.y + 100,
              },
              image: PunchImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 4,
              scaleWidth: 4,
              autoAlpha: true,
            });

            // Добавляем спрайт Punch
            renderedSprites.push(Punch);

            gsap.to(Punch.position, {
              x: recipient.position.x + (this.isEnemy ? 60 : 0),
              y: recipient.position.y + (this.isEnemy ? 30 : 30),
              duration: 0.5,
              onComplete: () => {
                renderedSprites.pop(); // Удаляем спрайт после завершения
              },
            });

            // Анимация уменьшения шкалы здоровья врага
            gsap.to(healthBar, {
              width: `${recipient.health}%`,
              duration: 0.5,
              onComplete: () => {
                // Враг получает удар
                audio.tackleHit.play(); // проигрывание звука при попадании
              },
            });
          },
        });

        timeline.to(this.position, {
          y: this.position.y + 0,
          duration: 0.3,
          delay: 0.5, // Задержка перед возвратом
          onComplete: () => {
            gsap.to(this.position, {
              x: this.position.x,
              y: this.position.y,
              duration: 0.2,
            });
          },
        });

        break;
      }
      case 'Lightningbolt': {
        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }

        rotation = this.isEnemy ? 4 : 0;

        // Создаем спрайт Lightningbolt
        const LightningboltImage = new Image();
        LightningboltImage.src = './assets/newImages/maximba/lightningbolt.png';
        const Lightningbolt = new Sprite({
          position: {
            x: this.position.x + (this.isEnemy ? 40 : 0),
            y: this.position.y + 40,
          },
          image: LightningboltImage,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          rotation,
          scaleHeight: 2.5, // уменьшенный размер по высоте
          scaleWidth: 2.5, // уменьшенный размер по ширине
        });

        const timeline = gsap.timeline({
          onComplete: () => {
            // Анимация движения Lightningbolt к врагу
            gsap.to(Lightningbolt.position, {
              x: recipient.position.x + (this.isEnemy ? 0 : 0),
              y: recipient.position.y + (this.isEnemy ? -40 : 30),
              duration: 0.5,
              onComplete: () => {
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
                // Удаляем спрайт после завершения
                renderedSprites.splice(1, 1);
              },
            });
          },
        });

        // Анимация нервного покачивания и движение персонажа перед выстрелом
        timeline.to(this.position, {
          x: this.position.x + 5,
          y: this.position.y - 5,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          ease: 'power1.inOut',
        })
          .to(this.position, {
            y: this.position.y - (this.isEnemy ? -movementDistance * 2 : movementDistance * 2),
            duration: 0.2,
            ease: 'power2.out',
          })
          .to(this.position, {
            y: this.position.y,
            duration: 0.2,
            ease: 'power2.in',
          })
          .to(this.position, {
            x: this.position.x,
            y: this.position.y,
            duration: 0.2,
            onComplete: () => {
              // Добавляем спрайт Lightningbolt после завершения подготовки персонажа
              renderedSprites.splice(1, 0, Lightningbolt);
            },
          });

        break;
      }

      case 'DarkArrow': {
        const startX = this.position.x;
        const startY = this.position.y;
        const radiusX = 120;
        const radiusY = 60;

        rotation = this.isEnemy ? 3 : 0;

        // Путь в форме знака бесконечности
        const path = [
          { x: startX, y: startY },
          { x: startX - radiusX, y: startY - radiusY },
          { x: startX - 2 * radiusX, y: startY },
          { x: startX - radiusX, y: startY + radiusY },
          { x: startX, y: startY },
          { x: startX + radiusX, y: startY + radiusY },
          { x: startX + 2 * radiusX, y: startY },
          { x: startX + radiusX, y: startY - radiusY },
          { x: startX, y: startY },
        ];

        gsap.registerPlugin(MotionPathPlugin);

        // Создаем анимацию движения по траектории знака бесконечности
        const timeline = gsap.timeline({
          onComplete: () => {
            // Создаем спрайт DarkArrow
            const DarkArrowImage = new Image();
            DarkArrowImage.src = './assets/newImages/somatika/dark arrow.png';
            const DarkArrow = new Sprite({
              position: {
                x: startX,
                y: startY + 40,
              },
              image: DarkArrowImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 2,
              scaleWidth: 2,
            });

            renderedSprites.splice(1, 0, DarkArrow);

            gsap.to(DarkArrow.position, {
              x: recipient.position.x,
              y: recipient.position.y,
              duration: 0.5,
              onComplete: () => {
                audio.tackleHit.play(); // Проигрываем звук при попадании
                gsap.to(healthBar, {
                  width: `${recipient.health}%`, // Уменьшение здоровья
                });

                // Анимация тряски врага
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
                timeline.pause(); // Приостанавливаем анимацию движения по траектории

                // Возвращаем персонажа в исходную позицию
                gsap.to(this.position, {
                  x: startX,
                  y: startY,
                  duration: 1,
                  ease: 'power2.inOut',
                });
              },
            });
          },
        });

        timeline.to(this.position, {
          duration: 2, // Устанавливаем продолжительность анимации 2 секунды
          motionPath: {
            path,
            curviness: 1.25,
            autoRotate: true,
          },
          ease: 'power1.inOut',
        });

        break;
      }
      case 'Desintegrate': {
        audio.tackleHit.play(); // проигрывание звука при попадании
        gsap.to(healthBar, {
          width: `${recipient.health}%`, // уменьшение здоровья
        });

        gsap.to(recipient.position, { // анимация нанесения удара обидчиком
          x: recipient.position.x + 10,
          yoyo: true,
          repeat: 5,
          duration: 0.18,
        });

        gsap.to(recipient, { // анимация получения удара жертвой
          opacity: 0,
          repeat: 5,
          yoyo: true,
          duration: 0.18,
        });

        // Создаем спрайт Desintegrate
        const DesintegrateImage = new Image();
        DesintegrateImage.src = './assets/newImages/mikh ai-l/desintegrate.png';

        DesintegrateImage.onload = () => {
          const Desintegrate = new Sprite({
            position: {
              x: recipient.position.x + 20,
              y: recipient.position.y + 20,
            },
            image: DesintegrateImage,
            frames: {
              max: 4,
              hold: 10,
            },
            animate: true,
            scaleHeight: 2,
            scaleWidth: 2,
          });

          renderedSprites.push(Desintegrate);

          const vibrationTimeline = gsap.timeline({
            repeat: 3,
            yoyo: true,
            onComplete: () => {
              vibrationTimeline.kill();
            },
          });

          vibrationTimeline.to(this.position, {
            x: '+=15',
            y: '+=15',
            duration: 0.1,
          });

          vibrationTimeline.to(this.position, {
            x: '-=30',
            y: '-=30',
            duration: 0.1,
          });

          setTimeout(() => {
            renderedSprites.pop();
            vibrationTimeline.kill();
          }, 1000);
        };

        DesintegrateImage.onerror = () => {
          console.error('Failed to load image: ', DesintegrateImage.src);
        };

        break;
      }
      case 'Slash': {
        audio.tackleHit.play(); // проигрывание звука при атаке
        gsap.to(healthBar, {
          width: `${recipient.health}%`, // Уменьшение здоровья
        });

        // Анимация подпрыгивания
        gsap.to(this.position, {
          y: this.position.y - 200, // подпрыгивание
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // создаём спрайт Slash
            const slashImage = new Image();
            slashImage.src = './assets/newImages/somatika/slash.png';
            const slash = new Sprite({
              position: {
                x: recipient.position.x - 70, // Увеличение смещения влево
                y: recipient.position.y + 20, // Позиция Y врага с учётом смещения вниз
              },
              image: slashImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              scaleHeight: 5,
              scaleWidth: 5,
            });

            // Добавляем спрайт slash
            renderedSprites.push(slash);

            // Удаляем спрайт slash после завершения анимации удара
            setTimeout(() => {
              renderedSprites.pop();
            }, 300); // продолжительность анимации удара
          },
        });
        break;
      }
      case 'ElectricStrike': {
        rotation = this.isEnemy ? 3 : 0;

        audio.initFireball.play(); // проигрывание звука при касте

        const timeline = gsap.timeline({
          onComplete: () => {
            const electricStrikeImage = new Image(); // создание спрайта для электро страйка
            electricStrikeImage.src = './assets/newImages/mikh ai-l/electric strike.png';
            const electricStrike = new Sprite({
              position: {
                x: this.position.x + (this.isEnemy ? 0 : 60),
                y: this.position.y + (this.isEnemy ? 0 : 60),
              },
              image: electricStrikeImage,
              frames: {
                max: 4,
                hold: 10,
              },
              animate: true,
              rotation,
              scaleHeight: 2,
              scaleWidth: 2,
            });

            renderedSprites.splice(1, 0, electricStrike);

            gsap.to(electricStrike.position, { // выбор точки полёта проджектайла (враг)
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

                gsap.to(recipient, { // анимация получается удара жертвой
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

        const vibrationTimeline = gsap.timeline({
          repeat: 2,
          yoyo: true,
          onComplete: () => {
            vibrationTimeline.kill();
          },
        });

        vibrationTimeline.to(this.position, {
          x: '-=10',
          y: '-=10',
          duration: 0.1,
        });

        vibrationTimeline.to(this.position, {
          x: '+=20',
          y: '+=20',
          duration: 0.1,
        });
        break;
      }
      case 'TheDust': {
        const TheDustImage = new Image();
        TheDustImage.src = './assets/newImages/maximba/thedust.png';
        const TheDust = new Sprite({
          position: {
            x: recipient.position.x,
            y: recipient.position.y,
          },
          image: TheDustImage,
          frames: {
            max: 4,
            hold: 10,
          },
          animate: true,
          scaleHeight: 3, // Уменьшаем размер
          scaleWidth: 3, // уменьшаем размер
        });
        renderedSprites.push(TheDust);

        // Сохраняем начальную позицию
        const initialPosition = { x: this.position.x, y: this.position.y };

        const timeline = gsap.timeline({
          onComplete: () => {
            // Враг получает удар
            audio.tackleHit.play(); // проигрывание звука при попадани
            gsap.to(healthBar, {
              width: `${recipient.health}%`, // уменьшение здоровья
            });
            
            gsap.to(recipient.position, { // анимация нанесения удара обидчиком
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });

            gsap.to(recipient, {// анимация получения удара жертвой
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            
            // Удаляем спрайт удара после завершения анимации
            renderedSprites.splice(renderedSprites.indexOf(TheDust), 1);
          },
        });

        let movementDistance = 80;
        if (this.isEnemy) {
          movementDistance = -80;
        }

        timeline.to(this.position, {
          x: this.position.x - movementDistance * 6,
          y: this.position.y + movementDistance * 2,
          duration: 0.5,
        });

        timeline.to(this.position, {
          x: this.position.x,
          y: this.position.y,
          duration: 0.2,
          onStart: () => {
            gsap.to(TheDust.position, {
              y: recipient.position.y + 50,

              duration: 0.3,
            });
          },
          onComplete: () => {
            gsap.to(this.position, {
              x: initialPosition.x,
              duration: 0.5,
            });
          },
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
    this.context.fillStyle = 'rgba(255, 0, 0, 0.3'; // цвет границ. Полезно для отладки
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
