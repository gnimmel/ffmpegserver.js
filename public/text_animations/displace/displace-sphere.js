
let fragmentShaderGood = `
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
  displacement += sin(uTime * 10.0) * 0.06;

  // Add the displacement to the original texture coordinate.
  // Squaring the length for a concave magnification effect.
  vec2 distortedTexCoord = vTexCoord + displacement * toCenter * length(toCenter);

  // Read the original texture with the displaced texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;


let fragmentShaderGood_v2 = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vTexCoord;

void main() {
  // Calculate the vector from the current pixel to the center of the image.
  vec2 toCenter = vec2(0.5) - vTexCoord;

  // Calculate the displacement amount.
  vec2 displacement = abs(toCenter) * 4.9;

  // Add a jiggle motion.
  displacement.x += sin(uTime * 10.0 + toCenter.y * 4.0) * 0.02;
  displacement.y += sin(uTime * 10.0 + toCenter.x * 4.0) * 0.08;

  // Add the displacement to the original texture coordinate.
  // Squaring the length for a concave magnification effect.
  vec2 distortedTexCoord = vTexCoord + displacement * toCenter * length(toCenter);

  // Read the original texture with the displaced texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;

let fragmentShaderOK = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vTexCoord;

void main() {
  // Calculate the vector from the current pixel to the center of the image.
  vec2 toCenter = vec2(0.5) - vTexCoord;

  // Calculate the displacement amount. 
  float displacement = length(toCenter) * length(toCenter) * 4.2;

  // Add the displacement to the original texture coordinate.
  vec2 distortedTexCoord = mix(vTexCoord, vec2(0.5), displacement);

  // Read the original texture with the distorted texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;

let fragmentShaderNO = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vTexCoord;

void main() {
  // Calculate the vector from the current pixel to the center of the image.
  vec2 toCenter = vec2(0.5) - vTexCoord;

  // Calculate the displacement amount. 
  // Apply the sqrt() function to make the displacement grow faster near the edges.
  float displacement = sqrt(length(toCenter)) * 0.95;

  // Add the displacement to the original texture coordinate.
  vec2 distortedTexCoord = mix(vTexCoord, vec2(0.5), displacement);

  // Read the original texture with the distorted texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;

let fragmentShader = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vTexCoord;

void main() {
  // Calculate the vector from the current pixel to the center of the image.
  vec2 toCenter = vec2(0.5) - vTexCoord;

  // Calculate the displacement amount.
  float displacement = sqrt(length(toCenter)) * 2.2;

  // Apply a smoothstep function to only displace pixels near the edges.
  displacement *= smoothstep(0.35, 0.8, length(toCenter));

  // Add the displacement to the original texture coordinate.
  vec2 distortedTexCoord = mix(vTexCoord, vec2(0.5), displacement);

  // Read the original texture with the distorted texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;


// GLSL programs
let vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

let fragment_sphere = `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uSphereRadius;  // New uniform

varying vec2 vTexCoord;

