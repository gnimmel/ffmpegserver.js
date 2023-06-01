
const createSketch = (fps, canvasWidth, canvasHeight, showVideoLinkFunc, durationElem = null, progressElem = null, timerElem = null) => {
    return (p) => {

        const REQUIRES_GL = false;

        let intPixDensity = 1;

        var capturer;
        var frameCount = 0;
        var numFrames = fps * 10; // default to 5 second capture
        let startTime;
        let endTime;
        let canvasCaptureEndTime;

        let field;
        let w, h;
        let size;
        let columns;
        let rows;
        let noiseZ;
        let openSimplex;

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

                if (progressElem && frameCount < numFrames) {
                    progressElem.textContent = "Rendered frames: " + frameCount + " / " + numFrames;
                } else if (frameCount === numFrames) {
                    capturer.stop();
                    capturer.save(showVideoLinkFunc);

                    capturer = null;
                    canvasCaptureEndTime = timerElem.textContent;
                    console.timeEnd();
                }

                if (timerElem)
                    updateTimer();
            }
        }

        /*function clear() {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, w, h);
        }*/

        function initField() {
            field = new Array(columns);
            for (let x = 0; x < columns; x++) {
                field[x] = new Array(columns);
                for (let y = 0; y < rows; y++) {
                    field[x][y] = [0, 0];
                }
            }
        }

        function calculateField() {
            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    let angle = openSimplex.noise3D(x / 50, y / 50, noiseZ) * Math.PI * 2;
                    let length = openSimplex.noise3D(x / 50 + 400, y / 50 + 400, noiseZ);
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
            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    let angle = field[x][y][0];
                    let length = field[x][y][1];
                    p.push();
                    if (REQUIRES_GL)
                        p.translate((x * size) - (canvasWidth), (y * size) - (canvasHeight));
                    else
                        p.translate(x * size, y * size);

                    p.rotate(angle);

                    p.line(0, 0, 0, size * length);
                    p.pop();
                }
            }
        }

        let onProgress = (progress) => {
            if (progressElem) {
                progressElem.textContent = 'Transcoded: ' + (progress * 100).toFixed(1) + '%';
                
                if (timerElem)
                    updateTimer();
            }
            //progressElem.nodeValue = "Transcoded: " + (progress * 100).toFixed(1) + "%";
        }

        p.onStartCapture = () => {
            if (durationElem && durationElem.value !== "")
                numFrames = durationElem.value * fps;

            frameCount = 0;
            canvasCaptureEndTime = "";

            capturer = new CCapture({
                format: 'ffmpegserver',
                //workersPath: "3rdparty/",
                //format: 'gif',
                verbose: false,
                framerate: fps,
                onProgress: onProgress,
                name: 'uhhm-shareable',
                //extension: ".mp4",
                //codec: "libx264",
            });

            capturer.start();
            startTime = p.millis();
            console.time();
        }

        let updateTimer = () => {
            endTime = p.millis();
            let duration = p.millis() - startTime;
            let milliseconds = Math.floor((duration % 1000) / 10);
            let seconds = Math.floor((duration / 1000) % 60);
            let minutes = Math.floor((duration / (1000 * 60)) % 60);

            timerElem.textContent = (canvasCaptureEndTime ? 'Canvas Stream: ' + canvasCaptureEndTime + ' / Total Time: ' : '') +
                minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0') + ':' + 
                milliseconds.toString().padStart(2, '0');
        }
    };
};

export default createSketch;
