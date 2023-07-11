// texture.frag
#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D tex;
varying vec2 vTexCoord;

void main() {
  vec4 col = texture2D(tex, vTexCoord);
  gl_FragColor = col;
}
