/* eslint-disable import/no-cycle */
/* eslint-disable no-undef */

import { Sprite, Boundary } from './classes.js';
import collisions from './collisions.js';
import battleZonesData from './battleZones.js';
import { animateBattle, initBattle } from './battleScene.js';
import audio from './audio.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

// разрешение игры
canvas.width = 1732;
canvas.height = 852;

// Создание подмассивов строк для карты коллизий
// 100, потому что это количество плиток в одной строке карты мира в текущей реализации
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 100) {
  collisionsMap.push(collisions.slice(i, i + 100));
}

// тоже самое, но для коллизий боевых зон
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 100) {
  battleZonesMap.push(battleZonesData.slice(i, i + 100));
}

const boundaries = [];
const offset = { // стартовая позиция игрока по отношению к координатам
  x: -100,
  y: -350,
};

// i - индекс строки. j - индекс символа(ячейки)
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 2513) {
      boundaries.push(new Boundary(
        {
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          context,
        },
      ));
    }
  });
});

// определение коллизий боевых зон на карте
const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 2592) {
      battleZones.push(new Boundary(
        {
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
          context,
        },
      ));
    }
  });
});

// загрузка изображений карты мира, переднего плана и всех сторон спрайта игрока
const backgroundImage = new Image();
backgroundImage.src = './assets/newImages/map/NEWMAP.png';

const foregroundImage = new Image();
foregroundImage.src = './assets/newImages/map/foreground.png';

const playerUpImage = new Image();
playerUpImage.src = './assets/newImages/player/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './assets/newImages/player/playerLeft.png';

const playerDownImage = new Image();
playerDownImage.src = './assets/newImages/player/playerDown.png';

const playerRightImage = new Image();
playerRightImage.src = './assets/newImages/player/playerRight.png';

const player = new Sprite({
  position: { // стартовая точка игрока на карте. Сейчас это середина экрана
    x: canvas.width / 2,
    y: canvas.height / 2,
  },
  image: playerDownImage, // адрес изображения
  frames: {
    max: 4, // количество спрайтов в спрайт листе
    hold: 30, // скорость их смены
  },
  sprites: { // пул спрайт-листов игрока
    up: playerUpImage,
    left: playerLeftImage,
    down: playerDownImage,
    right: playerRightImage,
  },
  scaleHeight: 2.5,
  scaleWidth: 2.5,
});

const background = new Sprite({ // создание карты мира
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: backgroundImage,
});

const foreground = new Sprite({ // создание переднего плана
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const closeButton = document.querySelector('.close-button');
const instructionWindow = document.querySelector('.instruction-window');

if (closeButton && instructionWindow) {
  closeButton.addEventListener('click', () => {
    instructionWindow.style.display = 'none';
  });
}

const keys = { // объект нажатия кнопок. Меняется на true при нажатии
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

//  rectangle1 = player, rectangle2 = коллизии препятствий
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x
    && rectangle1.position.x <= rectangle2.position.x + rectangle2.width
    && rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    && rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}
// Массив с объектами, симулирующими движ.
const movables = [background, foreground, ...boundaries, ...battleZones];

const battle = { // состояние инициализации битвы
  initiated: false,
};

let lastKey = ''; // переменная с последней нажатой кнопкой движения

function animate() { // функция, которая постоянно отрисовывает объекты для симуляции движения
  const animbationId = window.requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста перед перерисовкой
  background.draw(context); // отрисовка карты мира
  boundaries.forEach((boundary) => { // отрисовка коллизий препятствий
    boundary.draw(context);
  });
  battleZones.forEach((battleZone) => { // отрисовка коллизий боевых зон
    battleZone.draw();
  });
  player.draw(context); // отрисовка спрайта персонажа
  foreground.draw(context); // отриовка боевого задника

  // сегментик для остановки анимации ходьбы при срабатывании сражения
  let moving = true;
  player.animate = false;

  if (battle.initiated) return;

  // Блок активации битвы
  // Проверка касания коллизий боевой зоны и расчёты размера посетившего зону хитбокса
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i += 1) {
      const battleZone = battleZones[i];
      const overlappingArea = (Math.min(
        player.position.x + player.width,
        battleZone.position.x + battleZone.width,
      ) - Math.max(
        player.position.x,
        battleZone.position.x,
      )) * (Math.min(
        player.position.y
        + player.height,
        battleZone.position.y
        + battleZone.height,
      ) - Math.max(
        player.position.y,
        battleZone.position.y,
      ));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone,
        })
        && overlappingArea > (player.width * player.height) / 2
        && Math.random() < 0.003 // шанс начала сражения
      ) {
        window.cancelAnimationFrame(animbationId);

        audio.map.stop();
        audio.initBattle.play();
        audio.battle.loop(true);
        audio.battle.play();

        battle.initiated = true;
        // Настройки анимации из сторонеей библиотеки gsap
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                initBattle();
                animateBattle();
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4,
                });
              },
            });
          },
        });
        break;
      }
    }
  }
  // сегмент с проверкой нажатия кнопки и всеми последующими вещами
  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true; // активация анимации
    player.image = player.sprites.up; // смена спрайта персонажа

    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 4,
              y: boundary.position.y - 4,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        const mobility = movable;
        mobility.position.y += 2;
      });
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 2,
              y: boundary.position.y - 20,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        const mobility = movable;
        mobility.position.x += 2;
      });
    }
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 4,
              y: boundary.position.y - 24,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        const mobility = movable;
        mobility.position.y -= 2;
      });
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true;
    player.image = player.sprites.right;

    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 20,
              y: boundary.position.y - 20,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        const mobility = movable;
        mobility.position.x -= 2;
      });
    }
  }
}

// добавить комментарий, при необходимости быстрой отладки боёв (ну и снять его в battleScene.js)
animate();

// Массивы с допустимыми для нажатиями кнопками движения
const upButtons = ['w', 'ц', 'ArrowUp'];
const leftButtons = ['a', 'ф', 'ArrowLeft'];
const downButtons = ['s', 'ы', 'ArrowDown'];
const rightButtons = ['d', 'в', 'ArrowRight'];

// Нажиматель кнопок движения
window.addEventListener('keydown', ({ key }) => {
  if (upButtons.includes(key)) {
    keys.w.pressed = true;
    lastKey = 'w';
  } else if (leftButtons.includes(key)) {
    keys.a.pressed = true;
    lastKey = 'a';
  } else if (downButtons.includes(key)) {
    keys.s.pressed = true;
    lastKey = 's';
  } else if (rightButtons.includes(key)) {
    keys.d.pressed = true;
    lastKey = 'd';
  }
});

// Отжиматель кнопок движения
window.addEventListener('keyup', ({ key }) => {
  if (upButtons.includes(key)) {
    keys.w.pressed = false;
  } else if (leftButtons.includes(key)) {
    keys.a.pressed = false;
  } else if (downButtons.includes(key)) {
    keys.s.pressed = false;
  } else if (rightButtons.includes(key)) {
    keys.d.pressed = false;
  }
});

// Воспроизводитель музыки
let clicked = false;
window.addEventListener('click', () => {
  if (!clicked) {
    audio.map.loop(true);
    audio.map.play();
    clicked = true;
  }
});

export { animate, battle };
