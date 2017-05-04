/* global THREE */
//from https://github.com/mrdoob/three.js/blob/master/examples/webgl_custom_attributes_points2.html
var texture = new THREE.TextureLoader().load( "images/ast.png" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;

var particleshader = new THREE.ShaderMaterial( {
  uniforms: {
    color:     { value: new THREE.Color( 0x999999 ) },
    texture:   { value: texture }
  },
  vertexShader:  [
    "attribute float size;",
    "attribute vec3 ca;",
    "varying vec3 vColor;",
    //"varying vec3 vNormal;",
    "void main() {",
      "vColor = ca;",
      //"vNormal = normal;",
      "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
      "gl_PointSize = size * ( 1.0 / -mvPosition.z );",
      "gl_Position = projectionMatrix * mvPosition;",
    "}"  
  ].join( "\n" ),
  fragmentShader: [
    "uniform vec3 color;",
    "uniform sampler2D texture;",
    "varying vec3 vColor;",
    //"varying vec3 vNormal;",
    "void main() {",
      //"vec3 light = vec3(0, 0.01, 0);",
      //"light = normalize(light);",
      "vec4 color = vec4( color * vColor, 1.0 ) * texture2D( texture, gl_PointCoord );",
      //"float dProd = max(0.0, dot(vNormal, light));",
      //"gl_FragColor = vec4(dProd, dProd, dProd, 1.0);",
      "gl_FragColor = color;",
    "}"
  ].join( "\n" ),  
  transparent:    true
  //lights: true
});
