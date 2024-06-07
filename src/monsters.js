import attacks from './attacks.js';

// Объект со всеми монстрами игры
const monsters = {
  Emby: { // родительский одного монстра
    position: { // его позиция на боевой арене
      x: 450, // конкретно такие параметры подходят для монстра игрока при стандартном масштабе
      y: 450,
    },
    image: { // путь до изображения
      src: './assets/newImages/somalmatestsprite.png',
    },
    frames: { // количество кадров анимации и скорость их смены
      max: 4,
      hold: 60,
    },
    animate: true, // является ли спрайт анимированных впринципе
    name: 'Somalma', // имя
    attacks: [attacks.Tackle, attacks.Fireball], // пул аттак
  },
  Draggle: {
    position: {
      x: 1330,
      y: 100,
    },
    image: {
      src: './assets/newImages/maximba_final_sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    isEnemy: true,
    name: 'Maximba',
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};

export default monsters;
