var addGeolocFunction = function(dom, connect, html, has, domConstruct, domGeom, lang,
					  domStyle, registry, WidgetFeature, GfxLayer, GeometryFeature, Point) {
	var runningId = null;// again
	var sources = {};
	this.inError = 0;
	this.isGPSAvailable = true;

	this.latChangeId = null;
	this.lonChangeId = null;
	this.headChangeId = null;
	this.compassChangeId = null;

	this.latKeyUpId = null;
	this.lonKeyUpId = null;
	this.accKeyUpId = null;
	this.altKeyUpId = null;
	this.altAccKeyUpId = null;
	this.headKeyUpId = null;
	this.velKeyUpId = null;
	this.applyClick = null;

	this.widgetFeature = null;
	this.compass = null;
	
	this.latitude = 48.858242;
	this.longitude = 2.294521;
	this.accuracy = rand(100, 1);
	this.altitude = rand(10000, 1);
	this.heading = rand(360, 0);
	this.speed = rand(100, 2);
	this.altitudeAccuracy = 1;
	this.stepToNextLL = 0.2;

	function positionsAreEquals(pos1, pos2){
	    if (!pos1 || !pos2) return false;
		return (pos1.coords.accuracy==pos2.coords.accuracy &&
	            pos1.coords.altitude==pos2.coords.altitude &&
	            pos1.coords.altitudeAccuracy==pos2.coords.altitudeAccuracy &&
	            pos1.coords.heading==pos2.coords.heading &&
	            pos1.coords.latitude==pos2.coords.latitude &&
	            pos1.coords.longitude==pos2.coords.longitude &&
	            pos1.coords.speed==pos2.coords.speed);

	};	
	
	this.getPositionError = function(code, msg) {
		var PositionError = function(e, m) {
			if (e == null) {
				// if the error is not provided, then we generate one randomly.
				var d = new Date();
				this.code = 1 + d.getTime() % 3;
			} else {
				this.code = e;
			}
			if (m == null) {
				if (this.code == 1)
					this.message = "Permission Denied.";
				else if (this.code == 2)
					this.message = "Position unavailable.";
				else if (this.code == 3)
					this.message = "Time out.";
				else
					this.message = "Unknown error.";
			} else {
				this.message = m;
			}
		};
		return new PositionError(code, msg);
	};

	this.turnOffGPS = function(){
		this.isGPSAvailable = false;
	};
	this.turnOnGPS = function(){
		this.isGPSAvailable = true;
	};
	
	// Get current geolocation values
	this.getGeolocation = function() {
		// if the GPS is not available return null
		if (!this.isGPSAvailable) return null;
			
		var Coordinates = function(latitude, longitude,
				altitude, accuracy, altitudeAccuracy,
				heading, speed) {
			this.latitude = latitude;
			this.longitude = longitude;
			this.altitude = altitude;
			this.accuracy = accuracy;
			this.altitudeAccuracy = altitudeAccuracy;
			this.heading = heading;
			this.speed = speed;
		};
		var r = new Coordinates(this.latitude,
				this.longitude, this.altitude,
				this.accuracy, this.altitudeAccuracy,
				this.heading, this.speed);
		var Position = function(c, t) {
			this.coords = c; // Coordinates
			this.timestamp = t;
		};
		var d = new Date();
		var t = d.getTime();
		return new Position(r, t);
	};

	this.updateMap = function() {
		var map = registry.byId('geolocationMap');
		if (map) {
			map = map.map;
			var from = dojox.geo.openlayers.EPSG4326;
			var to = map.olMap.getProjectionObject();
			var lon = parseFloat(this.longitude);
			var lat = parseFloat(this.latitude);
			var p = {
					x : lon,
					y : lat
			};
			OpenLayers.Projection.transform(p, from, to);
			map.olMap.setCenter(new OpenLayers.LonLat(p.x, p.y));
			
			if (typeof map._customGeometryLayer === "undefined") {
				// create a GfxLayer
				map._customGeometryLayer = new GfxLayer();
				// add layer to the map
    			map.addLayer(map._customGeometryLayer);
			}
			
			if (typeof map._customGeometryFeature !== "undefined") {
				map._customGeometryLayer.removeFeature(map._customGeometryFeature);
			}
			// create a GeometryFeature
    		var centerPoint = new Point({x:lon, y:lat});
			map._customGeometryFeature = new GeometryFeature(centerPoint);
			// set the shape properties, fill and stroke
			map._customGeometryFeature.setFill([ 255, 0, 0 ]);
			map._customGeometryFeature.setStroke([ 0, 0, 0 ]);
			map._customGeometryFeature.setShapeProperties({
			  r : 5
			});
			// add the feature to the layer
			map._customGeometryLayer.addFeature(map._customGeometryFeature);
    		
		}
		if (this.compass)
			this.compass.set("value", this.heading);

	};

	this.updateMap = function() {
		var map = registry.byId('geolocationMap');
		if (map) {
			map = map.map;
			var from = dojox.geo.openlayers.EPSG4326;
			var to = map.olMap.getProjectionObject();
			var lon = parseFloat(this.longitude);
			var lat = parseFloat(this.latitude);
			var p = {
					x : lon,
					y : lat
			};
			OpenLayers.Projection.transform(p, from, to);
			map.olMap.setCenter(new OpenLayers.LonLat(p.x, p.y));
		}
		if (this.compass)
			this.compass.set("value", this.heading);
	};
	
	this.updateMapCenterShape = function() {
		var map = registry.byId('geolocationMap');
		if (map) {
			map = map.map;
			if (typeof map._customGeometryLayer === "undefined") {
				// create a GfxLayer
				map._customGeometryLayer = new GfxLayer();
				// add layer to the map
				map.addLayer(map._customGeometryLayer);
			}

			if (typeof map._customGeometryFeature !== "undefined") {
				// Remove previously existing GeometryFeature
				map._customGeometryLayer.removeFeature(map._customGeometryFeature);
			}
			// create a GeometryFeature
			var lon = parseFloat(this.longitude);
			var lat = parseFloat(this.latitude);
			var centerPoint = new Point({x:lon, y:lat});
			map._customGeometryFeature = new GeometryFeature(centerPoint);
			// set the shape properties, fill and stroke
			map._customGeometryFeature.setFill([ 255, 0, 0 ]);
			map._customGeometryFeature.setStroke([ 0, 0, 0 ]);
			map._customGeometryFeature.setShapeProperties({
			  r : 5
			});
			// add the feature to the layer
			map._customGeometryLayer.addFeature(map._customGeometryFeature);
			map._customGeometryLayer.redraw();
		}
	};

	this.updateUI = function(map) {
		if (this.latitude != parseFloat(sim_geoloc_geoLat.get("value")))
			sim_geoloc_geoLat.set("value", this.latitude);
		if (this.longitude != parseFloat(sim_geoloc_geoLng.get("value")))
			sim_geoloc_geoLng.set("value", this.longitude);
		if (this.altitude != parseFloat(sim_geoloc_geoAlt.get("value")))
			sim_geoloc_geoAlt.set("value", this.altitude);
		if (this.accuracy != parseFloat(sim_geoloc_geoAcc.get("value")))
			sim_geoloc_geoAcc.set("value", this.accuracy);
		if (this.altitudeAccuracy != parseFloat(sim_geoloc_geoAltAcc.get("value")))
			sim_geoloc_geoAltAcc.set("value",this.altitudeAccuracy);
		if (this.heading != parseFloat(sim_geoloc_geoHead.get("value")))
			sim_geoloc_geoHead.set("value", this.heading);
		if (this.speed != parseFloat(sim_geoloc_geoVel.get("value")))
			sim_geoloc_geoVel.set("value", this.speed);
		if (map)
			this.updateMap();
		this.updateMapCenterShape();
			
	};

	this.calcWaypoint = function(lon1,lat1,brng,d){
		var EARTH_RADIUS = 3958.75; //miles
		//Ratio of a circle's circumference to its diameter
		var PI = 3.1415926535897932384626433832795;
		//Factor to convert decimal degrees to radians
		var DEG2RAD =  0.01745329252;
		//Factor to convert decimal degrees to radians
		var RAD2DEG = 57.29577951308;
		var R = EARTH_RADIUS;   
		lat1 = lat1*DEG2RAD;
		lon1 = lon1*DEG2RAD;
		brng = brng*DEG2RAD;
		var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
	              Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
		var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
	                     Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
		
		return [lon2*RAD2DEG,lat2*RAD2DEG];
	},
	
	this.calcDistance = function(speed,time){
		return  speed*time;
	},
	
	this.nextLoc = function() {
		var distance = this.calcDistance(this.speed,1);
		var nextPoint = this.calcWaypoint(this.longitude ,this.latitude, this.heading, distance/1609);// because the earth radius is in miles
		var ret = {
				latitude : nextPoint[1],
				longitude : nextPoint[0],
				altitude : this.nextAltitude()
		};
		return ret;
	};

	this.nextAltitude = function() {
		var a = parseFloat(this.altitude);
		a += randRange(this.stepToNextLL, 2);
		if (a > 10000)
			a = a - 10000;
		if (a < -0)
			a += a;
		return parseFloat(a);
	};
	
	
	this.applyClicked = function() {
		var updateMap = false;
		var updateGeo = false;
		
		// handle the latitude change
		var newValue = parseFloat(sim_geoloc_geoLat
				.get("value"));
		if (isNaN(newValue)) {
			if ((sim_geoloc_geoLat.get("value") != "-")
					&& (sim_geoloc_geoLat.get("value") != ""))
				sim_geoloc_geoLat.set("value", this.latitude);
		} else {
			if (newValue != this.latitude) {
				this.latitude = newValue;
				updateMap = true;
				updateGeo = true;
			}
		}

		// handle the longitude change
		newValue = parseFloat(sim_geoloc_geoLng.get("value"));
		if (isNaN(newValue)) {
			if ((sim_geoloc_geoLng.get("value") != "-")
					&& (sim_geoloc_geoLng.get("value") != ""))
				sim_geoloc_geoLng.set("value", this.longitude);
		} else {
			if (newValue != this.longitude) {
				this.longitude = newValue;
				updateMap = true;
				updateGeo = true;
			}
		}
		
		// handle the heading change
		newValue = parseFloat(sim_geoloc_geoHead.get("value"));
		if (isNaN(newValue)) {
			if (sim_geoloc_geoHead.get("value") != "")
				sim_geoloc_geoHead.set("value", this.heading);
		} else {
			var resetHeading = false;
			while ((newValue < 0) || (newValue > 360)) {
				if (newValue <= 0)
					newValue += 360;
				if (newValue > 360)
					newValue -= 360;
				resetHeading = true;
			}
			if (resetHeading)
				sim_geoloc_geoHead.set("value", newValue);
			if (newValue != this.heading) {
				this.heading = newValue;
				if (this.compass)
					this.compass.set("value", this.heading);
				updateMap = true;
				updateGeo = true;
			}
		}
		
		// handle the accuracy change
		newValue = parseFloat(sim_geoloc_geoAcc
				.get("value"));
		if (isNaN(newValue)) {
			if (sim_geoloc_geoAcc.get("value") != "")
				sim_geoloc_geoAcc.set("value",
						this.accuracy);
		} else {
			if (newValue != this.accuracy) {
				this.accuracy = newValue;
				updateMap = true;
				updateGeo = true;
			}
		}
		
		// handle the altitude change
		newValue = parseFloat(sim_geoloc_geoAlt
				.get("value"));
		if (isNaN(newValue)) {
			if ((sim_geoloc_geoAlt.get("value") != "-")
					&& (sim_geoloc_geoAlt.get("value") != ""))
				sim_geoloc_geoAlt.set("value", this.altitude);
		} else {
			if (newValue != this.altitude) {
				this.altitude = newValue;
				updateGeo = true;
			}
		}
		
		// handle the altitude accuracy change
		newValue = parseFloat(sim_geoloc_geoAltAcc.get("value"));
		if (isNaN(newValue)) {
			if (sim_geoloc_geoAltAcc.get("value") != "")
				sim_geoloc_geoAltAcc.set("value", this.altitudeAccuracy);
		} else {
			if (newValue != this.altitudeAccuracy) {
				this.altitudeAccuracy = newValue;
				updateGeo = true;
			}
		}
		
		// handle the altitude speed change
		newValue = parseFloat(sim_geoloc_geoVel.get("value"));
		if (isNaN(newValue)) {
			if (sim_geoloc_geoVel.get("value") != "")
				sim_geoloc_geoVel.set("value", this.speed);
		} else {
			if (newValue != this.speed) {
				this.speed = newValue;
				updateGeo = true;
			}
		}
		
		if (updateMap) {
			this.updateMap();
			this.updateMapCenterShape();
		}
		if (updateGeo) {
			this.updateGeolocation(false);
		}
	};
	
	// Public
	// Generate next geolocation values
	this.nextGeolocation = function() {
			var ll = this.nextLoc();
			this.latitude = ll.latitude;
			this.longitude = ll.longitude;
			this.altitude = ll.altitude;
			if (this.applyClick == null) {
				this.applyClick = dojo.connect(
						sim_geoloc_apply_button,
						"onClick",
						null,
						dojo.hitch(this, this.applyClicked));
			}
			this.updateUI(true);		
	};
	
	// Public
	// set the geolocation and update the ui
	this.setGeolocation = function(location) {
			this.latitude = location.latitude ? location.latitude : this.latitude ;
			this.longitude = location.longitude ? location.longitude : this.longitude ;
			this.accuracy = location.accuracy ? location.accuracy : this.accuracy ;
			this.altitude = location.altitude ? location.altitude : this.altitude ;
			this.heading = location.heading ? location.heading : this.heading ;
			this.speed = location.speed ? location.speed : this.speed ;
			this.altitudeAccuracy = location.altitudeAccuracy ? location.altitudeAccuracy : this.altitudeAccuracy ;			
			this.updateUI(true);
	};

	// Public
	// Update geolocation and send to device
	this.updateGeolocation = function(newVal) {
		if (newVal == true)
			this.nextGeolocation();
	};

	var _sim_geoloc_timer_is_on = false;

	this.timedGeolocUpdate = function() {
		if (_sim_geoloc_timer_is_on == true) {
			this.updateGeolocation(true);
			setTimeout(lang.hitch(this,	this.timedGeolocUpdate), 1000); // update location every sec
		}
	};

	this.startStopTimer = function() {
		if (_sim_geoloc_timer_is_on == false) {
			sim_geoloc_apply_button.attr("disabled", true); // enable "apply" button when not in play
			_sim_geoloc_timer_is_on = true;
			this.timedGeolocUpdate();
			sim_geoloc_startStop_button.set("label", n.sim_common_stop); // switch label from "play" to "stop"
		} else {
			sim_geoloc_apply_button.attr("disabled", false); // disable "apply" button when in play
			_sim_geoloc_timer_is_on = false;
			sim_geoloc_startStop_button.set("label", n.sim_common_start); // switch label from "stop" to "play"
		}
	};

	// generate a new error when button is pressed,
	// there can be only 1 error at a time
	this.generateError = function() {
		if(!this.inError){
			this.inError++;
		}
		this.updateErrorButton();
	};

	this.updateErrorButton = function() {
		var n = _pg_sim_nls;
		var l = n.sim_common_error_button;
		if (this.inError > 0){
			sim_geoloc_error_button.attr("disabled", true);
			sim_geoloc_error_type_select_button.attr("disabled", true);
			l = n.sim_common_error_pending_button;
		}
		else{
			sim_geoloc_error_button.attr("disabled", false);
			sim_geoloc_error_type_select_button.attr("disabled", false);
		}
		sim_geoloc_error_button.set("label", l);
	};
	// get the value of the error from the select button
	this.getPositionErrorIndex = function(){
		return parseInt(sim_geoloc_error_type_select_button.getValue());
	};
	
	// Public
	// Handle requests
	this.exec = function(action, args, callbackId, source, uuid) {
		var r = this.getGeolocation();
		var DEFAULT_TIMEOUT = 100000; // This is the default timeout because the timeout is not passed as a parameter all the time
		sources[uuid]=source;
		if (action == 'getLocation') {
			var that = this;
			var id = args[0];
			var enableHighAccuracy = args[1];
			var timeout = DEFAULT_TIMEOUT;
			var maxage = args[2];
			var afterCallback = function(){
				delete sources[uuid];
				that.destroyHandlerFunc(uuid);
			};
			var error = function(pluginResult){
				var positionErrorIndex = that.getPositionErrorIndex();
				that.postResult(new PluginResult(callbackId,PluginResultStatus.ERROR,that.getPositionError(positionErrorIndex), false),uuid);
			};
			var success = function(position){
				that.postResult(new PluginResult(callbackId, PluginResultStatus.OK, position, false),uuid);
			};
			this.createHandlerFunc(action, args, callbackId, source, uuid,success, afterCallback, enableHighAccuracy, timeout, maxage,error);
			return;
//			return new PluginResult(callbackId,	PluginResultStatus.OK, r, false);
		} else if (action == 'addWatch') { // watch location
			var that = this;
			var id = args[0];
			var maxage = args[1];
			var enableHighAccuracy = args[2];
			var timeout = DEFAULT_TIMEOUT;
			var minChangeDistance = args[4];
			var afterCallback = function(){
				this.startTime = new Date().getTime();
			};
			var error = function(){
				var positionErrorIndex = that.getPositionErrorIndex();
				that.postResult(new PluginResult(callbackId,PluginResultStatus.ERROR,that.getPositionError(positionErrorIndex), true),uuid);
			};
			var success = function(position){
				that.postResult(new PluginResult(callbackId, PluginResultStatus.OK, position, true),uuid);
			};
			this.createHandlerFunc(action, args, callbackId, source, uuid,success, afterCallback,enableHighAccuracy,timeout,maxage,error);
			return;
		} else if (action == 'removeRequest') { // stop watching
			this.destroyHandlerFunc(args[0]); // trigger the destroy handler function
		}
		return new PluginResult(callbackId,
				PluginResultStatus.INVALID_ACTION);
	};

	this.createWidget = function() {
		that.compass = compass;
		return div;
	};

	//return result to device
	this.postResult = function(result, uuid) {
		_consoleLog("Message recieved from geolocation plugin" + result);
		var source = sources[uuid];
		if ((source != null) && (typeof source !== "undefined")) {
			if (typeof result === 'object') {
				_consoleLog("posting...");
				try {
					source.postMessage(JSON.stringify(result), "*");
				} catch (err) {
					_consoleLog(err.message);
					_consoleLog("Error occured while stringifying: " + result);
				}
				_consoleLog("posted...");
			} else {
				source.postMessage(resultString, "*");
			}
		} else {
			_consoleLog("Error in postResult");
		}
	};
	
	this.handlers = {};
	
	this.handlerFunction = function(options){
		
		this.running = false;
		
		function calcIntervalTime(enableHighAccuracy){
			if (enableHighAccuracy){
				return 2000; // every 2 second
			}else {
				return 300000; // 5 minute
			}
		};
		
		this.initialize = function(options){
			this.that = options.that;
			this.success = options.success;
			this.error = options.error;
			this.startTime = new Date().getTime();
			this.getGeolocation = options.getGeolocation;
			this.timeout = options.timeout;
			this.maxage = options.maxage;
			this.afterCallBack = options.afterCallback;
			this.uuid = options.uuid;
			this.action = options.action;
			this.intervalTime = calcIntervalTime(options.enableHighAccuracy);
		};
		
		this.start = function(){
			this.intervalId = setInterval(
				     (function(self) {         //Self-executing func which takes 'this' as self
				         return function() {   //Return a function in the context of 'self'
				             self.handlerLoop(); //Thing you wanted to run as non-window 'this'
				         }
				     })(this),
				     this.intervalTime     //normal interval, 'this' scope not impacted here.
				 ); 
		};
		
		
		this.maxAgeCheck = function(p){
			var now = new Date().getTime();
			return ((this.maxage>(now-p.timestamp))?true:false);
		};
		/**
		The
		**/
		this.successParameters = function(p){
			if (this.maxAgeCheck(p)){
				return true;
			}
			return false;
		};
		
		this.timeSinceLastRes = function(){
			return (new Date().getTime()- this.startTime);
		};
		
		this.handlerLoop = function(){
			if (this.running) return;
			else this.running = true;
			
			var that = this.that;
			
			if (this.currLoc)
				this.prevLoc = this.currLoc;
			this.currLoc = that.getGeolocation();
			
//			This is done in the cordova plugin. no need to make the check in here
//			if (this.timeout < this.timeSinceLastRes()){
//				// error 
//				this.afterCallBack();
//			}
			
			// sending an error to the device is neccessary
			if (that.inError > 0) {
				that.inError--;
				that.updateErrorButton();
				this.error();
				this.afterCallBack();
			}
			// check if the position have not changed , if not, no callback should be return so just return;
			else if (positionsAreEquals(this.currLoc,this.prevLoc)) {
				// empty function to skip the excution, NO RETURN !!!!!
			}
			// sending the current position
			else if (this.currLoc){
				var success = this.successParameters(this.currLoc);
				if (success){
					this.success(this.currLoc);
					this.afterCallBack();
				}
			}
			// no current position available so check if the prev position suit the terms
			else if (this.prevLoc){
				var success = this.successParameters(this.prevLoc);
				if (success){
					this.success(this.prevLoc);
					this.afterCallBack();
				}
			}
			this.running = false;
		};
		
		this.destroy = function(){
			window.clearInterval(this.intervalId);
		};
		{
			this.prevLoc = null;
			this.currLoc = null;
			this.initialize(options);
		}
	};
	
	this.createHandlerFunc = function(action, args, callbackId, source, uuid, success, afterCallback,enableHighAccuracy,timeout,maxage, error){
		var handlerId = (action == "addWatch")?args[0]:uuid;
		this.handlers[handlerId] = new this.handlerFunction({
										that:this,
										afterCallback :afterCallback,							
										success:success,
										error:error,
										uuid : uuid,
										action : action,
										args : args,
										enableHighAccuracy : enableHighAccuracy,
										timeout :timeout,
										maxage :maxage,
										callbackId : callbackId,
										enableHighAccuracy:true,
										getGeolocation : this.getGeolocation,
										});
		this.handlers[handlerId].start();
	};
	
	this.destroyHandlerFunc = function(handlerId){
		var handler = this.handlers[handlerId];
		handler.destroy();
		delete this.handlers[handlerId];
	};
	
	
	
	// Initialization
	{
		var n = _pg_sim_nls;
		dom.byId('sim_geoloc_latitude_label').innerHTML = n.sim_geoloc_latitude_label;
		dom.byId('sim_geoloc_longitude_label').innerHTML = n.sim_geoloc_longitude_label;
		dom.byId('sim_geoloc_accuracy_label').innerHTML = n.sim_geoloc_accuracy_label;
		dom.byId('sim_geoloc_altitude_label').innerHTML = n.sim_geoloc_altitude_label;
		dom.byId('sim_geoloc_altitudeAccuracy_label').innerHTML = n.sim_geoloc_altitudeAccuracy_label;
		dom.byId('sim_geoloc_heading_label').innerHTML = n.sim_geoloc_heading_label+'&deg;';
		dom.byId('sim_geoloc_velocity_label').innerHTML = n.sim_geoloc_velocity_label;
		sim_geoloc_next_button.set("label",
				n.sim_geoloc_next_button);
		sim_geoloc_apply_button.set("label",
				"Apply");
		sim_geoloc_startStop_button.set("label",
				n.sim_common_start);
		
		// set tooltips for buttons
		var applyTooltip = new dijit.Tooltip({
			connectId: ["applyBtn"],
			position:['above'],
			label: n.sim_geoloc_apply_tooltip,
		});
		var playTooltip = new dijit.Tooltip({
			connectId: ["startStopBtn"],
			position:['above'],
			label: n.sim_geoloc_startStop_tooltip
		});
		var stepTooltip = new dijit.Tooltip({
			connectId: ["nextBtn"],
			position:['above'],
			label: n.sim_geoloc_step_tooltip
		});
		
		
		this.updateErrorButton();
		if (window.mbsOpenLayersAvailable == true) {
			var longitude = 2.294521;
			var latitude = 48.858242;
			var map = new dojox.geo.openlayers.widget.Map({
				initialLocation : {
					position : [ longitude, latitude ],
					extent : 2
				},
				id : "geolocationMap"
			}, "geolocationMapDiv");
			domStyle.set(map.domNode, {
				width : 100 + "%",
				height : 200 + "px"
			});
			map.startup();
			var control = new OpenLayers.Control({
				autoActivate : true
			});
			var that = this;
			OpenLayers.Util.extend(
				control,
				{
					chartSize : 70,
					draw : function(px) {
						OpenLayers.Control.prototype.draw.apply(this, arguments);
						if (!this._element) {
							var div = dojo.create(
									"div",
									{
										unselectable : "on",
										style : {
											position : "absolute",
											bottom : "0px",
											right : "0px",
										}
									},
									this.div);
							that.compass = new widgets.Compass(
									{
										background : [
													  10,
													  20,
													  200,
													  0 ],
										color : [
												   0x20,
												   0x20,
												   0x20 ],
										title : 'Heading',
										width : this.chartSize,
										height : this.chartSize,
										min : 0,
										max : 360,
										majorTicksInterval : 30,
										startAngle : 0,
										endAngle : 360,
										value : 0,
										textIndicatorFont : 'normal normal normal 7pt calibri,Helvetica,Arial,sans-serif',
										font : 'normal normal normal 4pt calibri,Helvetica,Arial,sans-serif',
										id : "compassWidget"
									}, div);
							that.compass.startup();
							this._element = div;
							this.map.events.register(
									'moveend',
									this,
									this.update);
							return div;
						}
					}
				});
			
			OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
                    var lonlat = map.map.olMap.getLonLatFromPixel(e.xy);
                    
                    var from = map.map.olMap.getProjectionObject();
					var to = dojox.geo.openlayers.EPSG4326;
					var p = {
							x : lonlat.lon,
							y : lonlat.lat
					};
					OpenLayers.Projection.transform(p, from, to);
					that.longitude = parseFloat(p.x);
					that.latitude = parseFloat(p.y);
					that.updateUI(false);
                }

            });
			var click = new OpenLayers.Control.Click();
			map.map.olMap.addControl(click);
            click.activate();
			
			
			map.map.olMap.addControl(control);
			control.activate(true);
		}

		this.nextGeolocation();
	}
};


