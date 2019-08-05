import React from 'react';

import Graphic from './Graphic';
import { setupAudioContext } from './Audio';
import { updateGameObject } from './Game';

export default class M extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.bindAudioEvents();
  }

  setupAndPlay(el) {
    if (!this.audioContext) {
      this.audioContext = setupAudioContext();
    }

    el.play();
  }

  bindAudioEvents() {
    window.Events.on('playing', audioEl => {
      console.log('playing');
    });

    window.Events.on('seeking', audioEl => {
      console.log('seeking');
    });

    window.Events.on('paused', audioEl => {
      console.log('paused');
    });
  }

  handleClick = async event => {
    event.preventDefault();

    const el = document.querySelector('audio');
    el.paused ? this.setupAndPlay(el) : el.pause();
  };

  render() {
    return (
      <>
        <a
          className="f1"
          href="#"
          onClick={this.handleClick}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
          }}
        />

        <audio ref="audioEl" className={'dn'} src={this.props.audio} controls />

        <Graphic className="pointer" onClick={this.handleClick} />
      </>
    );
  }
}
