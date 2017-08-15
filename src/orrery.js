/* global THREE, THREEx, loader, getObject, updateObject, getOrbit, datetimepicker, particleshader, has, settings, $, px */
var Orrery = {
  version: '0.5'
};

var container, parNode, renderer, scene, camera,
    width, height, cfg, sbomesh,
    renderFcts= [];

THREEx.Planets.baseURL = "images/maps/";
THREEx.Planets.scale = 0.1;

var display = function(config, date) {
  var dt = date || new Date(),
      interval = 86400, 
      parID = null; 

  cfg = settings.set(config); 

  parNode = $(cfg.container);
  if (parNode) { 
    parID = "#" + cfg.container;
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

  // store all dynamic bodies
  container = d3.select(parID).append("container");

  // init renderer
  renderer = new THREE.WebGLRenderer({antialias : true});
  renderer.setClearColor("#000");
  renderer.setSize( width, height );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  
  parNode.appendChild(renderer.domElement );
  
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);
  
  camera = new THREE.PerspectiveCamera(45, width/height, 0.01, 10000);
  camera.position.z = 3.5;
  camera.position.y = 2;
  var controls = new THREE.OrbitControls(camera);

  scene.add(new THREE.AmbientLight( 0x333333 ));

  var light = new THREE.PointLight( 0xffffff, 1, 0 );
  light.castShadow = true;
  //light.shadow.bias = 0.01;
  
  var mesh = THREEx.Planets.create("sol");
  light.add(mesh);
  scene.add(light);


  //Display planets with texture and orbital track
  d3.json('data/planets.json', function(error, json) {
    if (error) return console.log(error);
    
    var data = [];
    
    for (var key in json) {
      if (!has(json, key)) continue;
      var datum = {id: key};
      //object: pos[x,y,z],name,r,icon,elements
      var planet = getObject(dt, json[key]);
      datum.body = planet;
      
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
        datum.track = line;
      }
      var mesh = THREEx.Planets.create(key);
      if (!mesh) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), new THREE.MeshPhongMaterial({color: "#fff"})); 
      }
      mesh.position.fromArray(planet.pos);
      scene.add(mesh);
      
      datum.mesh = mesh;
      data.push(datum);
    }
    container.selectAll(".planets").data(data)
      .enter().append("path")
      .attr("class", "planet")
      .attr("id", function(d) { return d.id; } );
  });

  //Display Small bodies as dots
  d3.json('data/sbo.json', function(error, json) {
    if (error) return console.log(error);

    var data = [],
        length = Object.keys(json).length,
			  positions = new Float32Array( length * 3 ),
			  colors = new Float32Array( length * 3 ),
			  sizes = new Float32Array( length ),
        i = 0;
        
    for (var key in json) {
      if (!has(json, key)) continue;
      var datum = {id: key};
      //sbos: pos[x,y,z],name,r
      var sbo = getObject(dt, json[key]);
      datum.body = sbo;
      
      var vec = new THREE.Vector3().fromArray(sbo.pos);
      vec.toArray( positions, i * 3 );
      
      var col = new THREE.Color( 0xe9d1b1 ); 
      col.toArray( colors, i * 3 );
      
      sizes[i] = sbo.r;
      i++;
      
      data.push(datum);
    }
   
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
    geometry.addAttribute( 'ca', new THREE.BufferAttribute( colors, 3 ) ); 
      
    sbomesh = new THREE.Points( geometry, particleshader );
    //sbomesh.receiveShadow = true;

    scene.add( sbomesh );

    container.selectAll(".sbos").data( data )
      .enter().append("path")
      .attr("class", "sbo")
      .attr("id", function(d) { return d.id; } );
  });
  
  // render the scene
  renderFcts.push(function(){
    //meshes.forEach( function(d, i) { d.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rot[i]); })
    
    var p = camera.position;
    scene.fog.density = 0.05 / Math.pow( p.x*p.x + p.y*p.y + p.z*p.z, 0.5 );
    renderer.render(scene, camera);  
  });
  
  if (cfg.date === true) {
    var pick = datetimepicker({callback: function(date, tz) {
      dt.setTime(date.valueOf());
      d3.select("#datetime").html(pick.date());
      Orrery.update(dt);
    }, target: "#datetime", time: false, dateselect: false, startofweek: 0});

    d3.select(parID).append("div").attr("id", "datetime").html( pick.date() ).on("click", function() { pick(dt); });
        
  }
  
  init();
};


var update = function(dt) {
  container.selectAll(".planet").each(function(d) { 
    var pos = updateObject(dt, d.body);
    if (!pos) return;
    d.body.pos = pos;
    d.mesh.position.fromArray(pos);
  });
  
  var positions = sbomesh.geometry.getAttribute( 'position' ).array; 

  container.selectAll(".sbo").each(function(d, i) { 
    var pos = updateObject(dt, d.body);
    //d.body.pos = pos;
    var vec = new THREE.Vector3().fromArray(pos);
    vec.toArray( positions, i * 3 );

    //sbomeshes[d.size-1].geometry.vertices[d.vertex].fromArray(pos);
   
    //d.mesh.position.fromArray(pos);
  });
  sbomesh.geometry.attributes.position.needsUpdate = true;
  
};

// handle window resize
window.addEventListener('resize', function(){
  var stl = window.getComputedStyle(parNode, null);
  width = parseInt(stl.width);
  height = parseInt(stl.height);
  
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
Orrery.update = update;
Orrery.animate = function(dt) {
  update(dt);
  dt.setDate(dt.getDate() + 1);  
  setTimeout(Orrery.animate, 100,  dt);
};
