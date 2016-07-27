/* global getRotation, getObject, updateObject, getOrbit, vMultiply, has, settings, $, px */
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
	//renderer.shadowMapEnabled	= true;
  
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);
  

  camera = new THREE.PerspectiveCamera(45, width/height, 0.01, 10000);
  camera.position.z = 3.5;
  camera.position.y = 2;
  var controls = new THREE.OrbitControls(camera);

  var light = new THREE.AmbientLight( 0xffffff )
  scene.add(light);

  
  container = d3.select(parID).append("container");
  
  var mesh = Planets.create("sol");
  scene.add(mesh);


  //Display planets with image and orbital track
  d3.json('data/planets.json', function(error, json) {
    if (error) return console.log(error);
          
    for (var key in json) {
      var dat = {};
      if (!has(json, key)) continue;
      //object: pos[x,y,z],name,r,icon,elements
      var planet = getObject(dt, json[key]);
      dat.body = planet;
      
      if (has(json[key], "trajectory")) {
        //track: [x,y,z]
        var track = getOrbit(dt, json[key]);
        var mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors,
          fog: true
        });
        mat.transparent = true;
        mat.opacity = 0.6;

        var line = new THREE.Line(track, mat);
        scene.add(line);
        dat.track = line;
      }
      var mesh = Planets.create(key);
      if (!mesh) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshPhongMaterial({color: "#fff"})); 
      }
      mesh.position.fromArray(planet.pos);
      scene.add(mesh);
      dat.mesh = mesh;
    }

    
 /*
        
    container.selectAll(".planets").data(planets)
      .enter().append("path")
      .attr("class", "planet");
*/    
  });

  //Display Small bodies as dots
  d3.json('data/sbo.json', function(error, json) {
    if (error) return console.log(error);
    
   var geo = new THREE.Geometry();
   var mat = new THREE.PointsMaterial({
     color:0xffffff, 
     size:0.01,
     fog: true
   });
   for (var key in json) {
      var dat = {};
      if (!has(json, key)) continue;
      //sbos: pos[x,y,z],name,r
      //if (json[key].H >= 11) continue;
      var sbo = getObject(dt, json[key]);
      var vec = new THREE.Vector3();
      vec.fromArray(sbo.pos);
      geo.vertices.push(vec);
    }
    var pts = new THREE.Points(geo, mat);
    scene.add(pts);
  });
  
  // render the scene
  renderFcts.push(function(){
    //meshes.forEach( function(d, i) { d.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rot[i]); })
    var p = camera.position;
    scene.fog.density = 0.2 / Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
    renderer.render(scene, camera);  
  });
  
  init();
}


// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix()  
}, false);

 
// run the rendering loop
var lastTimeMsec= null;
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
    })
  })
}

Orrery.display = display;

/*

var update = function(dt) {
  var i, pos;
  var textureLoader = new THREE.TextureLoader(); 
  
  d3.selectAll(".planet").each( function(d, i) {
    var map = textureLoader.load("img/" + d.icon);
    var mat = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true});
    var sprite = new THREE.Sprite(mat);
    sprite.position.set(d.pos.x, d.pos.y, d.pos.z);
    scene.add(sprite);
  });
  
  //redraw();
};


var display = function(config, date) {
  
     
  
  //Display spacecraft with images (opt. text/trajectory)
  if (cfg.spacecraft.show) { 
    d3.json('data/probes.json', function(error, json) {
      if (error) return console.log(error);
      
      for (var key in json) {
        if (!has(json, key)) continue;
        //object: pos[x,y,z],name,r,icon
        var pr = getObject(dt, json[key]);
        if (pr) probes.push(pr);
      }
    
      //trajectory
      if (cfg.spacecraft.trajectory) { 

      } 
      
      //image or dot
     sc = helio.selectAll(".probes").data(probes);
        
      if (cfg.spacecraft.image) { 
        sc.enter().append("image")
          .attr("xlink:href", function(d) { return "img/" + d.icon; } )
          .attr("transform", translate)
          .attr("class", "sc")
          .attr("width", function(d) { return d.r; }  )
          .attr("height", function(d) { return d.r; }  );
      } else {
        sc.enter().append("path")
          .attr("transform", translate)
          .attr("class", "sc")
          .attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));        
      }
    });
    
  }
  
  d3.select(window).on('resize', resize);

  render();
  
};

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}




function resize() {
  if (cfg.width && cfg.width > 0) return;
  width = parNode ? parNode.clientWidth : window.innerWidth;
  height = parNode ? parNode.clientHeight : window.innerHeight;
  svg.attr("width", width).attr("height", height);
  helio.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

  redraw();
}

//Projected trajectory from [x,y,z] vector array
function translate_tracks(tracks) {
  var res = [];
  
  tracks.forEach( function(track) {
    var t = [];
    for (var i=0; i<track.length; i++) {
      var p = vMultiply(rmatrix, track[i]);
      p[0] *= scale; p[2] *= scale;  
      t.push([p[0],-p[2]]);
    }
    res.push(t);
  });
  return res;
}

//Projected position from [x,y,z] vector
function translate(d) {
  var p = vMultiply(rmatrix, d.pos),
      off = d.r / 2,
      offx = d.name == "Saturn" ? d.r*1.35 : off;
  p[0] *= scale;  
  p[2] *= scale;  
  if (off) {
    p[0] -= offx;
    p[2] += off;
  }
  return "translate(" + p[0] + "," + -p[2] + ")";
}

function redraw() {
  //d3.event.preventDefault();
  scale = zoom.scale();  
  if (d3.event && d3.event.sourceEvent.type !== "wheel") {
    var trans = zoom.translate();
    angle = [30-z(trans[1]), 0, 90+x(trans[0])];
    rmatrix = getRotation(angle);
  }
  //console.log(d3.event.sourceEvent.type);
  //console.log(x(trans[0]) + ", " + y(trans[1]));

  var rsun = Math.pow(scale, 0.8);
  sun.attr({"x": -rsun/2, "y": -rsun/2, "width": rsun, "height": rsun});
  
  pl.attr("transform", translate);

  tdata = translate_tracks(tracks);
  tr.data(tdata).attr("d", line);
  
  sb.attr("transform", translate);
  if (sc) sc.attr("transform", translate);
}

Orrery.display = display;
Orrery.update = update;
*/