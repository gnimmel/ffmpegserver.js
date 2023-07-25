import BaseAnimation from '/text_animations/BaseAnimation.js';

class SphereAnimation extends BaseAnimation {
  constructor(p, font, arrLyrics, textColor) {
    super(p);
    this.font = font;
    this.arrLyrics = arrLyrics;
    this.textColor = textColor;
    this.img = undefined;
  }

  setup() {
    this.p.perspective(this.p.PI / 3.0, this.p.width / this.p.height, 0.1, 500);
    this.img = this.p.createGraphics(500, 300);
    this.img.pixelDensity(10);
    this.img.textFont(this.font);
    this.img.noStroke();
    this.img.textAlign(this.p.CENTER, this.p.TOP);

    let xShift = 0.33;
    for (let i = 0; i < 3; i++) {
      let fontSize = 12;
      let leading = 15;
      this.img.textSize(fontSize);
      this.img.textLeading(leading);
      this.img.fill(this.textColor);

      let {lines, numLines} = this.splitIntoLines(this.arrLyrics[i].join(' '), this.img.width*0.25);
      let totalTextHeight = numLines * leading;
      while (totalTextHeight > this.img.height && fontSize > 1 && leading > 1) {
        fontSize -= 0.5;
        leading -= 0.5;
        this.img.textSize(fontSize);
        this.img.textLeading(leading);
        totalTextHeight = numLines * leading;
      }

      let yStart = (this.img.height - totalTextHeight) / 2;
      this.img.text(lines, parseInt(this.img.width*(i*xShift)), yStart, parseInt(this.img.width*0.25), parseInt(this.img.height*0.5));
    }
    
    this.p.pixelDensity(2);
  }

  draw() {
    this.p.push();
    this.p.camera(500, 0, 0, 0, 0, 0, 0, 1, 0);

    let gl = this.p._renderer.GL;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
  
    this.p.noStroke(); 
    this.p.texture(this.img);
    this.p.rotateY(this.p.millis() * -0.00025);
    this.p.sphere(147);

    gl.disable(gl.CULL_FACE);
    this.p.pop();
  }

  splitIntoLines(str, maxWidth) {
    let words = str.split(' ');
    let lines = '';
    let lineCount = 0;
    let line = '';

    for (let i = 0; i < words.length; i++) {
      let tempLine = line + (line.length > 0 ? ' ' : '') + words[i];
      let tempLineWidth = this.img.textWidth(tempLine);

      if (tempLineWidth > maxWidth && i > 0) {
        lines += line + '\n';
        lineCount++;
        line = words[i];
      } else {
        line = tempLine;
      }
    }

    lines += line;
    lineCount++;

    return {lines: lines, numLines: lineCount};
  }
}

export default SphereAnimation;