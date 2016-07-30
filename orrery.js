// Copyright 2015 Olaf Frohn https://github.com/ofrohn, see LICENSE
!(function() {
var Planets = Planets || {};

Planets.baseURL = 'images/';

var loader = new THREE.TextureLoader();

Planets.params = {
  "sol": {map: "sunmap.jpg", radius: 1.2, tilt: 7.25, rot: 1.0438},
  "mer": {map: "mercurymap.jpg", bump:"mercurybump.jpg", radius: 0.3, tilt: 0, rot: 58.646},
  "ven": {map: "venusmap.jpg", radius: 0.4, tilt: 177.3, rot: 4.05},
  "ter": {map: "earthmapclouds.jpg", bump:"earthbump.jpg", radius: 0.4, tilt: 23.45, rot: 0.9973},
  "lun": {map: "moonmap.jpg", bump:"moonbump.jpg", radius: 0.25, tilt: 1.54, rot: 27.3217},
  "mar": {map: "marsmap.jpg", bump:"marsbump.jpg", radius: 0.35, tilt: 25.19, rot: 1.026},
  "cer": {map: "ceresmap.jpg", radius: 0.15, tilt: 4.0, rot: 0.378},
  "ves": {map: "vestamap.jpg", bump: "vestabump.jpg", radius: 0.15, tilt: 29.0, rot: 0.223},
  "jup": {map: "jupitermap.jpg", radius: 1.2, tilt: 3.12, rot: 0.414,
             ring: {map: "jupiterrings.gif", radius: 2.7, opacity: 0.5} },
  "sat": {map: "saturnmap.jpg", radius: 1.2, tilt: 26.73, rot: 0.444, 
             ring: {map: "saturnrings.gif", radius: 2.6, opacity: 0.9} },
  "ura": {map: "uranusmap.jpg", radius: 1.0, tilt: 97.86, rot: 0.718, 
             ring: {map: "uranusrings.gif", radius: 2.1, opacity: 0.6} },
  "nep": {map: "neptunemap.jpg", radius: 1.0, tilt: 29.56, rot: 0.671, 
             ring: {map: "neptunerings.gif", radius: 2.5, opacity: 0.8} },
  "plu": {map: "plutomap.jpg", radius: 0.2, tilt: 122.53, rot: 6.387}  
};

Planets.create = function(body, param) {
  if (!Planets.params.hasOwnProperty(body)) {
    console.log("Object not found: " + body);
    return null;
  }
  var p = param || Planets.params[body], arg = {};
  
  var geometry = new THREE.SphereGeometry(p.radius/10, 32, 32);
  
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
    mesh.receiveShadow	= true;
    mesh.castShadow = true;
    var ring = Planets.createRing(body);
    ring.receiveShadow	= true;
    ring.castShadow = true;
    mesh.add(ring);
  }
  /*if (body === "earth") {
    var cloud = Planets.createEarthCloud();
    mesh.add(cloud);
  }*/
  mesh.rotation.set(0, 0, p.tilt * deg2rad);  
  return mesh;
};
  
  
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
    });
    imageTrans.src = map;
  }, false);
  imageMap.src = map;
  
  var geometry = new Planets._RingGeometry(p.radius/10 + 0.005, p.ring.radius/10, 64);
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
      contextResult.putImageData(dataResult,0,0);
      material.map.needsUpdate = true;
    });
    imageTrans.src = Planets.baseURL + 'earthcloudmaptrans.jpg';
  }, false);
  imageMap.src = Planets.baseURL + 'earthcloudmap.jpg';

  var geometry = new THREE.SphereGeometry(Planets.params.earth.radius/10 + 0.0005, 32, 32);
  var material = new THREE.MeshPhongMaterial({
    map    : new THREE.Texture(canvasResult),
    side    : THREE.DoubleSide,
    transparent  : true,
    opacity    : 0.9,
  });
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
};


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
    uv = new THREE.Vector2(1, 0);
    uvs.push(uv);
    uv = new THREE.Vector2(0, 1);
    uvs.push(uv);

    this.faces.push(face);
    this.faceVertexUvs[0].push(uvs);

    // Create the second triangle
    face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
    uvs = [];

    uv = new THREE.Vector2(0, 1);
    uvs.push(uv);
    uv = new THREE.Vector2(1, 0);
    uvs.push(uv);
    uv = new THREE.Vector2(1, 1);
    uvs.push(uv);

    this.faces.push(face);
    this.faceVertexUvs[0].push(uvs);
  }

  //this.computeCentroids();
  this.computeFaceNormals();

  this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );
};
Planets._RingGeometry.prototype = Object.create( THREE.Geometry.prototype );

