# D3-Orrery

An interactive Solar System simulator (a.k.a. Orrery) implemented with D3.js and three.js. Shows planets with images and trajectories, as well as small bodies as dots. Optional scacecraft with images and trajectories.
* [Data formats](data/formats.md)

### Options  



### Files

__JSON data files__

* `planets.json` All the official planets, plus Pluto, with orbital elements from [JPL Solar System Dynamics](http://ssd.jpl.nasa.gov/?planet_pos)
* `sbo.json` Small bodies throughout the Solar System, including Asteroids and Transneptunian objects down to 12th absolute magnitude, orbital elemnts from the [IAU Minor Planet Center](http://www.minorplanetcenter.org/iau/MPCORB.html)
* `probes.json` Spacecraft elements, mostly from [JPL Horizons](http://ssd.jpl.nasa.gov/horizons.cgi)


Thanks to Mike Bostock for [D3.js](http://d3js.org/) and Project Pluto for the [Kepler equation algoritm](http://www.projectpluto.com/kepler.htm)

Released under [BSD License](LICENSE)