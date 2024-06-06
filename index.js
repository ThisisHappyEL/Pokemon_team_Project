import { Sprite, Boundary } from './src/classes.js';
import collisions from './src/collisions.js';
import battleZonesData from './src/battleZones.js';
import attacks from './src/attacks.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

// Создание подмассивов строк для карты коллизий
// 70, потому что это количество плиток в одной строке карты мира в текущей реализации
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

console.log(battleZonesMap);

const boundaries = [];
const offset = {
  x: -735,
  y: -650,
};

// i - индекс строки. j - индекс символа(ячейки)
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
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

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
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

console.log(battleZones);

const backgroundImage = new Image();
backgroundImage.src = './assets/temporaryAssets/Images/Pellet Town.png';

const foregroundImage = new Image();
foregroundImage.src = './assets/temporaryAssets/Images/foreground.png';

const playerUpImage = new Image();
playerUpImage.src = './assets/temporaryAssets/Images/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './assets/temporaryAssets/Images/playerLeft.png';

const playerDownImage = new Image();
playerDownImage.src = './assets/temporaryAssets/Images/playerDown.png';

const playerRightImage = new Image();
playerRightImage.src = './assets/temporaryAssets/Images/playerRight.png';

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 30,
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    down: playerDownImage,
    right: playerRightImage,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: backgroundImage,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

const keys = {
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
const movables = [background, ...boundaries, foreground, ...battleZones];

const battle = {
  initiated: false,
};

function animate() { // функция, которая постоянно отрисовывает объекты для симуляции движения
  const animbationId = window.requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста перед перерисовкой
  background.draw(context);
  boundaries.forEach((boundary) => {
    boundary.draw(context);
  });
  battleZones.forEach(battleZone => {
    battleZone.draw();
  });
  player.draw(context);
  foreground.draw(context);

  // сегментик для остановки анимации ходьбы при срабатывании сражаения
  let moving = true;
  player.animate = false;

  console.log(animbationId)
  if (battle.initiated) return;
  /*
  Блок активации битвы
  Проверка касания коллизий боевой зоны и расчёты размера посетившего зону хитбокса
  */
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
        && Math.random() < 0.01 // шанс начала сражения
      ) {
        console.log('activate battle');
        window.cancelAnimationFrame(animbationId);
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

  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i += 1) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 2,
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
        movable.position.y += 2;
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
              y: boundary.position.y,
            },
          },
        })
      ) {
        console.log('colliding');
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += 2;
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
              x: boundary.position.x,
              y: boundary.position.y - 2,
            },
          },
        })
      ) {
        console.log('colliding');
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= 2;
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
              x: boundary.position.x - 2,
              y: boundary.position.y,
            },
          },
        })
      ) {
        console.log('colliding');
        moving = false;
        break;
      }
    }
    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= 2;
      });
    }
  }
}

// animate();

const battleBackGroundImage = new Image();
battleBackGroundImage.src = './assets/temporaryAssets/Images/battleBackground.png';
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackGroundImage,
});

const draggleImage = new Image();
draggleImage.src = './assets/temporaryAssets/Images/draggleSprite.png';
const draggle = new Sprite({
  position: {
    x: 800,
    y: 100,
  },
  image: draggleImage,
  frames: {
    max: 4,
    hold: 60,
  },
  animate: true,
  isEnemy: true,
});

const embyImage = new Image();
embyImage.src = './assets/temporaryAssets/Images/embySprite.png';
const emby = new Sprite({
  position: {
    x: 280,
    y: 325,
  },
  image: embyImage,
  frames: {
    max: 4,
    hold: 60,
  },
  animate: true,
});

const renderedSprites = [
  draggle,
  emby,
];

function animateBattle() {
  window.requestAnimationFrame(animateBattle);
  battleBackground.draw(context);

  renderedSprites.forEach(sptrite => {
    sptrite.draw(context);
  });
}

animateBattle();

// Прослушиватели для битвы
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', (event) => {
    const selectedAttack = attacks[event.currentTarget.innerHTML];
    emby.attack({
      attack: selectedAttack,
      recipient: draggle,
      renderedSprites,
    });
  });
});

let lastKey = '';

const upButtons = ['w', 'ц', 'ArrowUp'];
const leftButtons = ['a', 'ф', 'ArrowLeft'];
const downButtons = ['s', 'ы', 'ArrowDown'];
const rightButtons = ['d', 'в', 'ArrowRight'];

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
  } else {
    console.log('не та кнопка');
  }
});

window.addEventListener('keyup', ({ key }) => {
  if (upButtons.includes(key)) {
    keys.w.pressed = false;
  } else if (leftButtons.includes(key)) {
    keys.a.pressed = false;
  } else if (downButtons.includes(key)) {
    keys.s.pressed = false;
  } else if (rightButtons.includes(key)) {
    keys.d.pressed = false;
  } else {
    console.log('не та кнопка');
  }
});
