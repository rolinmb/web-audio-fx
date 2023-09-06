var audioCtx: AudioContext | undefined = undefined;
var distNode: WaveShaperNode | undefined = undefined;
var paused: boolean = true;

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

window.onload = function() {
  audioCtx = new AudioContext();
  distNode = audioCtx.createWaveShaper();
  distNode.curve = getDistortionCurve(0);
  distNode.oversample = <OverSampleType>'2x';
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
    const urlHeader = <HTMLHeadingElement> document.getElementById('audio-url-header');
    urlHeader.innerHTML = 'Current .mp3 File: '+audioFile.name;
    if (urlHeader.style.display === 'none') {
      urlHeader.style.display = 'block';
    }
    const audioWebUrl = URL.createObjectURL(audioFile);
    const audioElement = <HTMLAudioElement> document.getElementById('main-audio');
    audioElement.src = audioWebUrl;
    audioElement.load();
    const playPauseBtn = <HTMLButtonElement> document.getElementById('play-pause-btn');
    playPauseBtn.style.display = 'block';
  } else {
    alert('Please select a .mp3 file to edit.');
    audioFileInput.value = '';
  }
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
  } else {
    playPauseBtn.innerHTML = 'Play .mp3';
    audioElement.pause();
  }
  paused = !paused;
}