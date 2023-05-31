import Timer from './utils/timer.js';

let timer = new Timer('timer');

const REQUIRES_GL = false;

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


const sketch = (p) => {
  
  let scl = 0.5;

  //let canvas;
  //let ctx;
  let field;
  let w, h;
  let size;
  let columns;
  let rows;
  let noiseZ;
  let openSimplex;

  let fps = 30;

  let intPixDensity = 1;
  let canvasWidth = (urlParams.hasOwnProperty('canvasWidth')) ? parseInt(urlParams['canvasWidth']) * scl : 1080 * scl;
  let canvasHeight = (urlParams.hasOwnProperty('canvasHeight')) ? parseInt(urlParams['canvasHeight']) * scl : 1080 * scl;

  // GUI
  let gui;
  let params = {
    textTop: "TRAP",
    textBtm: "BANGER",
    color1: [255, 56, 56],
    color3: [0, 0, 255],

    speed: 0.7,
    speedMin: 0.01,
    speedMax: 1.0,
    speedStep: 0.001,

    zoom: 0.15,
    zoomMin: 0.01,
    zoomMax: 1.0,
    zoomStep: 0.001,

    textColor: [201, 255, 5],
    textScale: 1.0,
    textScaleMin: 0.2,
    textScaleMax: 1.8,
    textScaleStep: 0.001
  };

  var progressElem = document.getElementById("progress");
  var progressNode = document.createTextNode("");
  progressElem.appendChild(progressNode);

  var capturer;
  var frameCount = 0;
  var numFrames = fps * 10; // default to 5 second capture

  p.preload = () => {
    //theShader = p.loadShader('vert.glsl', 'frag.glsl');
    //f = p.loadFont("Nunito-SemiBold.ttf");
  }

  p.setup = () => {
    p.frameRate(fps);
    p.pixelDensity(intPixDensity);
    p.createCanvas(canvasWidth, canvasHeight, (REQUIRES_GL) ? p.WEBGL : p.P2D);
    p.background(0);
    
    //ctx = p.drawingContext;

    openSimplex = openSimplexNoise(Date.now());
    //openSimplex = openSimplexNoise(Math.random(42))
    size = 10;
    noiseZ = 10;
    //canvas = document.querySelector("#canvas");
    //ctx = canvas.getContext("2d");
    reset();
    
    let elem = document.createElement('p');
    elem.textContent = 'Output Resolution: ' + canvasWidth + 'x' + canvasHeight;
    document.getElementById('resolution').appendChild(elem);
  

    //gui = p.createGui(p);
    //gui.addObject(params);
    //gui.setPosition((canvasWidth + 50) * .5, 25);
  }

  p.draw = () => {
    calculateField();
    noiseZ = p.millis() * 0.0002;
    p.clear();
    p.background(0);
    drawField();


    if (capturer) {
      capturer.capture(document.getElementById('defaultCanvas0'));

      ++frameCount;
      if (frameCount < numFrames) {
        progressNode.nodeValue = "Rendered frames: " + frameCount + " / " + numFrames;
      } else if (frameCount === numFrames) {
        capturer.stop();
        capturer.save(showVideoLink);

        // Save the video and generate the download URL
        /*
      capturer.save(function(blob) {
        var url = URL.createObjectURL(blob);
        console.log("Download URL: " + url);
        // You can use this URL to create a download link, for example:
        var a = document.createElement('a');
        a.href = url;
        a.download = 'myAnimation.mp4';
        a.click();
      });
      */
        capturer = null;
      }
    }
  }

  /*function clear() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
  }*/

  function initField() {
    field = new Array(columns);
    for(let x = 0; x < columns; x++) {
      field[x] = new Array(columns);
      for(let y = 0; y < rows; y++) {
        field[x][y] = [0, 0];
      }
    }
  }
  
  function calculateField() {
    for(let x = 0; x < columns; x++) {
      for(let y = 0; y < rows; y++) {
        let angle = openSimplex.noise3D(x/50, y/50, noiseZ) * Math.PI * 2;
        let length = openSimplex.noise3D(x/50 + 400, y/50 + 400, noiseZ);
        field[x][y][0] = angle;
        field[x][y][1] = length;
      }
    }
  }
  
  function reset() {
    w = canvasWidth;
    h = canvasHeight;
    //p.noiseSeed(Math.random());
    columns = Math.floor(w / size) + 1;
    rows = Math.floor(h / size) + 1;
    initField();
  }

  function drawField() {
    p.stroke(255);
    for(let x = 0; x < columns; x++) {
      for(let y = 0; y < rows; y++) {
        let angle = field[x][y][0];
        let length = field[x][y][1];
        p.push();
        if (REQUIRES_GL)
          p.translate(x * size - (canvasWidth * scl), y * size - (canvasHeight * scl));
        else
          p.translate(x * size, y * size);

        p.rotate(angle);
        
        p.line(0, 0, 0, size * length);
        p.pop();
      }
    }
  }

}

let thep5 = new p5(sketch, 'flow-sketch');


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

let startCapture = () => {
  if (document.getElementById('duration').value !== "")
    numFrames = document.getElementById('duration').value * thep5.fps;
  
  frameCount = 0;

  capturer = new CCapture({
    format: 'ffmpegserver',
    //workersPath: "3rdparty/",
    //format: 'gif',
    verbose: true,
    framerate: thep5.fps,
    onProgress: onProgress,
    //extension: ".mp4",
    //codec: "libx264",
  });

  capturer.start();
  timer.start();
}

let onProgress = (progress) => {
  progressNode.nodeValue = "Transcoded: " + (progress * 100).toFixed(1) + "%";
}

document.getElementById('startButton').onclick = startCapture;



//export { showVideoLink, startCapture };
