// Copyright 2015 Olaf Frohn https://github.com/ofrohn, see LICENSE
!(function() {var THREEx = THREEx || {};

THREEx.Planets = {};

THREEx.Planets.baseURL = "maps/";

// maps from http://planetpixelemporium.com/ and others (see readme)

THREEx.Planets.params = {
  // texture map, bump map, cloud map, arbitrary radius, axis tilt in degrees, rotation period in days
  // ring: texture map, outer radius rel. to planet, opacity
  "sol": {map: "sunmap.jpg", radius: 0.12, tilt: 7.25, rot: 1.0438,
          corona: {map: "solarcorona.jpg", radius:0.53} },
  "mer": {map: "mercurymap.jpg", bump:"mercurybump.jpg", radius: 0.03, tilt: 0, rot: 58.646},
  "ven": {map: "venusmap.jpg", radius: 0.04, tilt: 177.3, rot: 4.05},
  "ter": {map: "earthmap.jpg", bump:"earthbump.jpg", clouds:"earthclouds.png", radius: 0.04, tilt: 23.45, rot: 0.9973},
  "lun": {map: "moonmap.jpg", bump:"moonbump.jpg", radius: 0.025, tilt: 1.54, rot: 27.3217},
  "mar": {map: "marsmap.jpg", bump:"marsbump.jpg", clouds:"marsclouds.png", radius: 0.035, tilt: 25.19, rot: 1.026},
  "ves": {map: "vestamap.jpg", bump: "vestabump.jpg", radius: 0.01, tilt: 29.0, rot: 0.223},
  "cer": {map: "ceresmap.jpg", radius: 0.016, tilt: 4.0, rot: 0.378},
  "jup": {map: "jupitermap.jpg", radius: 0.12, tilt: 3.12, rot: 0.414,
          ring: {map: "jupiterrings.png", radius: 0.27, opacity: 0.5} },
  "sat": {map: "saturnmap.jpg", radius: 0.12, tilt: 26.73, rot: 0.444, 
          ring: {map: "saturnrings.png", radius: 0.26, opacity: 1.0} },
  "ura": {map: "uranusmap.jpg", radius: 0.10, tilt: 97.86, rot: 0.718, 
          ring: {map: "uranusrings.png", radius: 0.20, opacity: 0.5} },
  "nep": {map: "neptunemap.jpg", radius: 0.10, tilt: 29.56, rot: 0.671, 
          ring: {map: "neptunerings.png", radius: 0.25, opacity: 0.8} },
  "plu": {map: "plutomap.jpg", radius: 0.02, tilt: 122.53, rot: 6.387}  
};


// Friendly names 
var substitutes = {
  "Sun": "sol",
  "Mercury": "mer",
  "Venus": "ven",
  "Earth": "ter",
  "Moon": "lun",
  "Mars": "mar",
  "Vesta": "ves",
  "Ceres": "cer",
  "Jupiter": "jup",
  "Saturn": "sat",
  "Uranus": "ura",
  "Neptune": "nep",
  "Pluto": "plu",
};

THREEx.Planets.createSun = function() { return THREEx.Planets.create("sun"); };
THREEx.Planets.createMercury = function() { return THREEx.Planets.create("mercury"); };
THREEx.Planets.createVenus = function() { return THREEx.Planets.create("venus"); };
THREEx.Planets.createEarth = function() { return THREEx.Planets.create("earth", true); };
THREEx.Planets.createMoon = function() { return THREEx.Planets.create("moon"); };
THREEx.Planets.createMars = function() { return THREEx.Planets.create("mars"); };
THREEx.Planets.createJupiter = function() { return THREEx.Planets.create("jupiter"); };
THREEx.Planets.createJupiterRing = function() { return THREEx.Planets.createRing("jupiter"); };
THREEx.Planets.createSaturn = function() { return THREEx.Planets.create("saturn", true); };
THREEx.Planets.createSaturnRing = function() { return THREEx.Planets.createRing("saturn"); };
THREEx.Planets.createUranus = function() { return THREEx.Planets.create("uranus", true); };
THREEx.Planets.createUranusRing = function() { return THREEx.Planets.createRing("uranus"); };
THREEx.Planets.createNeptune = function() { return THREEx.Planets.create("neptune"); };
THREEx.Planets.createNeptuneRing = function() { return THREEx.Planets.createRing("neptune"); };
THREEx.Planets.createPluto = function() { return THREEx.Planets.create("pluto"); };

THREEx.Planets.createStarfield = function() {
  var loader = new THREE.TextureLoader();
  var texture = loader.load(THREEx.Planets.baseURL + "tycho-skymap.jpg");
  var material = new THREE.MeshBasicMaterial({
    map  : texture,
    side  : THREE.BackSide
  })
  var geometry = new THREE.SphereGeometry(100, 32, 32)
  var mesh = new THREE.Mesh(geometry, material)
  return mesh  
}
    
// Create body, skipextras truthy -> don't create cloud, ring etc.
THREEx.Planets.create = function(body, skipextras) {
  if (!THREEx.Planets.params.hasOwnProperty(body)) {
    if (substitutes.hasOwnProperty(body)) body = substitutes[body];
    else {
      console.log("Object not found: " + body);
      return null;
    }
  }
  var p = THREEx.Planets.params[body], arg = {};
  var loader = new THREE.TextureLoader();
  
  var geometry = new THREE.SphereGeometry(p.radius, 32, 32);
  
  arg.map = loader.load(THREEx.Planets.baseURL + p.map);

  if (p.hasOwnProperty("bump")) {
    arg.bumpMap = loader.load(THREEx.Planets.baseURL + p.bump);  
    arg.bumpScale = 0.02;
  }  
  if (p.hasOwnProperty("spec")) {
    arg.specularMap = loader.load(THREEx.Planets.baseURL + p.spec);  
    arg.specular = new THREE.Color("#333");
  }
  
  var material = new THREE.MeshPhongMaterial(arg);
  var mesh = new THREE.Mesh(geometry, material);
  
  if (!skipextras && p.hasOwnProperty("ring")) {
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    var ring = THREEx.Planets.createRings(body);
    ring.receiveShadow = true;
    ring.castShadow = true;
    mesh.add(ring);
  };

  if (!skipextras && p.hasOwnProperty("clouds")) {
    mesh.add(THREEx.Planets.createClouds(body));
  }  

  if (!skipextras && body === "sol") {
    mesh.add(THREEx.Planets.createCorona());
  }  

  mesh.rotation.set(0, 0, THREE.Math.degToRad(p.tilt));  
  return mesh;
}
  
  
// Planetary rings 
THREEx.Planets.createRings = function(body) {
  if (!THREEx.Planets.params.hasOwnProperty(body)) {
    if (substitutes.hasOwnProperty(body)) body = substitutes[body];
    else {
      console.log("Object not found: " + body);
      return null;
    }
  }
  if (!THREEx.Planets.params[body].hasOwnProperty("ring")) {
    console.log("Rings not found: " + body);
    return null;
  }
  var p = THREEx.Planets.params[body], map = THREEx.Planets.baseURL + p.ring.map,
      loader = new THREE.TextureLoader();
  
  var geometry = new THREEx.Planets.RingGeometry(p.radius * 1.05, p.ring.radius, 64, 64);
  var material = new THREE.MeshPhongMaterial({
    map: loader.load(map),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: p.ring.opacity
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.lookAt(new THREE.Vector3(0, 1, 0));
  mesh.name = body + "rings";
  return mesh;
}

// Cloud layer from transparent png, see http://blog.thematicmapping.org/2013/09/creating-webgl-earth-with-threejs.html
THREEx.Planets.createClouds = function(body) {
  if (!THREEx.Planets.params.hasOwnProperty(body)) {
    if (substitutes.hasOwnProperty(body)) body = substitutes[body];
    else {
      console.log("Object not found: " + body);
      return null;
    }
  }
  if (!THREEx.Planets.params[body].hasOwnProperty("clouds")) {
    console.log("Clouds not found: " + body);
    return null;
  }
  var p = THREEx.Planets.params[body], map = THREEx.Planets.baseURL + p.clouds,
      loader = new THREE.TextureLoader();

  var mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.radius * 1.01, 32, 32),
    new THREE.MeshPhongMaterial({
      map: loader.load(map),
      transparent: true
    })
  );
  mesh.name = body + "clouds";  
  return mesh;
}

// Solar corona, based on Lee Stemkoski's https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Simple-Glow.html
THREEx.Planets.createCorona = function() {
  var p = THREEx.Planets.params.sol, map = THREEx.Planets.baseURL + p.corona.map;

  var material = new THREE.SpriteMaterial({ 
    map: new THREE.TextureLoader().load(map), 
    color: 0xffff33, 
    transparent: false, 
    blending: THREE.AdditiveBlending
	});
	var mesh = new THREE.Sprite(material);
	mesh.scale.multiplyScalar(p.corona.radius);
	mesh.name = "solcorona";
  return mesh;
};



/**
 * change the original from three.js because i needed different UV
 * 
 * @author Kaleb Murphy
 * @author Olaf Frohn
 */
THREEx.Planets.RingGeometry = function (innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength) {

	THREE.Geometry.call( this );

	this.type = 'RingGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	innerRadius = innerRadius || 0;
	outerRadius = outerRadius || 50;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

	var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

	for ( i = 0; i < phiSegments + 1; i ++ ) {

		// concentric circles inside ring

		for ( o = 0; o < thetaSegments + 1; o ++ ) {

			// number of segments per circle

			var vertex = new THREE.Vector3();
			var segment = thetaStart + o / thetaSegments * thetaLength;
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			this.vertices.push( vertex );
			//uvs.push( new THREE.Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );
      uvs.push( new THREE.Vector2( i/(thetaSegments-1), o/ (phiSegments-1) ) );
		}

		radius += radiusStep;

	}

	var n = new THREE.Vector3( 0, 0, 1 );

	for ( i = 0; i < phiSegments; i ++ ) {

		// concentric circles inside ring

		var thetaSegment = i * ( thetaSegments + 1 );

		for ( o = 0; o < thetaSegments ; o ++ ) {

			// number of segments per circle

			var segment = o + thetaSegment;

			var v1 = segment;
			var v2 = segment + thetaSegments + 1;
			var v3 = segment + thetaSegments + 2;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ] );

			v1 = segment;
			v2 = segment + thetaSegments + 2;
			v3 = segment + 1;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ] );

		}

	}

	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREEx.Planets.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREEx.Planets.RingGeometry.prototype.constructor = THREEx.Planets.RingGeometry;

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function() {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function () {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis

			theta = Math.atan2( offset.x, offset.z );

			// angle from y-axis

			phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			theta += thetaDelta;
			phi += phiDelta;

			// restrict theta to be between desired limits
			theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, theta ) );

			// restrict phi to be between desired limits
			phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, phi ) );

			// restrict phi to be betwee EPS and PI-EPS
			phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

			var radius = offset.length() * scale;

			// restrict radius to be between desired limits
			radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.x = radius * Math.sin( phi ) * Math.sin( theta );
			offset.y = radius * Math.cos( phi );
			offset.z = radius * Math.sin( phi ) * Math.cos( theta );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				thetaDelta *= ( 1 - scope.dampingFactor );
				phiDelta *= ( 1 - scope.dampingFactor );

			} else {

				thetaDelta = 0;
				phiDelta = 0;

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function() {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
		scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var theta;
	var phi;

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		thetaDelta -= angle;

	}

	function rotateUp( angle ) {

		phiDelta -= angle;

	}

	var panLeft = function() {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			var te = objectMatrix.elements;

			// get X column of objectMatrix
			v.set( te[ 0 ], te[ 1 ], te[ 2 ] );

			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function() {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			var te = objectMatrix.elements;

			// get Y column of objectMatrix
			v.set( te[ 4 ], te[ 5 ], te[ 6 ] );

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function() {

		var offset = new THREE.Vector3();

		return function( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		//console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		//console.log( 'handleMouseWheel' );

		var delta = 0;

		if ( event.wheelDelta !== undefined ) {

			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) {

			// Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( delta < 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {

			if ( scope.enableRotate === false ) return;

			handleMouseDownRotate( event );

			state = STATE.ROTATE;

		} else if ( event.button === scope.mouseButtons.ZOOM ) {

			if ( scope.enableZoom === false ) return;

			handleMouseDownDolly( event );

			state = STATE.DOLLY;

		} else if ( event.button === scope.mouseButtons.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseDownPan( event );

			state = STATE.PAN;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			document.addEventListener( 'mouseout', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			if ( scope.enableRotate === false ) return;

			handleMouseMoveRotate( event );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.enableZoom === false ) return;

			handleMouseMoveDolly( event );

		} else if ( state === STATE.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseMovePan( event );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.constraint.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.constraint.enableDamping = ! value;

		}

	},

	dynamicDampingFactor : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.constraint.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.constraint.dampingFactor = value;

		}

	}

} );

