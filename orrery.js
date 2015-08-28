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


var transform = function(item, date, gmass) {
  var dt, i, key, gm, dat = {}, elms = ["a","e","i","w","M","L","W","N"],
/*
    ep = epoch (dt)
    N = longitude of the ascending node (deg)
    i = inclination to the ecliptic (plane of the Earth's orbit) (deg)
    w = argument of perihelion (deg)
    a = semi-major axis, or mean distance from Sun (AU,km)
    e = eccentricity (0=circle, 0-1=ellipse, 1=parabola, >1=hyperbola ) (-)
    M = mean anomaly (0 at perihelion; increases uniformly with time) (deg)
    n = mean daily motion = 2pi/P
    
    W = N + w  = longitude of perihelion
    L = M + W  = mean longitude
    q = a*(1-e) = perihelion distance
    Q = a*(1+e) = aphelion distance
    P = a ^ 1.5 = orbital period (years if a is in AU, astronomical units)
    T = Epoch_of_M - (M(deg)/360_deg) / P  = time of perihelion
    v = true anomaly (angle between position and perihelion)
    E = eccentric anomaly
    
    Mandatory: a, e, i, N, w|W, M|L, dM|n
*/
  near_parabolic = function(E, e) {
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
  },
  kepler = function(dat) {
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
  },
  trueAnomaly = function(dat) {
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
  },
  derive = function(dat) {
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
  },
  cartesian = function(dat) {
    var x, y, z, u = dat.v + dat.w;
    x = dat.r * (Math.cos(dat.N) * Math.cos(u) - Math.sin(dat.N) * Math.sin(u) * Math.cos(dat.i));
    y = dat.r * (Math.sin(dat.N) * Math.cos(u) + Math.cos(dat.N) * Math.sin(u) * Math.cos(dat.i));
    z = dat.r * (Math.sin(u) * Math.sin(dat.i));
    dat.x = x;
    dat.y = y;
    dat.z = z;
    return {x:x, y:y, z:z};
  },
  ecliptic = function(dat) {
    var lon, lat;
    lon = Math.atan2(dat.y, dat.x);
    lat = Math.atan2(dat.z, Math.sqrt(dat.x*dat.x + dat.y*dat.y));
    dat.l = Trig.normalize(lon);
    dat.b = lat;
    return {l:lon, b:lat}; 
  };
  
  gm = gmass || Math.pow(0.01720209895, 2);

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
    dat.M += (dat.n * (Math.PI / 180) * dat.d);
  }
  derive(dat);
  trueAnomaly(dat);
  cartesian(dat);
  //ecliptic(dat);
  return dat;
};

//gm_sol = 0.0002959122082855911025
//gm_earth = 2975247333163008


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


var getObject = function(d) {
  var e = d.elements[0];
  //if (d.length > 1) {
    //find trajectory for date    
  //} 
  var pos = transform(e, dt);
  
  var res = {name: d.name, pos: [pos.x, pos.y, pos.z], r: 12 - d.H };
  //icon
  if (d.icon && d.icon !== "") res.icon = d.icon;
  
  return res;
};


var getOrbit = function(d) {
  var e = d.elements[0], res = [],
      p, p0 = transform(e, dt);
  
  var period = p0.P,
      end = dtAdd(dt, period, "y"),
      step = dtDiff(dt, end)/90/(p0.a),
      current = new Date(dt.valueOf());
  
  while (dtDiff(current, end) > 0) {
    p = transform(e, current);
    res.push([p.x,p.y,p.z]);
    current = dtAdd(current, step);
  }

  res.push([p0.x,p0.y,p0.z]);
  
  return res;
};


var Orrery = {
  version: '0.2',
  svg: null
};


//http://ssd.jpl.nasa.gov/?planet_pos
var planets = [], sbos = [], tracks = [], tdata,
    dt = new Date(),
    angle = [30,0,90],
    scale = 60,  par = null, 
    sun, planet, track, sbo;

var width = par ? par.clientWidth : window.innerWidth,
    height = par ? par.clientHeight : window.innerHeight;

//var trans = transform(dt);
    
var rmatrix = getRotation(angle);

var x = d3.scale.linear().domain([-width/2, width/2]).range([-360, 360]);
var z = d3.scale.linear().domain([-height/2, height/2]).range([90, -90]).clamp(true);

var zoom = d3.behavior.zoom()    
             .center([0, 0])
             //.x(x).y(y)
             .scaleExtent([10, 150])
             .scale(scale)
             //.size([width, height])
             .on("zoom", redraw);

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height).call(zoom);
            
var helio = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");
                //scale(scale)

var rsun = Math.pow(scale, 0.8);
sun = helio.append("image")
   .attr({"xlink:href": "img/sun.png",
          "x": -rsun/2,
          "y": -rsun/2,
          "width": rsun,
          "height": rsun});

var line = d3.svg.line()
     .x( function(d) { return d[0]; } )
     .y( function(d) { return d[1]; } );

          
d3.json('data/planets.json', function(error, json) {
  if (error) return console.log(error);
  
  for (var key in json) {
    if (!has(json, key)) continue;
    //object: pos[x,y,z],name,r,icon
    planets.push(getObject(json[key]));
    //track: [x,y,z]    
    tracks.push(getOrbit(json[key]));
  }
  //console.log(planets);
  
  tdata = translate_tracks(tracks);
  //upd: helio.selectAll(".tracks").data([data]).attr("d", line)
  //.attr("transform", "translate(" + x(1) + ")") 
  track = helio.selectAll(".tracks")
    .data(tdata)
    .enter().append("path")
    .attr("class", "dot")            
    .attr("d", line); 

  
  planet = helio.selectAll(".planets")
    .data(planets)
    .enter().append("image")
    .attr("xlink:href", function(d) { return "img/" + d.icon; } )
    .attr("transform", translate)
    .attr("class", "planet")
    .attr("width", function(d) { return d.name == "Saturn" ? d.r*2.7 : d.r; } )
    .attr("height", function(d) { return d.r; } );
    //.attr("d", d3.svg.symbol().size( function(d) { return Math.pow(d.r-8, 2); } ));


});

d3.json('data/sbo.json', function(error, json) {
  if (error) return console.log(error);
  
  for (var key in json) {
    if (!has(json, key)) continue;
    //sbos: pos[x,y,z],name,r
    if (json[key].H < 11)
      sbos.push(getObject(json[key]));
  }
  //console.log(objects);
  
  sbo = helio.selectAll(".sbos")
    .data(sbos)
    .enter().append("path")
    .attr("transform", translate)
    .attr("class", "sbo")
    .attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));

});


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
  if (d3.event.sourceEvent.type !== "wheel") {
    var trans = zoom.translate();
    angle = [30-z(trans[1]), 0, 90+x(trans[0])];
    rmatrix = getRotation(angle);
  }
  //console.log(d3.event.sourceEvent.type);
  //console.log(x(trans[0]) + ", " + y(trans[1]));

  rsun = Math.pow(scale, 0.8);
  sun.attr({"xlink:href": "../../blog/res/planets/sun.png", "x": -rsun/2, "y": -rsun/2, "width": rsun,
          "height": rsun});
  
  planet.attr("transform", translate);

  tdata = translate_tracks(tracks);

  track.data(tdata)
    .attr("d", line);
    //.attr("transform", function(d) { "translate(" + d[0] + "," + d[1] + ")"; } );     


  sbo.attr("transform", translate);
    //.attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));
}this.Orrery = Orrery;
})();