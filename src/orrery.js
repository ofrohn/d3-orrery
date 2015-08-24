var Orrery = {
  version: '0.2',
  svg: null
};


//http://ssd.jpl.nasa.gov/?planet_pos
var planets = [], sbos = [], tracks = [],
    dt = new Date(),
    angle = [30,0,90],
    scale = 10,  parent = null;

var width = parent ? parent.clientWidth : window.innerWidth,
    height = parent ? parent.clientHeight : window.innerHeight;

var rmatrix = getRotation(angle);

var zoom = d3.behavior.zoom().scaleExtent([10, 150]).on("zoom", redraw).scale([scale])

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height)
            .call(zoom);

var helio = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                //scale(scale)

//helio.append("circle").attr("r", 1 + scale/10)
//   .attr("cx", 0).attr("cy", 0).attr("class", "sun")

var rsun = Math.pow(scale, 0.8);
helio.append("image")
   .attr({"xlink:href": "../../blog/res/planets/sun.png",
          "x": -rsun/2,
          "y": -rsun/2,
          "width": rsun,
          "height": rsun});

var line = d3.svg.line()
     .x( function(d) { return d[0]; } )
     .y( function(d) { return d[1]; } );

          
d3.json('data/planets.json', function(error, json) {
  if (error) return console.log(error);
  
  for (key in json) {
    //object: pos[x,y,z],name,r,icon
    planets.push(getObject(json[key]));
    //track: [x,y,z]    
    tracks.push(getOrbit(json[key]));
  }
  //console.log(planets);
  
/*  tracks.forEach( function(track) {
    helio.selectAll(".tracks")
      .data(track)
      .enter().append("path")
      .attr("transform", function(d) { return translate(d); } )
      .attr("class", "dot")
      .attr("d", d3.svg.symbol().size( function(d) { return 1 + scale/100; } ));
  })
*/

  var tdata = translate_tracks(tracks);
  //upd: helio.selectAll(".tracks").data([data]).attr("d", line)
  //.attr("transform", "translate(" + x(1) + ")") 
  helio.selectAll(".tracks")
    .data(tdata)
    .enter().append("path")
    .attr("class", "dot")            
    .attr("d", function(d) { 
      return line(d); 
    } ); 

  
  helio.selectAll(".planets")
    .data(planets)
    .enter().append("image")
    .attr("xlink:href", function(d) { return "../../blog/res/planets/" + d.icon } )
    .attr("transform", function(d) { var off = d.name == "Saturn" ? d.r*1.35 : null; return translate(d, d.r/2, off); } )
    .attr("class", "planet")
    .attr("width", function(d) { return d.name == "Saturn" ? d.r*2.7 : d.r; } )
    .attr("height", function(d) { return d.r; } );
    //.attr("d", d3.svg.symbol().size( function(d) { return Math.pow(d.r-8, 2); } ));


})

d3.json('data/sbo.json', function(error, json) {
  if (error) return console.log(error);
  
  for (key in json) {
    //sbos: pos[x,y,z],name,r
    if (json[key].H < 11)
      sbos.push(getObject(json[key]));
  }
  //console.log(objects);
  
  helio.selectAll(".sbos")
    .data(sbos)
    .enter().append("path")
    .attr("transform", function(d) { return translate(d); } )
    .attr("class", "sbo")
    .attr("d", d3.svg.symbol().size( function(d) { return d.r; } ));

})


function translate_tracks(tracks) {
  var res = [];
  
  tracks.forEach( function(track) {
    var t = [];
    for (var i=0; i<track.length; i++) {
      var p = vMultiply(rmatrix, track[i]);
      p[0] *= scale; p[2] *= scale;  
      t.push([-p[0],-p[2]]);
    }
    res.push(t);
  })
  return res;
}

function translate(d, off, offx) {
  var p = vMultiply(rmatrix, d.pos);
  p[0] *= scale;  
  p[2] *= scale;  
  if (off) {
    p[0] += offx || off;
    p[2] += off;
  }
  return "translate(" + -p[0] + "," + -p[2] + ")";
}

function redraw() {
  scale = zoom.scale();  

  helio.selectAll(".tracks")
    .attr("transform", function(d) { return translate(d); } )
    .attr("d", d3.svg.symbol().size( function(d) { return 1 + scale/100; } ));
  helio.selectAll(".planets")
    .attr("transform", function(d) { var off = d.name == "Saturn" ? d.r*1.35 : null; return translate(d, d.r/2, off); } );

}