//Matrix calculations

//Multiply 3x3 matrix with 3d-vector
var vMultiply = function(m, v) {
  var res = []; 
  
  for (var i=0; i < 3; i++) {
    var sum = 0;
    for (var k=0; k < 3; k++) {
      sum += m[i][k] * v[k];
    }
    res[i] = sum;
  }
  return res;  
};

//Multiply two 3x3 matrices
var mMultiply = function(a, b) {
  var res = [];
  
  for (var i=0; i < 3; i++) {
    res[i] = [];
    for (var j=0; j < 3; j++) {
      var sum = 0;
      for (var k=0; k < 3; k++) {
        sum += b[i][k] * a[k][j];
      }
      res [i][j] = sum;
    }
  }
  return res;  
};

var getRotation = function(angle) {
  //Rotation by z- and x-axis
  return mMultiply(rMatrix("z", angle[2]), rMatrix("x", angle[0]));
};

//Get x/y/z-rotation matrix
var rMatrix = function(axis, θ) {
   var r = -θ * Math.PI / 180,
       c = Math.cos(r), s = Math.sin(r);
      
   switch (axis) {
     case "x": return [[1,0,0],[0,c,s],[0,-s,c]];
     case "y": return [[c,0,-s],[0,1,0],[s,0,c]];
     case "z": return [[c,s,0],[-s,c,0],[0,0,1]];
   }
};

var deg2rad = Math.PI / 180;

function $(id) { return document.getElementById(id); }
function px(n) { return n + "px"; } 
function Round(x, dg) { return(Math.round(Math.pow(10,dg)*x)/Math.pow(10,dg)); }
function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

function has(o, key) { return o !== null && hasOwnProperty.call(o, key); }
function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
function isArray(o) { return Object.prototype.toString.call(o) === "[object Array]"; }
function isObject(o) { var type = typeof o;  return type === 'function' || type === 'object' && !!o; }
function isFunction(o) { return typeof o == 'function' || false; }

function dist(p1, p2){
  var θ1 = p1.θ * deg2rad, ϕ1 = p1.ϕ * deg2rad,
      θ2 = p2.θ * deg2rad, ϕ2 = p2.ϕ * deg2rad;

  return Math.sqrt(p1.r*p1.r + p2.r*p2.r - 2*p1.r*p2.r * (Math.sin(θ1) * Math.sin(θ2) * Math.cos(ϕ1-ϕ2) + Math.cos(θ1) * Math.cos(θ2)));
}


function attach(node, event, func) {
  if (node.addEventListener) node.addEventListener(event, func, false);
  else node.attachEvent("on" + event, func); 
}

function stopPropagation(e) {
  if (typeof e.stopPropagation != "undefined") e.stopPropagation();
  else e.cancelBubble = true;
}

function dtParse(s) {
  if (!s) return; 
  var t = s.split(".");
  if (t.length < 1) return; 
  t = t[0].split("-");
  t[0] = t[0].replace(/\D/g, "");
  if (!t[0]) return; 
  t[1] = t[1]?t[1].replace(/\D/g, ""):"1";
  t[2] = t[2]?t[2].replace(/\D/g, ""):"1";
  
  return new Date(t[0], t[1]-1, t[2]);
}

function dtAdd(dt, val, type) {
  var t, ldt = dt.valueOf();
  if (!val) return new Date(ldt); 
  t = type || "d";
  switch (t) {
    case 'y': case 'yr': ldt += 31556926080*val; break;
    case 'm': case 'mo': ldt += 2629800000*val; break;
    case 'd': case 'dy': ldt += 86400000*val; break;
    case 'h': case 'hr': ldt += 3600000*val; break;
    case 'n': case 'mn': ldt += 60000*val; break;
    case 's': case 'sec': ldt += 1000*val; break;
    case 'ms': ldt += val; break;
  }
  return new Date(ldt);
}


