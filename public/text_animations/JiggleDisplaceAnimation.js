import BaseAnimation from '/text_animations/BaseAnimation.js';

class JiggleDisplaceAnimation extends BaseAnimation {
  constructor(p, font, arrLyrics, textColor) {
    super(p);
    this.sentences = arrLyrics.flat();
    this.currentSentenceIndex = 0;
    this.currentWordIndex = 0;
    this.timePerWord = 200;
    this.timePerSentence = 1000;
    this.nextWordTime = 0;
    this.maxLineWidth;
    this.fontSize = 48;
    this.lineHeight = 50;
    this.color = textColor;
    this.font = font;
    this.startTime = null;
    this.nextSentenceTime = null;
  }

  setup() {
    this.maxLineWidth = this.p.width * 0.4;

    this.p.textFont(this.font);
    this.p.textSize(this.fontSize);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.startTime = this.p.millis();
    this.nextSentenceTime = this.sentences[0].split(" ").length * this.timePerWord + this.timePerSentence;
  }

  draw() {
    let elapsed = this.p.millis() - this.startTime;

    if (elapsed >= this.nextWordTime) {
      let sentence = this.sentences[this.currentSentenceIndex];
      let words = sentence.split(" ");

      if (this.currentWordIndex < words.length) {
        this.currentWordIndex++;
        this.nextWordTime += this.timePerWord;
      }
    }

    if (elapsed >= this.nextSentenceTime) {
      this.currentSentenceIndex++;
      this.currentWordIndex = 0;

      if (this.currentSentenceIndex >= this.sentences.length) {
        this.currentSentenceIndex = 0;
        this.startTime = this.p.millis();
        elapsed = 0;
      }

      let nextSentence = this.sentences[this.currentSentenceIndex];
      this.nextWordTime = elapsed + this.timePerWord;
      this.nextSentenceTime = elapsed + nextSentence.split(" ").length * this.timePerWord + this.timePerSentence;
    }

    if (this.currentSentenceIndex < this.sentences.length) {
      let sentence = this.sentences[this.currentSentenceIndex];
      let words = sentence.split(" ");

      let lines = [];
      let currentLine = [];
      let currentLineWidth = 0;

      for (let word of words) {
        let wordWidth = this.p.textWidth(word + " ");

        if (currentLineWidth + wordWidth > this.maxLineWidth && currentLine.length > 0) {
          lines.push(currentLine.join(" "));
          currentLine = [];
          currentLineWidth = 0;
        }

        currentLine.push(word);
        currentLineWidth += wordWidth;
      }

      if (currentLine.length > 0) {
        lines.push(currentLine.join(" "));
      }

      let wordCount = 0;
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineWords = line.split(" ");
        let lineY = - (lines.length - 1) * this.lineHeight / 2 + i * this.lineHeight;

        let totalLineWidth = this.p.textWidth(line);
        let lineX = -totalLineWidth / 2;

        for (let j = 0; j < lineWords.length; j++) {
          if (wordCount < this.currentWordIndex) {
            this.p.fill(this.color);
            this.p.noStroke();
            this.p.text(lineWords[j], lineX, lineY);
          }
          lineX += this.p.textWidth(lineWords[j] + " ");
          wordCount++;
        }
      }
    }
  }
}

export default JiggleDisplaceAnimation;
