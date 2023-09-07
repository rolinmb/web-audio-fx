let audioCtx: AudioContext | undefined = undefined;
let renderingCtx: OfflineAudioContext | undefined = undefined;
let masterGain: GainNode | undefined = undefined;
let compressor: DynamicsCompressorNode | undefined = undefined;
let lowPass: BiquadFilterNode | undefined = undefined;
let highPass: BiquadFilterNode | undefined = undefined;
let distNode: WaveShaperNode | undefined = undefined;
let delayGain: GainNode | undefined = undefined;
let delayNode: DelayNode | undefined = undefined;
let preGain: GainNode | undefined = undefined;
let audioElement: HTMLAudioElement | undefined = undefined;
let paused: boolean = true;

document.getElementById('master-gain-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('master-gain-slider');
  let val: number = slider.valueAsNumber;
  masterGain!.gain.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('master-gain-view')!.innerHTML = 'Master Gain: '+val.toString()+' db';
});

document.getElementById('compressor-threshold-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('compressor-threshold-slider');
  let val: number = slider.valueAsNumber;
  compressor!.threshold.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('compressor-threshold-view')!.innerHTML = 'Compressor Threshold: '+val.toString()+' db';
});

document.getElementById('compressor-knee-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('compressor-knee-slider');
  let val: number = slider.valueAsNumber;
  compressor!.knee.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('compressor-knee-view')!.innerHTML = 'Compressor Knee: '+val.toString()+' db';
});

document.getElementById('compressor-ratio-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('compressor-ratio-slider');
  let val: number = slider.valueAsNumber;
  compressor!.ratio.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('compressor-ratio-view')!.innerHTML = 'Compressor Ratio: '+val.toString()+':1';
});

document.getElementById('compressor-attack-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('compressor-attack-slider');
  let val: number = slider.valueAsNumber;
  compressor!.attack.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('compressor-attack-view')!.innerHTML = 'Compressor Attack: '+val.toString()+' seconds';
});

document.getElementById('compressor-release-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('compressor-release-slider');
  let val: number = slider.valueAsNumber;
  compressor!.release.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('compressor-release-view')!.innerHTML = 'Compressor Release: '+val.toString()+' db';
});

document.getElementById('low-pass-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('low-pass-slider');
  let val: number = slider.valueAsNumber;
  lowPass!.frequency.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('low-pass-view')!.innerHTML = 'Low Pass Cutoff: '+val.toString()+' Hz';
});

document.getElementById('high-pass-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('high-pass-slider');
  let val: number = slider.valueAsNumber;
  highPass!.frequency.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('high-pass-view')!.innerHTML = 'High Pass Cutoff: '+val.toString()+' Hz';
});

function getDistortionCurve(amount: number, tone: number): Float32Array {
  const k: number = typeof amount === 'number' ? amount : 50;
  const n_samples: number = 44100;
  const curve: Float32Array = new Float32Array(n_samples);
  const distortionSelect = <HTMLSelectElement> document.getElementById('distortion-type-select');
  let distortionType: string = distortionSelect.value;
  switch (distortionType) {
    case 'default':
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / ((Math.PI + k * Math.abs(x)) * (1 + tone));
      }
      break;
    case 'hardclip':
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = Math.min(1, Math.max(-1, x * k));
      }
      break;
    case 'softclip':
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = Math.tanh(x * k);
      }
    case 'exponential':
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = Math.pow(Math.abs(x), k) * (x >= 0 ? 1 : -1);
      }
      break;
    case 'arctan':
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = (2 / Math.PI) * Math.atan(x * k);
      }
    default:
      for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / ((Math.PI + k * Math.abs(x)) * (1 + tone));
      }
      break;
  }
  
  return curve;
}

function updateDistortion() {
  const amountSlider = <HTMLInputElement> document.getElementById('distortion-amount-slider');
  let amountVal: number = amountSlider.valueAsNumber;
  const toneSlider = <HTMLInputElement> document.getElementById('distortion-tone-slider')
  let toneVal: number = toneSlider.valueAsNumber;
  distNode!.curve = getDistortionCurve(amountVal, toneVal);
  document.getElementById('distortion-amount-view')!.innerHTML = 'Distortion Amount: '+amountVal.toString();
  document.getElementById('distortion-tone-view')!.innerHTML = 'Distortion Tone: '+toneVal.toString();
}

document.getElementById('distortion-amount-slider')!.addEventListener('input', function() {
  updateDistortion();
});

document.getElementById('distortion-tone-slider')!.addEventListener('input', function() {
  updateDistortion();
});

document.getElementById('distortion-type-select')!.addEventListener('change', function() {
  const distortionSelect = <HTMLSelectElement> document.getElementById('distortion-type-select');
  let distortionType: string = distortionSelect.value;
  document.getElementById('distortion-type-view')!.innerHTML = "Distortion Type: "+distortionType;
  updateDistortion();
});

