const snowflakes = [];
let audioContext;
let ambientNode;

const createSnowflake = () => {
  const element = document.createElement('div');
  element.className = 'snowflake';
  element.style.left = `${Math.random() * 100}%`;
  element.style.animationDuration = `${6 + Math.random() * 6}s`;
  element.style.opacity = `${0.3 + Math.random() * 0.5}`;
  document.body.appendChild(element);
  snowflakes.push(element);
};

const playAmbient = () => {
  if (ambientNode) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioContext = audioContext || new Ctx();
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    output[i] = (Math.random() * 2 - 1) * 0.2;
  }

  const noise = audioContext.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.7;

  const gain = audioContext.createGain();
  gain.gain.value = 0.18;

  noise.connect(filter).connect(gain).connect(audioContext.destination);
  noise.start(0);
  ambientNode = { noise, gain };
};

const stopAmbient = () => {
  if (ambientNode) {
    ambientNode.noise.stop(0);
    ambientNode = null;
  }
};

export const enableWinter = () => {
  Array.from({ length: 32 }).forEach(createSnowflake);
  playAmbient();
};

export const disableWinter = () => {
  snowflakes.splice(0).forEach((flake) => flake.remove());
  stopAmbient();
};

document.body.addEventListener('winter:disable', disableWinter);