function dtDiff(dt1, dt2, type) {
  var ldt, t, con;
  if (!dt2 || !dt1) return; 
  ldt = dt2.valueOf() - dt1.valueOf();
  t = type || "d";
  switch (t) {
    case 'y': case 'yr': ldt /= 31556926080; break;
    case 'm': case 'mo': ldt /= 2629800000; break;
    case 'd': case 'dy': ldt /= 86400000; break;
    case 'h': case 'hr': ldt /= 3600000; break;
    case 'n': case 'mn': ldt /= 60000; break;
    case 's': case 'sec': ldt /= 1000; break;
    case 'ms': break;
  }
  return ldt;
  //return Math.floor(ldt);
}

function dtFrac(dt) {
  return (dt.getHours() + dt.getTimezoneOffset()/60.0 + dt.getMinutes()/60.0 + dt.getSeconds()/3600.0) / 24;
}


var Trig = {
  sinh: function (val) { return (Math.pow(Math.E, val)-Math.pow(Math.E, -val))/2; },
  cosh: function (val) { return (Math.pow(Math.E, val)+Math.pow(Math.E, -val))/2; },
  tanh: function (val) { return 2.0 / (1.0 + Math.exp(-2.0 * val)) - 1.0; },
  asinh: function (val) { return Math.log(val + Math.sqrt(val * val + 1)); },
  acosh: function (val) { return Math.log(val + Math.sqrt(val * val - 1)); },
  normalize0: function(val) {  return ((val + Math.PI*3) % (Math.PI*2)) - Math.PI; },
  normalize: function(val) {  return ((val + Math.PI*2) % (Math.PI*2)); },  
  //deg2rad: function(val)  {  return val * Math.PI / 180; },
  //hour2rad: function(val) {  return val * Math.PI / 12; },
  //rad2deg: function(val)  {  return val * 180 / Math.PI; },
  //rad2hour: function(val) {  return val * 12 / Math.PI; },
  cartesian: function(p) {
    var θ = p[0] * deg2rad, ϕ = p[1] * deg2rad, r = p[2];
    return [r * Math.sin(ϕ) * Math.cos(θ), r * Math.sin(ϕ) * Math.sin(θ), r * Math.cos(ϕ)];
  },
  spherical: function(p) {
    var r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z),
        θ = Math.atan(p.y / p.x),
        ϕ = Math.acos(p.z / r);
    return  [θ / deg2rad, ϕ / deg2rad, r];
  }
};


var gm = Math.pow(0.01720209895, 2);

var transform = function(item, date, gmass) {
  var dt, i, key, dat = {}, elms = ["a","e","i","w","M","L","W","N","n"];
/*
    ep = epoch (dt)
    N = longitude of the ascending node (deg) Ω
    i = inclination to the ecliptic (plane of the Earth's orbit) (deg) 
    w = argument of perihelion (deg)  ω
    a = semi-major axis, or mean distance from Sun (AU,km)
    e = eccentricity (0=circle, 0-1=ellipse, 1=parabola, >1=hyperbola ) (-)
    M = mean anomaly (0 at perihelion; increases uniformly with time) (deg)
    n = mean daily motion = 2pi/P
    
    W = N + w  = longitude of perihelion ϖ
    L = M + W  = mean longitude
    q = a*(1-e) = perihelion distance
    Q = a*(1+e) = aphelion distance
    P = a ^ 1.5 = orbital period (years if a is in AU, astronomical units)
    T = Epoch_of_M - (M(deg)/360_deg) / P  = time of perihelion
    v = true anomaly (angle between position and perihelion) ν
    E = eccentric anomaly
    
    Mandatory: a, e, i, N, w|W, M|L, dM|n
*/
  
  if (gmass) gm = gmass;

  if (date) {
    if (date instanceof Date) { dt = date; }
    else { dt = dtParse(date); }
  }
  if (!dt) { dt = new Date(); }
  dat.jd = JD(dt);
    
  dt = dtParse(item.ep);
  dat.jd0 = JD(dt);
  dat.d = dat.jd - dat.jd0;
  dat.cy = dat.d / 36525;
  
  for (i=0; i<elms.length; i++) {
    key = elms[i];
    if (has(item, "d"+key)) {
      dat[key] = item[key] + item["d"+key] * dat.cy;
    } else if (has(item, key)) {
      dat[key] = item[key];
    }
    
    if (has(dat, key)) {
      if (key.search(/a|e/) === -1) dat[key] *= Math.PI / 180; 
      else dat[key] *= 1.0;
    }
  }
  if (has(dat, "M") && !has(dat, "dM") && has(dat, "n")) {
    dat.M += (dat.n * dat.d);
  }
  derive(dat);
  trueAnomaly(dat);
  cartesian(dat);
  ecliptic(dat);
  return dat;
};

