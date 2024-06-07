import attacks from './attacks.js';

const monsters = {
  Emby: {
    position: {
      x: 510,
      y: 520,
    },
    image: {
      src: './assets/Images/embySprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Emby',
    attacks: [attacks.Tackle, attacks.Fireball],
  },
  Draggle: {
    position: {
      x: 1380,
      y: 180,
    },
    image: {
      src: './assets/Images/draggleSprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    isEnemy: true,
    name: 'Draggle',
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};

export default monsters;
