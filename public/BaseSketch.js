//import { setupSphere, drawSphere } from '/text_animations/sphere/sphere.js';
import SphereAnimation from './text_animations/SphereAnimation.js';
import KaraokeAnimation from './text_animations/KaraokeAnimation.js';
import SlideAnimation from './text_animations/SlideAnimation.js';
import JiggleDisplaceAnimation from './text_animations/JiggleDisplaceAnimation.js';

class BaseSketch {
    constructor(fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, DURATION = 15, REQUIRES_GL = true) {
        this.fps = fps;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lyrics = lyrics;
        this.textColor = textColor;
        this.videoPath = videoPath;
        this.bVideoReady = false;

        this.DURATION = DURATION;
        this.REQUIRES_GL = REQUIRES_GL;
        this.w_gloffset = (this.REQUIRES_GL) ? -(this.canvasWidth/2) : 0;
        this.h_gloffset = (this.REQUIRES_GL) ? -(this.canvasHeight/2) : 0;
        this.intPixDensity = 2;
        this.frameCount = 0;
        this.numFrames = this.fps * this.DURATION;

        this.textAnimation;
        this.videoGraphics;
    }
    
    p5preload(p) {
        this.video = p.createVideo(this.videoPath);
        this.font = p.loadFont("fonts/PPMori-Regular.otf");
    }

    p5setup(p) {
        console.log("fps: " + this.fps);
        console.log("sketch::SETUP");
        p.frameRate(this.fps);
        p.pixelDensity(this.intPixDensity);
        p.createCanvas(this.canvasWidth, this.canvasHeight, (this.REQUIRES_GL) ? p.WEBGL : p.P2D);
        p.background(0);

        

        this.video.elt.onloadstart = function() {
            console.log("Video load started.");
        }

        this.video.elt.oncanplaythrough = () => {
            if (!this.bVideoReady) {
                this.bVideoReady = true;
                this.video.play();
                console.log("Video can play through.");
            }
        }

        this.video.elt.onerror = function() {
            console.log("An error occurred while loading the video.");
        }

        this.video.volume(0);
        this.video.loop();
        this.video.hide();
        this.video.elt.setAttribute('playsinline', true);
        this.video.elt.setAttribute('loop', true);
        this.video.elt.setAttribute('muted', true);

        p.textFont(this.font);  

        this.videoGraphics = p.createGraphics(p.width, p.height);//, p.WEBGL);

        if (this.videoPath.toLowerCase().includes("Floating_Particles".toLowerCase())) {
            this.textAnimation = new SphereAnimation(p, this.font, this.lyrics, this.textColor);
        } else if (this.videoPath.toLowerCase().includes("Geometry_Wave".toLowerCase())) {
            this.textAnimation = new KaraokeAnimation(p, this.font, this.lyrics, this.textColor);
        } else if (this.videoPath.toLowerCase().includes("Spiral".toLowerCase())) {
            this.textAnimation = new SlideAnimation(p, this.font, this.lyrics, this.textColor);
        } else if (this.videoPath.toLowerCase().includes("ASCII_Sphere".toLowerCase())) {
            this.textAnimation = new JiggleDisplaceAnimation(p, this.font, this.lyrics, this.textColor);
        } else if (this.videoPath.toLowerCase().includes("ASCII".toLowerCase())) {
            console.log("ANIMATION NEEDS TO BE UPDATED");
            this.textAnimation = new KaraokeAnimation(p, this.font, this.lyrics, this.textColor);
        } else if (this.videoPath.toLowerCase().includes("Sphere".toLowerCase())) {
            console.log("ANIMATION NEEDS TO BE UPDATED");
            this.textAnimation = new JiggleDisplaceAnimation(p, this.font, this.lyrics, this.textColor);
        } else {
            console.error("INVALID ANIMATION");
        }

        this.textAnimation.setup();
        //setupSphere(p, this.font, this.lyrics, this.textColor);

        //this.theCanvas = document.getElementById('defaultCanvas0');
    }

    p5draw(p) {
        if (!this.bVideoReady) return;
        //p.clear(0,0,0,0);

        //p.image(this.video, this.w_gloffset, this.h_gloffset, p.width, p.height);
        p.resetShader();
        this.videoGraphics.image(this.video, 0, 0, p.width, p.height);
        p.image(this.videoGraphics, this.w_gloffset, this.h_gloffset);

        this.textAnimation.draw();

        /*p.fill(0);
        p.textSize(20);
        p.text(`FPS: ${p.nf(p.frameRate(), 2, 2)}`, -this.canvasWidth/2, -400);*/
    }
}

export default BaseSketch;