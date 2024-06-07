import attacks from './attacks.js';

// Объект со всеми монстрами игры
const monsters = {
  Emby: { // родительский одного монстра
    position: { // его позиция на боевой арене
      x: 510, // конкретно такие параметры подходят для монстра игрока при стандартном масштабе
      y: 520,
    },
    image: { // путь до изображения
      src: './assets/Images/embySprite.png',
    },
    frames: { // количество кадров анимации и скорость их смены
      max: 4,
      hold: 60,
    },
    animate: true, // является ли спрайт анимированных впринципе
    name: 'Emby', // имя
    attacks: [attacks.Tackle, attacks.Fireball], // пул аттак
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