//Matrix calculations

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

var deg2rad = Math.PI / 180;

function $(id) { return document.getElementById(id); }
function px(n) { return n + "px"; } 
function Round(x, dg) { return(Math.round(Math.pow(10,dg)*x)/Math.pow(10,dg)); }
function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

function has(o, key) { return o !== null && hasOwnProperty.call(o, key); }
function isNumber(n) { return !isNaN(parseFloat(n)) && isFinite(n); }
function isArray(o) { return Object.prototype.toString.call(o) === "[object Array]"; }
function isObject(o) { var type = typeof o;  return type === 'function' || type === 'object' && !!o; }
function isFunction(o) { return typeof o == 'function' || false; }

function dist(p1, p2){
  var θ1 = p1.θ * deg2rad, ϕ1 = p1.ϕ * deg2rad,
      θ2 = p2.θ * deg2rad, ϕ2 = p2.ϕ * deg2rad;

  return Math.sqrt(p1.r*p1.r + p2.r*p2.r - 2*p1.r*p2.r * (Math.sin(θ1) * Math.sin(θ2) * Math.cos(ϕ1-ϕ2) + Math.cos(θ1) * Math.cos(θ2)));
}


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
  normalize0: function(val) {  return ((val + Math.PI*3) % (Math.PI*2)) - Math.PI; },
  normalize: function(val) {  return ((val + Math.PI*2) % (Math.PI*2)); },  
  //deg2rad: function(val)  {  return val * Math.PI / 180; },
  //hour2rad: function(val) {  return val * Math.PI / 12; },
  //rad2deg: function(val)  {  return val * 180 / Math.PI; },
  //rad2hour: function(val) {  return val * 12 / Math.PI; },
  cartesian: function(p) {
    var θ = p[0] * deg2rad, ϕ = p[1] * deg2rad, r = p[2];
    return [r * Math.sin(ϕ) * Math.cos(θ), r * Math.sin(ϕ) * Math.sin(θ), r * Math.cos(ϕ)];
  },
  spherical: function(p) {
    var r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z),
        θ = Math.atan(p.y / p.x),
        ϕ = Math.acos(p.z / r);
    return  [θ / deg2rad, ϕ / deg2rad, r];
  }
};


