let msk, pattern, mPixs
function setup() {
  createCanvas(400, 400);
  background(30)
  fill(200,50,60)
  msk = createGraphics(width,height)
  pattern = createGraphics(width,height)
  pixelDensity(1)
  msk.beginShape();
      // Exterior part of shape, clockwise winding
      msk.vertex(0, 0);
      msk.vertex(400, 0);
      msk.vertex(400, 400);
      msk.vertex(0, 400);
      // Interior part of shape, counter-clockwise winding
      msk.beginContour();
        msk.vertex(20, 20);
        msk.vertex(50, 220);
        msk.vertex(120, 380);
        msk.vertex(370, 320);
        msk.vertex(240, 160);
        msk.vertex(350, 40);
      msk.endContour();
  msk.endShape(CLOSE);
  mPixs = msk.loadPixels()
}

function draw() {
  
  for (let c=0; c<9; c++) {
    for (let r=0; r<9; r++) {
      pattern.circle(width/8*c,height/8*r,40)
    }    
  }
  for (let c=0; c<9; c++) {
    for (let r=0; r<9; r++) {
      let xo=random(-5,5), yo=random(-5,5)
      circle(width/8*c+xo,height/8*r+yo,50)
    }    
  }
  pattern.loadPixels()
  msk.loadPixels()
  for (let i=0; i < pattern.pixels.length; i+=4){
      pattern.pixels[i+3] = msk.pixels[i+3]
  }
  pattern.updatePixels()
  image(pattern,0,0)
}