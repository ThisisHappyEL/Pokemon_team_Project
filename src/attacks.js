// Массив с атаками
const attacks = {
  Tackle: { // родительский элемент
    name: 'Tackle', // название
    damage: 10, // наносимый урон
    type: 'Normal', // текст для блока "Тип урона"
    color: 'black', // цвет текста в блоке "Тип урона"
  },
  Fireball: {
    name: 'Fireball',
    damage: 25,
    type: 'Fire',
    color: 'red',
  },
};

export default attacks;