void main() {
  vec2 position = vTexCoord * 2.0 - 1.0;
  
  // Scale the position by the sphere radius
  position *= uSphereRadius;
  
  // Calculate polar coordinates
  float longitude = atan(position.y, position.x);
  float latitude = asin(position.y);
  
  // Rotate the sphere over time
  longitude += uTime * 0.1;
  
  // Map polar coordinates back to 2D
  vec2 sphericalUV = vec2(longitude, latitude) / 3.1415926 * 0.5 + 0.5;
  
  vec4 color = texture2D(uTexture, vec2(sphericalUV.x, 1.0 - sphericalUV.y));

  if (color.a < 0.6) discard;

  gl_FragColor = color;
}
`;

let x, y;
let myFont;
let video;
let shaderProgram;
let graphics, graphicsText2D;
let aspectRatio;
let sphereRadius = 0.85;

function preload() {
  video = createVideo(['/public/videos/36_Competitive_FF4D2F_Particles_Sphere.mp4']);
  myFont = loadFont('/public/fonts/PPMori-Regular.otf');  // Use a local font file
}

function setup() {
  createCanvas(1080*0.65, 1920*0.65, WEBGL);
  
  graphics = createGraphics(width, width, WEBGL);  // Create a 2D graphics for text
  graphics.textFont(myFont);  // Set the font
  graphics.noStroke();
  //graphicsText2D = createGraphics(width, width);  // Create a 2D graphics for text
  //graphicsText2D.textFont(myFont);  // Set the font
  //graphicsText2D.noStroke();

  video.volume(0);  
  video.loop();
  video.hide();
  //video.play();

  shaderProgram = createShader(vertexShader, fragment_sphere);
  shader(shaderProgram);  // Apply the shader to the main canvas
  
  x = graphics.width / 2;
  y = graphics.height / 2;
}

function draw() {
  clear();
  background(220);
  
  
  image(video, -width/2, -height/2, width, height);

  //graphics.background(0, 0, 0, 0);  // Ensure the background is transparent
  //graphics.clear();
  graphics.fill(255,0,0);
  graphics.textSize(40);
  graphics.textAlign(CENTER, CENTER);
  graphics.text('Hello, world!\nlets eat tacos', x, y);
  
  //graphics.clear();
  //graphics.image(graphicsText2D, -graphicsText2D.width/2, -graphicsText2D.height/2);
  //graphics.image(graphicsText2D, 0, 0);
  shader(shaderProgram);  // Apply the shader to the main canvas
  shaderProgram.setUniform('uSphereRadius', sphereRadius);
  shaderProgram.setUniform('uTexture', graphics);  // Pass the HTMLCanvasElement to the shader
  shaderProgram.setUniform('uTime', millis() / 1000.0);




  //rect(-width / 2, -height / 2, width, height);
   // Apply the shader to the main canvas
  //rect(-width / 2, -height / 2, width, height);

  texture(graphics);
  plane(graphics.width, graphics.height);

  //texture(graphics);
  //rect(-width/2, -height/2, graphics.width, graphics.height);

  /*beginShape(TRIANGLES);
  vertex(-1, -aspectRatio, 0, 0, 0);  // Changed texture y-coordinate from 1 to 0
  vertex(1, -aspectRatio, 0, 1, 0);   // Changed texture y-coordinate from 1 to 0
  vertex(1, aspectRatio, 0, 1, 1);    // Changed texture y-coordinate from 0 to 1
  vertex(1, aspectRatio, 0, 1, 1);    // Changed texture y-coordinate from 0 to 1
  vertex(-1, aspectRatio, 0, 0, 1);   // Changed texture y-coordinate from 0 to 1
  vertex(-1, -aspectRatio, 0, 0, 0);  // Changed texture y-coordinate from 1 to 0
  endShape();*/

  /*beginShape(TRIANGLES);
  vertex(-1, -aspectRatio, 0, 0, 1);
  vertex(1, -aspectRatio, 0, 1, 1);
  vertex(1, aspectRatio, 0, 1, 0);
  vertex(1, aspectRatio, 0, 1, 0);
  vertex(-1, aspectRatio, 0, 0, 0);
  vertex(-1, -aspectRatio, 0, 0, 1);
  endShape();*/

  beginShape(TRIANGLES);
  vertex(-1, -1, 0, 0, 1);
  vertex(1, -1, 0, 1, 1);
  vertex(1, 1, 0, 1, 0);
  vertex(1, 1, 0, 1, 0);
  vertex(-1, 1, 0, 0, 0);
  vertex(-1, -1, 0, 0, 1);
  endShape();
  
  //plane(width, width);  // Draw a plane that covers the whole canvas
  //image(graphics, -graphics.width/2, -graphics.height/2);
  //image(graphicsText2D, (width-graphicsText2D.width)/2, (height-graphicsText2D.height)/2);
  //image(graphicsText2D, 0, 0);
}



function clearWithTransparency(g) {
  g.loadPixels();
  for (let i = 0; i < g.pixels.length; i += 4) {
    g.pixels[i] = 0;
    g.pixels[i+1] = 0;
    g.pixels[i+2] = 0;
    g.pixels[i+3] = 0;
  }
  g.updatePixels();
}