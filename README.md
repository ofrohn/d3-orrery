# D3-Orrery

An interactive Solar System simulator (a.k.a. Orrery) implemented with D3.js and three.js. Shows planets with images and trajectories, as well as small bodies as dots. Optional scacecraft with images and trajectories.
* [Data formats](data/readme.md)

### Usage

```js
//Default configuration (in so far it is implemented)
var settings = {
  width: 0,            // Default width; 0 = full width of parent
  height: 0,           // Default height; 0 = full height of parent
  date: true,          // Show date on map with date picker on click
  dateformat: "%Y-%m-%d",  // Date format (see [d3.js time format](https://github.com/d3/d3-time-format/blob/master/README.md#timeFormat)
  container: "orrery-map",    // ID of parent element, e.g. div
  datapath: "data/",   // Path/URL to data files, empty = subfolder 'data'
  imagepath: "images/",   // Path/URL to image files, empty = subfolder 'images'
}

// Diplay todays positions with above configuration
Orrery.display(settings, new Date());

```

### Files

__JSON data files__

* `planets.json` All the official planets, plus Pluto, with orbital elements from [JPL Solar System Dynamics](http://ssd.jpl.nasa.gov/?planet_pos)
* `sbo.json` Small bodies throughout the Solar System, including Asteroids and Transneptunian objects down to 12th absolute magnitude, orbital elemnts from the [IAU Minor Planet Center](http://www.minorplanetcenter.org/iau/MPCORB.html)
* `probes.json` Spacecraft elements, mostly from [JPL Horizons](http://ssd.jpl.nasa.gov/horizons.cgi)


Thanks to Mike Bostock for [D3.js](http://d3js.org/) and Project Pluto for the [Kepler equation algoritm](http://www.projectpluto.com/kepler.htm)

Released under [BSD License](LICENSE)