import React from 'react';
import { AudioContext } from 'standardized-audio-context';

import { Graphic } from './Graphic';
import { handleAudioBackgroundGraphicsUpdate } from './Audio';
import { updateGameObject } from './Game';

export default class M extends React.Component {
  constructor(props) {
    super(props);
  }

  setupAudioContext() {
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

    this.audioContext = audioContext;
  }

  setupAndPlay(el) {
    if (!this.audioContext) {
      this.setupAudioContext();
    }

    el.play();
  }

  render() {
    return (
      <>
        <a
          className="f1"
          href="#"
          onClick={async event => {
            event.preventDefault();

            const el = document.querySelector('audio');
            el.paused ? this.setupAndPlay(el) : el.pause();
            await window.fetch('/foo' + +new Date());
          }}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />

        <audio ref="audioEl" className={'dn'} src={this.props.audio} loop controls />

        <Graphic
          className="pointer"
          onClick={async () => {
            const el = document.querySelector('audio');
            el.paused ? this.setupAndPlay(el) : el.pause();
            await window.fetch('/foo' + +new Date());
          }}
        />
      </>
    );
  }
}
