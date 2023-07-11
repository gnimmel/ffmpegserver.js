import { setupSphere, drawSphere } from './text_animations/sphere/sphere.js';

const createSketch = (fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, showVideoLinkFunc = null) => {
    return (p) => {

        const DURATION = 15;
        const REQUIRES_GL = true;

        let w_gloffset = (REQUIRES_GL) ? -(canvasWidth/2) : 0
        let h_gloffset = (REQUIRES_GL) ? -(canvasHeight/2) : 0

        let intPixDensity = 2;

        let capturer;
        let frameCount = 0;
        let numFrames = fps * DURATION;
        let startTime;
        let endTime;
        let canvasCaptureEndTime;
        let font;

        let bVideoReady = false;

        let params = {
            color: textColor,
            text: lyrics
          };
        let video;

        p.preload = () => {
            font = p.loadFont("fonts/PPMori-Regular.otf");
        }

        function videoLoaded() {
            console.log('Video Loaded');
            video.play();  // Play the video
        }

        p.setup = () => {
            console.log("fps: " + fps);
            console.log("sketch::SETUP");
            p.frameRate(fps);
            p.pixelDensity(intPixDensity);
            //console.log("sketch::createCanvas:before");
            p.createCanvas(canvasWidth, canvasHeight, (REQUIRES_GL) ? p.WEBGL : p.P2D);
            //console.log("sketch::createCanvas:after");
            p.background(0);

            let filePath = videoPath;
            p.httpDo(
                filePath,
                'GET',
                function(res) {
                    console.log('File exists');
                },
                function(err) {
                    console.log('File does not exist');
                }
            );
            
            //console.log("sketch::createVideo:before");
            video = p.createVideo(videoPath, videoLoaded);
            //console.log("sketch::createVideo:after");
            
            video.elt.onloadstart = function() {
                console.log("Video load started.");
            }
            video.elt.oncanplay = function() {
                console.log("Video can play.");
                //p.onStartCapture();
            }
            video.elt.oncanplaythrough = function() {
                console.log("Video can play through without stopping for buffering.");
                //p.onStartCapture();
                bVideoReady = true;
            }
            video.elt.onerror = function() {
                console.log("An error occurred while loading the video.");
            }

            video.volume(0);
            video.loop();
            video.hide();
            video.elt.setAttribute('playsinline', true);
            //video.elt.setAttribute('autoplay', true);
            video.elt.setAttribute('loop', true);
            video.elt.setAttribute('muted', true);

            setupSphere(p, font, lyrics);
        }

        p.draw = () => {
            if (!bVideoReady) return;

            p.image(video, w_gloffset, h_gloffset, p.width, p.height);

            drawSphere(p);
            /*
            p.textFont(font);
            p.textSize(90 * (p.width / 1080));
            p.textLeading(100 * (p.width / 1080))
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.fill(textColor[0], textColor[1], textColor[2]);
            p.text(lyrics, 
                parseInt(p.width*0.5)-parseInt(p.width*0.25) + w_gloffset, 
                parseInt(p.height*0.5)-parseInt(p.height*0.25) + h_gloffset, 
                parseInt(p.width*0.5), 
                parseInt(p.height*0.5));
            */

            if (capturer) {
                capturer.capture(document.getElementById('defaultCanvas0'));

                ++frameCount;

                if (progressElem && frameCount < numFrames) {
                    progressElem.textContent = "Rendered frames: " + frameCount + " / " + numFrames;
                } else if (frameCount === numFrames) {
                    capturer.stop();
                    if (showVideoLinkFunc)
                        capturer.save(showVideoLinkFunc);
                    else
                        capturer.save();
    

                    capturer = null;
                    if (timerElem)
                        canvasCaptureEndTime = timerElem.textContent;
                    console.timeEnd();
                }

                if (timerElem)
                    updateTimer();
            }
        }

        let onProgress = (progress) => {
            if (progressElem) {
                progressElem.textContent = 'Transcoded: ' + (progress * 100).toFixed(1) + '%';
                
                if (timerElem)
                    updateTimer();
            }
        }

        p.onStartCapture = () => {
            console.log("Starting capture");
            
            frameCount = 0;
            canvasCaptureEndTime = "";

            capturer = new CCapture({
                format: 'ffmpegserver',
                //workersPath: "3rdparty/",
                //format: 'gif',
                verbose: false,
                framerate: fps,
                onProgress: onProgress,
                name: 'uhhm-shareable-test',
                //extension: ".mp4",
                //codec: "libx264",
            });

            capturer.start();
            startTime = p.millis();
            console.time();
        }

        const updateTimer = () => {
            endTime = p.millis();
            let duration = p.millis() - startTime;
            let milliseconds = Math.floor((duration % 1000) / 10);
            let seconds = Math.floor((duration / 1000) % 60);
            let minutes = Math.floor((duration / (1000 * 60)) % 60);

            timerElem.textContent = (canvasCaptureEndTime ? 'Capture Time: ' + canvasCaptureEndTime + ' / Total Time: ' : '') +
                minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0') + ':' + 
                milliseconds.toString().padStart(2, '0');
        }
    };
};

export default createSketch;
