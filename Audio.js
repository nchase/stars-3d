import average from 'analyser-frequency-average';

import { logger } from './util';

import { createAudioContextContainer } from './AudioContextContainer';
import { GameState } from './Game';

export async function setupAudio(audioType) {
  const audioContextContainer = await createAudioContextContainer({ audioType });

  // we should only do these if the right objects exist:
  handleAudioBackgroundGraphicsUpdate(audioContextContainer.analyserNode);

  return audioContextContainer;
}

export function handleAudioBackgroundGraphicsUpdate(analyserNode) {
  var dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  var { background, blinkersLarge, blinkersEtc } = GameState.objects;

  analyserNode.getByteFrequencyData(dataArray);

  // tweak these to specify low-end, mid-range, high-end, etc.
  const minHz = 1;
  const maxHz = 20000;

  var avg = average(analyserNode, dataArray, minHz, maxHz);

  if (avg > 0.075) {
    logger(avg);
  }

  if (document.querySelector('audio').paused === false) {
    blinkersLarge.forEach((blinker, index) => {
      const rand = Math.random();
      if (rand > 0.99) {
        blinker.alpha = avg;
      }
    });
    blinkersEtc.forEach((blinker, index) => {
      const rand = Math.random();
      if (rand > 0.9) {
        blinker.alpha = avg;
      }
    });
  }

  // this function updates the background shader according to the audio
  // analyser's data. whenever we update via request animation frame, we call
  // this and change the shader's value to what the audio data contains at
  // that time.
  requestAnimationFrame(() => handleAudioBackgroundGraphicsUpdate(analyserNode));
}
