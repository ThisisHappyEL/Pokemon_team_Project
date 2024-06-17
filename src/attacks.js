// Массив с атаками
const attacks = {
  Lightningbolt: {
    name: 'Lightningbolt',
    damage: 30,
    type: 'Electric',
    color: 'yellow',
    typeIcon: {
      src: './assets/newImages/icons/lightningbolt.png',
    },
  },
  Coconut: {
    name: 'Coconut',
    damage: 15,
    type: 'Normal',
    color: 'black',
    typeIcon: {
      src: './assets/newImages/icons/coconut.png',
    },
  },
  Waterball: {
    name: 'Waterball',
    damage: 25,
    type: 'Water',
    color: 'blue',
    typeIcon: {
      src: './assets/newImages/icons/waterball.png',
    },
  },
  java_Slash: {
    name: 'java_Slash',
    damage: 25,
    type: 'Normal',
    color: 'black',
    typeIcon: {
      src: './assets/newImages/icons/java slash.png',
    },
  },
  poisonous_Spit: {
    name: 'poisonous_Spit',
    damage: 30,
    type: 'Poison',
    color: 'green',
    typeIcon: {
      src: './assets/newImages/icons/acid spit.png',
    },
  },
  DarkArrow: {
    name: 'DarkArrow',
    damage: 25,
    type: 'Hypnosis',
    color: 'purple',
    typeIcon: {
      src: './assets/newImages/icons/dark arrow.png',
    },
  },
  Desintegrate: {
    name: 'Desintegrate',
    damage: 25,
    type: 'Separation',
    color: 'orange',
    typeIcon: {
      src: './assets/newImages/icons/desintegrate.png',
    },
  },
  FireBolt: {
    name: 'FireBolt',
    damage: 25,
    type: 'Magic',
    color: 'Red',
    typeIcon: {
      src: './assets/newImages/icons/fire bolt.png',
    },
  },
  IcyArrow: {
    name: 'IcyArrow',
    damage: 15,
    type: 'Magic',
    color: 'Blue',
    typeIcon: {
      src: './assets/newImages/icons/icy arrow.png',
    },
  },
  EarthBump: {
    name: 'EarthBump',
    damage: 10,
    type: 'Nature',
    color: 'Brown',
    typeIcon: {
      src: './assets/newImages/icons/earth bump.png',
    },
  },
  Punch: {
    name: 'Punch',
    damage: 20,
    type: 'Normal',
    color: 'Green',
    typeIcon: {
      src: './assets/newImages/icons/punch.png',
    },
  },
  ElectricStrike: {
    name: 'ElectricStrike',
    damage: 15,
    type: 'Electric',
    color: 'yellow',
    typeIcon: {
      src: './assets/newImages/icons/electric strike.png',
    },
  },
  TheDust: {
    name: 'TheDust',
    damage: 20,
    type: 'Nature',
    color: 'Brown',
    typeIcon: {
      src: './assets/newImages/icons/thedust.png',
    },
  },
  Slash: {
    name: 'Slash',
    damage: 20,
    type: 'Normal',
    color: 'Black',
    typeIcon: {
      src: './assets/newImages/icons/slash.png',
    },
  },
};

export default attacks;
