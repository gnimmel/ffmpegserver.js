precision mediump float;
precision mediump int;

// p5.js automatically sets these uniforms
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

// attributes coming from p5.js sketch
attribute vec3 aPosition;

// UV coordinates for texture mapping
varying vec2 vUv;

void main() {
  // Calculate the UV coordinates
  vec4 modelViewPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  vUv = vec2(aPosition.x, aPosition.y) * 0.5 + 0.5;
  
  // Set the position
  gl_Position = uProjectionMatrix * modelViewPosition;
}
