/* global getRotation, getObject, getOrbit, vMultiply, has */
var Orrery = {
  version: '0.2',
  svg: null
};


var planets = [], sbos = [], tracks = [], probes = [], tdata,
    dt = new Date(),
    angle = [30,0,90],
    scale = 60,  par = null, 
    sun, planet, track, probe, sbo;

// Can be in box element par, otherwise full screen
var width = par ? par.clientWidth : window.innerWidth,
    height = par ? par.clientHeight : window.innerHeight;

//var trans = transform(dt);

//Rotation matrix
var rmatrix = getRotation(angle);

//Scales for rotation with dragging
var x = d3.scale.linear().domain([-width/2, width/2]).range([-360, 360]);
var z = d3.scale.linear().domain([-height/2, height/2]).range([90, -90]).clamp(true);

var zoom = d3.behavior.zoom().center([0, 0]).scaleExtent([10, 150]).scale(scale).on("zoom", redraw);

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height).call(zoom);

//Coordinate origin [0,0] at Sun position
var helio = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")");

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
    if (has(json[key], "trajectory") && json[key].trajectory === true)
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

d3.json('data/probes.json', function(error, json) {
  if (error) return console.log(error);
  
  for (var key in json) {
    if (!has(json, key)) continue;
    //object: pos[x,y,z],name,r,icon
    var pr = getObject(json[key]);
    if (pr) probes.push(pr);
  }

  probe = helio.selectAll(".probes")
    .data(probes)
    .enter().append("image")
    .attr("xlink:href", function(d) { return "../../blog/res/probes/" + d.icon; } )
    .attr("transform", translate)
    .attr("class", "planet")
    .attr("width", 20 )
    .attr("height", 20 );
    //.attr("d", d3.svg.symbol().size( function(d) { return Math.pow(d.r-8, 2); } ));


});

  d3.select(window).on('resize', resize);

  function resize() {
    //if (cfg.width && cfg.width > 0) return;
    width = par ? par.clientWidth : window.innerWidth;
    height = par ? par.clientHeight : window.innerHeight;
    //var scale = proj.scale * width/1024;
    svg.attr("width", width).attr("height", height);
    helio.attr("transform", "translate(" + width/2 + "," + height/2 + ")");
    //zoom.scale([scale]);
    //projection.translate([width/2, height/2]).scale([scale]);
    //if (parent) parent.style.height = px(height);
    redraw();
  }


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
  sun.attr({"x": -rsun/2, "y": -rsun/2, "width": rsun,
          "height": rsun});
  
  planet.attr("transform", translate);

  tdata = translate_tracks(tracks);

  track.data(tdata)
    .attr("d", line);
    //.attr("transform", function(d) { "translate(" + d[0] + "," + d[1] + ")"; } );     


  sbo.attr("transform", translate);
    //.attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));
}