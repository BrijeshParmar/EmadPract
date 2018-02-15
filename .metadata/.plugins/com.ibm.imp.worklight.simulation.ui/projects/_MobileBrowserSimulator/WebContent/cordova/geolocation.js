/*
 * Cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

if (!Cordova.hasResource("geolocation")) {
	Cordova.addResource("geolocation");

	// ***  extention ***
	
	var timers = {};   // list of timers in use

	// Returns default params, overrides if provided with values
	//Returns default params, overrides if provided with values
	function parseParameters(options) {
	    var opt = {
	        maximumAge: 10000,
	        timeout: Infinity,
	        enableHighAccuracy: false,
	        desiredAccuracy: 0,
	        minChangeDistance: 0,
	    	minChangeTime: 0
	    };

	    if (options) {
	        if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 100) {
	            opt.maximumAge = options.maximumAge;
	        }
	        if (options.enableHighAccuracy !== undefined) {
	            opt.enableHighAccuracy = options.enableHighAccuracy;
	        }
	        if (options.timeout !== undefined && !isNaN(options.timeout)) {
	            if (options.timeout < 0) {
	                opt.timeout = 0;
	            } else {
	                opt.timeout = options.timeout;
	            }
	        }
	        // additions over Cordova
	        if (options.minChangeDistance !== undefined && !isNaN(options.minChangeDistance) && options.minChangeDistance > 0) {
	            opt.minChangeDistance = options.minChangeDistance;
	        }
	        if (options.minChangeTime !== undefined && !isNaN(options.minChangeTime) && options.minChangeTime > 0) {
	        	opt.minChangeTime = options.minChangeTime;
	        }
	        if (options.enableHighAccuracy) {
	        	// optional highAccuracyOptions - translated internally to a single desiredAccuracy attribute
	        	if (options.highAccuracyOptions && (typeof options.highAccuracyOptions == 'object')) {
	        		var highAccuracyOptions = options.highAccuracyOptions;
	        		if (highAccuracyOptions.desiredAccuracy !== undefined && !isNaN(highAccuracyOptions.desiredAccuracy) && highAccuracyOptions.desiredAccuracy > 0) {
	        			opt.desiredAccuracy = highAccuracyOptions.desiredAccuracy;
	        		}
	        		// in iOS, if the iOSBestAccuracy attribute is defined - it overrides the desiredAccuracy attribute
	        		if (//isIOSEnv() &&
	        				(highAccuracyOptions.iOSBestAccuracy === this.IOS_BEST_ACCURACY || 
	        				 highAccuracyOptions.iOSBestAccuracy === this.IOS_BEST_ACCURACY_FOR_NAVIGATION)) {
	        			opt.desiredAccuracy = highAccuracyOptions.iOSBestAccuracy;
	        		}
	        	}
	        }
	    }

	    return opt;
	};

	// Returns a timeout failure, closed over a specified timeout value and error callback.
	function createTimeout(errorCallback, timeout) {
	    var t = setTimeout(function() {
	        clearTimeout(t);
	        t = null;
	        errorCallback({
	            code:PositionError.TIMEOUT,
	            message:"Position retrieval timed out."
	        });
	    }, timeout);
	    return t;
	}

	
	/**
	 * This class provides access to device GPS data.
	 * 
	 * @constructor
	 */
	var Geolocation = function() {

		// The last known GPS position.
		this.lastPosition = null;

		// Geolocation listeners
		this.listeners = {};
		
		
		// start  -  Extended GeoLocation *****
		this.IOS_BEST_ACCURACY = -1;
		this.IOS_BEST_ACCURACY_FOR_NAVIGATION = -2;
			
	    this.lastPosition = null; // reference to last known (cached) position returned
	    // start  -  Extended GeoLocation *****
	};

	/**
	 * Coordinates object
	 */
	Coordinates = function(latitude, longitude, altitude, accuracy,
			altitudeAccuracy, heading, speed) {
		this.latitude = latitude;
		this.longitude = longitude;
		this.altitude = altitude;
		this.accuracy = accuracy;
		this.altitudeAccuracy = altitudeAccuracy;
		this.heading = heading;
		this.speed = speed;
	};
	/**
	 * Position object
	 */
	Position = function(c, t) {
		this.coords = c; // Coordinates
		this.timestamp = t;
	};


	 /**
	   * Asynchronously acquires the current position.
	   *
	   * @param {Function} successCallback    The function to call when the position data is available
	   * @param {Function} errorCallback      The function to call when there is an error getting the heading position. (OPTIONAL)
	   * @param {PositionOptions} options     The options for getting the position data. (OPTIONAL)
	   */
	Geolocation.prototype.getCurrentPosition = function(successCallback, errorCallback, options) {
	        // arguments check , need to find out how to add argscheck module
			//argscheck.checkArgs('fFO', 'geolocation.getCurrentPosition', arguments);
	        
			options = parseParameters(options);

	        // Timer var that will fire an error callback if no position is retrieved from native
	        // before the "timeout" param provided expires
		   	var id = Cordova.createUUID();
	        var timeoutTimer = null;

	        var win = function(p) {
	            clearTimeout(timeoutTimer);
	            if (!(timeoutTimer)) {
	                // Timeout already happened, or native fired error callback for
	                // this geo request.
	                // Don't continue with success callback.
	                return;
	            }
	            var pos = new Position(
	                {
	                    latitude:p.coords.latitude,
	                    longitude:p.coords.longitude,
	                    altitude:p.coords.altitude,
	                    accuracy:p.coords.accuracy,
	                    heading:p.coords.heading,
	                    speed:p.coords.speed,
	                    altitudeAccuracy:p.coords.altitudeAccuracy
	                },
	                (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp)))
	            );
	            Geolocation.lastPosition = pos;
	            successCallback(pos);
	        };
	        var fail = function(e) {
	            clearTimeout(timeoutTimer);
	            timeoutTimer = null;
	            var err = new PositionError(e.code, e.message);
	            if (err.code === PositionError.TIMEOUT) {
	            	//need to remove the callback and potentially stop listening to changes
	        		Cordova.exec(null, null, "Geolocation","removeRequest", [id]);
	           } 
	            if (errorCallback) {
	                errorCallback(err);
	            }
	        };

	        // Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
	        // fire the success callback with the cached position.
	        if (Geolocation.lastPosition && options.maximumAge && (((new Date()).getTime() - Geolocation.lastPosition.timestamp.getTime()) <= options.maximumAge)) {
	            successCallback(Geolocation.lastPosition);
	        // If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
	        } else if (options.timeout === 0) {
	            fail({
	                code:PositionError.TIMEOUT,
	                message:"timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."
	            });
	        // Otherwise we have to call into native to retrieve a position.
	        } else {
	            if (options.timeout !== Infinity) {
	                // If the timeout value was not set to Infinity (default), then
	                // set up a timeout function that will fire the error callback
	                // if no successful position was retrieved before timeout expired.
	                timeoutTimer = createTimeout(fail, options.timeout);
	            } else {
	                // This is here so the check in the win function doesn't mess stuff up
	                // may seem weird but this guarantees timeoutTimer is
	                // always truthy before we call into native
	                timeoutTimer = true;
	            }
	            Cordova.exec(win, fail, "Geolocation", "getLocation", [id,options.enableHighAccuracy, options.maximumAge, options.desiredAccuracy]);
	        }
	        return timeoutTimer;
	    };
	    
	    
	    /**
	     * Asynchronously watches the geolocation for changes to geolocation.  When a change occurs,
	     * the successCallback is called with the new location.
	     *
	     * @param {Function} successCallback    The function to call each time the location data is available
	     * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
	     * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
	     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
	     */
	    Geolocation.prototype.watchPosition = function(successCallback, errorCallback, options) {
//	        argscheck.checkArgs('fFO', 'Geolocation.getCurrentPosition', arguments);
	        options = parseParameters(options);

	        var id = Cordova.createUUID();

	        // Tell device to get a position ASAP, and also retrieve a reference to the timeout timer generated in getCurrentPosition
	        timers[id] = {timer:null};

	        var fail = function(e) {
	            clearTimeout(timers[id].timer);
	            var err = new PositionError(e.code, e.message);
	            if (errorCallback) {
	                errorCallback(err);
	            }
	        };

	        var win = function(p) {
	        	// make sure we don't report anything older than the last location updated
				if (Geolocation.lastPosition && p.timestamp <= Geolocation.lastPosition.timestamp) {
					console.debug("Acquired location is older or same as the previous location. Ignoring.");
					return;
	            }
				
	            clearTimeout(timers[id].timer);
	            if (options.timeout !== Infinity) {
	                timers[id].timer = createTimeout(fail, options.timeout);
	            }
	            var pos = new Position(
	                {
	                    latitude:p.coords.latitude,
	                    longitude:p.coords.longitude,
	                    altitude:p.coords.altitude,
	                    accuracy:p.coords.accuracy,
	                    heading:p.coords.heading,
	                    speed:p.coords.speed,
	                    altitudeAccuracy:p.coords.altitudeAccuracy
	                },
	                (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp)))
	            );
	            Geolocation.lastPosition = pos;
	            successCallback(pos);
	        };

	        Cordova.exec(win, fail, "Geolocation", "addWatch", [id, options.maximumAge, options.enableHighAccuracy, options.desiredAccuracy, options.minChangeDistance, options.minChangeTime]);

	        return id;
	    };  
	    
	   
	    /**
	     * Clears the specified heading watch.
	     *
	     * @param {String} id       The ID of the watch returned from #watchPosition
	     */
	    Geolocation.prototype.clearWatch = function(id) {
	        if (id && timers[id] !== undefined) {
	            clearTimeout(timers[id].timer);
	            timers[id].timer = false;
	            Cordova.exec(null, null, "Geolocation", "removeRequest", [id]);
	            delete timers[id];
	        }
	    };
	    
	

	/**
	 * Force the Cordova geolocation to be used instead of built-in.
	 */
	Geolocation.usingCordova = false;
	Geolocation.useCordova = function() {
		if (Geolocation.usingCordova) {
			return;
		}
		Geolocation.usingCordova = true;
		_consoleLog("#################### Using Cordova geolocation.");

		// Set built-in geolocation methods to our own implementations
		// (Cannot replace entire geolocation, but can replace individual
		// methods)
		navigator.geolocation.setLocation = navigator._geo.setLocation;
		navigator.geolocation.getCurrentPosition = navigator._geo.getCurrentPosition;
		navigator.geolocation.watchPosition = navigator._geo.watchPosition;
		navigator.geolocation.clearWatch = navigator._geo.clearWatch;
		navigator.geolocation.start = navigator._geo.start;
		navigator.geolocation.stop = navigator._geo.stop;
	};

	Cordova.addConstructor(function() {
		navigator._geo = new Geolocation();
		// With Firefox, when we modify the geolocation service, it
		// automatically gets
		// reset to its original value after a few seconds. Therefore, we cannot
		// override it
		var browserUserAgent = navigator.userAgent;
		if (typeof navigator.originalUserAgent !== "undefined"){
			browserUserAgent = navigator.originalUserAgent;
		}
        navigator.geolocation = navigator._geo;
		Geolocation.useCordova();
		navigator.geolocation.start = navigator._geo.start;
		navigator.geolocation.stop = navigator._geo.stop;
		
	});

};