//AU 149597870.7 km
//gm_sol = 0.0002959122082855911025 (AU^3/d^2)
//gm_earth = 8.8876925870231737638917894479187e-10 (AU^3/d^2)           
//gm_earth = 2975536354019328 (km^3/d^2)  

             

function near_parabolic(E, e) {
  var anom2 = e > 1.0 ? E*E : -E*E,
      term = e * anom2 * E / 6.0,
      rval = (1.0 - e) * E - term,
      n = 4;

  while(Math.abs(term) > 1e-15) {
    term *= anom2 / (n * (n + 1));
    rval -= term;
    n += 2;
  }
  return(rval);
}

function kepler(dat) {
  var curr, err, trial, tmod,
      e = dat.e, M = dat.M,
      thresh = 1e-8,
      offset = 0.0, 
      delta_curr = 1.9, 
      is_negative = false, 
      n_iter = 0;

  if (!M) return(0.0); 

  if (e < 1.0) {
    if (M < -Math.PI || M > Math.PI) {
       tmod = Trig.normalize0(M);
       offset = M - tmod;
       M = tmod;
     }

    if (e < 0.9) {   
      curr = Math.atan2(Math.sin(M), Math.cos(M) - e);
      do {
        err = (curr - e * Math.sin(curr) - M) / (1.0 - e * Math.cos(curr));
        curr -= err;
      } while (Math.abs(err) > thresh);
      return curr; // + offset;
    }
  }

  if ( M < 0.0) {
    M = -M;
    is_negative = true;
  }

  curr = M;
  thresh = thresh * Math.abs(1.0 - e);
             /* Due to roundoff error,  there's no way we can hope to */
             /* get below a certain minimum threshhold anyway:        */
  if ( thresh < 1e-15) { thresh = 1e-15; }
  if ( (e > 0.8 && M < Math.PI / 3.0) || e > 1.0) {   /* up to 60 degrees */
    trial = M / Math.abs( 1.0 - e);

    if (trial * trial > 6.0 * Math.abs(1.0 - e)) {  /* cubic term is dominant */
      if (M < Math.PI) {
        trial = Math.pow(6.0 * M, 1/3);
      } else {       /* hyperbolic w/ 5th & higher-order terms predominant */
        trial = Trig.asinh( M / e);
      }
    }
    curr = trial;
  }
  if (e > 1.0 && M > 4.0) {   /* hyperbolic, large-mean-anomaly case */
    curr = Math.log(M);
  }
  if (e < 1.0) {
    while(Math.abs(delta_curr) > thresh) {
      if ( n_iter++ > 8) {
        err = near_parabolic(curr, e) - M;
      } else {
        err = curr - e * Math.sin(curr) - M;
      }
      delta_curr = -err / (1.0 - e * Math.cos(curr));
      curr += delta_curr;
    }
  } else {
    while (Math.abs(delta_curr) > thresh) {
      if (n_iter++ > 7) {
        err = -near_parabolic(curr, e) - M;
      } else {
        err = e * Trig.sinh(curr) - curr - M;
      }
      delta_curr = -err / (e * Trig.cosh(curr) - 1.0);
      curr += delta_curr;
    }
  }
  return( is_negative ? offset - curr : offset + curr);
}

