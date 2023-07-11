precision mediump float;
precision mediump int;

uniform sampler2D tex;
varying vec2 vUv;

void main() {
  vec4 sampledTexture = texture2D(tex, vUv);
  
  // Use the sampled texture's alpha for the gl_FragColor
  gl_FragColor = vec4(sampledTexture.rgb, sampledTexture.a);
}
