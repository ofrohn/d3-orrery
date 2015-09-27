Data files with orbital elements 
```js
 {
 "Id": {               // Unique identifier
  "name": "<string>",  // (opt) Object name
  "desig": "<string>", // (opt) Object designator
  "icon": "<string>",  // (opt) Image representation 
  "H": <number>,  // Absolute magnitude (mag)
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
   }, {} ... 
  ]
 }, 
 {} ...
 }
```