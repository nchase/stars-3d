import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'events';

import './index.css';

import App from './App';

window.Events = new EventEmitter();

import { InitSettings, GameState } from './Game';

InitSettings(GameState);

ReactDOM.render(<App audio={'./audio/2019-05-29-a-gift.mp3'} />, document.getElementById('app'));

// 1. just make it full screen
// 2. tapping anywhere on the screen stops or starts the playback
// 3. everything else.
