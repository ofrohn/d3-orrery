/* global THREE */
//from https://github.com/mrdoob/three.js/blob/master/examples/webgl_custom_attributes_points2.html
var texture = new THREE.TextureLoader().load( "maps/circle.png" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

var particleshader = new THREE.ShaderMaterial( {
  uniforms: {
    //amplitude: { value: 1.0 },
    color:     { value: new THREE.Color( 0xffffff ) },
    texture:   { value: texture }
  },
  vertexShader:  [
    "attribute float size;",
    "attribute vec3 ca;",
    "varying vec3 vColor;",
    "void main() {",
      "vColor = ca;",
      "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
      "gl_PointSize = size * ( 1.0 / -mvPosition.z );",
      "gl_Position = projectionMatrix * mvPosition;",
    "}"  
  ].join( "\n" ),
  fragmentShader: [
    "uniform vec3 color;",
    "uniform sampler2D texture;",
    "varying vec3 vColor;",
    "void main() {",
      "vec4 color = vec4( color * vColor, 1.0 ) * texture2D( texture, gl_PointCoord );",
      "gl_FragColor = color;",
    "}"
  ].join( "\n" ),  
  transparent:    true
  //lights: true
});
