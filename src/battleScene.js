import { Sprite, Monster } from './classes.js';
import attacks from './attacks.js';
import monsters from './monsters.js';
import { animate, battle } from '../index.js';
import audio from './audio.js';

const canvas = document.querySelector('canvas'); // вырисовываемый блок
const context = canvas.getContext('2d'); // контекст

const battleBackGroundImage = new Image(); // загрузка задника для арены
battleBackGroundImage.src = './assets/Images/battleBackground.png';
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackGroundImage,
});

// множество параметров, которые необходимо заполнить при инициации боя
let enemyMonster;
let playerMonster;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'; // отображение интерфейса
  document.querySelector('#dialogueBox').style.display = 'none'; // отображение интерфейса диалогов
  document.querySelector('#enemyHealthBar').style.width = '100%'; // отображение здоровья врага
  document.querySelector('#playerHealthBar').style.width = '100%'; // отображение здоровья игрока
  document.querySelector('#attacksBox').replaceChildren(); // перерисовка кнопок атаки

  enemyMonster = new Monster(monsters.Draggle); // определение врага
  playerMonster = new Monster(monsters.Emby); // определение бойца игрока
  renderedSprites = [enemyMonster, playerMonster]; // пул спрайтов для отрисовки
  queue = []; // очередь действий

  playerMonster.attacks.forEach((attack) => { // заполнение интерфейса кнопками атак
    const button = document.createElement('button'); // создание кнопки
    button.innerHTML = attack.name; // название кнопки
    document.querySelector('#attacksBox').append(button);
  });

  // Прослушиватели для битвы
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const selectedAttack = attacks[event.currentTarget.innerHTML];
      playerMonster.attack({
        attack: selectedAttack,
        recipient: enemyMonster,
        renderedSprites,
      });

      if (enemyMonster.health <= 0) { // Проверка на смээрть игрока
        queue.push(() => {
          enemyMonster.faint();
        });
        queue.push(() => {
          // переход обратно на карту мира с затемнением
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
      // Рандомизация атаки вражеского монстра
      const randomAttack = enemyMonster.attacks[
        Math.floor(Math.random() * enemyMonster.attacks.length)
      ];

      queue.push(() => {
        enemyMonster.attack({
          attack: randomAttack,
          recipient: playerMonster,
          renderedSprites,
        });

        if (playerMonster.health <= 0) { // проверка на смэээрть врага
          queue.push(() => {
            playerMonster.faint();
          });

          queue.push(() => {
            // переход обратно на карту мира с затемнением
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

    // отслеживание нажатия кнопки атаки
    button.addEventListener('mouseenter', (event) => {
      const selectedAttack = attacks[event.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });
  });
}

// непосредственно функция отрисовки и работы битвы
function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw(context);

  renderedSprites.forEach((sprite) => {
    sprite.draw(context);
  });
}

// Отменить комментарий, при необходимости быстрой отладки боёв
// initBattle();
// animateBattle();

// логика для срабатывания клика по сообщению после атаки
document.querySelector('#dialogueBox').addEventListener('click', (event) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    event.currentTarget.style.display = 'none';
  }
});

export { animateBattle, initBattle };
