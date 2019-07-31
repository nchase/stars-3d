import React from 'react';
import * as PIXI from 'pixi.js';
import { RGBSplitFilter, PixelateFilter } from 'pixi-filters';
import { TweenLite } from 'gsap';

import { updateGameObject } from './Game';

export class Graphic extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.windowWidth = calculateWidth(window.innerWidth);
    this.windowHeight = window.innerHeight;

    this.renderer = new PIXI.Renderer({
      backgroundColor: '0x1c2733',
    });
    this.refs.graphic && this.refs.graphic.appendChild(this.renderer.view);

    this.stage = new PIXI.Container();

    this.background = this.createBackground();

    this.stage.addChild(this.background);

    this.bindAudioEvents();

    this.animate();
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
      this.background.alpha = 0.6;
    });
  }

  // main animation loop; this function, which renders the scene via Pixi,
  // calls itself whenever `requestAnimationFrame` happens.
  animate = () => {
    this.windowWidth = calculateWidth(window.innerWidth);
    this.windowHeight = calculateHeight(this.windowWidth);
    this.stage.width = this.windowWidth;
    this.stage.height = this.windowHeight;

    this.renderer.resize(window.innerWidth, window.innerHeight);

    this.renderer.render(this.stage);
    this.frame = requestAnimationFrame(this.animate);
  };

  render() {
    return (
      <div className="flex">
        <div ref="graphic" {...this.props} />
      </div>
    );
  }

  createBackground() {
    var graphic = new PIXI.TilingSprite.from('./stars.png');
    graphic.width = 2000;
    graphic.height = 2000;

    graphic.alpha = 0.6;
    updateGameObject({ background: graphic });

    return graphic;
  }
}

function calculateWidth(windowWidth) {
  return windowWidth;
}

function calculateHeight(width) {
  // we should do this based on AR of the original image:
  return window.innerHeight;
}

export function updateBackgroundFilter(value, filter) {
  filter.red = [value * -20, 0];
  filter.green = [value, value];
  filter.blue = [value, value];
}
export function updateBackgroundPixelateFilter(value, filter) {
  filter.size = [value, value];
}