document.getElementById('delay-gain-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('delay-gain-slider');
  let val: number = slider.valueAsNumber;
  delayGain!.gain.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('delay-gain-view')!.innerHTML = 'Delay Gain: '+val.toString()+' db';
});

document.getElementById('delay-time-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('delay-time-slider');
  let val: number = slider.valueAsNumber;
  delayNode!.delayTime.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('delay-time-view')!.innerHTML = 'Delay Time: '+val.toString()+ ' seconds';
});

document.getElementById('pre-gain-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('pre-gain-slider');
  let val: number = slider.valueAsNumber;
  preGain!.gain.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('pre-gain-view')!.innerHTML = "Pre Gain: "+val.toString()+' db';
});

window.onload = function() {
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
  const masterGainSlider = <HTMLInputElement> document.getElementById('master-gain-slider');
  masterGainSlider.value = '1';

  compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
  compressor.knee.setValueAtTime(40, audioCtx.currentTime);
  compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0, audioCtx.currentTime);
  compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

  const compressorThresholdSlider = <HTMLInputElement> document.getElementById('compressor-threshold-slider');
  compressorThresholdSlider.value = '-50';
  const compressorKneeSlider = <HTMLInputElement> document.getElementById('compressor-knee-slider');
  compressorKneeSlider.value = '40';
  const compressorRatioSlider = <HTMLInputElement> document.getElementById('compressor-ratio-slider');
  compressorRatioSlider.value = '12';
  const compressorAttackSlider = <HTMLInputElement> document.getElementById('compressor-attack-slider');
  compressorAttackSlider.value = '0';
  const compressorReleaseSlider = <HTMLInputElement> document.getElementById('compressor-release-slider');
  compressorReleaseSlider.value = '0.25';

  lowPass = audioCtx.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.setValueAtTime(1000, audioCtx.currentTime);
  const lowPassSlider = <HTMLInputElement> document.getElementById('low-pass-slider');
  lowPassSlider.value = '1000';

  highPass = audioCtx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.setValueAtTime(1000, audioCtx.currentTime);
  const highPassSlider = <HTMLInputElement> document.getElementById('high-pass-slider');
  highPassSlider.value = '1000';

  distNode = audioCtx.createWaveShaper();
  distNode.curve = getDistortionCurve(0, 0.5);
  distNode.oversample = <OverSampleType>'2x';
  const distAmountSlider = <HTMLInputElement> document.getElementById('distortion-amount-slider');
  distAmountSlider.value = '0';

  const distToneSlider = <HTMLInputElement> document.getElementById('distortion-tone-slider');
  distToneSlider.value = '5';

  const distortionSelect = <HTMLSelectElement> document.getElementById('distortion-type-select');
  distortionSelect.style.display = 'none';

  delayGain = audioCtx.createGain();
  delayGain.gain.setValueAtTime(0, audioCtx.currentTime);
  const delayGainSlider = <HTMLInputElement> document.getElementById('delay-gain-slider');
  delayGainSlider.value = '0';

  delayNode = audioCtx.createDelay();
  delayNode.delayTime.setValueAtTime(0.25, audioCtx.currentTime);
  const delayTimeSlider = <HTMLInputElement> document.getElementById('delay-time-slider');
  delayTimeSlider.value = '0.25';

  preGain = audioCtx.createGain();
  preGain.gain.setValueAtTime(2, audioCtx.currentTime);
  const preGainSlider = <HTMLInputElement> document.getElementById('pre-gain-slider');
  preGainSlider.value = '2';

  const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
  scrubInput.value = '0';
  scrubInput.addEventListener('input', function() {
    audioElement!.currentTime = parseFloat(scrubInput.value);
  });
  scrubInput.addEventListener('loadedmetadata', function() {
    scrubInput.value = '0';
  });

  const paramWraps = document.getElementsByClassName('param-wrap') as HTMLCollectionOf<HTMLDivElement>;
  const paramViews = document.getElementsByClassName('fx-slider-view') as HTMLCollectionOf<HTMLHeadingElement>;
  const paramSliders = document.getElementsByClassName('fx-slider') as HTMLCollectionOf<HTMLInputElement>;
  for (let i = 0; i < paramWraps.length; i++) {
    paramWraps[i].style.display = 'none';
    if (i < paramWraps.length - 1) {
      paramViews[i].style.display = 'none';
      paramSliders[i].style.display = 'none';
    }
  }
}

