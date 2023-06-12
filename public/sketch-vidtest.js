
const createSketch = (fps, canvasWidth, canvasHeight, showVideoLinkFunc = null, durationElem = null, progressElem = null, timerElem = null, renderTextElem = null) => {
    return (p) => {

        const REQUIRES_GL = false;
        let w_gloffset = (REQUIRES_GL) ? -(canvasWidth/2) : 0
        let h_gloffset = (REQUIRES_GL) ? -(canvasHeight/2) : 0

        let intPixDensity = 1;

        let capturer;
        let frameCount = 0;
        let numFrames = fps * 5; // default to 5 second capture
        let startTime;
        let endTime;
        let canvasCaptureEndTime;
        let font;

        let params = {
            color: [112, 255, 178],
            text: "to rock a rhyme that's right on time, "
          };
        let video;

        p.preload = () => {
            font = p.loadFont("fonts/PPMori-Regular.otf");
        }

        p.setup = () => {
            console.log("fps: " + fps);

            p.frameRate(fps);
            p.pixelDensity(intPixDensity);
            p.createCanvas(canvasWidth, canvasHeight, (REQUIRES_GL) ? p.WEBGL : p.P2D);
            p.background(0);

            video = p.createVideo('videos/UHHM_Shareable_Asset_Inspired_6.mp4');
            video.volume(0);
            video.loop();
            video.hide();
            video.elt.setAttribute('playsinline', true);
            video.elt.setAttribute('autoplay', true);
            video.elt.setAttribute('loop', true);
            video.elt.setAttribute('muted', true);
        }

        p.draw = () => {
            p.image(video, w_gloffset, h_gloffset, p.width, p.height);

            p.textFont(font);
            p.textSize(90 * (p.width / 1080));
            p.textLeading(100 * (p.width / 1080))
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.fill(params.color[0], params.color[1], params.color[2]);
            p.text(params.text, 
                parseInt(p.width*0.5)-parseInt(p.width*0.25) + w_gloffset, 
                parseInt(p.height*0.5)-parseInt(p.height*0.25) + h_gloffset, 
                parseInt(p.width*0.5), 
                parseInt(p.height*0.5));

            // Render stats
            p.noStroke();
            //p.fill(0);
            //p.rect(0, canvasHeight*0.85, canvasWidth, canvasHeight*0.85);
            p.fill(255,255,255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(18);
            p.text(fps + " fps, " + durationElem.value + " secs, " + canvasWidth + "x" + canvasHeight, 
                parseInt(canvasWidth*0.5) + w_gloffset, 
                parseInt(canvasHeight*0.9) + h_gloffset);
            //p.textSize(24);
            p.text(timerElem.textContent, parseInt(canvasWidth*0.5) + w_gloffset, parseInt(canvasHeight*0.95) + h_gloffset);
            
            //p.textFont(font);
            //p.fill(255,255,0);
            //p.textSize(50);
            
            //p.text(renderTextElem.value, parseInt(canvasWidth*0.5), parseInt(canvasHeight*0.4));
            

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
