/* global THREE, transform, dt, dateAdd, dateDiff, has  */

var getObject = function(dt, d, par) {
  
  var index = getEpoch(dt, d.elements);
  var parent = par || "sol";
  //has special data, todo: find appropriate data
  if (has(d.elements[index], "d")) return;

  var e = d.elements[index];
  var pos = transform(e, dt, par);
  
  var res = {name: d.name, pos: [-pos.y, pos.z, -pos.x], elements: d.elements};
  // size
  if (d.H && d.H !== "") res.r = 13 - d.H;
  else if (d.r && d.r !== "") res.r = d.r;
  else res.r = 20;
  
  //icon
  if (d.icon && d.icon !== "") res.icon = d.icon;
  
  return res;
};

var updateObject = function(dt, body) {
  var index = getEpoch(dt, body.elements);
  
  //has special data, todo: find appropriate data
  if (has(body.elements[index], "d")) return;

  //var e = d.elements[index];
  var pos = transform(body.elements[index], dt);
  body.pos = [-pos.y, pos.z, -pos.x];
  
  return body.pos;
};

//Find valid set of elements for date
var getEpoch = function(dt, e) {
  var index = 0;
  
  if (e.length > 1) {
    //find trajectory for date 
    for (var i=0; i<e.length; i++) {
      if (dateDiff(new Date(Date.parse(e[i].ep)), dt) <= 0) {
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
      end = dateAdd(dt, period, "y"),
      step = dateDiff(dt, end)/90,
      current = new Date(dt.valueOf());
  
  while (dateDiff(current, end) > 0) {
    p = transform(e, current);
    geo.vertices.push(new THREE.Vector3(-p.y, p.z, -p.x));
    col = p.z >= 0 ? 0xaaaaaa : 0x666666;
    geo.colors.push(new THREE.Color(col));

    current = dateAdd(current, step);
  }

  //geo.vertices.push( new THREE.Vector3(-p0.y, p0.z, -p0.x));
  
  return geo;
};

var getProbe = function(dt, d) {
  //elements, position, location
  
};