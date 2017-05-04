### Data files with orbital elements 
```js
 {
 "Id": {               // Unique identifier
  "name": "<string>",  // (opt) Object name
  "desig": "<string>", // (opt) Object designator
  "icon": "<string>",  // (opt) Image representation 
  "H": <number>,       // Absolute magnitude (mag)
  "astar": <number>    // (opt) a* color index 
  "iz": <number>       // (opt) i-z color index 
  "elements": [
   {"a": <number>,   // Semimajor axis (AU)
    "e": <number>,   // Eccentricity  (n)
    "i": <number>,   // Inclination (deg) 
    "N": <number>,   // Longitude of the ascending node (deg)
    
    "M": <number>,   // Mean anomaly (deg) or
    "L": <number>,   // Mean longitude = M + W (deg)
    
    "w": <number>,   // Argument of perihelion (deg) or
    "W": <number>,   // Longitude of perihelion = N + w (deg)

    "n": <number>    // (opt) Mean daily motion (deg/d)
    "da": <number>,  // (opt) Semimajor axis change (AU/cy)
    "de": <number>,  // (opt) Eccentricity change (n/cy)
    "di": <number>,  // (opt) Inclination change (deg/cy) 
    "dL": <number>,  // (opt) Mean longitude change (deg/cy) 
    "dW": <number>,  // (opt) Longitude of perihelion change (deg/cy) 
    "dN": <number>,  // (opt) Longitude of the ascending node change (deg/cy) 
    "ep": "<date>"   // Epoch (YYYY-MM-DD)
   }, {}, ... 
  ]
 }, 
 {}, ...
 }
```

###Probes with elements, trajectory or location
```js
{
 "Id": {               // Unique identifier
  "name": "<string>",  // (opt) Object name
  "icon": "<string>",  // (opt) Image representation 
  "trajectory": [
    {"date": "<date>", // Start date, eom: end date (yyyy-mm-dd)
     "type": "<type>", // elements|ecliptic|cartesian|orbit|eom
     "data":
       {elements} ||   // Osculating elements (see above)
       [l, b, r] ||    // Polar trajectory coordinates longitude (deg), latitude (deg), range [AU|km]
       [x, y, z] ||    // Cartesian coordinates x, y, z [AU|km]
       parent          // Orbited parent body, default sol
       null            // eom = End of mission without data
    },
    {},...
  ]
 }, {}, ...
}
// r, x, y, & z in AU in solar orbit, km otherwise
// l,b in degrees
```
