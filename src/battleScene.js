/* eslint-disable import/no-cycle */
/* eslint-disable no-undef */

import { Sprite, Monster } from './classes.js';
import attacks from './attacks.js';
import { allMonsters, playerMonsters } from './monsters.js';
import { animate, battle } from './mainScene.js';
import audio from './audio.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const battleBackGroundImage = new Image();
battleBackGroundImage.src = './assets/newImages/background/background.png';
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

let enemyMonster;
let playerMonster;
let renderedSprites;
let battleAnimationId;
let queue;

const dialogueBox = document.querySelector('#dialogueBox');
let isAnimationInProgress = false;

function showAttackMessage(monsterName, attackName, backgroundColor) {
  if (isAnimationInProgress) return;

  isAnimationInProgress = true;
  dialogueBox.style.pointerEvents = 'none';

  dialogueBox.style.display = 'block';
  dialogueBox.innerHTML = `${monsterName} used ${attackName}`;
  dialogueBox.style.backgroundColor = backgroundColor;

  const timeline = gsap.timeline({
    onComplete: () => {
      dialogueBox.style.pointerEvents = 'auto';
      dialogueBox.style.backgroundColor = 'rgba(158, 255, 190)';
      isAnimationInProgress = false;
    },
  });

  timeline
    .to(dialogueBox, {
      duration: 1.5,
      backgroundColor: '#ffffff',
    })
    .to(dialogueBox, {
      duration: 0.1,
      backgroundColor: 'rgba(158, 255, 190)',
    });
}