var gm = Math.pow(0.01720209895, 2);

var transform = function(item, date, gmass) {
  var dt, i, key, dat = {}, elms = ["a","e","i","w","M","L","W","N","n"];
/*
    ep = epoch (dt)
    N = longitude of the ascending node (deg) Ω
    i = inclination to the ecliptic (plane of the Earth's orbit) (deg) 
    w = argument of perihelion (deg)  ω
    a = semi-major axis, or mean distance from Sun (AU,km)
    e = eccentricity (0=circle, 0-1=ellipse, 1=parabola, >1=hyperbola ) (-)
    M = mean anomaly (0 at perihelion; increases uniformly with time) (deg)
    n = mean daily motion = 2pi/P
    
    W = N + w  = longitude of perihelion ϖ
    L = M + W  = mean longitude
    q = a*(1-e) = perihelion distance
    Q = a*(1+e) = aphelion distance
    P = a ^ 1.5 = orbital period (years if a is in AU, astronomical units)
    T = Epoch_of_M - (M(deg)/360_deg) / P  = time of perihelion
    v = true anomaly (angle between position and perihelion) ν
    E = eccentric anomaly
    
    Mandatory: a, e, i, N, w|W, M|L, dM|n
*/
  
  if (gmass) gm = gmass;

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
    dat.M += (dat.n * dat.d);
  }
  derive(dat);
  trueAnomaly(dat);
  cartesian(dat);
  ecliptic(dat);
  return dat;
};

