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
    attacks: [attacks.Tackle, attacks.Fireball], // пул аттак
  },
  Maximba: {
    image: {
      src: './assets/newImages/maximba/maximba final sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Maximba',
    attacks: [attacks.Tackle, attacks.Fireball],
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
    attacks: [attacks.Tackle, attacks.Fireball],
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
    attacks: [attacks.Tackle, attacks.Fireball],
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
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};

const playerMonsters = ['Somalma', 'Maximba', 'Somatika', 'MikhAi_L', 'JabbaScript'];

export { allMonsters, playerMonsters };
