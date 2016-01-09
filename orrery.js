// Copyright 2015 Olaf Frohn https://github.com/ofrohn, see LICENSE
!(function() {//Matrix calculations

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

function $(id) { return document.getElementById(id); }
function px(n) { return n + "px"; } 
function Round(x, dg) { return(Math.round(Math.pow(10,dg)*x)/Math.pow(10,dg)); }
function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

function has(o, key) { return o !== null && hasOwnProperty.call(o, key); }
function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
function isArray(o) { return Object.prototype.toString.call(o) === "[object Array]"; }
function isObject(o) { var type = typeof o;  return type === 'function' || type === 'object' && !!o; }
function isFunction(o) { return typeof o == 'function' || false; }


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
  normalize0: function(val) {  return ((val + Math.PI*3) % (Math.PI*2)) - Math.PI;  },
  normalize: function(val) {  return ((val + Math.PI*2) % (Math.PI*2));  },  
  deg2rad: function(val)  {  return val * Math.PI / 180; },
  hour2rad: function(val) {  return val * Math.PI / 12; },
  rad2deg: function(val)  {  return val * 180 / Math.PI; },
  rad2hour: function(val) {  return val * 12 / Math.PI; },
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
  //ecliptic(dat);
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
  
  var res = {name: d.name, pos: [pos.x, pos.y, pos.z], elements: d.elements};
  // size
  if (d.H && d.H !== "") res.r = 12 -d.H;
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

  return [pos.x, pos.y, pos.z];
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
  var e = d.elements[0], res = [],
      p, p0 = transform(e, dt);
  
  var period = p0.P,
      end = dtAdd(dt, period, "y"),
      step = dtDiff(dt, end)/45/(p0.a),
      current = new Date(dt.valueOf());
  
  while (dtDiff(current, end) > 0) {
    p = transform(e, current);
    res.push([p.x,p.y,p.z]);
    current = dtAdd(current, step);
  }

  res.push([p0.x,p0.y,p0.z]);
  
  return res;
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
  version: '0.2',
  svg: null
};

var svg, helio, z, x, rmatrix,
    parNode,
    scale = 60, 
    angle = [30, 0, 90],
    width, height, cfg,
    sun, pl, tr, sc, sb,
    planets = [], sbos = [], probes = [], tracks = [], tdata;

var zoom = d3.behavior.zoom().center([0, 0]).scaleExtent([1, 150]).scale(scale).on("zoom", redraw);
var line = d3.svg.line().x( function(d) { return d[0]; } ).y( function(d) { return d[1]; } );

var update = function(dt) {
  var i, pos;
  
  for (i=0; i<planets.length; i++) {
    pos = updateObject(dt, planets[i].elements);
    if (pos) planets[i].pos = pos;
  }  

  for (i=0; i<sbos.length; i++) {
    pos = updateObject(dt, sbos[i].elements);
    if (pos) sbos[i].pos = pos;
  }  

  for (i=0; i<probes.length; i++) {
    pos = updateObject(dt, probes[i].elements);
    if (pos) probes[i].pos = pos;
  }  
  
  redraw();
};

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
    parNode = null; 
  }

  // Can be in box element par, otherwise full screen
  width = parNode ? parNode.clientWidth : window.innerWidth;
  height = parNode ? parNode.clientHeight : window.innerHeight;

  //var trans = transform(dt);

  //Rotation matrix
  rmatrix = getRotation(angle);

  //Scales for rotation with dragging
  x = d3.scale.linear().domain([-width/2, width/2]).range([-360, 360]);
  z = d3.scale.linear().domain([-height/2, height/2]).range([90, -90]).clamp(true);

  svg = d3.select(parID).append("svg").attr("width", width).attr("height", height).call(zoom);

  //Coordinate origin [0,0] at Sun position
  helio = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");

  var rsun = Math.pow(scale, 0.8);
  sun = helio.append("image")
     .attr({"xlink:href": "img/sun.png",
            "x": -rsun/2,
            "y": -rsun/2,
            "width": rsun,
            "height": rsun});


  //Display planets with image and orbital track
  if (cfg.planets.show) { 
    d3.json('data/planets.json', function(error, json) {
      if (error) return console.log(error);
            
      for (var key in json) {
        if (!has(json, key)) continue;
        //object: pos[x,y,z],name,r,icon,elements
        planets.push(getObject(dt, json[key]));
        //track: [x,y,z]
        if (cfg.planets.trajectory && has(json[key], "trajectory"))
          tracks.push(getOrbit(dt, json[key]));
      }
      
      if (cfg.planets.trajectory) {
        tdata = translate_tracks(tracks);

        tr = helio.selectAll(".tracks").data(tdata)
          .enter().append("path")
          .attr("class", "dot")            
          .attr("d", line); 
      } 
      
      pl = helio.selectAll(".planets").data(planets);
      
      if (cfg.planets.image) {
        pl.enter().append("image")
          .attr("xlink:href", function(d) { return "img/" + d.icon; } )
          .attr("transform", translate)
          .attr("class", "planet")
          .attr("width", function(d) { return d.name == "Saturn" ? d.r*2.7 : d.r; } )
          .attr("height", function(d) { return d.r; } );
      } else {
        pl.enter().append("path")
          .attr("transform", translate)
          .attr("class", "planet")
          .attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));        
      }
    });
     
  }
  
  //Display Small bodies as dots
  if (cfg.sbos.show) { 
    d3.json('data/sbo.json', function(error, json) {
      if (error) return console.log(error);
      
      for (var key in json) {
        if (!has(json, key)) continue;
        //sbos: pos[x,y,z],name,r
        if (json[key].H < 11)
          sbos.push(getObject(dt, json[key]));
      }
      //console.log(objects);
      
      sb = helio.selectAll(".sbos").data(sbos)
        .enter().append("path")
        .attr("transform", translate)
        .attr("class", "sbo")
        .attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));

    });
  }
  
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
      /*if (cfg.spacecraft.trajectory) { 

      } */     
      
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
};

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
Orrery.update = update;this.Orrery = Orrery;
})();