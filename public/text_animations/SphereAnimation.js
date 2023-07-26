import BaseAnimation from '/text_animations/BaseAnimation.js';

class SphereAnimation extends BaseAnimation {
  constructor(p, font, arrLyrics, textColor) {
    super(p, font, arrLyrics, textColor);
    //this.font = font;
    this.arrLyrics = arrLyrics;
    //this.textColor = textColor;
    this.img = undefined;
    this.fontSize = 12;
    this.leading = 15;
    this.texW = 500;
    this.texH = 300;
  }

  setup() {
    super.setup();
    this.fontSize = parseInt(this.p.width / (this.baseW / this.fontSize));
    this.leading = parseInt(this.p.width / (this.baseW / this.leading));
    this.texW = parseInt(this.p.width / (this.baseW / this.texW));
    this.texH = parseInt(this.p.width / (this.baseW / this.texH));

    this.p.perspective(this.p.PI / 3.0, this.p.width / this.p.height, 0.1, 500);
    this.img = this.p.createGraphics(this.texW, this.texH);
    this.img.pixelDensity(10);
    this.img.textFont(this.font);
    this.img.noStroke();
    this.img.textAlign(this.p.CENTER, this.p.TOP);

    let xShift = 0.33;
    for (let i = 0; i < 3; i++) {
      this.img.textSize(this.fontSize);
      this.img.textLeading(this.leading);
      this.img.fill(this.textColor);

      let {lines, numLines} = this.splitIntoLines(this.arrLyrics[i].join(' '), this.img.width*0.25);
      let totalTextHeight = numLines * this.leading;
      while (totalTextHeight > this.img.height && this.fontSize > 1 && this.leading > 1) {
        this.fontSize -= 0.5;
        this.leading -= 0.5;
        this.img.textSize(this.fontSize);
        this.img.textLeading(this.leading);
        totalTextHeight = numLines * this.leading;
      }

      let yStart = (this.img.height - totalTextHeight) / 2;
      this.img.text(lines, parseInt(this.img.width*(i*xShift)), yStart, parseInt(this.img.width*0.25), parseInt(this.img.height*0.5));
    }
    
    this.p.pixelDensity(2);
  }

  draw() {
    super.draw();

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