function initBattle() {
  document.querySelector('#chooseMonstersPanel').style.display = 'block';
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#chooseMonstersBox').replaceChildren();
  document.querySelector('#attacksBox').replaceChildren();

  const monsterKeys = Object.keys(allMonsters);

  const randomMonsterKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];

  enemyMonster = new Monster({
    ...allMonsters[randomMonsterKey],
    position: enemyMonsterPosition,
    isEnemy: true,
  });
  renderedSprites = [enemyMonster];
  document.querySelector('#enemyMonsterName').innerText = `Enemy ${enemyMonster.name}`;

  queue = [];

  playerMonsters.forEach((monsterKey) => {
    const monsterData = allMonsters[monsterKey];
    const pickMonsterButton = document.createElement('button');
    pickMonsterButton.id = 'chooseMonsterButton';
    pickMonsterButton.classList.add('monster-container');
    pickMonsterButton.setAttribute('data-key', monsterKey);

    const buttonContentContainer = document.createElement('div');
    buttonContentContainer.style.display = 'flex';
    buttonContentContainer.style.alignItems = 'center';

    const canvasAnimationSprite = document.createElement('canvas');
    canvasAnimationSprite.id = 'monsterAnimBox';
    canvasAnimationSprite.width = 200;
    canvasAnimationSprite.height = 175;

    const iconContainer = document.createElement('div');
    iconContainer.classList.add('icon-container');

    const monsterAttacks = monsterData.attacks;
    monsterAttacks.forEach((attack) => {
      const attackIconSrc = attack.typeIcon.src;
      const attackIcon = document.createElement('img');
      attackIcon.src = attackIconSrc;
      attackIcon.classList.add('attack-icon');
      iconContainer.append(attackIcon);
    });

    const localContext = canvasAnimationSprite.getContext('2d');

    const monster = new Monster({
      position: {
        x: 0,
        y: 0,
      },
      image: { src: monsterData.image.src },
      frames: monsterData.frames,
      context: localContext,
      animate: true,
      name: monsterData.name,
      attacks: monsterAttacks,
      flip: monsterData.flip,
    });

    function animatePickMonsterSprite() {
      localContext.clearRect(
        0,
        0,
        canvasAnimationSprite.width,
        canvasAnimationSprite.height,
      );
      monster.draw(localContext);
      requestAnimationFrame(animatePickMonsterSprite);
    }
    animatePickMonsterSprite();

    buttonContentContainer.append(canvasAnimationSprite);
    buttonContentContainer.append(iconContainer);

    const buttonText = document.createElement('span');
    buttonText.classList.add('buttonText');
    buttonText.innerHTML = monsterData.name;

    pickMonsterButton.append(buttonContentContainer);
    pickMonsterButton.append(buttonText);

    document.querySelector('#chooseMonstersBox').append(pickMonsterButton);
  });

  let isAttackInProgress = false;

  document.querySelectorAll('#chooseMonstersBox button').forEach((selectMonsterButton) => {
    selectMonsterButton.addEventListener('click', (selectMonsterEvent) => {
      const selectedMonsterKey = selectMonsterEvent.currentTarget.getAttribute('data-key');
      if (!allMonsters[selectedMonsterKey]) {
        console.error(`Monster key ${selectedMonsterKey} does not exist in allMonsters`);
        return;
      }

      document.querySelector('#chooseMonstersPanel').style.display = 'none';

      playerMonster = new Monster({
        ...allMonsters[selectedMonsterKey],
        position: playerMonsterPosition,
      });
      renderedSprites.push(playerMonster);

      document.querySelector('#playerMonsterName').innerText = `Player ${playerMonster.name}`;

      document.querySelector('#attacksBox').replaceChildren();
      playerMonster.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#attacksBox').append(button);

        button.addEventListener('click', (selectAttackEvent) => {
          if (isAttackInProgress) {
            return;
          }

          isAttackInProgress = true;

          const selectedAttack = attacks[selectAttackEvent.currentTarget.innerHTML];

          document.querySelectorAll('#attacksBox button').forEach((btn) => {
            btn.setAttribute('disabled', 'true');
          });

          showAttackMessage(playerMonster.name, selectedAttack.name, 'rgba(128, 128, 128)');

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

                  const completionWindow = document.querySelector('#completion-window');
                  const completionCloseButton = document.querySelector('#completion-close-button');

                  const enemyMonsterKey = Object.keys(allMonsters).find(
                    (key) => allMonsters[key].name === enemyMonster.name,
                  );

                  if (!playerMonsters.includes(enemyMonsterKey)) {
                    playerMonsters.push(enemyMonsterKey);
                  }

                  if (playerMonsters.length === 7) {
                    if (completionWindow) {
                      completionWindow.style.display = 'block';
                    }
                  }
                  if (completionCloseButton && completionWindow) {
                    completionCloseButton.addEventListener('click', () => {
                      completionWindow.style.display = 'none';
                    });
                  }

                  audio.map.play();
                },
              });
            });
          }

          const randomAttack = enemyMonster.attacks[
            Math.floor(Math.random() * enemyMonster.attacks.length)
          ];
          queue.push(() => {
            showAttackMessage(enemyMonster.name, randomAttack.name, 'rgba(128, 128, 128)');

            enemyMonster.attack({
              attack: randomAttack,
              recipient: playerMonster,
              renderedSprites,
            });

            queue.push(() => {
              document.querySelectorAll('#attacksBox button').forEach((btn) => {
                btn.removeAttribute('disabled');
              });
            });

            if (playerMonster.health <= 0) {
              queue.push(() => {
                playerMonster.faint();
                audio.lose.play();
              });

              queue.push(() => {
                gsap.to('#overlappingDiv', {
                  opacity: 1,
                  onComplete: () => {
                    cancelAnimationFrame(battleAnimationId);
                    animate();
                    document.querySelector('#userInterface').style.display = 'none';
                    gsap.to('#overlappingDiv', {
                      opacity: 0,
                      onComplete: () => {
                        battle.initiated = false;
                        audio.map.play();
                      },
                    });
                  },
                });
              });
            }
          });

          isAttackInProgress = false;
        });

        button.addEventListener('mouseenter', (mouseenterEvent) => {
          const selectedAttack = attacks[mouseenterEvent.currentTarget.innerHTML];
          document.querySelector('#attackType').innerHTML = selectedAttack.type;
          document.querySelector('#attackType').style.color = selectedAttack.color;
        });
      });
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
// При необходимости отладки боёв минуя карту мира - убрать комментарии
// initBattle();
// animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', () => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    dialogueBox.style.display = 'none';
  }
});

export { animateBattle, initBattle };
