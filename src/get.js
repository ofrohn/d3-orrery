
var getObject = function(d) {
  var e = d.elements[0];
  if (d.length > 1) {
    
  } 
  var pos = transform(e, dt);
  
  var res = {name: d.name, pos: [pos.x, pos.y, pos.z], r: 14 - d.H }
  //icon
  if (d.icon && d.icon != "") res.icon = d.icon;
  
  return res;
}


var getOrbit = function(d) {
  var e = d.elements[0], res = [],
      p0 = transform(e, dt);
  
  var period = p0.P,
      end = dtAdd(dt, period, "y"),
      step = dtDiff(dt, end)/90/(p0.a),
      current = new Date(dt.valueOf());

  res.push({pos:[p0.x,p0.y,p0.z]});
  
  while (dtDiff(current, end) > 0) {
    p = transform(e, current);
    res.push({pos: [p.x,p.y,p.z]});
    current = dtAdd(current, step);
  }
  
  return res;
}