function unhideElements() {
  const urlHeader = <HTMLHeadingElement> document.getElementById('audio-url-header');
  urlHeader.style.display = 'block';
  const paramWraps = document.getElementsByClassName('param-wrap') as HTMLCollectionOf<HTMLDivElement>;
  const paramViews = document.getElementsByClassName('fx-slider-view') as HTMLCollectionOf<HTMLHeadingElement>;
  const paramSliders = document.getElementsByClassName('fx-slider') as HTMLCollectionOf<HTMLInputElement>;
  for (let i = 0; i < paramWraps.length; i++) {
    paramWraps[i].style.display = 'block';
    if (i < paramWraps.length - 1) {
      paramViews[i].style.display = 'block';
      paramSliders[i].style.display = 'block';
    }
  }
  const distortionSelect = <HTMLSelectElement> document.getElementById('distortion-type-select');
  distortionSelect.style.display = 'block';
  const playPauseBtn = <HTMLButtonElement> document.getElementById('play-pause-btn');
  playPauseBtn.style.display = 'block';
  const scrubHeader = <HTMLHeadingElement> document.getElementById('scrub-info-header');
  scrubHeader.style.display = 'block';
  const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
  scrubInput.style.display = 'block';
  const renderBtn = <HTMLButtonElement> document.getElementById('render-audio-btn');
  renderBtn.style.display = 'block';
}

function handleAudioUpload() {
  const uploadBtn = <HTMLButtonElement> document.getElementById('audio-upload-btn');
  uploadBtn.innerHTML = 'Upload new .mp3';
  const audioFileInput = <HTMLInputElement> document.getElementById('audio-file-input'); 
  if (audioFileInput && audioFileInput.files && audioFileInput.files.length > 0) {
    if (audioFileInput.files.length > 1) {
      alert('Please select only one .mp3 file to edit.');
      audioFileInput.value = '';
      return;
    } else if (!audioFileInput.files[0].name.endsWith('.mp3')) {
      alert('Please select only .mp3 files to edit.');
      audioFileInput.value = '';
      return;
    }
    const audioFile = audioFileInput.files[0];
    const audioWebUrl = URL.createObjectURL(audioFile);
    audioElement = <HTMLAudioElement> document.getElementById('main-audio');
    audioElement.src = audioWebUrl;
    audioElement.load();
    const audioSourceNode = audioCtx!.createMediaElementSource(audioElement);
    audioSourceNode.connect(preGain!);                                  
    preGain!.connect(delayNode!).connect(delayGain!).connect(distNode!);
    preGain!.connect(distNode!);
    distNode!.connect(highPass!).connect(lowPass!).connect(compressor!).connect(masterGain!).connect(audioCtx!.destination);
    const urlHeader = <HTMLHeadingElement> document.getElementById('audio-url-header');
    urlHeader.innerHTML = 'Current .mp3 File: '+audioFile.name;
    if (urlHeader.style.display === 'none') {
      unhideElements();
    }
  } else {
    alert('Please select a .mp3 file to edit.');
    audioFileInput.value = '';
  }
}

function updateScrubInput() {
  const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
  scrubInput.value = audioElement!.currentTime.toString();
}

function handlePlayPause() {
  const playPauseBtn = <HTMLButtonElement> document.getElementById('play-pause-btn');
  const audioElement = <HTMLAudioElement> document.getElementById('main-audio');
  if ((audioElement && (!audioElement.src || audioElement.src === '')) || playPauseBtn.style.display === 'none') {
    alert('Cannot play/pause audio if no .mp3 file is selected.');
    return;
  }
  if (paused) {
    playPauseBtn.innerHTML = 'Pause .mp3';
    audioElement.play();
    const scrubInterval = setInterval(updateScrubInput, 100);
    audioElement.addEventListener('ended', function() {
      clearInterval(scrubInterval);
    });
  } else {
    playPauseBtn.innerHTML = 'Play .mp3';
    audioElement.pause();
  }
  paused = !paused;
}

async function loadAudioBuffer(): Promise<AudioBuffer> {
  try {
    const response = await fetch(audioElement!.src);
    const audioData = await response.arrayBuffer();
    return await audioCtx!.decodeAudioData(audioData);
  } catch (error) {
    console.error('Error loading uploaded audio into rendering buffer:', error);
    throw new Error('Error loading uploaded audio into rendering buffer: '+error);
  }
}

