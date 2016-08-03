/* global THREE, THREEx, loader, getObject, updateObject, getOrbit, has, settings, $, px */
var Orrery = {
  version: '0.4'
};

var container, parNode, renderer, scene, camera,
    width, height, cfg,
    renderFcts= [];

var display = function(config, date) {
  var dt = date || new Date(),
      parID = null; 

  cfg = settings.set(config); 

  parNode = $(cfg.container);
  if (parNode) { 
    parID = "#"+cfg.container;
    var stl = window.getComputedStyle(parNode, null);
    if (!parseInt(stl.width) && !cfg.width) parNode.style.width = px(window.innerWidth);    
    if (!parseInt(stl.height) && !cfg.height) parNode.style.height = px(window.innerHeight);    
  } else { 
    parID = "body"; 
    parNode = document.body; 
  }

  // Can be in box element parNode, otherwise full screen
  width = parNode ? parNode.clientWidth : window.innerWidth;
  height = parNode ? parNode.clientHeight : window.innerHeight;

  // init renderer
  renderer = new THREE.WebGLRenderer({antialias : true});
  renderer.setClearColor("#000");
  renderer.setSize( width, height );
  parNode.appendChild(renderer.domElement );
  //renderer.shadowMapEnabled  = true;
  
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);
  

  camera = new THREE.PerspectiveCamera(45, width/height, 0.01, 10000);
  camera.position.z = 3.5;
  camera.position.y = 2;
  var controls = new THREE.OrbitControls(camera);

  var light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  container = d3.select(parID).append("container");
  
  var mesh = THREEx.Planets.create("sol");
  scene.add(mesh);


  //Display planets with image and orbital track
  d3.json('data/planets.json', function(error, json) {
    if (error) return console.log(error);
          
    for (var key in json) {
      if (!has(json, key)) continue;
      var dat = {};
      //object: pos[x,y,z],name,r,icon,elements
      var planet = getObject(dt, json[key]);
      dat.body = planet;
      
      if (has(json[key], "trajectory")) {
        //track: [x,y,z]
        var track = getOrbit(dt, json[key]);
        var mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors,
          transparent: true,
          opacity: 0.6,
          fog: true
        });

        var line = new THREE.Line(track, mat);
        scene.add(line);
        dat.track = line;
      }
      var mesh = THREEx.Planets.create(key);
      if (!mesh) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), new THREE.MeshPhongMaterial({color: "#fff"})); 
      }
      mesh.position.fromArray(planet.pos);
      scene.add(mesh);
      dat.mesh = mesh;
    }

    
 
        
    //container.selectAll(".planets").data(planets)
    //  .enter().append("path")
    //  .attr("class", "planet");
    
  });

  //Display Small bodies as dots
  d3.json('data/sbo.json', function(error, json) {
    if (error) return console.log(error);
    
   var map = new THREE.TextureLoader().load("images/ast.png");
   //12 diff sizes
   var mat = [], geo = [], basesize = 0.006;
   for (var i=1; i<=12; i++) {
     geo.push(new THREE.Geometry());
     mat.push(new THREE.PointsMaterial({
       color:0xffffff, 
       map: map,
       blending: THREE.AdditiveBlending,
       size: basesize * i,
       transparent: true,
       fog: true
     }));
   }
   for (var key in json) {
      if (!has(json, key)) continue;
      var dat = {};
      //sbos: pos[x,y,z],name,r
      //if (!isNumber(json[key].H)) { console.log(key); continue; }
      var sbo = getObject(dt, json[key]);
      var vec = new THREE.Vector3();
      vec.fromArray(sbo.pos);
      var index = Math.floor(sbo.r);
      if (index > 12) index = 12;
      geo[index-1].vertices.push(vec);
    }
    for (i=0; i<12; i++) {
      scene.add(new THREE.Points(geo[i], mat[i]));
    }
  });
  
  // render the scene
  renderFcts.push(function(){
    //meshes.forEach( function(d, i) { d.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rot[i]); })
    var p = camera.position;
    scene.fog.density = 0.05 / Math.pow(p.x*p.x + p.y*p.y + p.z*p.z, 0.5);
    renderer.render(scene, camera);  
  });
  
  init();
};


// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}, false);

 
// run the rendering loop
var lastTimeMsec = null;
function init() {
  requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    // call each update function
    renderFcts.forEach(function(renderFct) {
      renderFct(deltaMsec/1000, nowMsec/1000);
    });
  });
}

Orrery.display = display;
