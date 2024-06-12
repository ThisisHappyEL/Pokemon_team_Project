// Массив с атаками
const attacks = {
  Tackle: { // родительский элемент
    name: 'Tackle', // название
    damage: 10, // наносимый урон
    type: 'Normal', // текст для блока "Тип урона"
    color: 'black', // цвет текста в блоке "Тип урона"
    typeIcon: {
      src: './assets/newImages/icons/testIcon1.png',
    },
  },
  Fireball: {
    name: 'Fireball',
    damage: 25,
    type: 'Fire',
    color: 'red',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
  Lightningbolt: {
    name: 'Lightningbolt',
    damage: 30,
    type: 'Electric',
    color: 'yellow',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
  Coconut: {
    name: 'Coconut',
    damage: 15,
    type: 'Normal',
    color: 'black',
    typeIcon: {
      src: './assets/newImages/icons/testIcon1.png',
    },
  },
  Waterball: {
    name: 'Waterball',
    damage: 25,
    type: 'Water',
    color: 'blue',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
  java_Slash: {
    name: 'java_Slash',
    damage: 5,
    type: 'Normal',
    color: 'black',
    typeIcon: {
      src: './assets/newImages/icons/testIcon1.png',
    },
  },
  poisonous_Spit: {
    name: 'poisonous_Spit',
    damage: 5,
    type: 'Poison',
    color: 'green',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
  DarkArrow: {
    name: 'DarkArrow',
    damage: 25,
    type: 'Hypnosis',
    color: 'purple',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
  Desintegrate: {
    name: 'Desintegrate',
    damage: 25,
    type: 'Separation',
    color: 'orange',
    typeIcon: {
      src: './assets/newImages/icons/testIcon2.png',
    },
  },
};

export default attacks;
