import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './js/StreamPlayTech';
const ipcRenderer = require('electron').ipcRenderer;


function getWindowSize() {
    const { offsetWidth, offsetHeight } = document.documentElement
    const { innerHeight } = window // innerHeight will be blank in Windows system
    return [
        offsetWidth,
        innerHeight > offsetHeight ? offsetHeight : innerHeight
    ]
}

function createVideoHtml(source) {
    const [width, height] = getWindowSize()
    const videoHtml =
        `<video id="my-video" class="video-js vjs-big-play-centered" controls preload="auto" width="${width}"
    height="${height}" data-setup="{}">
    <source src="${source}" type="video/mp4">
    <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a web browser that
    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </p>
    </video>`
    return videoHtml;
}

var holder = document.getElementById('holder');
let videoContainer = document.getElementById("video-container")
let videoHtml = createVideoHtml("https://v.supermonkey.com.cn/Act-ss-mp4-hd/f0c7c03579bc4e9aaed6049e6fa6833d/SUPERMONKEY-0826.mp4")
videoContainer.innerHTML = videoHtml;

var newSettings = {
    backgroundOpacity: '0',
    edgeStyle: 'dropshadow',
    fontPercent: 1.25,
};

holder.ondragover = function () {
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    return false;
};
holder.ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    console.log('File you dragged here is', file.path);
    ipcRenderer.send('fileDrop', file.path);
    return false;
};
let vid = document.getElementById("my-video");

let player = videojs(vid);
document.onkeydown = (event) => {
    console.log("onkeypress", event);
    if (event.code === "Space") {
        if (player) {
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
        }
        return false;
    }
}

ipcRenderer.on('resize', function () {
    console.log('resize')
    const vid = document.getElementById('my-video')
    if (vid) {
        const [width, height] = getWindowSize()
        vid.style.width = width + 'px'
        vid.style.height = height + 'px'
    }
});

ipcRenderer.on('fileSelected', function (event, message) {
    console.log('fileSelected:', message)
    let vid = document.getElementById("my-video");

    videojs(vid).dispose();

    videoContainer.innerHTML = createVideoHtml(message.videoSource);
    vid = document.getElementById("my-video");
    if (message.type === 'native') {
        player = videojs(vid);
        player.play();
    } else if (message.type === 'stream') {
        player = videojs(vid, {
            techOrder: ['StreamPlay'],
            StreamPlay: { duration: message.duration }
        }, () => {
            player.play()
        });
    }
    // player.textTrackSettings.setDefaults();
    // player.textTrackSettings.setValues(newSettings);
    // player.textTrackSettings.updateDisplay();

});

ipcRenderer.send("ipcRendererReady", "true");



