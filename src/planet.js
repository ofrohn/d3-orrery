var Planets = Planets || {};

Planets.baseURL = 'images/';

var deg2rad = Math.PI / 180;

var loader = new THREE.TextureLoader();

Planets.params = {
  "sol": {map: "sunmap.jpg", radius: 1.5, tilt: 7.25, rot: 1.0438},
  "mer": {map: "mercurymap.jpg", bump:"mercurybump.jpg", radius: 0.3, tilt: 0, rot: 58.646},
  "ven": {map: "venusmap.jpg", radius: 0.4, tilt: 177.3, rot: 4.05},
  "ter": {map: "earthmapclouds.jpg", bump:"earthbump.jpg", radius: 0.4, tilt: 23.45, rot: 0.9973},
  "lun": {map: "moonmap.jpg", bump:"moonbump.jpg", radius: 0.25, tilt: 1.54, rot: 27.3217},
  "mar": {map: "marsmap.jpg", bump:"marsbump.jpg", radius: 0.35, tilt: 25.19, rot: 1.026},
  "cer": {map: "ceresmap.jpg", radius: 0.15, tilt: 4.0, rot: 0.378},
  "ves": {map: "vestamap.jpg", bump: "vestabump.jpg", radius: 0.15, tilt: 29.0, rot: 0.223},
  "jup": {map: "jupitermap.jpg", radius: 1.2, tilt: 3.12, rot: 0.414,
             ring: {map: "jupiterrings.gif", radius: 3.2, opacity: 0.5} },
  "sat": {map: "saturnmap.jpg", radius: 1.2, tilt: 26.73, rot: 0.444, 
             ring: {map: "saturnrings.gif", radius: 2.5, opacity: 0.9} },
  "ura": {map: "uranusmap.jpg", radius: 1.0, tilt: 97.86, rot: 0.718, 
             ring: {map: "uranusrings.gif", radius: 2.0, opacity: 0.6} },
  "nep": {map: "neptunemap.jpg", radius: 1.0, tilt: 29.56, rot: 0.671, 
             ring: {map: "neptunerings.gif", radius: 2.4, opacity: 0.8} },
  "plu": {map: "plutomap.jpg", radius: 0.2, tilt: 122.53, rot: 6.387}  
}

