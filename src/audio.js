/* global Howl */
// Это чтобы линтер не жаловался на Howl
const audio = {
  map: new Howl({
    src: './assets/Audio/ABeachTune.wav', // путь до музыки или звука
    html5: true,
    volume: 0.5, // громкость. менять по необходимости в диапозоне 0.1 - 1
  }),
  initBattle: new Howl({
    src: './assets/Audio/initBattle.wav',
    volume: 0.1,
  }),
  battle: new Howl({
    src: './assets/Audio/Fighting.wav',
    volume: 0.4,
  }),
  tackleHit: new Howl({
    src: './assets/Audio/tackleHit.wav',
    volume: 0.3,
  }),
  fireballHit: new Howl({
    src: './assets/Audio/fireballHit.wav',
    volume: 0.5,
  }),
  initFireball: new Howl({
    src: './assets/Audio/initFireball.wav',
    volume: 0.3,
  }),
  victory: new Howl({
    src: './assets/Audio/victory.wav',
    volume: 1,
  }),
};

export default audio;
