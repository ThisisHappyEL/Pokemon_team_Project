/* eslint-disable import/no-cycle */
/* eslint-disable no-undef */

import { Sprite, Monster } from './classes.js';
import attacks from './attacks.js';
import { allMonsters, playerMonsters } from './monsters.js';
import { animate, battle } from './mainScene.js';
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

const enemyMonsterPosition = {
  x: 1330,
  y: 100,
};

const playerMonsterPosition = {
  x: 450,
  y: 450,
};

// множество параметров, которые необходимо заполнить при инициации боя
let enemyMonster;
let playerMonster;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {
  // Отображение и сокрытие панели выбора монстрика перед битвой
  document.querySelector('#chooseMonstersPanel').style.display = 'block';
  document.querySelector('#userInterface').style.display = 'block'; // отображение интерфейса
  document.querySelector('#dialogueBox').style.display = 'none'; // отображение интерфейса диалогов
  document.querySelector('#enemyHealthBar').style.width = '100%'; // отображение здоровья врага
  document.querySelector('#playerHealthBar').style.width = '100%'; // отображение здоровья игрока
  document.querySelector('#chooseMonstersBox').replaceChildren(); // перерисовка кнопок выбора
  document.querySelector('#attacksBox').replaceChildren(); // перерисовка кнопок атаки

  // Определение врага
  enemyMonster = new Monster({
    ...allMonsters.Maximba,
    position: enemyMonsterPosition,
    isEnemy: true,
  });
  renderedSprites = [enemyMonster]; // пул спрайтов для отрисовки
  // имя монстра врага
  document.querySelector('#enemyMonsterName').innerText = `Enemy ${enemyMonster.name}`;

  queue = []; // Очередь действий

  // Заполнение панели выбора монстрика кнопками и изображениями с ними
  playerMonsters.forEach((name) => {
    const pickMonsterButton = document.createElement('button'); // создание кнопки
    pickMonsterButton.id = 'chooseMonsterButton'; // присвоение id для работы с стилями в css
    pickMonsterButton.classList.add('monster-container'); // тоже самое, но с class
    pickMonsterButton.setAttribute('data-name', name); // сохранить имя монстра в data-name

    const buttonContentContainer = document.createElement('div'); // общий контейнер
    buttonContentContainer.style.display = 'flex';
    buttonContentContainer.style.alignItems = 'center';

    const canvasAnimationSprite = document.createElement('canvas'); // Создание элемента для canvas
    canvasAnimationSprite.id = 'monsterAnimBox'; // присвоение id для работы с стилями в css
    canvasAnimationSprite.width = 200; // ширина canvas
    canvasAnimationSprite.height = 175; // высота canvas

    const iconContainer = document.createElement('div'); // создание контейнера для иконок
    iconContainer.classList.add('icon-container'); // класс для стилизации

    // Получаем атаки текущего монстра
    const monsterAttacks = allMonsters[name].attacks;
    monsterAttacks.forEach((attack) => {
      const attackIconSrc = attack.typeIcon.src;
      const attackIcon = document.createElement('img'); // создание элемента img для иконки атаки
      attackIcon.src = attackIconSrc;
      attackIcon.classList.add('attack-icon'); // Добавление класса для стилизации иконок
      iconContainer.append(attackIcon);
    });

    const localContext = canvasAnimationSprite.getContext('2d'); // контекст для работы кнопок

    const monster = new Monster({ // Создание объекта Monster для анимации спрайта
      position: {
        x: 0,
        y: 0,
      },
      image: { src: allMonsters[name].image.src },
      frames: allMonsters[name].frames,
      context: localContext,
      animate: true,
      name,
      attacks: monsterAttacks,
    });

    function animatePickMonsterSprite() { // Функция для анимации спрайта
      localContext.clearRect( // очистка canvas
        0,
        0,
        canvasAnimationSprite.width,
        canvasAnimationSprite.height,
      );
      monster.draw(localContext); // отрисовка спрайта
      requestAnimationFrame(animatePickMonsterSprite); // рекурсивный вызов для анимации
    }
    animatePickMonsterSprite(); // Запуск анимации

    buttonContentContainer.append(canvasAnimationSprite); // добавление спрайта
    buttonContentContainer.append(iconContainer); // добавление иконок

    const buttonText = document.createElement('span'); // Создание элемента для текста
    buttonText.classList.add('buttonText');
    buttonText.innerHTML = allMonsters[name].name; // Название кнопки

    // Добавление контейнера с canvas и иконками и текста в кнопку
    pickMonsterButton.append(buttonContentContainer); // добавление кнопки
    pickMonsterButton.append(buttonText); // добавление текста

    // Добавление кнопки в контейнер
    document.querySelector('#chooseMonstersBox').append(pickMonsterButton);
  });

  document.querySelectorAll('#chooseMonstersBox button').forEach((selectMonsterButton) => {
    selectMonsterButton.addEventListener('click', (selectMonsterEvent) => {
      const selectedMonsterName = selectMonsterEvent.currentTarget.getAttribute('data-name');
      document.querySelector('#chooseMonstersPanel').style.display = 'none';

      // Определение бойца игрока
      playerMonster = new Monster({
        ...allMonsters[selectedMonsterName],
        position: playerMonsterPosition,
      });
      renderedSprites.push(playerMonster); // добавление игрока в пул спрайтов для отрисовки

      // имя монстра игрока
      document.querySelector('#playerMonsterName').innerText = `Player ${playerMonster.name}`;

      // Очистка и заполнение панели атак для выбранного монстра игрока
      document.querySelector('#attacksBox').replaceChildren();
      playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button'); // создание кнопки
        button.innerHTML = attack.name; // название кнопки
        document.querySelector('#attacksBox').append(button);

        // Добавление обработчиков событий для атак
        button.addEventListener('click', (selectAttackEvent) => {
          const selectedAttack = attacks[selectAttackEvent.currentTarget.innerHTML];
          playerMonster.attack({
            attack: selectedAttack,
            recipient: enemyMonster,
            renderedSprites,
          });

          if (enemyMonster.health <= 0) {
            queue.push(() => {
              enemyMonster.faint();
              audio.victory.play();
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

                  // добавление побежденного монстра в коллекцию игрока
                  if (!playerMonsters.includes(enemyMonster.name)) {
                    playerMonsters.push(enemyMonster.name);
                  }

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

            if (playerMonster.health <= 0) {
              queue.push(() => {
                playerMonster.faint();
                audio.victory.play(); // СДЕЛАТЬ ПРОИГРЫШНУЮ КОГДА ОНА БУДЕТ ГОТОВА
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
        // отображение типа атаки
        button.addEventListener('mouseenter', (mouseenterEvent) => {
          const selectedAttack = attacks[mouseenterEvent.currentTarget.innerHTML];
          document.querySelector('#attackType').innerHTML = selectedAttack.type;
          document.querySelector('#attackType').style.color = selectedAttack.color;
        });
      });
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
  const dialogueBox = event.currentTarget;

  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    dialogueBox.style.display = 'none';
  }
});

export { animateBattle, initBattle };
