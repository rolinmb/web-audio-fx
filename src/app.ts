let audioCtx: AudioContext | undefined = undefined;
let masterGain: GainNode | undefined = undefined;
let distNode: WaveShaperNode | undefined = undefined;
let preGain: GainNode | undefined = undefined;
let audioElement: HTMLAudioElement | undefined = undefined;
let paused: boolean = true;

document.getElementById('master-gain-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('master-gain-slider');
  let val: number = slider.valueAsNumber;
  masterGain!.gain.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('master-gain-view')!.innerHTML = 'Master Gain: '+val.toString();
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

document.getElementById('pre-gain-slider')!.addEventListener('input', function() {
  const slider = <HTMLInputElement> document.getElementById('pre-gain-slider');
  let val: number = slider.valueAsNumber;
  preGain!.gain.setValueAtTime(val, audioCtx!.currentTime);
  document.getElementById('pre-gain-view')!.innerHTML = "Pre Gain: "+val.toString();
});

window.onload = function() {
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
  const masterGainSlider = <HTMLInputElement> document.getElementById('master-gain-slider');
  masterGainSlider.value = '1';

  distNode = audioCtx.createWaveShaper();
  distNode.curve = getDistortionCurve(0);
  distNode.oversample = <OverSampleType>'2x';
  const distSlider = <HTMLInputElement> document.getElementById('distortion-amount-slider');
  distSlider.value = '0';

  preGain = audioCtx.createGain();
  preGain.gain.setValueAtTime(10, audioCtx.currentTime);
  const preGainSlider = <HTMLInputElement> document.getElementById('pre-gain-slider');
  preGainSlider.value = '10';

  const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
  scrubInput.value = '0';
  scrubInput.addEventListener('input', function() {
    audioElement!.currentTime = parseFloat(scrubInput.value);
  });
  scrubInput.addEventListener('loadedmetadata', function() {
    scrubInput.value = '0';
  });
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
    const audioSourceNode = audioCtx!.createMediaElementSource(audioElement); // FX routing for processing
    audioSourceNode.connect(preGain!).connect(distNode!).connect(masterGain!).connect(audioCtx!.destination);
    const urlHeader = <HTMLHeadingElement> document.getElementById('audio-url-header');
    urlHeader.innerHTML = 'Current .mp3 File: '+audioFile.name;
    if (urlHeader.style.display === 'none') { // Making hidden elements visible
      urlHeader.style.display = 'block';
      document.getElementById('master-gain-view')!.style.display = 'block';
      document.getElementById('master-gain-slider')!.style.display = 'block';
      document.getElementById('distortion-amount-view')!.style.display = 'block';
      document.getElementById('distortion-amount-slider')!.style.display = 'block';
      document.getElementById('pre-gain-view')!.style.display = 'block';
      document.getElementById('pre-gain-slider')!.style.display = 'block';
      const playPauseBtn = <HTMLButtonElement> document.getElementById('play-pause-btn');
      playPauseBtn.style.display = 'block';
      const scrubInput = <HTMLInputElement> document.getElementById('audio-scrub-input');
      scrubInput.style.display = 'block';
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