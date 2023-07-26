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

    this.shaderProgram;
    this.graphics;
    this.aspectRatio;
  }

  setup() {
    this.maxLineWidth = this.p.width * 0.4;
    this.startTime = this.p.millis();
    this.nextSentenceTime = this.sentences[0].split(" ").length * this.timePerWord + this.timePerSentence;

    this.p.textFont(this.font);
    this.p.textSize(this.fontSize);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.noStroke();

    this.graphics = this.p.createGraphics(this.p.width, this.p.width);
    this.graphics.textFont(this.font);
    this.graphics.textSize(this.fontSize);
    this.graphics.textAlign(this.p.LEFT, this.p.CENTER);
    this.graphics.noStroke();

    this.shaderProgram = this.p.createShader(this.vertexShader, this.fragmentShaderGood_random);
    //this.p.shader(this.shaderProgram);
    this.p.shader(this.shaderProgram);
    
    this.aspectRatio = this.p.width / this.p.height;
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
            if (true) 
            {
              this.p.fill(this.color);
              this.p.noStroke();
              this.p.text(lineWords[j], lineX, lineY);
            } else 
            {
              this.graphics.clear(0, 0, 0, 0);
              this.graphics.fill(this.color);
              this.graphics.text(lineWords[0], lineX, lineY);

              //this.p.image(this.graphics, -this.p.width/2, -this.p.height/2);
              
              this.shaderProgram.setUniform('uTexture', this.graphics);
              this.shaderProgram.setUniform('uTime', this.p.millis() / 1000.0);

              this.p.beginShape(this.p.TRIANGLES);
              this.p.vertex(-1, -this.aspectRatio, 0, 0, 1);
              this.p.vertex(1, -this.aspectRatio, 0, 1, 1);
              this.p.vertex(1, this.aspectRatio, 0, 1, 0);
              this.p.vertex(1, this.aspectRatio, 0, 1, 0);
              this.p.vertex(-1, this.aspectRatio, 0, 0, 0);
              this.p.vertex(-1, -this.aspectRatio, 0, 0, 1);
              this.p.endShape();
            }
          }
          lineX += this.p.textWidth(lineWords[j] + " ");
          wordCount++;
        }
      }
      
    }
  }

  drawWithDisplacement(str, x, y) {
    this.graphics.clear(0, 0, 0, 0);
    this.graphics.fill(this.color);
    this.graphics.text(lineWords[j], lineX, lineY);
    
    this.shaderProgram.setUniform('uTexture', this.graphics);
    this.shaderProgram.setUniform('uTime', this.p.millis() / 1000.0);

    this.p.beginShape(this.p.TRIANGLES);
    this.p.vertex(-1, -this.aspectRatio, 0, 0, 1);
    this.p.vertex(1, -this.aspectRatio, 0, 1, 1);
    this.p.vertex(1, this.aspectRatio, 0, 1, 0);
    this.p.vertex(1, this.aspectRatio, 0, 1, 0);
    this.p.vertex(-1, this.aspectRatio, 0, 0, 0);
    this.p.vertex(-1, -this.aspectRatio, 0, 0, 1);
    this.p.endShape();
  }

  // GLSL programs
  // GLSL programs
  vertexShader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 1.0);
  }
  `;

  fragmentShaderGood_random = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uResolution;

  varying vec2 vTexCoord;

  void main() {
    // Calculate the vector from the current pixel to the center of the image.
    vec2 toCenter = vec2(0.5) - vTexCoord;

    // Calculate the displacement amount.
    float displacement = length(toCenter) * 4.9;

    // Add a jiggle motion.
    vec2 jiggle;
    jiggle.x = sin(uTime * 10.0 + vTexCoord.y * 3.1415) * 0.06;
    jiggle.y = cos(uTime * 8.0 + vTexCoord.x * 3.1415) * 0.06;
    displacement += length(jiggle);

    // Add the displacement to the original texture coordinate.
    // Squaring the length for a concave magnification effect.
    vec2 distortedTexCoord = vTexCoord + displacement * toCenter * length(toCenter);

    // Read the original texture with the displaced texture coordinate.
    vec4 color = texture2D(uTexture, distortedTexCoord);
    
    // If the alpha value is less than a small threshold, discard the fragment.
    if (color.a < 0.4) discard;
    if (color.r < 0.3) discard;

    // Use the alpha channel of the color to control its transparency
    gl_FragColor = vec4(color.rgb, color.a);
  }
  `;

}


export default JiggleDisplaceAnimation;
