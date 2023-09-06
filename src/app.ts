let audioCtx: AudioContext | undefined = undefined;
let masterGain: GainNode | undefined = undefined;
let compressor: DynamicsCompressorNode | undefined = undefined;
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

function getDistortionCurve(amount: number): Float32Array {
  const k: number = typeof amount === 'number' ? amount : 50;
  const n_samples: number = 44100;
  const curve: Float32Array = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; i++) {
    const x: number = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

document.getElementById('distortion-amount-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('distortion-amount-slider');
  let val: number = slider.valueAsNumber;
  distNode!.curve = getDistortionCurve(val);
  document.getElementById('distortion-amount-view')!.innerHTML = 'Distortion Amount: '+val.toString();
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

  distNode = audioCtx.createWaveShaper();
  distNode.curve = getDistortionCurve(0);
  distNode.oversample = <OverSampleType>'2x';
  const distSlider = <HTMLInputElement> document.getElementById('distortion-amount-slider');
  distSlider.value = '0';

  delayGain = audioCtx.createGain();
  delayGain.gain.setValueAtTime(0, audioCtx.currentTime);
  const delayGainSlider = <HTMLInputElement> document.getElementById('delay-gain-slider');
  delayGainSlider.value = '0';

  delayNode = audioCtx.createDelay();
  delayNode.delayTime.setValueAtTime(0.25, audioCtx.currentTime);
  const delayTimeSlider = <HTMLInputElement> document.getElementById('delay-time-slider');
  delayTimeSlider.value = '0.25';

  preGain = audioCtx.createGain();
  preGain.gain.setValueAtTime(5, audioCtx.currentTime);
  const preGainSlider = <HTMLInputElement> document.getElementById('pre-gain-slider');
  preGainSlider.value = '5';

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
  for (let i = 0; i < paramViews.length; i++) {
    paramWraps[i].style.display = 'none';
    paramViews[i].style.display = 'none';
    paramSliders[i].style.display = 'none';
  }
}

function unhideElements() {
  const urlHeader = <HTMLHeadingElement> document.getElementById('audio-url-header');
  urlHeader.style.display = 'block';
  const paramWraps = document.getElementsByClassName('param-wrap') as HTMLCollectionOf<HTMLDivElement>;
  const paramViews = document.getElementsByClassName('fx-slider-view') as HTMLCollectionOf<HTMLHeadingElement>;
  const paramSliders = document.getElementsByClassName('fx-slider') as HTMLCollectionOf<HTMLInputElement>;
  for (let i = 0; i < paramViews.length; i++) {
    paramWraps[i].style.display = 'block';
    paramViews[i].style.display = 'block';
    paramSliders[i].style.display = 'block';
  }

  /*
  document.getElementById('master-gain-view')!.style.display = 'block';
  document.getElementById('master-gain-slider')!.style.display = 'block';
  document.getElementById('compressor-threshold-view')!.style.display = 'block';
  document.getElementById('compressor-threshold-slider')!.style.display = 'block';
  document.getElementById('compressor-knee-view')!.style.display = 'block';
  document.getElementById('compressor-knee-slider')!.style.display = 'block';
  document.getElementById('compressor-ratio-view')!.style.display = 'block';
  document.getElementById('compressor-ratio-slider')!.style.display = 'block';
  document.getElementById('compressor-attack-view')!.style.display = 'block';
  document.getElementById('compressor-attack-slider')!.style.display = 'block';
  document.getElementById('compressor-release-view')!.style.display = 'block';
  document.getElementById('compressor-release-slider')!.style.display = 'block';
  document.getElementById('distortion-amount-view')!.style.display = 'block';
  document.getElementById('distortion-amount-slider')!.style.display = 'block';
  document.getElementById('delay-gain-view')!.style.display = 'block';
  document.getElementById('delay-gain-slider')!.style.display = 'block';
  document.getElementById('delay-time-view')!.style.display = 'block';
  document.getElementById('delay-time-slider')!.style.display = 'block';
  document.getElementById('pre-gain-view')!.style.display = 'block';
  document.getElementById('pre-gain-slider')!.style.display = 'block';
  */
  const playPauseBtn = <HTMLButtonElement> document.getElementById('play-pause-btn');
  playPauseBtn.style.display = 'block';
  const scrubHeader = <HTMLHeadingElement> document.getElementById('scrub-info-header');
  scrubHeader.style.display = 'block';
  const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
  scrubInput.style.display = 'block';
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
    audioSourceNode.connect(preGain!);                                   // Dry
    preGain!.connect(delayNode!).connect(delayGain!).connect(distNode!); // "Wet"
    preGain!.connect(distNode!);                                         // "Dry"
    distNode!.connect(masterGain!).connect(audioCtx!.destination);       // Master Gain = Master Bus / Mix
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

document.addEventListener('keydown', function(event) {
  if (event.key === ' ') {
    event.preventDefault();
    handlePlayPause();
  }
});