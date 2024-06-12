import attacks from './attacks.js';

// Объект со всеми монстрами игры
const allMonsters = {
  Somalma: { // родительский одного монстра
    image: { // путь до изображения
      src: './assets/newImages/somalma/somalma final sprite.png',
    },
    frames: { // количество кадров анимации и скорость их смены
      max: 4,
      hold: 60,
    },
    animate: true, // является ли спрайт анимированных впринципе
    name: 'Somalma', // имя
    attacks: [attacks.Coconut, attacks.Waterball], // пул аттак
  },
  Maximba: {
    image: {
      src: './assets/newImages/maximba/maximba final sprite2.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Maximba',
    attacks: [attacks.Tackle, attacks.Lightningbolt],
  },
  Somatika: {
    image: {
      src: './assets/newImages/somatika/somatika final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Somatika',
    attacks: [attacks.Tackle, attacks.DarkArrow],
  },
  MikhAi_L: {
    image: {
      src: './assets/newImages/mikh ai-l/mikh ai-l final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Mikh AI-L',
    attacks: [attacks.Tackle, attacks.Desintegrate],
  },
  JabbaScript: {
    image: {
      src: './assets/newImages/jabba script/jabba script final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Jabba Script',
    attacks: [attacks.java_Slash, attacks.poisonous_Spit],
    flip: false, // жабке лучше не отражаться
  },
  Kelpish: {
    image: {
      src: './assets/newImages/kelpish/kelpish final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Kelpish',
    attacks: [attacks.Tackle],
    flip: false,
  },
  Muscletache: {
    image: {
      src: './assets/newImages/muscletache/muscletache final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Muscletache',
    attacks: [attacks.Tackle],
  },
};

const playerMonsters = [
  'Somalma',
  'Maximba',
  'Somatika',
  'MikhAi_L',
  'Kelpish',
  'Muscletache',
];

export { allMonsters, playerMonsters };
