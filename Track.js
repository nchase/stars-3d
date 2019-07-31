import React from 'react';
import { format as dateFormat } from 'date-fns';

module.exports = class Track extends React.Component {
  handleTimeUpdate(event) {
    const { audioEl } = this.refs;

    if (!audioEl) {
      return null;
    }

    const currentProgress = (audioEl.currentTime / audioEl.duration) * 100;

    this.setState({
      progress: `${currentProgress}%`,
    });
  }

  changeCurrentTime(event) {
    if (this.refs.audioEl.paused) {
      return false;
    }

    var progressBarElDims = event.currentTarget.getBoundingClientRect();

    var desiredDistance = event.clientX - progressBarElDims.left;

    var distanceRatio = desiredDistance / progressBarElDims.width;

    return (this.refs.audioEl.currentTime = distanceRatio * this.refs.audioEl.duration);
  }

  constructor(props) {
    super(props);

    this.state = {
      progress: 0,
    };
  }

  componentDidMount() {
    const { audioEl } = this.refs;

    audioEl.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
    audioEl.addEventListener('seeking', () => window.Events.emit('seeking', this.refs.audioEl));
    audioEl.addEventListener('playing', () => {
      window.Events.emit('playing', this.refs.audioEl);
    });
  }

  componentWillUnmount() {
    this.refs.audioEl.removeEventListener('timeupdate', this.handleTimeUpdate.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTrack, src: trackSrc } = this.props;
    if (activeTrack.props.src !== trackSrc) {
      this.refs.audioEl.pause();
    }
  }

  startTogglePlayback() {
    const { audioEl } = this.refs;

    if (audioEl.paused) {
      return audioEl.play();
    }

    audioEl.currentTime = 0;

    audioEl.play();
  }

  pauseTogglePlayback() {
    const { audioEl } = this.refs;

    if (audioEl.paused) {
      return audioEl.play();
    }

    return audioEl.pause();
  }

  renderCurrentTime() {
    if (!this.refs.audioEl) {
      return '00:00';
    }

    return `${dateFormat(this.refs.audioEl.currentTime * 1000, 'mm[:]ss')}`;
  }

  renderDuration() {
    if (!this.refs.audioEl) {
      return '00:00';
    }

    if (!this.refs.audioEl.duration) {
      return '00:00';
    }

    return `${dateFormat(this.refs.audioEl.duration * 1000, 'mm[:]ss')}`;
  }

  renderPlayButton() {
    return (
      <div
        onClick={() => {
          this.startTogglePlayback();
        }}
        className="dib mr2"
      >
        {'>'}
      </div>
    );
  }
  renderPauseButton() {
    return (
      <div
        onClick={() => {
          this.pauseTogglePlayback();
        }}
        className="dib mr2"
      >
        {'-'}
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="pointer flex-ns items-center justify-between mb3">
          <div
            onClick={() => {
              this.props.setActiveTrack(this.refs.audioEl, this.props);
            }}
            className="flex w-100"
          >
            <div
              className="mr3 dib w-25"
              style={{
                fontFamily: 'monospace',
                fontSize: '16px',
              }}
            >
              {this.renderPlayButton()}
              {this.renderPauseButton()}
            </div>

            <div className="w-100">Track {this.props.index}</div>

            <div className="w-100 nowrap">
              {`${this.renderCurrentTime()}
               /
               ${this.renderDuration()}`}
            </div>
          </div>
          <div className="bg-gray w-100 h1" onMouseDown={this.changeCurrentTime.bind(this)}>
            <div
              className="bg-black h-100"
              style={{
                width: this.state.progress,
              }}
            />
          </div>
        </div>
        <audio
          ref="audioEl"
          className={process.env.debug ? 'db' : 'dn'}
          src={this.props.src}
          loop
          controls
        />
      </div>
    );
  }
};
