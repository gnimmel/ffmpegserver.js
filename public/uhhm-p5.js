/*var url = window.location.href;

console.log("Current URL: " + url);

var urlObj = new URL(url);
var pams = new URLSearchParams(urlObj.search);

// What words were passed?
for (let pair of pams.entries()) {
  console.log(pair[0] + ', ' + pair[1]);
}
*/

const sketch = (p) => {
  let theShader;
  let f;
  let textGraphic;
  let fps = 30;

  //let zoom = 1;
  let offset;
  let intPixDensity = 1;
  let displayWidth = 1080;
  let displayHeight = 1080;

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
    theShader = p.loadShader('vert.glsl', 'frag.glsl');
    f = p.loadFont("Nunito-SemiBold.ttf");
  }

  p.setup = () => {
    p.frameRate(fps);
    p.pixelDensity(intPixDensity);
    p.createCanvas(displayWidth, displayHeight, p.WEBGL);
    p.background(0);
    offset = p.createVector(0, 0);

    textGraphic = p.createGraphics(displayWidth, displayHeight, p.WEBGL);
    textGraphic.pixelDensity(intPixDensity);
    textGraphic.background(0);
    textGraphic.textFont(f);
    textGraphic.textSize(Math.round(displayWidth * 0.14) * params.textScale);
    textGraphic.textAlign(p.CENTER, p.CENTER);
    textGraphic.fill("#ffffff");
    textGraphic.text(params.textTop, Math.round(displayWidth * 0.1), -(Math.round(displayHeight * 0.12 * params.textScale)));
    textGraphic.text(params.textBtm, Math.round(displayWidth * 0.1), Math.round(displayHeight * 0.05 * params.textScale));

    //zoom = 0.15;
    offset.x = 50;

    gui = p.createGui(p);
    gui.addObject(params);
    gui.setPosition((displayWidth + 50) * .5, 25);
  }

  p.draw = () => {
    //console.log(params.color1)

    textGraphic.background(0);
    textGraphic.textSize(Math.round(displayWidth * 0.14) * params.textScale);
    textGraphic.text(params.textTop, Math.round(displayWidth * 0.1), -(Math.round(displayHeight * 0.12 * params.textScale)));
    textGraphic.text(params.textBtm, Math.round(displayWidth * 0.1), Math.round(displayHeight * 0.05 * params.textScale));

    var y = (p.mouseY - (displayHeight / intPixDensity)) / p.min(1, p.windowWidth / p.windowHeight) + (displayHeight / intPixDensity);
    var py = (p.pmouseY - (displayHeight / intPixDensity)) / p.min(1, p.windowWidth / p.windowHeight) + (displayHeight / intPixDensity);

    theShader.setUniform("u_resolution", [p.width * intPixDensity, p.height * intPixDensity]);
    theShader.setUniform("u_time", p.millis() / (1500.0 * (1 - params.speed) + 100));
    theShader.setUniform("u_offset", [-offset.x * intPixDensity, offset.y * intPixDensity]);
    theShader.setUniform("u_zoom", 1.0 / params.zoom);
    theShader.setUniform("u_mouse", [p.mouseX * intPixDensity, (p.height - y) * intPixDensity]);
    theShader.setUniform("u_text", textGraphic);
    theShader.setUniform("u_color1", [p.red(p.color(params.color1)) / 100, p.green(p.color(params.color1)) / 100, p.blue(p.color(params.color1)) / 100]);
    theShader.setUniform("u_color3", [p.red(p.color(params.color3)) / 100, p.green(p.color(params.color3)) / 100, p.blue(p.color(params.color3)) / 100]);
    theShader.setUniform("u_color2", [p.red(p.color(params.textColor)) / 100, p.green(p.color(params.textColor)) / 100, p.blue(p.color(params.textColor)) / 100]);
    //p.noStroke();
    p.shader(theShader);
    p.rect(p.width * -0.5, p.height * -0.5, p.width, p.height);

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

  showVideoLink = (url, size) => {
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
  }

  startCapture = () => {
    if (document.getElementById('duration').value !== "")
      numFrames = document.getElementById('duration').value * fps;
    
    frameCount = 0;

    capturer = new CCapture({
      format: 'ffmpegserver',
      //workersPath: "3rdparty/",
      //format: 'gif',
      verbose: true,
      framerate: fps,
      onProgress: onProgress,
      //extension: ".mp4",
      //codec: "libx264",
    });

    capturer.start();
  }

  onProgress = (progress) => {
    progressNode.nodeValue = (progress * 100).toFixed(1) + "%";
  }
}

let thep5 = new p5(sketch, 'wavy-sketch');