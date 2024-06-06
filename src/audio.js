const audio = {
  map: new Howl({
    src: './assets/Audio/map.wav',
    html5: true,
    volume: 0.5,
  }),
  initBattle: new Howl({
    src: './assets/Audio/initBattle.wav',
    volume: 0.1,
  }),
  battle: new Howl({
    src: './assets/Audio/battle.mp3',
    volume: 0.4,
  }),
  tackleHit: new Howl({
    src: './assets/Audio/tackleHit.mp3',
    volume: 0.3,
  }),
  fireballHit: new Howl({
    src: './assets/Audio/fireballHit.mp3',
    volume: 0.2,
  }),
  initFireball: new Howl({
    src: './assets/Audio/initFireball.mp3',
    volume: 0.3,
  }),
  victory: new Howl({
    src: './assets/Audio/victory.mp3',
    volume: 1,
  }),
};

export default audio;
