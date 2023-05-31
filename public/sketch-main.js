//import Timer from './utils/timer.js';
//import Timer from "./libraries/easytimer.js";
import createSketch from './sketch-flow.js';

const FPS = 60;
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const CANVAS_SCALE = 0.5;


// Check for url params
var urlParams = {};
var url = window.location.href;

console.log("Current URL: " + url);

var urlObj = new URL(url);
var pams = new URLSearchParams(urlObj.search);

// What params have we been passed?
for (let pair of pams.entries()) {
  console.log(pair[0] + ', ' + pair[1]);
  urlParams[pair[0]] = pair[1];
}

let showVideoLink = (url, size) => {
    size = size ? (" [size: " + (size / 1024 / 1024).toFixed(1) + "meg]") : " [unknown size]";
    var a = document.createElement("a");
    a.href = url;
    var filename = url;
    var slashNdx = filename.lastIndexOf("/");
    if (slashNdx >= 0) {
      filename = filename.substr(slashNdx + 1);
    }
    a.download = filename;
    a.appendChild(document.createTextNode(url + size));
    document.getElementById('container').insertBefore(a, progressElem);
  
    //timer.stop();
  }

let progressElem = document.getElementById('progress');
let durationElem = document.getElementById('duration');
let timerElem = document.getElementById('timer');
let canvasWidth = (urlParams.hasOwnProperty('canvasWidth')) ? parseInt(urlParams['canvasWidth']) * CANVAS_SCALE : CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight = (urlParams.hasOwnProperty('canvasHeight')) ? parseInt(urlParams['canvasHeight']) * CANVAS_SCALE : CANVAS_HEIGHT * CANVAS_SCALE;
document.getElementById('resolution').textContent = 'Output Resolution: ' + canvasWidth + 'x' + canvasHeight;

//const timer = new Timer(document.getElementById('timer'));

// Create the flow sketch
const mySketch = createSketch(
    FPS, 
    canvasWidth, 
    canvasHeight, 
    showVideoLink, 
    durationElem, 
    progressElem,
    timerElem
    );
let thep5 = new p5(mySketch, 'flow-sketch');

// Events
document.getElementById('startButton').onclick = thep5.onStartCapture;