//AU 149597870.7 km
//gm_sol = 0.0002959122082855911025 (AU^3/d^2)
//gm_earth = 8.8876925870231737638917894479187e-10 (AU^3/d^2)           
//gm_earth = 2975536354019328 (km^3/d^2)  

             

function near_parabolic(E, e) {
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
}

function kepler(dat) {
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
}

function trueAnomaly(dat) {
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
}

function derive(dat) {
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
}

function cartesian(dat) {
  var x, y, z, u = dat.v + dat.w;
  x = dat.r * (Math.cos(dat.N) * Math.cos(u) - Math.sin(dat.N) * Math.sin(u) * Math.cos(dat.i));
  y = dat.r * (Math.sin(dat.N) * Math.cos(u) + Math.cos(dat.N) * Math.sin(u) * Math.cos(dat.i));
  z = dat.r * (Math.sin(u) * Math.sin(dat.i));
  dat.x = x;
  dat.y = y;
  dat.z = z;
  return {x:x, y:y, z:z};
}

function ecliptic(dat) {
  var lon, lat;
  lon = Math.atan2(dat.y, dat.x);
  lat = Math.atan2(dat.z, Math.sqrt(dat.x*dat.x + dat.y*dat.y));
  dat.l = Trig.normalize(lon);
  dat.b = lat;
  return {l:lon, b:lat}; 
}

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



