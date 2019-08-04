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
    this.app = new PIXI.Application({
      resizeTo: window,
    });
    this.renderer = this.app.renderer;

    this.renderer.backgroundColor = '0x1c2733';

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
      //this.background.alpha = 0.6;
    });
  }

  // main animation loop; this function, which renders the scene via Pixi,
  // calls itself whenever `requestAnimationFrame` happens.
  animate = () => {
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
    var graphic = new PIXI.Container({});

    this.stars = [];
    this.blinkersLarge = [];
    this.blinkersEtc = [];

    window.stars = this.stars;

    for (let i = 0; i < window.innerWidth / 2.5; i++) {
      let star;
      // create a new Sprite
      if (i % 20 === 0) {
        star = PIXI.Sprite.from('./stars_particle-large.png');
      } else {
        star = PIXI.Sprite.from('./stars_particle.png');
      }

      // set the anchor point so the texture is centerd on the sprite
      star.anchor.set(0.5);

      // scatter them all
      star.x = Math.random() * window.innerWidth;
      star.y = Math.random() * window.innerHeight;

      star.offset = Math.random() * 100;
      star.alpha = Math.min(Math.random(), 0.75);

      this.stars.push(star);

      if (i % 20 === 0) {
        this.blinkersLarge.push(star);
      }
      if (i % 12 === 0) {
        this.blinkersEtc.push(star);
      }

      graphic.addChild(star);
    }

    updateGameObject({ background: graphic });
    updateGameObject({ blinkersLarge: this.blinkersLarge });
    updateGameObject({ blinkersEtc: this.blinkersEtc });

    return graphic;
  }
}

export function updateBackgroundFilter(value, filter) {
  filter.red = [value * -20, 0];
  filter.green = [value, value];
  filter.blue = [value, value];
}
export function updateBackgroundPixelateFilter(value, filter) {
  filter.size = [value, value];
}
