import React from 'react';
import * as PIXI from 'pixi.js';
import { RGBSplitFilter, PixelateFilter } from 'pixi-filters';
import { TweenLite } from 'gsap';

import { updateGameObject } from './Game';

let cameraZ = 0;
const fov = 20;
const baseSpeed = 0.025;
let speed = 40;
let warpSpeed = 0;
const starStretch = 5;
const starBaseSize = 4;

export class Graphic extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.app = new PIXI.Application({
      resizeTo: window,
    });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.renderer = this.app.renderer;

    this.renderer.backgroundColor = '0x1c2733';

    this.refs.graphic && this.refs.graphic.appendChild(this.renderer.view);

    this.stage = this.app.stage;

    this.background = this.createBackground();

    this.stage.addChild(this.background);

    this.bindAudioEvents();

    // put it on spin cycle and assign to something local in case we ever need to use it:
    this.app.ticker.add(this.animate);
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

  // main animation loop; this function, which renders the scene via Pixi,
  // calls itself whenever `requestAnimationFrame` happens.

  animate = delta => {
    this.renderer.render(this.stage);

    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      if (star.z < cameraZ) {
        randomizeStar(star);
      }

      // Map star 3d position to 2d with really simple projection
      const z = star.z - cameraZ;
      star.sprite.x =
        star.x * (fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.width / 2;
      star.sprite.y =
        star.y * (fov / z) * this.app.renderer.screen.width + this.app.renderer.screen.height / 2;

      // Calculate star scale & rotation.
      const dxCenter = star.sprite.x - this.app.renderer.screen.width / 2;
      const dyCenter = star.sprite.y - this.app.renderer.screen.height / 2;
      const distanceCenter = Math.sqrt(dxCenter * dxCenter + dyCenter + dyCenter);
      const distanceScale = Math.max(0, (2000 - z) / 2000);
      star.sprite.scale.x = distanceScale * starBaseSize;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is and depending on how far away it is from the center.
      star.sprite.scale.y =
        distanceScale * starBaseSize +
        (distanceScale * speed * starStretch * distanceCenter) / this.app.renderer.screen.width;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
  };

  render() {
    return (
      <div className="flex">
        <div ref="graphic" {...this.props} />
      </div>
    );
  }

  generateStars = () => {
    for (let i = 0; i < window.innerWidth / 1.5; i++) {
      const star = {
        sprite: new PIXI.Sprite.from('./stars_particle.png'),
        z: 0,
        x: 0,
        y: 0,
      };
      star.sprite.anchor.x = 0.5;
      star.sprite.anchor.y = 0.7;

      randomizeStar(star, true);

      star.sprite.scale.set(0.5 + Math.random());

      star.sprite.rotation = Math.random();

      star.sprite.alpha = Math.min(Math.random(), 0.75);

      this.stars.push(star);

      if (star.sprite.alpha >= 0.75) {
        this.blinkersLarge.push(star);
      }
      if (i % 12 === 0 && star.sprite.alpha < 0.75) {
        this.blinkersEtc.push(star);
      }

      this.graphic.addChild(star.sprite);
    }
  };

  createBackground() {
    var graphic = (this.graphic = new PIXI.Container({}));

    this.stars = [];
    this.blinkersLarge = [];
    this.blinkersEtc = [];

    window.stars = this.stars;

    this.generateStars();

    updateGameObject({ background: graphic });
    updateGameObject({ blinkersLarge: this.blinkersLarge });
    updateGameObject({ blinkersEtc: this.blinkersEtc });
    updateGameObject({ stars: this.stars });

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

function randomizeStar(star, initial) {
  star.z = initial ? Math.random() * 2000 : cameraZ + Math.random() * 1000 + 2000;

  // Calculate star positions with radial random coordinate so no star hits the camera.
  const deg = Math.random() * Math.PI * 2;
  const distance = Math.random() * 50 + 1;
  star.x = Math.cos(deg) * distance;
  star.y = Math.sin(deg) * distance;
}
