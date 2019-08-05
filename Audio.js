import average from 'analyser-frequency-average';
import { AudioContext } from 'standardized-audio-context';
import { TweenLite } from 'gsap';

import { logger } from './util';

import { createAudioContextContainer } from './AudioContextContainer';
import { GameState } from './Game';

let beatLocked = false;

export function setupAudioContext() {
  const audioContext = new AudioContext();

  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = Math.pow(2, 11);

  audioContext.analyserNode = analyserNode;

  for (const source of document.querySelectorAll('audio')) {
    // why does creating media element source make this go to hell
    // create a source of type audioNode for each found `<audio>` element[^1][^2]:
    const audioNode = audioContext.createMediaElementSource(source);

    source.addEventListener('seeking', () => window.Events.emit('seeking', source));
    source.addEventListener('playing', () => {
      window.Events.emit('playing', source);
    });
    source.addEventListener('pause', () => {
      window.Events.emit('paused', source);
    });

    // connect each audioNode to the context's output:
    audioNode.connect(audioContext.destination);

    //  and also send each audioNode's data to our analyser:
    audioNode.connect(analyserNode);
  }

  handleAudioBackgroundGraphicsUpdate(audioContext.analyserNode);

  return audioContext;
}

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
    if (factor > 0.5 && factor < 1 && beatLocked === false && avg > 0.33) {
      console.log(avg, 'time to go!!', factor, currentTime);
      beatLocked = true;
      TweenLite.to(env, 0.2, { speed: avg * 20 });

      setTimeout(() => {
        TweenLite.to(env, 0.01, { speed: 0.05 });
      }, 600);

      setTimeout(() => {
        beatLocked = false;
      }, 1200);
    }
  }

  // this function updates the background shader according to the audio
  // analyser's data. whenever we update via request animation frame, we call
  // this and change the shader's value to what the audio data contains at
  // that time.
  requestAnimationFrame(() => handleAudioBackgroundGraphicsUpdate(analyserNode));
}
