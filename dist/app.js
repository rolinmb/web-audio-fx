"use strict";
let audioCtx = undefined;
let audioSourceNode = undefined;
let audioElement = undefined;
let dest = undefined;
let mediaRecorder = undefined;
let masterGain = undefined;
let compressor = undefined;
let lowPass = undefined;
let highPass = undefined;
let distNode = undefined;
let delayGain = undefined;
let delayNode = undefined;
let preGain = undefined;
let curFname = "";
let paused = true;
let chunks = [];
document.getElementById('master-gain-slider').addEventListener('input', function () {
    const slider = document.getElementById('master-gain-slider');
    let val = slider.valueAsNumber;
    masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('master-gain-view').innerHTML = 'Master Gain: ' + val.toString() + ' db';
});
document.getElementById('compressor-threshold-slider').addEventListener('input', function () {
    const slider = document.getElementById('compressor-threshold-slider');
    let val = slider.valueAsNumber;
    compressor.threshold.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('compressor-threshold-view').innerHTML = 'Compressor Threshold: ' + val.toString() + ' db';
});
document.getElementById('compressor-knee-slider').addEventListener('input', function () {
    const slider = document.getElementById('compressor-knee-slider');
    let val = slider.valueAsNumber;
    compressor.knee.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('compressor-knee-view').innerHTML = 'Compressor Knee: ' + val.toString() + ' db';
});
document.getElementById('compressor-ratio-slider').addEventListener('input', function () {
    const slider = document.getElementById('compressor-ratio-slider');
    let val = slider.valueAsNumber;
    compressor.ratio.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('compressor-ratio-view').innerHTML = 'Compressor Ratio: ' + val.toString() + ':1';
});
document.getElementById('compressor-attack-slider').addEventListener('input', function () {
    const slider = document.getElementById('compressor-attack-slider');
    let val = slider.valueAsNumber;
    compressor.attack.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('compressor-attack-view').innerHTML = 'Compressor Attack: ' + val.toString() + ' seconds';
});
document.getElementById('compressor-release-slider').addEventListener('input', function () {
    const slider = document.getElementById('compressor-release-slider');
    let val = slider.valueAsNumber;
    compressor.release.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('compressor-release-view').innerHTML = 'Compressor Release: ' + val.toString() + ' db';
});
document.getElementById('low-pass-slider').addEventListener('input', function () {
    const slider = document.getElementById('low-pass-slider');
    let val = slider.valueAsNumber;
    lowPass.frequency.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('low-pass-view').innerHTML = 'Low Pass Cutoff: ' + val.toString() + ' Hz';
});
document.getElementById('high-pass-slider').addEventListener('input', function () {
    const slider = document.getElementById('high-pass-slider');
    let val = slider.valueAsNumber;
    highPass.frequency.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('high-pass-view').innerHTML = 'High Pass Cutoff: ' + val.toString() + ' Hz';
});
function getDistortionCurve(amount, tone) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const distortionSelect = document.getElementById('distortion-type-select');
    let distortionType = distortionSelect.value;
    switch (distortionType) {
        case 'default':
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / ((Math.PI + k * Math.abs(x)) * (1 + tone));
            }
            break;
        case 'hardclip':
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = Math.min(1, Math.max(-1, x * k));
            }
            break;
        case 'softclip':
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = Math.tanh(x * k);
            }
            break;
        case 'exponential':
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = Math.pow(Math.abs(x), k) * (x >= 0 ? 1 : -1);
            }
            break;
        case 'arctan':
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = (2 / Math.PI) * Math.atan(x * k);
            }
            break;
        default:
            for (let i = 0; i < n_samples; i++) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / ((Math.PI + k * Math.abs(x)) * (1 + tone));
            }
            break;
    }
    return curve;
}
function updateDistortion() {
    const amountSlider = document.getElementById('distortion-amount-slider');
    let amountVal = amountSlider.valueAsNumber;
    const toneSlider = document.getElementById('distortion-tone-slider');
    let toneVal = toneSlider.valueAsNumber;
    distNode.curve = getDistortionCurve(amountVal, toneVal);
    document.getElementById('distortion-amount-view').innerHTML = 'Distortion Amount: ' + amountVal.toString();
    document.getElementById('distortion-tone-view').innerHTML = 'Distortion Tone: ' + toneVal.toString();
}
document.getElementById('distortion-amount-slider').addEventListener('input', function () {
    updateDistortion();
});
document.getElementById('distortion-tone-slider').addEventListener('input', function () {
    updateDistortion();
});
document.getElementById('distortion-type-select').addEventListener('change', function () {
    const distortionSelect = document.getElementById('distortion-type-select');
    let distortionType = distortionSelect.value;
    document.getElementById('distortion-type-view').innerHTML = "Distortion Type: " + distortionType;
    updateDistortion();
});
document.getElementById('delay-gain-slider').addEventListener('input', function () {
    const slider = document.getElementById('delay-gain-slider');
    let val = slider.valueAsNumber;
    delayGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('delay-gain-view').innerHTML = 'Delay Gain: ' + val.toString() + ' db';
});
document.getElementById('delay-time-slider').addEventListener('input', function () {
    const slider = document.getElementById('delay-time-slider');
    let val = slider.valueAsNumber;
    delayNode.delayTime.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('delay-time-view').innerHTML = 'Delay Time: ' + val.toString() + ' seconds';
});
document.getElementById('pre-gain-slider').addEventListener('input', function () {
    const slider = document.getElementById('pre-gain-slider');
    let val = slider.valueAsNumber;
    preGain.gain.setValueAtTime(val, audioCtx.currentTime);
    document.getElementById('pre-gain-view').innerHTML = "Pre Gain: " + val.toString() + ' db';
});
function unhideElements() {
    const urlHeader = document.getElementById('audio-url-header');
    urlHeader.style.display = 'block';
    const paramWraps = document.getElementsByClassName('param-wrap');
    const paramViews = document.getElementsByClassName('fx-slider-view');
    const paramSliders = document.getElementsByClassName('fx-slider');
    for (let i = 0; i < paramWraps.length; i++) {
        paramWraps[i].style.display = 'block';
        if (i < paramWraps.length - 1) {
            paramViews[i].style.display = 'block';
            paramSliders[i].style.display = 'block';
        }
    }
    const distortionSelect = document.getElementById('distortion-type-select');
    distortionSelect.style.display = 'block';
    const playPauseBtn = document.getElementById('play-pause-btn');
    playPauseBtn.style.display = 'block';
    const scrubHeader = document.getElementById('scrub-info-header');
    scrubHeader.style.display = 'block';
    const scrubInput = document.getElementById('audio-scrub-input');
    scrubInput.style.display = 'block';
    const renderBtn = document.getElementById('render-audio-btn');
    renderBtn.style.display = 'block';
}
function handleAudioUpload() {
    const uploadBtn = document.getElementById('audio-upload-btn');
    uploadBtn.innerHTML = 'Upload new .mp3 or .wav';
    const audioFileInput = document.getElementById('audio-file-input');
    if (audioFileInput && audioFileInput.files && audioFileInput.files.length > 0) {
        if (audioFileInput.files.length > 1) {
            alert('Please select only one .mp3 or .wav file to edit.');
            audioFileInput.value = '';
            return;
        }
        else if (!audioFileInput.files[0].name.endsWith('.mp3') && !audioFileInput.files[0].name.endsWith(".wav")) {
            alert('Please select only .mp3 or .wav files to edit.');
            audioFileInput.value = '';
            return;
        }
        const audioFile = audioFileInput.files[0];
        curFname = audioFile.name.split(".")[0];
        const audioWebUrl = URL.createObjectURL(audioFile);
        audioElement = document.getElementById('main-audio');
        audioElement.src = audioWebUrl;
        audioElement.load();
        audioSourceNode = audioCtx.createMediaElementSource(audioElement);
        audioSourceNode.connect(preGain);
        preGain.connect(delayNode).connect(delayGain).connect(distNode);
        preGain.connect(distNode);
        distNode.connect(highPass).connect(lowPass).connect(compressor).connect(masterGain).connect(audioCtx.destination);
        const urlHeader = document.getElementById('audio-url-header');
        urlHeader.innerHTML = 'Current .mp3 File: ' + audioFile.name;
        if (urlHeader.style.display === 'none') {
            unhideElements();
        }
    }
    else {
        alert('Please select a .mp3 file to edit.');
        audioFileInput.value = '';
    }
    const playPauseBtn = document.getElementById("play-pause-btn");
    playPauseBtn.innerHTML = "Play";
    playPauseBtn.addEventListener("click", handlePlayPause);
    document.addEventListener('keydown', docHandlePlayPause);
}
function updateScrubInput() {
    const scrubInput = document.getElementById('audio-scrub-input');
    scrubInput.value = audioElement.currentTime.toString();
}
function handlePlayPause() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const audioElement = document.getElementById('main-audio');
    if ((audioElement && (!audioElement.src || audioElement.src === '')) || playPauseBtn.style.display === 'none') {
        alert('Cannot play/pause audio if no .wav file is selected.');
        return;
    }
    if (paused) {
        playPauseBtn.innerHTML = 'Pause';
        audioElement.play();
        const scrubInterval = setInterval(updateScrubInput, 100);
        audioElement.addEventListener('ended', function () {
            clearInterval(scrubInterval);
        });
    }
    else {
        playPauseBtn.innerHTML = 'Play';
        audioElement.pause();
    }
    paused = !paused;
}
function docHandlePlayPause(event) {
    if (event.key === " ") {
        event.preventDefault();
        handlePlayPause();
    }
}
function handleRenderAudio() {
    chunks = [];
    dest = new MediaStreamAudioDestinationNode(audioCtx);
    mediaRecorder = new MediaRecorder(dest.stream);
    masterGain.disconnect(audioCtx.destination);
    masterGain.connect(dest);
    mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        const audioUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = audioUrl;
        downloadLink.download = `${curFname}.ogg`;
        downloadLink.innerText = "Download rendered audio";
        document.body.appendChild(downloadLink);
    };
    mediaRecorder.start();
    setTimeout(() => {
        mediaRecorder.stop();
    }, 600000);
}
window.onload = function () {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
    const masterGainSlider = document.getElementById('master-gain-slider');
    masterGainSlider.value = '1';
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    const compressorThresholdSlider = document.getElementById('compressor-threshold-slider');
    compressorThresholdSlider.value = '-50';
    const compressorKneeSlider = document.getElementById('compressor-knee-slider');
    compressorKneeSlider.value = '40';
    const compressorRatioSlider = document.getElementById('compressor-ratio-slider');
    compressorRatioSlider.value = '12';
    const compressorAttackSlider = document.getElementById('compressor-attack-slider');
    compressorAttackSlider.value = '0';
    const compressorReleaseSlider = document.getElementById('compressor-release-slider');
    compressorReleaseSlider.value = '0.25';
    lowPass = audioCtx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(1000, audioCtx.currentTime);
    const lowPassSlider = document.getElementById('low-pass-slider');
    lowPassSlider.value = '1000';
    highPass = audioCtx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(1000, audioCtx.currentTime);
    const highPassSlider = document.getElementById('high-pass-slider');
    highPassSlider.value = '1000';
    distNode = audioCtx.createWaveShaper();
    distNode.curve = getDistortionCurve(0, 0.5);
    distNode.oversample = '2x';
    const distAmountSlider = document.getElementById('distortion-amount-slider');
    distAmountSlider.value = '0';
    const distToneSlider = document.getElementById('distortion-tone-slider');
    distToneSlider.value = '5';
    const distortionSelect = document.getElementById('distortion-type-select');
    distortionSelect.style.display = 'none';
    delayGain = audioCtx.createGain();
    delayGain.gain.setValueAtTime(0, audioCtx.currentTime);
    const delayGainSlider = document.getElementById('delay-gain-slider');
    delayGainSlider.value = '0';
    delayNode = audioCtx.createDelay();
    delayNode.delayTime.setValueAtTime(0.25, audioCtx.currentTime);
    const delayTimeSlider = document.getElementById('delay-time-slider');
    delayTimeSlider.value = '0.25';
    preGain = audioCtx.createGain();
    preGain.gain.setValueAtTime(2, audioCtx.currentTime);
    const preGainSlider = document.getElementById('pre-gain-slider');
    preGainSlider.value = '2';
    const scrubInput = document.getElementById('audio-scrub-input');
    scrubInput.value = '0';
    scrubInput.addEventListener('input', function () {
        audioElement.currentTime = parseFloat(scrubInput.value);
    });
    scrubInput.addEventListener('loadedmetadata', function () {
        scrubInput.value = '0';
    });
    const paramWraps = document.getElementsByClassName('param-wrap');
    const paramViews = document.getElementsByClassName('fx-slider-view');
    const paramSliders = document.getElementsByClassName('fx-slider');
    for (let i = 0; i < paramWraps.length; i++) {
        paramWraps[i].style.display = 'none';
        if (i < paramWraps.length - 1) {
            paramViews[i].style.display = 'none';
            paramSliders[i].style.display = 'none';
        }
    }
    const uploadInput = document.getElementById("audio-upload-btn");
    uploadInput.addEventListener("click", handleAudioUpload);
    const renderBtn = document.getElementById("render-audio-btn");
    renderBtn.addEventListener("click", handleRenderAudio);
};
