import attacks from './attacks.js';

// Объект со всеми монстрами игры
const allMonsters = {
  Somalma: { // родительский одного монстра
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
  Maximba: {
    image: {
      src: './assets/newImages/maximba_final_sprite.png',
    },
    frames: {
      max: 4,
      hold: 60,
    },
    animate: true,
    name: 'Maximba',
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};

const playerMonsters = ['Somalma'];

export { allMonsters, playerMonsters };