var getObject = function(dt, d) {
  
  var index = getEpoch(dt, d.elements);
  
  //has special data, todo: find appropriate data
  if (has(d.elements[index], "d")) return;

  var e = d.elements[index];
  var pos = transform(e, dt);
  
  var res = {name: d.name, pos: [-pos.y, pos.z, -pos.x], elements: d.elements};
  // size
  if (d.H && d.H !== "") res.r = 13 - d.H;
  else if (d.r && d.r !== "") res.r = d.r;
  else res.r = 20;
  
  //icon
  if (d.icon && d.icon !== "") res.icon = d.icon;
  
  return res;
};

var updateObject = function(dt, e) {
  var index = getEpoch(dt, e);
  
  //has special data, todo: find appropriate data
  if (has(e[index], "d")) return;

  //var e = d.elements[index];
  var pos = transform(e[index], dt);

  return [-pos.y, pos.z, -pos.x];
};

//Find valid set of elements for date
var getEpoch = function(dt, e) {
  var index = 0;
  
  if (e.length > 1) {
    //find trajectory for date 
    for (var i=0; i<e.length; i++) {
      if (dtDiff(new Date(Date.parse(e[i].ep)), dt) <= 0) {
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
      end = dtAdd(dt, period, "y"),
      step = dtDiff(dt, end)/90,
      current = new Date(dt.valueOf());
  
  while (dtDiff(current, end) > 0) {
    p = transform(e, current);
    geo.vertices.push(new THREE.Vector3(-p.y, p.z, -p.x));
    col = p.z >= 0 ? 0x999999 : 0x666666;
    geo.colors.push(new THREE.Color(col));

    current = dtAdd(current, step);
  }

  //geo.vertices.push( new THREE.Vector3(-p0.y, p0.z, -p0.x));
  
  return geo;
};

//Default configuration
var settings = {
  width: 0,            // Default width; 0 = full width of parent
  height: 0,           // Default height; 0 = full height of parent
  container: "map",    // ID of parent element, e.g. div
  datapath: "data/",   // Path/URL to data files, empty = subfolder 'data'
  imagepath: "img/",   // Path/URL to image files, empty = subfolder 'img'
  planets: {          
    show: true,        // Show planets, data in planets.json
    image: true,       // With image representation, if dataset contains icon parameter
    trajectory: true,  // Show orbital path as line 
    size: null         // Constant size or function
  },
  sbos: {
    show: true,        // Show small body objects, data in sbo.json
    image: false,      // With image representation, if dataset contains 'icon' parameter
    text: true,        // Show object name, if dataset contains 'designator' parameter
    trajectory: false, // Show orbital path as line 
    size: null         // Constant size or function
  },
  spacecraft: {
    show: false,        // Show spacecraft, data in probes.json
    image: false,      // With image representation, if dataset contains 'icon' parameter
    text: true,        // Show sc name, if dataset contains 'designator' parameter
    trajectory: false, // Show trajectory path as line 
    size: null         // Constant size or function
  },
  other: [             // Additional data  
  /*{file:"",          // JSON filename or url
     image: true,      // With image representation, if dataset contains 'icon' parameter
     text: true,       // Show object name, if dataset contains 'designator' parameter
     trajectory: false,// Show trajectory path as line 
     size: null        // Constant size or function
  },{}                 // Can contain multiple datasets
  */
  ],
  set: function(cfg) { // Override defaults with values of cfg
    var key, res = {};
    if (!cfg) return this; 
    for (var prop in this) {
      if (!has(this, prop)) continue; 
      if (typeof(this[prop]) === 'function') continue; 
      if (!has(cfg, prop) || cfg[prop] === null) { 
        res[prop] = this[prop]; 
      } else if (this[prop] === null || this[prop].constructor != Object ) {
        res[prop] = cfg[prop];
      } else {
        res[prop] = {};
        for (key in this[prop]) {
          if (has(cfg[prop], key)) {
            res[prop][key] = cfg[prop][key];
          } else {
            res[prop][key] = this[prop][key];
          }            
        }
      }
    }
    return res;
  }
};


var Orrery = {
  version: '0.4'
};

var container, parNode, renderer, scene, camera,
    width, height, cfg,
    renderFcts= [];

var display = function(config, date) {
  var dt = date || new Date(),
      parID = null; 

  cfg = settings.set(config); 

  parNode = $(cfg.container);
  if (parNode) { 
    parID = "#"+cfg.container;
    var stl = window.getComputedStyle(parNode, null);
    if (!parseInt(stl.width) && !cfg.width) parNode.style.width = px(window.innerWidth);    
    if (!parseInt(stl.height) && !cfg.height) parNode.style.height = px(window.innerHeight);    
  } else { 
    parID = "body"; 
    parNode = document.body; 
  }

  // Can be in box element parNode, otherwise full screen
  width = parNode ? parNode.clientWidth : window.innerWidth;
  height = parNode ? parNode.clientHeight : window.innerHeight;

  // init renderer
  renderer = new THREE.WebGLRenderer({antialias : true});
  renderer.setClearColor("#000");
  renderer.setSize( width, height );
  parNode.appendChild(renderer.domElement );
  //renderer.shadowMapEnabled  = true;
  
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00025);
  

  camera = new THREE.PerspectiveCamera(45, width/height, 0.01, 10000);
  camera.position.z = 3.5;
  camera.position.y = 2;
  var controls = new THREE.OrbitControls(camera);

  var light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  container = d3.select(parID).append("container");
  
  var mesh = THREEx.Planets.create("sol");
  scene.add(mesh);


  //Display planets with image and orbital track
  d3.json('data/planets.json', function(error, json) {
    if (error) return console.log(error);
          
    for (var key in json) {
      if (!has(json, key)) continue;
      var dat = {};
      //object: pos[x,y,z],name,r,icon,elements
      var planet = getObject(dt, json[key]);
      dat.body = planet;
      
      if (has(json[key], "trajectory")) {
        //track: [x,y,z]
        var track = getOrbit(dt, json[key]);
        var mat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.VertexColors,
          transparent: true,
          opacity: 0.6,
          fog: true
        });

        var line = new THREE.Line(track, mat);
        scene.add(line);
        dat.track = line;
      }
      var mesh = THREEx.Planets.create(key);
      if (!mesh) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 32), new THREE.MeshPhongMaterial({color: "#fff"})); 
      }
      mesh.position.fromArray(planet.pos);
      scene.add(mesh);
      dat.mesh = mesh;
    }

    
 
        
    //container.selectAll(".planets").data(planets)
    //  .enter().append("path")
    //  .attr("class", "planet");
    
  });

  //Display Small bodies as dots
  d3.json('data/sbo.json', function(error, json) {
    if (error) return console.log(error);
    
   var map = new THREE.TextureLoader().load("maps/ast.png");
   //12 diff sizes
   var mat = [], geo = [], basesize = 0.006;
   for (var i=1; i<=12; i++) {
     geo.push(new THREE.Geometry());
     mat.push(new THREE.PointsMaterial({
       color:0xffffff, 
       map: map,
       blending: THREE.AdditiveBlending,
       size: basesize * i,
       transparent: true,
       fog: true
     }));
   }
   for (var key in json) {
      if (!has(json, key)) continue;
      var dat = {};
      //sbos: pos[x,y,z],name,r
      //if (!isNumber(json[key].H)) { console.log(key); continue; }
      var sbo = getObject(dt, json[key]);
      var vec = new THREE.Vector3();
      vec.fromArray(sbo.pos);
      var index = Math.floor(sbo.r);
      if (index > 12) index = 12;
      geo[index-1].vertices.push(vec);
    }
    for (i=0; i<12; i++) {
      scene.add(new THREE.Points(geo[i], mat[i]));
    }
  });
  
  // render the scene
  renderFcts.push(function(){
    //meshes.forEach( function(d, i) { d.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), rot[i]); })
    var p = camera.position;
    scene.fog.density = 0.05 / Math.pow(p.x*p.x + p.y*p.y + p.z*p.z, 0.5);
    renderer.render(scene, camera);  
  });
  
  init();
};


// handle window resize
window.addEventListener('resize', function(){
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}, false);

 
// run the rendering loop
var lastTimeMsec = null;
function init() {
  requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    // call each update function
    renderFcts.forEach(function(renderFct) {
      renderFct(deltaMsec/1000, nowMsec/1000);
    });
  });
}

Orrery.display = display;
this.Orrery = Orrery;
})();