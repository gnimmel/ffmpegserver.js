import createSketch from './sketch.js';

const TMP_LYRICS = "to rock a rhyme that's right on time";
const TMP_COLOR = [112, 255, 178];
//const TMP_VID_PATH = "videos/UHHM_Shareable_Asset_Inspired_6.mp4";
const TMP_VID_PATH = "videos/UHHM_Shareable_Asset_Competitive_3.mp4";

const FPS = 30;
const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 960;
const CANVAS_SCALE = 1.0;


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

let canvasWidth = CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight = CANVAS_HEIGHT * CANVAS_SCALE;
let framerate = FPS;

// Create the flow sketch
const mySketch = createSketch(
    framerate, 
    canvasWidth, 
    canvasHeight,
    TMP_LYRICS,
    TMP_COLOR,
    TMP_VID_PATH    
    );
let thep5 = new p5(mySketch, 'the-sketch');
