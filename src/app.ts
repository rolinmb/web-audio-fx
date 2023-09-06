var audioCtx = AudioContext || undefined;
var paused: boolean = true;

function handleAudioUpload() {
  const audioFileInput = document.getElementById('audio-file-input') as HTMLInputElement; 
  if (audioFileInput && audioFileInput.files && audioFileInput.files.length > 0) {
    if (audioFileInput.files.length > 1) {
        alert('Please select only one .mp3 file to edit.');
        audioFileInput.value = '';
        return;
    }
    const audioFile = audioFileInput.files[0];
    const audioWebUrl = URL.createObjectURL(audioFile);
    const audioElement = document.getElementById('main-audio') as HTMLAudioElement;
    audioElement.src = audioWebUrl;
    audioElement.load();
    audioElement.style.display = 'block';
    const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
    playPauseBtn.style.display = 'block';
  } else {
    alert('Please select a .mp3 file to edit.');
    audioFileInput.value = '';
  }
}

function handlePlayPause() {
  const playPauseBtn = document.getElementById('play-pause-btn') as HTMLButtonElement;
  const audioElement = document.getElementById('main-audio') as HTMLAudioElement;
  if ((audioElement && (!audioElement.src || audioElement.src === '')) || playPauseBtn.style.display === 'none' || audioElement.style.display === 'none') {
    alert('Cannot play/pause audio if no .mp3 file is selected.');
    return;
  }
  paused = !paused; // if paused = true; now paused = false (were paused, now play)
  if (paused) { // were just paused, now must play
    playPauseBtn.innerHTML = 'Pause .mp3';
    audioElement.pause();
  } else { // were just playing, now paused
    playPauseBtn.innerHTML = 'Play .mp3';
    audioElement.play();
  }
}