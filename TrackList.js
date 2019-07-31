var React = require('react');
var Track = require('./Track');

module.exports = function TrackList(props) {
  if (!props.tracks) {
    return null;
  }

  return (
    <div className={props.className}>
      {props.tracks.map(function(track, index) {
        return (
          <Track
            key={track.source}
            src={track.source}
            index={index}
            activeTrack={props.activeTrack}
            setActiveTrack={props.setActiveTrack}
            togglePlayback={props.togglePlayback}
            {...track}
          />
        );
      })}
    </div>
  );
};
