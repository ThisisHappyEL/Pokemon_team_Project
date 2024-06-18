/* global Howl */
// Это чтобы линтер не жаловался на Howl
const audio = {
  map: new Howl({
    src: './assets/Audio/newAudio/ABeachTune.wav', // путь до музыки или звука
    html5: true,
    volume: 0.2, // громкость. менять по необходимости в диапозоне 0.1 - 1
  }),
  initBattle: new Howl({
    src: './assets/Audio/newAudio/StartFight.wav',
    volume: 0.5,
  }),
  battle: new Howl({
    src: './assets/Audio/newAudio/Fighting1.wav',
    volume: 0.2,
  }),
  victory: new Howl({
    src: './assets/Audio/newAudio/Win1.wav',
    volume: 0.3,
  }),
  lose: new Howl({
    src: './assets/Audio/newAudio/LOSS.wav',
    volume: 0.5,
  }),
  tackleHit: new Howl({
    src: './assets/Audio/oldAudio/tackleHit.wav',
    volume: 0.3,
  }),
  initFireball: new Howl({
    src: './assets/Audio/oldAudio/initFireball1.wav',
    volume: 0.3,
  }),
  fireballHit: new Howl({
    src: './assets/Audio/oldAudio/fireballHit.wav',
    volume: 0.5,
  }),
  initCoconut: new Howl({
    src: './assets/Audio/newAudio/coconutThrow/coconut_flight1.wav',
    volume: 1,
  }),
  coconutHit: new Howl({
    src: './assets/Audio/newAudio/coconutThrow/coconut_punch.wav',
    volume: 1,
  }),
  darkArrow: new Howl({
    src: './assets/Audio/newAudio/darkArrow/somatikaHit.wav',
    volume: 1,
  }),
  frogPunch: new Howl({
    src: './assets/Audio/newAudio/frogPunch/FrogThrow.wav',
    volume: 1,
  }),
  frogThrow: new Howl({
    src: './assets/Audio/newAudio/frogThrow/snot.wav',
    volume: 1,
  }),
  waterball: new Howl({
    src: './assets/Audio/newAudio/waterball/waterboll.wav',
    volume: 1,
  }),
};

export default audio;
