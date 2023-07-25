import BaseAnimation from '/text_animations/BaseAnimation.js';

class SlideAnimation extends BaseAnimation {
  constructor(p, font, arrLyrics, textColor) {
    super(p);
    this.font = font;
    this.sentences = arrLyrics.flat();
    this.currentSentence = 0;
    this.animatingIn = false; 
    this.animatingOut = false; 
    this.animationStartTime = 0;
    this.baseTimePerLine = 700; 
    this.timeIncreasePerLineIn = 50; 
    this.timeIncreasePerLineOut = 25; 
    this.timeBetweenSentences = 1500; 
    this.delayStartTime = 0;
    this.lines = [];
    this.fontSize = 94;
    this.leading = 85;
    this.textColor = textColor;
    this.textBoxWidth = this.p.width * 0.7;
    this.textX = 0;//this.p.width / 2;
    this.textY = this.leading;//this.p.height / 2;
    this.p.textFont(this.font);
  }

  setup() {
    this.p.textSize(this.fontSize);
    this.p.textLeading(this.leading);
    this.lines = this.splitIntoLines(this.sentences[this.currentSentence], this.textBoxWidth);
    this.animationStartTime = this.p.millis();
    this.delayStartTime = this.p.millis();
  }

  draw() {
    this.p.textAlign(this.p.CENTER);
    let boxHeight = this.lines.length * this.leading;
    let boxTop = this.textY - boxHeight / 2;

    for (let i = 0; i < this.lines.length; i++) {
      let y;
      if (this.animatingIn && this.currentSentence !== 0) 
      {
        let timePerLine = this.baseTimePerLine + (this.lines.length - 1 - i) * this.timeIncreasePerLineIn;
        let t = this.p.constrain((this.p.millis() - this.animationStartTime) / timePerLine, 0, 1);
        y = this.lerp(-this.leading - this.p.height / 2, boxTop + i * this.leading, this.easeOutCubic(t));
      } else if (this.animatingOut) 
      {
        let timePerLine = this.baseTimePerLine + (this.lines.length - 1 - i) * this.timeIncreasePerLineOut;
        let t = this.p.constrain((this.p.millis() - this.animationStartTime) / timePerLine, 0, 1);
        y = this.lerp(boxTop + i * this.leading, this.p.height/2 + this.leading, this.easeInCubic(t));
      } else 
      {
        y = boxTop + i * this.leading;
      }
      this.p.fill(this.textColor);
      this.p.text(this.lines[i], this.textX, y);
    }

    if (this.animatingIn && this.p.millis() - this.animationStartTime > this.baseTimePerLine + (this.lines.length - 1) * this.timeIncreasePerLineIn) {
      this.animatingIn = false;
      this.delayStartTime = this.p.millis();
    }
  
    if (!this.animatingIn && !this.animatingOut && this.p.millis() - this.delayStartTime > this.timeBetweenSentences) {
      this.animatingOut = true;
      this.animationStartTime = this.p.millis();
    }

    if (this.animatingOut && this.p.millis() - this.animationStartTime > this.baseTimePerLine + (this.lines.length - 1) * this.timeIncreasePerLineOut) {
      this.animatingOut = false;
      this.currentSentence = (this.currentSentence + 1) % this.sentences.length;
      this.lines = this.splitIntoLines(this.sentences[this.currentSentence], this.textBoxWidth);
      this.animationStartTime = this.p.millis();
      this.animatingIn = this.currentSentence !== 0;
      this.delayStartTime = this.currentSentence === 0 ? this.p.millis() : 0;
    }
  }

  splitIntoLines(sentence, maxLineWidth) {
    let words = sentence.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      let newLine = line + (line === "" ? "" : " ") + words[i];
      if (this.p.textWidth(newLine) > maxLineWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = newLine;
      }
    }
    lines.push(line);
    return lines;
  }

  easeInCubic(t) {
    return t * t * t;
  }

  easeOutCubic(t) {
    return (--t) * t * t + 1;
  }

  lerp(start, stop, amt) {
    return start + (stop-start) * amt;
  }
}

export default SlideAnimation;
