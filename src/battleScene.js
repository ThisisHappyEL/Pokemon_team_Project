import { Sprite, Monster } from './classes.js';
import attacks from './attacks.js';
import monsters from './monsters.js';
import { animate, battle } from '../index.js';
import audio from './audio.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const battleBackGroundImage = new Image();
battleBackGroundImage.src = './assets/Images/battleBackground.png';
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackGroundImage,
});

let draggle;
let emby;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'; // отображение интерфейса
  document.querySelector('#dialogueBox').style.display = 'none'; // отображение интерфейса диалогов
  document.querySelector('#enemyHealthBar').style.width = '100%'; // отображение здоровья врага
  document.querySelector('#playerHealthBar').style.width = '100%'; // отображение здоровья игрока
  document.querySelector('#attacksBox').replaceChildren(); // перерисовка кнопок атаки

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];
  queue = [];

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    document.querySelector('#attacksBox').append(button);
  });

  // Прослушиватели для битвы
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const selectedAttack = attacks[event.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          // Назад во тьму
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector('#userInterface').style.display = 'none';
              gsap.to('#overlappingDiv', {
                opacity: 0,
              });

              battle.initiated = false;
              audio.map.play();
            },
          });
        });
      }
      // Вражеские атаки ниже
      const randomAttack = draggle.attacks[
        Math.floor(Math.random() * draggle.attacks.length)
      ];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        });

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });

          queue.push(() => {
            // Назад во тьму
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector('#userInterface').style.display = 'none';
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                });

                battle.initiated = false;
                audio.map.play();
              },
            });
          });
        }
      });
    });

    button.addEventListener('mouseenter', (event) => {
      const selectedAttack = attacks[event.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw(context);

  renderedSprites.forEach((sprite) => {
    sprite.draw(context);
  });
}

initBattle();
animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (event) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    event.currentTarget.style.display = 'none';
  }
});

export { animateBattle, initBattle };
