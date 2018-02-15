
/**
 *  Barak Mock location manager for hybrid app
 */


require([
         "dojo/_base/array"
         ], function(array){
	addService("ScenarioManager", function(){
		//Constants:
		
		var self = this;
		
		//Radius of the Earth in miles
		var EARTH_RADIUS = 3958.75;
		
		//Ratio of a circle's circumference to its diameter
		var PI = 3.1415926535897932384626433832795;
		
		//Factor to convert decimal degrees to radians
		var DEG2RAD =  0.01745329252;
		
		//Factor to convert decimal degrees to radians
		var RAD2DEG = 57.29577951308;
		
		// projections 
		var longLatProjection = new OpenLayers.Projection('EPSG:4326');
		var googleProjection = new OpenLayers.Projection('EPSG:900913');
		
		
		this.wifiPoints = [];
		this.noGpsZones = [];
		
		// ** WIFI calculation *** 
		
		this.DEFAULT_MINIMAL_STRENGTH = 15;
		
		this.maxSignalStrengthRadius = function(){
			return Math.sqrt((this.DEFAULT_MINIMAL_STRENGTH/100));
		};
		
		this.getCurrentPointData =  function(point,distance){
			var a = distance/point.radius;
			if (a < this.maxSignalStrengthRadius() ){
				point.strength = 100;
			} else {
				point.strength = (1/(a*a))*this.DEFAULT_MINIMAL_STRENGTH;
			}
			point.strength = point.strength.toFixed(2);
			return point;
		};
		
		this.getPointData = function(point, location){
			var p1 =new OpenLayers.Geometry.Point(point.longitude, point.latitude); 
			var p2 =new OpenLayers.Geometry.Point(location.coords.longitude, location.coords.latitude); 
			var R = 6371; // km
			var lat1 = p1.y * Math.PI / 180;
			var lat2 = p2.y * Math.PI / 180;
			var lon1 = p1.x * Math.PI / 180;
			var lon2 = p2.x * Math.PI / 180;
			var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
			var y = (lat2-lat1);
			var d1 = Math.sqrt(x*x + y*y) * R;
			var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
	                  Math.cos(lat1)*Math.cos(lat2) *
	                  Math.cos(lon2-lon1)) * R;
			var distanceInM = d1*1000;
			console.info("Gr8 Circle Distance: "+ d1*1000);
			var a = p1.transform(longLatProjection,googleProjection);
			var b = p2.transform(longLatProjection,googleProjection);
			var distance = a.distanceTo(b);
			console.info("regular Distance: "+ distance);
			if (distance < point.radius){
				return this.getCurrentPointData(point,distance);
			}
			return null;
		};
		
		this.getAvailbleWifiPoints = function(location){
			var wifiPoints1 = [];
			for (var i =0 ; i<this.wifiPoints.length; i++){
				var point = this.getPointData(this.wifiPoints[i], location);
				if (point) wifiPoints1.push(point);
			}
			return wifiPoints1;
		};
		
		this.isNoGps = function(location){
			var noGps = false;
			var currLocation  =new OpenLayers.Geometry.Point(location.coords.longitude, location.coords.latitude).transform(longLatProjection,googleProjection); 
			array.map(self.noGpsZones , function(f){
				if (f.geometry.containsPoint(currLocation)){
					noGps = true;
				}
			});
			return noGps;
		};
		
		
		this.Geo = { coordinates: [] } ;
		
		this.controller = {
				timeInterval : 3000,//default time is 3 sec
				initialize : function(options){
					self.locationGenerators.initialize(options);
					if (options.timeInterval){
						this.timeInterval = options.timeInterval;
					}
					if (options.wifiPoints){
						self.wifiPoints = options.wifiPoints;
					}
					if (options.noGpsZones){
						self.noGpsZones = options.noGpsZones;
					}
				},
				replaceRoute : function(options){
					self.locationGenerators.setRoute(options);
				},
				start : function(options){
					this.stop(options);
					self.locationGenerators.startTrack();
					this.intervalFunction =setInterval(this.checkLocation,this.timeInterval);
				},
				stop : function(options){
					clearInterval(this.intervalFunction);
					self.locationGenerators.stopTrack();
				},
				pause : function(options){
					this.stop(options);
				},
				continueTrack : function(options){
//					this.stop(options);
					self.locationGenerators.continueTrack();
					this.intervalFunction =setInterval(this.checkLocation,this.timeInterval);
				},
				restart: function(options){
					this.stop(options);
					this.start(options);
				},
				
				checkLocation: function(){
					var location = self.locationGenerators.getSingleLocation();
					if(location){
						getService('Scenario').updateLocation(location, accessPoints );
						var accessPoints = self.getAvailbleWifiPoints(location);
						getService('WifiPlugin').updateAcceesPoints(accessPoints);
						if (self.isNoGps(location)){
							getService('Geolocation').turnOffGPS();
						} else{
							getService('Geolocation').turnOnGPS();
							getService('Geolocation').setGeolocation({ longitude : location.coords.longitude,
								latitude : location.coords.latitude,
								heading : location.coords.heading,
								speed : location.coords.speed,
							});
						}
					}else { //location is null , send order to stop scenario
						self.controller.stop();
						getService('Scenario').switchToPauseMode();
					}
				},
				getLocation : function(){
					return self.locationGenerators.getSingleLocation();
				},
				trigerSuccessCallback : function(location){
//					this.successFunction(location);
				},
				trigerFailureCallback : function(){},
		};
		
		
		this.locationGenerators = {
				
				DEFAULT_ROUTE_START_TIME  : 0,
				available : false,
				stopTime : null,
				initialize : function(options){
					if (options.route){
						this.createFakeTrackData(options.route);
					}else if (options.routeFileName){
						$.getJSON(options.routeFileName, function(json) {
							self.locationGenerators.createFakeTrackData(json.route);
						});
					}
				},
				startTrack : function(options){
					this.startTime = new Date().getTime();
					this.stopTime = null;
					this.locationIndex = 0; 
				},
				stopTrack : function(options){
					if (!this.stopTime){
						this.stopTime = new Date().getTime();
					}
				},
				continueTrack : function(options){
					if (this.stopTime){
						this.startTime = new Date().getTime() - (this.stopTime - this.startTime);
						this.stopTime = null;
					}else{ // in case of the state is not pause than start
						this.startTrack();
					}	
				},
				calcTimeSinceStart : function(){
					if (this.stopTime){
						return (this.stopTime - this.startTime);
					}
					return (new Date().getTime() - this.startTime);
				},
				reset : function(options){},
				restart : function(options){},
				setRoute : function(options){
					this.createFakeTrackData(options.route);
				},
				track : this.Geo,
				isLocationAvailable: function(){
					// simple check for location availability 
					if (this.available && this.track.coordinates && this.track.coordinates.length > 0 ){
						return true;
					}
					return false;
				},
				lastKnownLocation : function(){
					return this.track.coordinates[this.track.coordinates.length-1];
				},
				updateLocationIndex: function(){
					this.locationIndex = this.locationIndex + self.controller.timeInterval/1000;// because timeInterval is in mil sec
				},
				getLocationAtSec : function(secFromStart){
					if (!this.isLocationAvailable()){
						return null;
					}
					if (this.track.coordinates.length > secFromStart){
						return this.track.coordinates[secFromStart];
					}else{
						return null; //before it was this.lastKnownLocation(); but now we decided that after the scenario has completed there is no GPS
					}
				},
				getLocation : function(options){
					if (!this.isLocationAvailable()){
						return null;
					}
					if (this.track.coordinates.length > this.locationIndex){
						var location = this.track.coordinates[this.locationIndex];
						this.updateLocationIndex();
						return location;
					}else{
						return this.lastKnownLocation();
					}
				},
				getSingleLocation:function(){
					var timeSinceStart = this.calcTimeSinceStart();
					var sec = Math.round(timeSinceStart/1000);
					return this.getLocationAtSec(sec);
				},
				getInterpolatedPoint : function(fromVertice, toVertice, v, numberOfPoint) {
		//			var interimPoint = new OpenLayers.Geometry.Point(fromVertice.x
		//					+ (toVertice.x - fromVertice.x)
		//					* ((v + 1) / (parseInt(numberOfPoint) + 1)),
		//					fromVertice.y + (toVertice.y - fromVertice.y)
		//					* ((v + 1) / (parseInt(numberOfPoint) + 1)));
					var interimPoint = new OpenLayers.Geometry.Point(fromVertice.x
							+ (toVertice.x - fromVertice.x)
							* ((v) / (parseInt(numberOfPoint))),
							fromVertice.y + (toVertice.y - fromVertice.y)
							* ((v) / (parseInt(numberOfPoint))));
					return interimPoint;
				},
				
				timeBetweenPoints : function(toPoint, fromPoint) {
					return toPoint.timeFromStart - fromPoint.timeFromStart;
				},
				
				segmentNumberOfPoints: function(toPoint,fromPoint){
					return this.timeBetweenPoints(toPoint,fromPoint);
				},
				//Inputs are 2 coordinates x1,y1 and x2,y2
				calcBearing : function(x1,y1,x2,y2){
		//			  Convert to radians
					  x1 = x1 * DEG2RAD;
					  y1 = y1 * DEG2RAD;
					  x2 = x2 * DEG2RAD;
					  y2 = y2 * DEG2RAD;
					  
					  a = Math.cos(y2) * Math.sin(x2 - x1);
					  b = Math.cos(y1) * Math.sin(y2) - Math.sin(y1) * Math.cos(y2) * Math.cos(x2 - x1);
					  adjust = 0;
					    
					  if((a == 0) && (b == 0)) {
					      bearing = 0;
					  } else if( b == 0) {
					      if( a < 0)  
					          bearing = 3 * PI / 2;
					      else
					          bearing = PI / 2;
					  } else if( b < 0) 
					      adjust = PI;
					  else {
					      if( a < 0) 
					          adjust = 2 * PI;
					      else
					          adjust = 0;
					  }
					  bearing = (Math.atan(a/b) + adjust) * RAD2DEG;
					  return bearing;
				},
				
				
				calcWayPoint : function(x1,y1){
		//			  Convert to radians
					  x1 = x1 * DEG2RAD;
					  y1 = y1 * DEG2RAD;
					  bearing = bearing * DEG2RAD;
		
					  // Convert arc distance to radians
					  c = distance / EARTH_RADIUS;
		
					  y2 = asin( sin(y1) * cos(c) + cos(y1) * sin(c) * cos(bearing)) * RAD2DEG;
		
		
					  a = sin(c) * sin(bearing);
					  b = cos(y1) * cos(c) - sin(y1) * sin(c) * cos(bearing);
		
					  if( b == 0 ) 
					      x2 = x1;
					  else
					      x2 = x1 + atan(a/b) * RAD2DEG;
		
					  return x2,y2;
				},
				
				
				/**
				 *  get 2 points in long lat
				 *  return distance in meters
				 */
				sphereDistanceMeters: function(p1,p2){
					var R = 6371; // km
					var lat1 = p1.y * Math.PI / 180;
					var lat2 = p2.y * Math.PI / 180;
					var lon1 = p1.x * Math.PI / 180;
					var lon2 = p2.x * Math.PI / 180;
					var x = (lon2-lon1) * Math.cos((lat1+lat2)/2);
					var y = (lat2-lat1);
					var d1 = Math.sqrt(x*x + y*y) * R;
					var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
			                  Math.cos(lat1)*Math.cos(lat2) *
			                  Math.cos(lon2-lon1)) * R;
					var distanceInM = d1*1000;
					return distanceInM;
				},
				
				addPointsAttributes : function(points,fromPoint,toPoint){
					var p1 = fromPoint.clone();
					var p2 = toPoint.clone();
					p1.transform(googleProjection,longLatProjection);
					p2.transform(googleProjection,longLatProjection);
					var bearing = this.calcBearing(p1.x,p1.y,p2.x,p2.y);
					var distance = this.sphereDistanceMeters(p1, p2);
					var time = this.timeBetweenPoints(toPoint, fromPoint);
					var speed = distance/time;
					return array.map(points , function(point){
						// only if attribute does not exists
						if (!point.attributes) point.attributes= {};
						
						point.attributes.speed = speed;
						point.attributes.bearing = bearing;
						return point;
					});
				},
				
				getTimeStamp : function(fromPoint,i){
					return this.routeStartTime + fromPoint.timeFromStart + i;
				},
				
				getInterimPointsBetween2Points: function(fromPoint,toPoint){
					var points = [];
					numberOfPoint  = this.segmentNumberOfPoints(toPoint,fromPoint);
					for (var i = 0; i<numberOfPoint; i++){
						var point = this.getInterpolatedPoint(fromPoint,toPoint,i,numberOfPoint);
						// add attributes and timestamp
						point.attributes = {};
						point.attributes.timestamp = this.getTimeStamp(fromPoint,i);
						
						points.push(point);
					}
		//			points.push(toPoint);
					points = this.addPointsAttributes(points,fromPoint,toPoint);
					return points;
				},
				
				/**
				 *  
				 * @param route route is an array of points in openlayer format with timeFromStart as an attribute
				 * @returns {Array} 
				 */
				getInterimPointsImproved : function(route){
					var points = [];
					for (var v = 0; v< route.length-1; v++){
						var segmentPoints = this.getInterimPointsBetween2Points(route[v],route[v+1]);
						points = points.concat(segmentPoints);
					}
					if (route.length){
						points.push(route[route.length-1]);
					}
					return points;
				},
				
				getInterimPoints : function(route){
					route = array.map(route , function(point){
									var newPoint = point.geometry ; //new OpenLayers.Geometry.Point(point.longitude, point.latitude);	
//									newPoint.transform(longLatProjection,googleProjection);
									newPoint.timeFromStart = point.attributes.time;
									return newPoint;
							});		
					var points =  this.getInterimPointsImproved(route);
					array.map(points, function(point){
						point.transform(googleProjection,longLatProjection);
					});
		//			for (var v = 0; v< route.length-1; v++){
		//				var fromPoint = new OpenLayers.Geometry.Point(route[v].longitude, route[v].latitude);
		//				var toPoint = new OpenLayers.Geometry.Point(route[v+1].longitude, route[v+1].latitude); 
		//				fromPoint.transform(longLatProjection,googleProjection);
		//				toPoint.transform(longLatProjection,googleProjection);
		//				fromPoint.timeFromStart = route[v].timeFromStart;
		//				toPoint.timeFromStart = route[v+1].timeFromStart;
		//				var segmentPoints = this.getInterimPointsBetween2Points(fromPoint,toPoint);
		//				points = points.concat(segmentPoints);
		//			}
		//			for(var i = 0; i< points.length; i++){
		//				points[i].transform(googleProjection,longLatProjection);
		//			}
					return points;
				},
				
				createFakeTrackData : function(route){
					this.available = false;//when replacing the data the locaiton manager is not available
					this.routeStartTime = this.DEFAULT_ROUTE_START_TIME;
					points = this.getInterimPoints(route);
					this.replaceCoordinates(points);
					this.available = true;//when data is set the location manager is back on 
				},
				
				getInterpolationPointsForRoute : function(route){
					
				},
				
				replaceCoordinates : function(points){
					data = [];
					for (var i in points) {
						data.push({
						  	  coords: {
						    	  accuracy: 80.5,
						    	  altitude: 1350.07,
						    	  altitudeAccuracy: 1,
						    	  heading: (typeof(points[i].attributes)!=='undefined' ? points[i].attributes.bearing: 0),
						    	  latitude: points[i].y,
						    	  longitude: points[i].x,
						    	  speed: (typeof(points[i].attributes)!=='undefined' ? points[i].attributes.speed: 0),
							  },
							  timestamp: points[i].timestamp,
						  });
					}
					this.track.coordinates = data;
				},
				
				createTrackPoint:function(){
				},
		};
	
	});

});


