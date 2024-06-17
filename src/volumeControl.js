/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', () => {
  const volumeButton = document.getElementById('volumeButton');
  const volumeOptions = document.getElementById('volumeOptions');
  const volumeButtons = document.querySelectorAll('.volume-option');

  volumeButton.addEventListener('click', () => {
    volumeOptions.style.display = volumeOptions.style.display === 'flex' ? 'none' : 'flex';
  });

  volumeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const volume = parseFloat(event.target.dataset.volume);
      Howler.volume(volume);
      volumeOptions.style.display = 'none';
    });
  });

  document.addEventListener('click', (event) => {
    if (!volumeButton.contains(event.target) && !volumeOptions.contains(event.target)) {
      volumeOptions.style.display = 'none';
    }
  });
});
