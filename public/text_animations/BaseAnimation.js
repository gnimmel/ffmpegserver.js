class BaseAnimation {
    constructor(p, font, arrLyrics, textColor) {
      this.p = p; // the p5 instance
      this.canvasScale;
      this.font = font;
      this.textColor = textColor;
      this.sentences = arrLyrics.flat();
      this.baseW = 1028;
    }
  
    setup() {
      // (overridden by subclasses)
      
    }
  
    draw() {
      // (overridden by subclasses)
    }
  }

  export default BaseAnimation;