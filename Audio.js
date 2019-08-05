import average from 'analyser-frequency-average';
import { TweenLite } from 'gsap';

import { logger } from './util';

import { createAudioContextContainer } from './AudioContextContainer';
import { GameState } from './Game';

export async function setupAudio(audioType) {
  const audioContextContainer = await createAudioContextContainer({ audioType });

  // we should only do these if the right objects exist:
  handleAudioBackgroundGraphicsUpdate(audioContextContainer.analyserNode);

  return audioContextContainer;
}

let onBeat = false;

export function handleAudioBackgroundGraphicsUpdate(analyserNode) {
  var dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  var { blinkersLarge, blinkersEtc, stars, env } = GameState.objects;

  analyserNode.getByteFrequencyData(dataArray);

  // tweak these to specify low-end, mid-range, high-end, etc.
  const minHz = 1;
  const maxHz = 20000;

  var avg = average(analyserNode, dataArray, minHz, maxHz);

  if (avg > 0.075) {
    //logger(avg);
  }

  if (document.querySelector('audio').paused === false && avg > 0) {
    blinkersLarge.forEach((blinker, index) => {
      const rand = Math.random();
      if (rand > 0.85 && rand <= 0.95) {
        TweenLite.to(blinker.sprite, 0.2, { alpha: Math.min(avg, 0.85) });
        TweenLite.to(blinker.sprite, 0.2, {
          rotation: blinker.sprite.rotation + Math.min(avg, 0.85),
        });
      } else if (rand >= 0.96) {
        const storedSize = {
          x: blinker.sprite.scale.x,
          y: blinker.sprite.scale.y,
        };

        // TweenLite.to(blinker.sprite.scale, 0.2, {
        //   x: blinker.sprite.scale.x * 2,
        //   y: blinker.sprite.scale.y * 2,
        // });

        // setTimeout(() => {
        //   console.log('reverting to ', storedSize);

        //   TweenLite.to(blinker.sprite.scale, 0.2, {
        //     x: storedSize.x,
        //     y: storedSize.y,
        //   });
        // }, 600);

        TweenLite.to(blinker.sprite, 0.2, { alpha: 1 });
      }
    });
    blinkersEtc.forEach((blinker, index) => {
      const rand = Math.random();
      if (rand > 0.9) {
        TweenLite.to(blinker.sprite, 0.2, { alpha: Math.min(avg, 0.7) });
      }
    });

    const secondsPerMeasure = 3.4929413476;
    const currentTime = document.querySelector('audio').currentTime;

    const factor = currentTime % secondsPerMeasure;
    if (factor > 0.5 && factor < 1 && onBeat === false) {
      console.log('time to go!!', factor, currentTime);
      onBeat = true;
      TweenLite.to(env, 0.2, { speed: avg * 20 });

      setTimeout(() => {
        TweenLite.to(env, 0.01, { speed: 0.05 });
        onBeat = false;
      }, 600);
    }
  }

  // this function updates the background shader according to the audio
  // analyser's data. whenever we update via request animation frame, we call
  // this and change the shader's value to what the audio data contains at
  // that time.
  requestAnimationFrame(() => handleAudioBackgroundGraphicsUpdate(analyserNode));
}