if (window.mbsOpenLayersAvailable == true) {
	require(
			[ "dojo/dom", "dojo/_base/connect", "dojo/_base/html", "dojo/has",
			  "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang",
			  "dojo/dom-style", "dijit/registry",
			  "dojox/geo/openlayers/WidgetFeature", "dojox/geo/openlayers/GfxLayer",
			  "dojox/geo/openlayers/GeometryFeature", "dojox/geo/openlayers/Point"  ],
			  function(dom, connect, html, has, domConstruct, domGeom, lang,
					  domStyle, registry, WidgetFeature, GfxLayer, GeometryFeature, Point) {
				addService(
					"Geolocation",
					function() {
						var hitchedInit = dojo.hitch(this, addGeolocFunction, dom, connect, html, has, domConstruct, domGeom, lang, domStyle, registry, WidgetFeature, GfxLayer, GeometryFeature, Point);
						hitchedInit();
					});
			});
} else {
	require(
			[ "dojo/dom", "dojo/_base/connect", "dojo/_base/html", "dojo/has",
			  "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/lang",
			  "dojo/dom-style", "dijit/registry" ],
			  function(dom, connect, html, has, domConstruct, domGeom, lang,
					  domStyle, registry) {
				addService(
					"Geolocation",
					function() {
						var hitchedInit = dojo.hitch(this, addGeolocFunction, dom, connect, html, has, domConstruct, domGeom, lang, domStyle, registry);
						hitchedInit();
					});
			});
}