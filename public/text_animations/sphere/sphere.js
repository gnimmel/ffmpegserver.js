let img;

export function setup(p, font, arrLyrics, textColor) 
{
  p.perspective(p.PI / 3.0, p.width/p.height, 0.1, 500);

  img = p.createGraphics(500, 300);
  img.pixelDensity(10);
  img.textFont(font);
  img.noStroke();
  img.textAlign(p.CENTER, p.TOP);

  let xShift = 0.33;
  let textBoxWidthPercent = 0.27;

  for (let i = 0; i < 3; i++) {
    let fontSize = 12;
    let leading = 15;
    img.textSize(fontSize);
    img.textLeading(leading);
    img.fill(textColor);

    let {lines, numLines} = splitIntoLines(arrLyrics[i].join('\n'), img.width*textBoxWidthPercent);
    let totalTextHeight = numLines * leading;
    while (totalTextHeight > img.height && fontSize > 1 && leading > 1) {
      fontSize -= 0.5;
      leading -= 0.5;
      img.textSize(fontSize);
      img.textLeading(leading);
      totalTextHeight = numLines * leading;
    }

    let yStart = (img.height - totalTextHeight) / 2;
    img.text(lines, 
      parseInt(img.width*(i*xShift)), 
      yStart, 
      parseInt(img.width*textBoxWidthPercent), 
      parseInt(img.height));
  }
  
  p.pixelDensity(2);
}

function splitIntoLines(str, maxWidth) {
  let lines = str.split('\n');
  let finalLines = '';
  let lineCount = 0;

  for (let j = 0; j < lines.length; j++) {
    let words = lines[j].split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      let tempLine = line + (line.length > 0 ? ' ' : '') + words[i];
      let tempLineWidth = img.textWidth(tempLine);

      if (tempLineWidth > maxWidth && i > 0) {
        finalLines += line + '\n';
        lineCount++;
        line = words[i];
      } else {
        line = tempLine;
      }
    }

    finalLines += line + '\n';
    lineCount++;
  }

  return {lines: finalLines, numLines: lineCount};
}

export function draw(p) 
{
  p.push();
  p.camera(500, 0, 0, 0, 0, 0, 0, 1, 0);

  let gl = p._renderer.GL;
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  
  p.noStroke(); 
  p.texture(img);
  //p.rotateY(p.frameCount * -0.005);
  //p.rotateY(-0.005 * p.deltaTime);
  p.rotateY(p.millis() * -0.00025);
  //console.log("p.deltaTime: " + p.deltaTime);
  p.sphere(147);

  gl.disable(gl.CULL_FACE);
  p.pop();
}
