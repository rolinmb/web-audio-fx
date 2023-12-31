"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let audioCtx = undefined;
let renderingCtx = undefined;
let masterGain = undefined;
let compressor = undefined;
let lowPass = undefined;
let highPass = undefined;
let distNode = undefined;
let delayGain = undefined;
let delayNode = undefined;
let preGain = undefined;
let audioElement = undefined;
let paused = true;
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
};
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
    uploadBtn.innerHTML = 'Upload new .mp3';
    const audioFileInput = document.getElementById('audio-file-input');
    if (audioFileInput && audioFileInput.files && audioFileInput.files.length > 0) {
        if (audioFileInput.files.length > 1) {
            alert('Please select only one .mp3 file to edit.');
            audioFileInput.value = '';
            return;
        }
        else if (!audioFileInput.files[0].name.endsWith('.mp3')) {
            alert('Please select only .mp3 files to edit.');
            audioFileInput.value = '';
            return;
        }
        const audioFile = audioFileInput.files[0];
        const audioWebUrl = URL.createObjectURL(audioFile);
        audioElement = document.getElementById('main-audio');
        audioElement.src = audioWebUrl;
        audioElement.load();
        const audioSourceNode = audioCtx.createMediaElementSource(audioElement);
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
}
function updateScrubInput() {
    const scrubInput = document.getElementById('audio-scrub-input');
    scrubInput.value = audioElement.currentTime.toString();
}
function handlePlayPause() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const audioElement = document.getElementById('main-audio');
    if ((audioElement && (!audioElement.src || audioElement.src === '')) || playPauseBtn.style.display === 'none') {
        alert('Cannot play/pause audio if no .mp3 file is selected.');
        return;
    }
    if (paused) {
        playPauseBtn.innerHTML = 'Pause .mp3';
        audioElement.play();
        const scrubInterval = setInterval(updateScrubInput, 100);
        audioElement.addEventListener('ended', function () {
            clearInterval(scrubInterval);
        });
    }
    else {
        playPauseBtn.innerHTML = 'Play .mp3';
        audioElement.pause();
    }
    paused = !paused;
}
function loadAudioBuffer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(audioElement.src);
            const audioData = yield response.arrayBuffer();
            return yield audioCtx.decodeAudioData(audioData);
        }
        catch (error) {
            console.error('Error loading uploaded audio into rendering buffer:', error);
            throw new Error('Error loading uploaded audio into rendering buffer: ' + error);
        }
    });
}
function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
function audioBufToWavBuf(audioBuf) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const numChannels = audioBuf.numberOfChannels;
            const audioData = [];
            for (let c = 0; c < numChannels; c++) {
                audioData.push(audioBuf.getChannelData(c));
            }
            const wavBuf = new ArrayBuffer(44 + audioData[0].length * 4);
            const preView = new DataView(wavBuf);
            writeString(preView, 0, 'RIFF');
            preView.setUint32(4, 36 + audioData[0].length * numChannels * 2, true);
            writeString(preView, 8, 'WAVE');
            writeString(preView, 12, 'fmt');
            preView.setUint32(16, 16, true);
            preView.setUint16(20, 1, true);
            preView.setUint16(22, numChannels, true);
            preView.setUint32(24, audioBuf.sampleRate, true);
            preView.setUint32(28, audioBuf.sampleRate * numChannels * 2, true);
            preView.setUint16(32, numChannels * 2, true);
            preView.setUint16(34, 16, true);
            writeString(preView, 36, 'data');
            preView.setUint32(40, audioData[0].length * numChannels * 2, true);
            const postView = new DataView(wavBuf, 44);
            for (let i = 0; i < audioData.length; i++) {
                for (let c = 0; c < numChannels; c++) {
                    postView.setInt16((i * numChannels + c) * 2, audioData[c][i] * 0x7fff, true);
                }
            }
            resolve(wavBuf);
        });
    });
}
function handleRenderAudio() {
    return __awaiter(this, void 0, void 0, function* () {
        audioElement.currentTime = 0;
        renderingCtx = new OfflineAudioContext(2, audioElement.duration * audioCtx.sampleRate, audioCtx.sampleRate);
        const audioBuffer = yield loadAudioBuffer();
        const renderingSource = renderingCtx.createBufferSource();
        renderingSource.buffer = audioBuffer;
        const renderingMasterGain = renderingCtx.createGain();
        renderingMasterGain.gain.setValueAtTime(masterGain.gain.value, renderingCtx.currentTime);
        const renderingCompressor = renderingCtx.createDynamicsCompressor();
        renderingCompressor.threshold.setValueAtTime(compressor.threshold.value, renderingCtx.currentTime);
        renderingCompressor.knee.setValueAtTime(compressor.knee.value, renderingCtx.currentTime);
        renderingCompressor.ratio.setValueAtTime(compressor.ratio.value, renderingCtx.currentTime);
        renderingCompressor.attack.setValueAtTime(compressor.attack.value, renderingCtx.currentTime);
        renderingCompressor.release.setValueAtTime(compressor.release.value, renderingCtx.currentTime);
        const renderingLowPass = renderingCtx.createBiquadFilter();
        renderingLowPass.type = lowPass.type;
        renderingLowPass.frequency.setValueAtTime(lowPass.frequency.value, renderingCtx.currentTime);
        const renderingHighPass = renderingCtx.createBiquadFilter();
        renderingHighPass.type = highPass.type;
        renderingHighPass.frequency.setValueAtTime(highPass.frequency.value, renderingCtx.currentTime);
        const renderingDistNode = renderingCtx.createWaveShaper();
        renderingDistNode.curve = distNode.curve;
        renderingDistNode.oversample = distNode.oversample;
        const renderingDelayGain = renderingCtx.createGain();
        renderingDelayGain.gain.setValueAtTime(delayGain.gain.value, renderingCtx.currentTime);
        const renderingDelayNode = renderingCtx.createDelay();
        renderingDelayNode.delayTime.setValueAtTime(delayNode.delayTime.value, renderingCtx.currentTime);
        const renderingPreGain = renderingCtx.createGain();
        renderingPreGain.gain.setValueAtTime(preGain.gain.value, renderingCtx.currentTime);
        renderingSource.connect(renderingPreGain);
        renderingPreGain.connect(renderingDelayNode).connect(renderingDelayGain).connect(renderingDistNode);
        renderingPreGain.connect(renderingDistNode);
        renderingDistNode.connect(renderingHighPass).connect(renderingLowPass).connect(renderingCompressor).connect(renderingMasterGain).connect(renderingCtx.destination);
        renderingCtx.startRendering().then((renderedBuffer) => __awaiter(this, void 0, void 0, function* () {
            const renderingStatus = document.getElementById('render-status-view');
            if (renderingStatus.style.display === 'none') {
                renderingStatus.style.display = 'block';
            }
            const wavBuffer = yield audioBufToWavBuf(renderedBuffer);
            const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
            const a = document.getElementById('download-rendered-link');
            a.href = URL.createObjectURL(wavBlob);
            a.download = "";
            if (a.style.display === 'none') {
                a.style.display = 'block';
            }
            a.innerHTML += ' (' + a.href + ')';
            renderingStatus.innerHTML = 'Rendering Complete; click the link below to download ' + a.href;
        }));
    });
}
document.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
        event.preventDefault();
        handlePlayPause();
    }
});
