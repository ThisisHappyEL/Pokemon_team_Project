// Массив с атаками
const attacks = {
  Tackle: { // родительский элемент
    name: 'Tackle', // название
    damage: 10, // наносимый урон
    type: 'Normal', // текст для блока "Тип урона"
    color: 'black', // цвет текста в блоке "Тип урона"
    typeIcon: {
      src: './assets/newImages/testIcon1.png',
    },
  },
  Fireball: {
    name: 'Fireball',
    damage: 25,
    type: 'Fire',
    color: 'red',
    typeIcon: {
      src: './assets/newImages/testIcon2.png',
    },
  },
};

export default attacks;
