import { AudioContext } from 'standardized-audio-context';

// container is a good model for the data that we have. audiotype here is useless though
export async function createAudioContextContainer({ audioType }) {
  const audioContext = new AudioContext();

  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = Math.pow(2, 11);

  const audioSources = connectElementNodes(audioContext, analyserNode);

  // give the context, a list of interactive <audio> elements,
  // and our data emitter to the caller:
  return { audioContext, audioSources, analyserNode };
}

function connectElementNodes(audioContext, analyserNode) {
  const audioSources = [];

  // find all `<audio>` elements on the page:
  for (const source of document.querySelectorAll('audio')) {
    // create a source of type audioNode for each found `<audio>` element[^1][^2]:
    const audioNode = audioContext.createMediaElementSource(source);

    // connect each audioNode to the context's output:
    audioNode.connect(audioContext.destination);
    //  and also send each audioNode's data to our analyser:
    audioNode.connect(analyserNode);

    audioSources.push({
      mediaElement: source,
      audioNode,
    });
  }

  return audioSources;
}

async function connectDeviceStreamNodes(audioContext, analyserNode) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const audioNode = audioContext.createMediaStreamSource(stream);
  // don't wire audio to destination in this case to avoid feedback loop mess:
  // use gain node to silence audio, send gain to output:
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;
  audioNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  audioNode.connect(analyserNode);

  return [{ audioNode: audioNode }];
}

// [^1]: MDN's WebAudio API Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
// [^2]: AudioNode Specification: https://webaudio.github.io/web-audio-api/#audionode
