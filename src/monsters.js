import attacks from './attacks.js';

// По какой-то причине спрайт огонька не всегда появлется после перезагрузки. Надо разобраться.
const monsters = {
  Emby: {
    position: {
      x: 280,
      y: 325,
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
      x: 800,
      y: 100,
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