function trueAnomaly(dat) {
  var v, r, x, y, r0, g, t;

  if (dat.e === 1.0) {   /* parabolic */
    t = dat.jd0 - dat.T;
    g = dat.w0 * t * 0.5;

    y = Math.pow(g + Math.sqrt(g * g + 1.0), 1/3);
    dat.v = 2.0 * Math.atan(y - 1.0 / y);
  } else {          /* got the mean anomaly;  compute eccentric,  then true */
    dat.E = kepler(dat);
    if (dat.e > 1.0) {    /* hyperbolic case */
      x = (dat.e - Trig.cosh(dat.E));
      y = Trig.sinh(dat.E);
    } else {          /* elliptical case */
      x = (Math.cos(dat.E) - dat.e);
      y =  Math.sin(dat.E);
    }
    y *= Math.sqrt(Math.abs(1.0 - dat.e * dat.e));
    dat.v = Math.atan2(y, x);
  }

  r0 = dat.q * (1.0 + dat.e);
  dat.r = r0 / (1.0 + dat.e * Math.cos(dat.v));
}

function derive(dat) {
  if (!dat.hasOwnProperty("w")) {
    dat.w = dat.W - dat.N;
  }
  if (!dat.hasOwnProperty("M")) {
    dat.M = dat.L - dat.W;
  }
  if (dat.e < 1.0) { dat.M = Trig.normalize0(dat.M); }
  dat.P = Math.pow(Math.abs(dat.a), 1.5);
  dat.T = dat.jd0 - (dat.M/Math.PI/2) / dat.P;

  if (dat.e !== 1.0) {   /* for non-parabolic orbits: */
   dat.q = dat.a * (1.0 - dat.e);
   dat.t0 = dat.a * Math.sqrt(Math.abs(dat.a) / gm);
  } else {
   dat.w0 = (3.0 / Math.sqrt(2)) / (dat.q * Math.sqrt(dat.q / gm));
   dat.a = 0.0;
   dat.t0 = 0.0;
  }
  dat.am = Math.sqrt(gm * dat.q * (1.0 + dat.e));
}

function cartesian(dat) {
  var x, y, z, u = dat.v + dat.w;
  x = dat.r * (Math.cos(dat.N) * Math.cos(u) - Math.sin(dat.N) * Math.sin(u) * Math.cos(dat.i));
  y = dat.r * (Math.sin(dat.N) * Math.cos(u) + Math.cos(dat.N) * Math.sin(u) * Math.cos(dat.i));
  z = dat.r * (Math.sin(u) * Math.sin(dat.i));
  dat.x = x;
  dat.y = y;
  dat.z = z;
  return {x:x, y:y, z:z};
}

function ecliptic(dat) {
  var lon, lat;
  lon = Math.atan2(dat.y, dat.x);
  lat = Math.atan2(dat.z, Math.sqrt(dat.x*dat.x + dat.y*dat.y));
  dat.l = Trig.normalize(lon);
  dat.b = lat;
  return {l:lon, b:lat}; 
}

function JD(dt) {  
    var yr = dt.getUTCFullYear(),
        mo = dt.getUTCMonth() + 1,
        dy = dt.getUTCDate(),
        frac = dtFrac(dt),
        j = 0, ly = 0, my, ypmy, djm, djm0 = 2400000.5,
        IYMIN = -4799,         /* Earliest year allowed (4800BC) */
        mtab = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];   /* Month lengths in days */

    if (yr < IYMIN) return -1; 
    if (mo < 1 || mo > 12) return -2; 
    
    if ((mo === 2) && (yr % 4 === 0) && ((yr % 100 !== 0) || (yr % 400 === 0))) { ly = 1; }
    if ( (dy < 1) || (dy > (mtab[mo-1] + ly))) { j = -3; }
     my = (mo - 14) / 12;
     ypmy = yr + my;
     djm = ((1461.0 * (ypmy + 4800.0)) / 4 + (367 * (mo - 2 - 12 * my)) / 12 - (3 * ((ypmy + 4900.0) / 100)) / 4 + dy - 2432076);

     return djm + djm0 + frac;
  }



var getObject = function(dt, d) {
  
  var index = getEpoch(dt, d.elements);
  
  //has special data, todo: find appropriate data
  if (has(d.elements[index], "d")) return;

  var e = d.elements[index];
  var pos = transform(e, dt);
  
  var res = {name: d.name, pos: [-pos.y, pos.z, -pos.x], elements: d.elements};
  // size
  if (d.H && d.H !== "") res.r = 13 - d.H;
  else if (d.r && d.r !== "") res.r = d.r;
  else res.r = 20;
  
  //icon
  if (d.icon && d.icon !== "") res.icon = d.icon;
  
  return res;
};