Planets.create = function(body) {
  if (!Planets.params.hasOwnProperty(body)) return console.log("Object not found: " + body);
  var p = Planets.params[body], arg = {};
  
  var geometry = new THREE.SphereGeometry(p.radius, 32, 32);
  
  arg.map = loader.load(Planets.baseURL + p.map);

  if (p.hasOwnProperty("bump")) {
    arg.bumpMap = loader.load(Planets.baseURL + p.bump);  
    arg.bumpScale = 0.05;
  }  
  if (p.hasOwnProperty("spec")) {
    arg.specularMap = loader.load(Planets.baseURL + p.spec);  
    arg.specular = new THREE.Color('grey');
  }
  
  var material = new THREE.MeshPhongMaterial(arg);
  var mesh = new THREE.Mesh(geometry, material);
  
  if (p.hasOwnProperty("ring")) {
    mesh.receiveShadow	= true
    mesh.castShadow = true
    var ring = Planets.createRing(body);
    ring.receiveShadow	= true
    ring.castShadow = true
    mesh.add(ring);
  };
  /*if (body === "earth") {
    var cloud = Planets.createEarthCloud();
    mesh.add(cloud);
  }*/
  mesh.rotation.set(0, 0, p.tilt * deg2rad);  
  return mesh;
}
  
  
Planets.createRing = function(body) {
  var p = Planets.params[body], map = Planets.baseURL + p.ring.map;
  
  // create destination canvas
  var cnv = document.createElement('canvas');
  cnv.width = 1024;
  cnv.height = 64;
  var ctx = cnv.getContext('2d');

  // load ringmap
  var imageMap = new Image();
  imageMap.addEventListener("load", function() {
    
    // create dataMap ImageData for ringmap
    var cnvMap = document.createElement('canvas');
    cnvMap.width = imageMap.width;
    cnvMap.height= imageMap.height;
    var ctxMap = cnvMap.getContext('2d');
    ctxMap.drawImage(imageMap, 0, 0);
    var dataMap = ctxMap.getImageData(0, 0, cnvMap.width, cnvMap.height);

    var imageTrans = new Image();
    imageTrans.addEventListener("load", function() {
      var cnvTrans = document.createElement('canvas');
      cnvTrans.width = imageTrans.width;
      cnvTrans.height = imageTrans.height;
      var ctxTrans = cnvTrans.getContext('2d');
      ctxTrans.drawImage(imageTrans, 0, 0);
      var dataTrans = ctxTrans.getImageData(0, 0, cnvTrans.width, cnvTrans.height);
      // merge dataMap + dataTrans into dataResult
      var dataResult = ctxMap.createImageData(cnv.width, cnv.height);
      for(var y = 0, offset = 0; y < imageMap.height; y++) {
        for(var x = 0; x < imageMap.width; x++, offset += 4) {
          dataResult.data[offset+0] = dataMap.data[offset+0];
          dataResult.data[offset+1] = dataMap.data[offset+1];
          dataResult.data[offset+2] = dataMap.data[offset+2];
          dataResult.data[offset+3] = dataTrans.data[offset+0];
        }
      }
      // update texture with result
      ctx.putImageData(dataResult,0,0);
      material.map.needsUpdate = true;
    })
    imageTrans.src = map;
  }, false);
  imageMap.src = map;
  
  var geometry = new Planets._RingGeometry(p.radius + 0.05, p.ring.radius, 64);
  var material = new THREE.MeshPhongMaterial({
    map: new THREE.Texture(cnv),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: p.ring.opacity,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.lookAt(new THREE.Vector3(0,1,0));
  return mesh;
};

Planets.createEarthCloud = function() {
  // create destination canvas
  var canvasResult = document.createElement('canvas');
  canvasResult.width = 1024;
  canvasResult.height = 512;
  var contextResult = canvasResult.getContext('2d');

  // load earthcloudmap
  var imageMap = new Image();
  imageMap.addEventListener("load", function() {
    
    // create dataMap ImageData for earthcloudmap
    var canvasMap = document.createElement('canvas');
    canvasMap.width = imageMap.width;
    canvasMap.height= imageMap.height;
    var contextMap = canvasMap.getContext('2d');
    contextMap.drawImage(imageMap, 0, 0);
    var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height);

    // load earthcloudmaptrans
    var imageTrans = new Image();
    imageTrans.addEventListener("load", function() {
      // create dataTrans ImageData for earthcloudmaptrans
      var canvasTrans   = document.createElement('canvas');
      canvasTrans.width = imageTrans.width;
      canvasTrans.height = imageTrans.height;
      var contextTrans = canvasTrans.getContext('2d');
      contextTrans.drawImage(imageTrans, 0, 0);
      var dataTrans   = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height);
      // merge dataMap + dataTrans into dataResult
      var dataResult   = contextMap.createImageData(canvasMap.width, canvasMap.height);
      for(var y = 0, offset = 0; y < imageMap.height; y++){
        for(var x = 0; x < imageMap.width; x++, offset += 4){
          dataResult.data[offset+0] = dataMap.data[offset+0];
          dataResult.data[offset+1] = dataMap.data[offset+1];
          dataResult.data[offset+2] = dataMap.data[offset+2];
          dataResult.data[offset+3] = 255 - dataTrans.data[offset+0];
        }
      }
      // update texture with result
      contextResult.putImageData(dataResult,0,0)  
      material.map.needsUpdate = true;
    })
    imageTrans.src = Planets.baseURL + 'earthcloudmaptrans.jpg';
  }, false);
  imageMap.src = Planets.baseURL + 'earthcloudmap.jpg';

  var geometry = new THREE.SphereGeometry(Planets.params.earth.radius + 0.005, 32, 32);
  var material = new THREE.MeshPhongMaterial({
    map    : new THREE.Texture(canvasResult),
    side    : THREE.DoubleSide,
    transparent  : true,
    opacity    : 0.9,
  });
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}


Planets._RingGeometry = function(innerRadius, outerRadius, thetaSegments) {

  THREE.Geometry.call( this );

  innerRadius = innerRadius || 0;
  outerRadius = outerRadius || 50;
  thetaSegments = thetaSegments  || 8;

  var normal = new THREE.Vector3( 0, 0, 1 );

  for(var i = 0; i < thetaSegments; i++ ){
    var angleLo = (i / thetaSegments) *Math.PI*2;
    var angleHi = ((i+1) / thetaSegments) *Math.PI*2;

    var vertex1 = new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
    var vertex2 = new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
    var vertex3 = new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
    var vertex4 = new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

    this.vertices.push( vertex1 );
    this.vertices.push( vertex2 );
    this.vertices.push( vertex3 );
    this.vertices.push( vertex4 );
    

    var vertexIdx = i * 4;

    // Create the first triangle
    var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
    var uvs = [];

    var uv = new THREE.Vector2(0, 0);
    uvs.push(uv);
    var uv = new THREE.Vector2(1, 0);
    uvs.push(uv);
    var uv = new THREE.Vector2(0, 1);
    uvs.push(uv);

    this.faces.push(face);
    this.faceVertexUvs[0].push(uvs);

    // Create the second triangle
    var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
    var uvs = [];

    var uv = new THREE.Vector2(0, 1);
    uvs.push(uv);
    var uv = new THREE.Vector2(1, 0);
    uvs.push(uv);
    var uv = new THREE.Vector2(1, 1);
    uvs.push(uv);

    this.faces.push(face);
    this.faceVertexUvs[0].push(uvs);
  }

  //this.computeCentroids();
  this.computeFaceNormals();

  this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );
};
Planets._RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