async function handleRenderAudio() {
  audioElement!.currentTime = 0;
  renderingCtx = new OfflineAudioContext(2, audioElement!.duration * audioCtx!.sampleRate, audioCtx!.sampleRate);
  const audioBuffer = await loadAudioBuffer();
  const renderingSource = renderingCtx.createBufferSource();
  renderingSource.buffer = audioBuffer;
  // create new rendering nodes from original AudioNode object fields
  const renderingMasterGain = renderingCtx.createGain();
  renderingMasterGain.gain.setValueAtTime(masterGain!.gain.value, renderingCtx!.currentTime);
  const renderingCompressor = renderingCtx.createDynamicsCompressor();
  renderingCompressor.threshold.setValueAtTime(compressor!.threshold.value, renderingCtx!.currentTime);
  renderingCompressor.knee.setValueAtTime(compressor!.knee.value, renderingCtx!.currentTime);
  renderingCompressor.ratio.setValueAtTime(compressor!.ratio.value, renderingCtx!.currentTime);
  renderingCompressor.attack.setValueAtTime(compressor!.attack.value, renderingCtx!.currentTime);
  renderingCompressor.release.setValueAtTime(compressor!.release.value, renderingCtx!.currentTime);
  const renderingLowPass = renderingCtx.createBiquadFilter();
  renderingLowPass.type = lowPass!.type;
  renderingLowPass.frequency.setValueAtTime(lowPass!.frequency.value, renderingCtx!.currentTime);
  const renderingHighPass = renderingCtx.createBiquadFilter();
  renderingHighPass.type = highPass!.type;
  renderingHighPass.frequency.setValueAtTime(highPass!.frequency.value, renderingCtx!.currentTime);
  const renderingDistNode = renderingCtx.createWaveShaper();
  renderingDistNode.curve = distNode!.curve;
  renderingDistNode.oversample = distNode!.oversample;
  const renderingDelayGain = renderingCtx.createGain();
  renderingDelayGain.gain.setValueAtTime(delayGain!.gain.value, renderingCtx!.currentTime);
  const renderingDelayNode = renderingCtx.createDelay();
  renderingDelayNode.delayTime.setValueAtTime(delayNode!.delayTime.value, renderingCtx!.currentTime);
  const renderingPreGain = renderingCtx.createGain();
  renderingPreGain.gain.setValueAtTime(preGain!.gain.value, renderingCtx!.currentTime);
  renderingSource.connect(renderingPreGain!);
  renderingPreGain!.connect(renderingDelayNode!).connect(renderingDelayGain!).connect(renderingDistNode!);
  renderingPreGain!.connect(renderingDistNode!);
  renderingDistNode!.connect(renderingHighPass!).connect(renderingLowPass!).connect(renderingCompressor!).connect(renderingMasterGain!).connect(renderingCtx.destination);
  // audioElement!.play();
  renderingCtx.startRendering().then((renderedBuffer) => {
    const renderingStatus = <HTMLHeadingElement> document.getElementById('render-status-view');
    if (renderingStatus.style.display === 'none') {
      renderingStatus.style.display = 'block';
    }
    /* // TODO: implement without lamejs
    const encoder = new lamejs.Mp3Encoder(2, audioCtx!.sampleRate, 128);
    const audioData = [];
    const leftChannel = renderedBuffer.getChannelData(0);
    const rightChannel = renderedBuffer.getChannelData(1);
    for (let i = 0; i < renderedBuffer.length; i += 1152) {
      const leftChunk = leftChannel.subarray(i, i + 1152);
      const rightChunk = rightChannel.subarray(i, i + 1152);
      const leftInts = new Int16Array(leftChunk.length);
      const rightInts = new Int16Array(rightChunk.length);
      const scale = 32767
      for (let j = 0; j < leftChunk.length; j++) {
        leftInts[j] = Math.max(-scale, Math.min(scale, leftChunk[j] * scale));
        rightInts[j] = Math.max(-scale, Math.min(scale, rightChunk[j] * scale));
      }
      const buf = encoder.encodeBuffer(leftInts, rightInts);
      if (buf.length > 0) {
        audioData.push(new Int8Array(buf));
      }
    }
    const audioBlob = new Blob(audioData, { type: 'audio/mp3' });
    const a = <HTMLAnchorElement> document.getElementById('download-rendered-link');
    a.href = URL.createObjectURL(audioBlob);
    a.download = "";
    if (a.style.display === 'none') {
      a.style.display = 'block';
    }
    */
    renderingStatus.innerHTML = 'Rendering Complete; click the link below to download the processed audio!';
  });
}

document.addEventListener('keydown', function(event) {
  if (event.key === ' ') {
    event.preventDefault();
    handlePlayPause();
  }
});

  /*
  const downloadDest = audioCtx!.createMediaStreamDestination();
  const recorder = new MediaRecorder(downloadDest.stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data)
    }
  };
  recorder.onstop = () => {
    const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
    const downloadLink = <HTMLAnchorElement> document.getElementById('rendered-audio-link');
    downloadLink.href = URL.createObjectURL(audioBlob);
    downloadLink.setAttribute('download', 'rendered_audio.mp3');
    downloadLink.style.display = 'block';
  };
  const downloadSourceNode = audioCtx!.createMediaElementSource(audioElement!);
  downloadSourceNode.connect(downloadDest);
  recorder.start();
  audioElement!.play();
  setTimeout(() => {
    recorder.stop();
    audioElement!.pause();
  }, audioElement!.duration * 1000);*/