var updateObject = function(dt, e) {
  var index = getEpoch(dt, e);
  
  //has special data, todo: find appropriate data
  if (has(e[index], "d")) return;

  //var e = d.elements[index];
  var pos = transform(e[index], dt);

  return [-pos.y, pos.z, -pos.x];
};

//Find valid set of elements for date
var getEpoch = function(dt, e) {
  var index = 0;
  
  if (e.length > 1) {
    //find trajectory for date 
    for (var i=0; i<e.length; i++) {
      if (dtDiff(new Date(Date.parse(e[i].ep)), dt) <= 0) {
        index = i===0 ? 0 : i-1;
        break;
      }
    }
  }
  return index;  
};

var getOrbit = function(dt, d) {  
  var e = d.elements[0], 
      col, p, p0 = transform(e, dt),
      geo = new THREE.Geometry();
  
  var period = p0.P,
      end = dtAdd(dt, period, "y"),
      step = dtDiff(dt, end)/90,
      current = new Date(dt.valueOf());
  
  while (dtDiff(current, end) > 0) {
    p = transform(e, current);
    geo.vertices.push(new THREE.Vector3(-p.y, p.z, -p.x));
    col = p.z >= 0 ? 0x999999 : 0x666666;
    geo.colors.push(new THREE.Color(col));

    current = dtAdd(current, step);
  }

  //geo.vertices.push( new THREE.Vector3(-p0.y, p0.z, -p0.x));
  
  return geo;
};

//Default configuration
var settings = {
  width: 0,            // Default width; 0 = full width of parent
  height: 0,           // Default height; 0 = full height of parent
  container: "map",    // ID of parent element, e.g. div
  datapath: "data/",   // Path/URL to data files, empty = subfolder 'data'
  imagepath: "img/",   // Path/URL to image files, empty = subfolder 'img'
  planets: {          
    show: true,        // Show planets, data in planets.json
    image: true,       // With image representation, if dataset contains icon parameter
    trajectory: true,  // Show orbital path as line 
    size: null         // Constant size or function
  },
  sbos: {
    show: true,        // Show small body objects, data in sbo.json
    image: false,      // With image representation, if dataset contains 'icon' parameter
    text: true,        // Show object name, if dataset contains 'designator' parameter
    trajectory: false, // Show orbital path as line 
    size: null         // Constant size or function
  },
  spacecraft: {
    show: false,        // Show spacecraft, data in probes.json
    image: false,      // With image representation, if dataset contains 'icon' parameter
    text: true,        // Show sc name, if dataset contains 'designator' parameter
    trajectory: false, // Show trajectory path as line 
    size: null         // Constant size or function
  },
  other: [             // Additional data  
  /*{file:"",          // JSON filename or url
     image: true,      // With image representation, if dataset contains 'icon' parameter
     text: true,       // Show object name, if dataset contains 'designator' parameter
     trajectory: false,// Show trajectory path as line 
     size: null        // Constant size or function
  },{}                 // Can contain multiple datasets
  */
  ],
  set: function(cfg) { // Override defaults with values of cfg
    var key, res = {};
    if (!cfg) return this; 
    for (var prop in this) {
      if (!has(this, prop)) continue; 
      if (typeof(this[prop]) === 'function') continue; 
      if (!has(cfg, prop) || cfg[prop] === null) { 
        res[prop] = this[prop]; 
      } else if (this[prop] === null || this[prop].constructor != Object ) {
        res[prop] = cfg[prop];
      } else {
        res[prop] = {};
        for (key in this[prop]) {
          if (has(cfg[prop], key)) {
            res[prop][key] = cfg[prop][key];
          } else {
            res[prop][key] = this[prop][key];
          }            
        }
      }
    }
    return res;
  }
};


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
  
  var mesh = Planets.create("sol");
  scene.add(mesh);

	var glowMat = new THREE.SpriteMaterial({ 
		map: loader.load( 'images/corona.jpg' ), 
		useScreenCoordinates: false, 
		color: 0xffff33, 
    transparent: false, 
    blending: THREE.AdditiveBlending
	});
	var glow = new THREE.Sprite(glowMat);
	glow.scale.multiplyScalar(0.4);
	mesh.add(glow);


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
      var mesh = Planets.create(key);
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
    
   var map = loader.load("images/ast.png");
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
this.Orrery = Orrery;
})();