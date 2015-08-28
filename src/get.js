/* global transform, dt, dtAdd, dtDiff,  */
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