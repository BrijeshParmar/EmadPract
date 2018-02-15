/**
 *  scenario editor service
 */
require([
         "dojo/_base/array",
         "dojo/dom-style",
         "dojo/_base/connect",
         "dojo/query",
         "dojo/has",
         "dojo/keys",
         "dijit/focus",
         "widgets/ScenarioStyle"
         ], function(array,domStyle, connect, query, has, keys, focusUtil, ScenarioStyle){
	
	var hasIE = has("ie");
	if (typeof hasIE !== "undefined") {
		addService("ScenarioEditor", function() {
			console.info("Scenario Editor not added in IE");
		});
		return;
	}

	addService("ScenarioEditor", function(){
		
		
		//Constants:
		var self = this;
		this.initMapManually = false;
		
		this.dataProjection = new OpenLayers.Projection("EPSG:4326");
		this.mapProjection = new OpenLayers.Projection("EPSG:900913");
	
		// format object to convert from geojson to feature
		this.geojson_format = new OpenLayers.Format.GeoJSON({
	        'internalProjection': self.mapProjection,
	        'externalProjection': self.dataProjection
	    });
		
		// strengths used as triggers and wifi radii
		this.DEFAULT_MINIMAL_STRENGTH = 15;
		this.DEFAULT_MEDIUM_STRENGTH = 50;
		this.DEFAULT_HIGH_STRENGTH = 80;
		
		this.DEFAULT_PATH_SPEED_M_PER_S = 10;
	
        
		function onPopupClose(evt){
			console.log("popup is close");
		};

		function selectFilter(feature){
			if (feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.LineString') return true;	
			return false;
		};

		var featureEditableFields = {
				'OpenLayers.Geometry.Point' : ['time'], 
				'OpenLayers.Geometry.Polygon' : ['SSID','MAC']
		};

		var featureReadOnlyFields = {
				'OpenLayers.Geometry.Point' : [], 
				'OpenLayers.Geometry.Polygon' : []
		};
		
		function getFeatureEditableField(feature){
			// if noGps return []
			if (feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon' && !feature.attributes.wifi) return [];
			
			var fields = featureEditableFields[feature.geometry.CLASS_NAME];
			if (fields) return fields;
			return [];
		};
		
		function getFeatureReadOnlyField(feature){
			var fields = featureReadOnlyFields[feature.geometry.CLASS_NAME];
			if (fields) return fields;
			return [];
		};
		
		
		function getFeatureTitle(feature){
			// Routes are LineString, Wifi and "no gps zones" are Polygons
			if (feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon') {
				if (feature.attributes.wifi) {
					return self.access_point_title ;
				}else{
					return self.no_gps_zone_title;
				}
			}
			return self.route_point_title;
		}
		
		function onFeatureSelect(feature) {
			if (selectFilter(feature)) return;
			
			if (self.selectedFeature) {
	  			self.removeFeaturePopup(self.selectedFeature);
			}
			self.selectedFeature = feature;
			
		    var fieldsHtml = '';
			var field = null, fieldIndex = null, label = null;
			var editableFields = getFeatureEditableField(feature);
			var readOnlyFields = getFeatureReadOnlyField(feature);
			fieldsHtml += '<table style="clear:both;">';
			for (fieldIndex in readOnlyFields) {
		    	field = readOnlyFields[fieldIndex];
		    	label = self.fieldLabels[field] || field;
		    	fieldsHtml += "<tr><th><label>"+label+": </label></th><th><input disabled value='"+feature.attributes[field]+"' name='"+field+ "'></th></tr>";
		    }
			for (fieldIndex in editableFields) {
		    	field = editableFields[fieldIndex];
		    	label = self.fieldLabels[field] || field;
		    	if (field === "time" && feature.attributes[field] == 0) {
			    	fieldsHtml += "<tr><th><label>"+label+": </label></th><th><input disabled value='"+feature.attributes[field]+"' name='"+field+ "'></th></tr>";
		    	} else {
			    	fieldsHtml += "<tr><th><label>"+label+": </label></th><th><input value='"+feature.attributes[field]+"' name='"+field+ "'></th></tr>";
		    	}
		    }
			fieldsHtml += '</table>';
			var point = feature.geometry.getCentroid();
			if (feature.geometry.containsPoint && !feature.geometry.containsPoint(point)) {
				point = feature.geometry.getVertices()[0];
			}
			var lonlat = point.getBounds().getCenterLonLat();
			var deleteLabel = feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon' ? self.DELETE_LABEL : self.DELETE_PATH_LABEL;
		    var popup = new OpenLayers.Popup.AnchoredBubble("chicken", 
		                             lonlat,
		                             null,
		                             "<div class='editPopup'>" + 
		                             "<div class='editPopupTitle'>" + getFeatureTitle(feature)+   "</div>" +
		                             "<div class='editPopupButtonWrapper'>" + 
		                             "<button onClick="+'"'+"getService(" + "'"+"ScenarioEditor"+"'"+ ").deleteFeature('"+ feature.id+"');"+'"'+">"+deleteLabel+"</button>" +
		                             "</div>" +
		                             fieldsHtml +
		                             "</div>",
		                             null, false);

		    //self.editorMap.map.olMap.setCenter(feature.geometry.getBounds().getCenterLonLat());

		    // put popup on top left and fix it relative to feature in case
		    popup.fixedRelativePosition = true;
		    popup.relativePosition = 'tr';
		    popup.autoSize = true;
		    feature.popup = popup;
		    
		    self.editorMap.map.olMap.addPopup(popup, /*exclusive*/ true);
		    
		    repositionPopup(popup, lonlat);
		}
		
	    // make sure popup is above and to the left of the feature
	    // since the relativePosition is overridden when the popup is drawn
		function repositionPopup(popup, lonlat) {
		    var pos = popup.relativePosition,
		    	px = self.editorMap.map.olMap.getLayerPxFromLonLat(lonlat),
		    	size = popup.size;
		    if (pos.charAt(0) == 'b') {
		    	px = px.add(0, -(size.h+20));
		    }
		    if (pos.charAt(1) == 'r') {
		    	px = px.add(-(size.w+20), 0);
		    }
		    popup.moveTo(px);
		    popup.relativePosition = 'tr';
		}
		
		function calcDiffTime(s1,s2,d){
			return Math.round(2*parseInt(d)/(parseInt(s1)+parseInt(s2)));
		}

		function calcSingleFeatureTime(feature, timeDiff){
			if (!feature.geometry) return;
			if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point"){
				var i = parseInt(feature.attributes.index);
				if (i != 0) {
					feature.attributes.time = parseInt(feature.attributes.time) + timeDiff;
				}
			}
		}

		function calcFeatureTime(feature){
			if (!feature.geometry) return;
			if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point"){
				var i = parseInt(feature.attributes.index);
				var t_new = parseInt(feature.attributes.time);
				var t_old = parseInt(feature.attributes.prev_time) || 0;
				var timeDiff = t_new - t_old;
				var features = self.paths[feature.attributes.line];
				for (var j=i+1; j< features.length; j++){
					calcSingleFeatureTime(features[j], timeDiff);
				}
			}
		}
		
		/**
		 * remove the feature popup and from map
		 */
		this.removeFeaturePopup = function(feature){
			if (!feature.popup) return;
			self.editorMap.map.olMap.removePopup(feature.popup);
		    feature.popup.destroy();
		    feature.popup = null;
		};
		
		/**
		 *  unselect feature callback for the select control 
		 *  resposible for storing the value from the input and calculate the value of other feature that are depend on this feature
		 */
		function onFeatureUnselect(feature) {
			if (selectFilter(feature)) return ;
		    if (!feature.popup) return;
			var fields = getFeatureEditableField(feature) ;
		    for (var i=0; i<fields.length;i++){
		    	var inputs = query("input[name='"+fields[i]+"']", feature.popup.contentDiv);
		    	if (inputs.length){
		    		feature.attributes["prev_"+fields[i]] = feature.attributes[fields[i]];
		    		feature.attributes[fields[i]] = inputs[0].value;
		    	}
		    }
			
		    calcFeatureTime(feature);
		    self.removeFeaturePopup(feature);
		    
		};
		
		
		
		function calcDistanceBetweenPoints(p1,p2){
			var p1t = p1.clone(), p2t = p2.clone();
			p1t.transform(self.mapProjection, self.dataProjection);
			p2t.transform(self.mapProjection, self.dataProjection);
			var d = getService("ScenarioManager").locationGenerators.sphereDistanceMeters(p1t, p2t);
			console.log("distance between points is:" + d);
			return d;
		};

		function calcDistanceFromPrevPoint(vertices,i){
			if (i==0){
				return 0; //if its the first point the distance is 0
			}
			return calcDistanceBetweenPoints(vertices[i-1],vertices[i]);
		};

		function initPathVertices(evt){
			verFeatures = []; 
			vertices  = evt.feature.geometry.getVertices();
			var timeFromStart = 0;
			for(var i in vertices){ 
				var f = new OpenLayers.Feature.Vector(vertices[i]);
				f.attributes  = { line: evt.feature.id, index: i };
				f.attributes.distance = calcDistanceFromPrevPoint(vertices,i);
				var deltaT = parseInt(f.attributes.distance / self.DEFAULT_PATH_SPEED_M_PER_S);

				// must have at least 1s between vertices
				if (deltaT == 0 && i > 0) {
					deltaT = 1;
				}
				timeFromStart += deltaT;
				f.attributes.time = timeFromStart;
				if (f.attributes.distance > 0 && deltaT > 0) {
					f.attributes.speed = f.attributes.distance / deltaT;
				}
				verFeatures.push(f);
			}
			self.paths[evt.feature.id] = verFeatures;
			self.pathLines[evt.feature.id] = evt.feature;
			// set style to path
			self.editableLayer.addFeatures(verFeatures);
			
		};
		
		function initWifiCircles(feature) {
			// note that getCentroid() doesn't work in screen space so circles jump around all the time
			var geometry = feature.geometry;
			var vertices = geometry.getVertices();
			var p0 = vertices[0], p1 = vertices[vertices.length/2];
			var x = (p0.x + p1.x) / 2;
			var y = (p0.y + p1.y) / 2;
			var center = new OpenLayers.Geometry.Point(x, y);
			var outerradius = p0.distanceTo(center);
			self.editableLayer.redraw();
			var strengthFeatures = createStrengthCircles(center, outerradius);
			self.strengthCircles[feature.id] = strengthFeatures;
			return strengthFeatures;
		}
		
		function createStrengthCircles(center, outerradius) {
			var strengthFeatures = [];
			// add a circle for "medium" strength
			var mediumgeom = OpenLayers.Geometry.Polygon.createRegularPolygon
			(
					center,
					outerradius * Math.sqrt(self.DEFAULT_MINIMAL_STRENGTH/self.DEFAULT_MEDIUM_STRENGTH),
					40,
					0
			);
			var mediumfeature = new OpenLayers.Feature.Vector(mediumgeom);
			// so we don't save it
			mediumfeature.attributes = {
					internal: true,
					strengthRegion: 'medium'
			};
			strengthFeatures.push(mediumfeature);

			// add a circle for "high" strength
			var highgeom = OpenLayers.Geometry.Polygon.createRegularPolygon
			(
					center,
					outerradius * Math.sqrt(self.DEFAULT_MINIMAL_STRENGTH/self.DEFAULT_HIGH_STRENGTH),
					40,
					0
			);
			var highfeature = new OpenLayers.Feature.Vector(highgeom);
			// so we don't save it
			highfeature.attributes = {
					internal: true,
					strengthRegion: 'high'
			};
			strengthFeatures.push(highfeature);
			return strengthFeatures;
		}
		
		function convertFeaturesToPoints(features){
			var points = [];
			for(var x in features){ 
				points.push(features[x].geometry.clone());
			}
			return points;	
		};

		var SSID = 'SSID';
		var MAC = 1;
		function initWifiFeature(evt){
			evt.feature.attributes = {
					SSID : SSID,
					MAC : MAC++,
					wifi : true
			};
		}
		
		this.initEditorData = function(dataJson) {
			this.clearAllPaths();
			this.wifiStyleIndex = 0 ; // reset color index
			this.editableLayer.removeAllFeatures();
			this.setScenarioToEditor(dataJson);
			
			// set to default state
			dijit.byId("newEditMapModal").set('title', dataJson && dataJson.scenarioName || "Scenario");
			this.controls.line.deactivate();
			this.controls.wifi.deactivate();
			this.controls.polygon.deactivate();
			sim_scenario_editor_go_input.set('value', '');
		};
		
		function parseLonLat(input){
			var values = input.displayedValue.split(',').map(Number); // parse a number like "34.7897 ,  32.4354" to [34.7897, 32.4354]
			return new OpenLayers.LonLat(values[1], values[0]).transform(self.dataProjection,self.mapProjection);;
		}
		
		this.goToLocation = function(){
			var input = dijit.byId("sim_scenario_editor_go_input");
			var lonLat = parseLonLat(input);
			var zoom = this.editorMap.map.olMap.zoom > 18 ? this.editorMap.map.olMap.zoom : 18;
			this.editorMap.map.olMap.setCenter(lonLat,zoom);
		};
		
		this.deleteFeature = function(featureId){
			var f = this.editableLayer.getFeatureById(featureId);
			this.removeFeaturePopup(f);
  			if (f.attributes.wifi) {
  				clearStrengthCircles(f);
  			}
			if (f.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
				this.editableLayer.destroyFeatures([f]);
			}else{
				this.clearAllPaths();
			}
			self.editableLayer.redraw();
		};
		
		/**
		 **************************  Start exporting functions   ********************
		 */		
		
			var DEFAULT_SIGNAL_STRENGTH = '54'; 

			/*=================================== Functions ======================================*/
			/*=============================== Saving Output to File ===============================*/
			
			
			this.getScenarioObject = function(){
				// divide the different feature to groups
				var objects = {
						"scenarioName": self.scenarioName,
						"Paths": self.paths,
						"Wifi": [],
						"noGps": []
				};
				var features = self.editableLayer.features;
				for (var f = 0; f < features.length; f++) {
					var geometry = features[f].geometry;
					if (geometry) {
						if (geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon" &&
								features[f].attributes.wifi) {
							objects["Wifi"].push(features[f]);
						} else if (geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon" &&
								!features[f].attributes.internal){
							objects["noGps"].push(features[f]);
						};
					}
				}
				
				return self.locationSimulationOutput(objects);
			};
	
			this.locationSimulationOutput =  function(objects){
					var outputJson = {
							scenarioName: this.scenarioName
					};
					var objCnt = 0;
					
					for (var obj in objects){
						if (obj=="Paths"){
							var pointCnt = 0;
							var route = [];
							var routeFeatures = [];
							var firstKey;
							for (var key in objects[obj]){
								for (var i in objects[obj][key]){
									routeFeatures.push(objects[obj][key][i]);
									var p = objects[obj][key][i].geometry.clone().transform(self.mapProjection,self.dataProjection);
	//										var p = new OpenLayers.Geometry.Point(v.x, v.y).transform(mapProjection,dataProjection);
									var time =objects[obj][key][i].attributes.time;
									var pJson = { 
											longitude: p.x,
											latitude: p.y,
											timeFromStart: time,
									};
									route.push(pJson);				
									pointCnt++;
								}
								break;
							}
							outputJson.route = self.geojson_format.write(routeFeatures);
							
							// add the route path to the data
							var pathLineFeature = routeFeatures.length ? [self.pathLines[routeFeatures[0].attributes.line]] :[];
							outputJson.pathLine = self.geojson_format.write(pathLineFeature);
							
							
						}else if (obj=="Wifi"){
							var wifiPoints = [];
							var wifiFeatures = [];
							var pointCnt = 0;
							for (var g = 0; g < objects[obj].length; g++){
								var feature = objects[obj][g];
								var geometry = feature.geometry;
								var vertices = geometry.getVertices();
								// note that getCentroid() doesn't work in screen space so circles jump around all the time
								var p0 = vertices[0], p1 = vertices[vertices.length/2];
								var x = (p0.x + p1.x) / 2;
								var y = (p0.y + p1.y) / 2;
								var center = new OpenLayers.Geometry.Point(x, y);
								var distance = p0.distanceTo(center);
								
								// create feature to serialize
								var featureToSerialize = new OpenLayers.Feature.Vector(center);
								featureToSerialize.attributes = {	
					            	  MAC : feature.attributes.MAC,
					            	  SSID : feature.attributes.SSID,
					            	  strength : DEFAULT_SIGNAL_STRENGTH,
					            	  radius : distance,
					            	  connected : false,
					            };
								wifiFeatures.push(featureToSerialize);
								pointCnt++;
								objCnt++; 
							}
							
							outputJson.wifiPoints  = self.geojson_format.write(wifiFeatures);
						}else if (obj=="noGps"){
							outputJson.noGps  = self.geojson_format.write(objects[obj]);
						}
					}
					return outputJson;
			};
			
			/**
			 **************************  End exporting functions   ********************
			 */		
			
			/**
			 **************************  Start importing functions   ********************
			 */		
			
			/**
			 *  zoom the map to contain a set of features
			 */
			this.zoomToFeature = function(features){
				var bounds;
				if(features.length > 0) {
					if(features.constructor != Array) {
						features = [features];
					}
					for(var i=0; i<features.length; ++i) {
						if (!bounds) {
							bounds = features[i].geometry.getBounds();
						} else {
							bounds.extend(features[i].geometry.getBounds());
						}
						
					}
					this.editorMap.map.olMap.zoomToExtent(bounds);
				} else {
					this.editorMap.map.olMap.zoomToMaxExtent();
				}
			};
			
			this.zoomMap = function(){
				// zoom map to feature
				this.zoomToFeature(this.editableLayer.features);
			};
			
			/**
			 *  this function responsible on doing things after the dialog has been opened
			 *  set the bound
			 *  
			 */
			this.afterShowDialog = function(){
				this.zoomMap();
				focusUtil.curNode && focusUtil.curNode.blur();
			};
			
			/**
			 * get a geojeson string and return features
			 */	
			this.getFeaturesFromGeoJson =  function(geojson){
				return this.geojson_format.read(geojson);
			};
			
			/**
			 * add no Gps zone to map
			 */
			this.addNOGpsZone = function(features){
				this.editableLayer.addFeatures(features);
			};
			
			/**
			 *   take the wifi points as feature list and add them to the map
			 */
			this.addWifiToMap = function(wifiPoints){
				var wifiFeatures = [];
				for (var i=0;i<wifiPoints.length;i++){
					var mycircle = OpenLayers.Geometry.Polygon.createRegularPolygon
					(
							wifiPoints[i].geometry.transform(),
							wifiPoints[i].attributes.radius,
							40, // enough for look like a circle
							0
					);
					var featurecircle = new OpenLayers.Feature.Vector(mycircle);
					featurecircle.attributes = wifiPoints[i].attributes;
					featurecircle.attributes.wifi = true;
					wifiFeatures.push(featurecircle);
					var strengthFeatures = initWifiCircles(featurecircle);
					this.editableLayer.addFeatures(strengthFeatures);
				}
				this.editableLayer.addFeatures(wifiFeatures);
			};
						
			/**
			 * create a line from ordered points and add attributes
			 */
			function createLineStringFromPoints(selectedFeatures){
				var points = array.map(selectedFeatures, function(feature){
					return feature.geometry;
				});
				var line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(points));
				return line;
			}
	
			/** 
			 * adding the path for all the points that we added
			 */
			this.addPathToRoutePoints = function(features){
				if (!features || !features.length) return; // don't create a linestring if no vertices!
				var line = createLineStringFromPoints(features);
				line.style = self.style_path;
				this.editableLayer.addFeatures([line]);
				
				// fixing the point and the line to be connected
				features = array.map(features, function(f){
					f.attributes.line = line.id;
					return f;
				});
				self.paths[line.id] = features;
				self.pathLines[line.id] = line;
			};
			
			
			/**
			 *  adding the path to the map
			 */
			this.addRouteToMap = function(features){
				features = array.filter(features, function(feature){
					return feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Point';
				});
				this.editableLayer.addFeatures(features);
				this.addPathToRoutePoints(features);
			};
			
			this.setScenarioName= function(scenarioName){
				this.scenarioName = scenarioName;
				sim_scenario_open_new_editor.set('title', scenarioName);
			};
			
			/**
			 * setScenario responsible to set the map and the scenation player
			 *  @json - json parameter with the scenario info
			 *   
			 */
			this.setScenarioToEditor = function(json){
				
				if (!json) return ;
				
				this.initMapManually =  true;
				
				self.setScenarioName(json.scenarioName);

				if (json.noGps){
					self.addNOGpsZone(self.getFeaturesFromGeoJson(json.noGps));
				}
				if (json.wifiPoints){
					self.addWifiToMap(self.getFeaturesFromGeoJson(json.wifiPoints));
				}
				if (json.route){
					self.addRouteToMap(self.getFeaturesFromGeoJson(json.route));
				}
				
				// zoom map to feature
				this.zoomMap();
				
				this.initMapManually =  false;
			};
			
			
			
			/**
			 **************************  End importing functions   ********************
			 */		
		
		
		this.clearAllPaths= function(){
			for (var key in self.pathLines){
				var features = [self.pathLines[key]];
				features = features.concat(self.paths[key]);
				array.forEach(features,function(f){
					self.removeFeaturePopup(f);
				});
				self.editableLayer.destroyFeatures(features);
				delete self.paths[key];
				delete self.pathLines[key];
			}
		};
		
		function clearStrengthCircles(feature) {
			if (!feature) return;
			var featureId = feature.id;
			if (!self.strengthCircles[featureId]) return;
			var strengthFeatures = self.strengthCircles[featureId];
			self.editableLayer.removeFeatures(strengthFeatures);
			delete self.strengthCircles[featureId];
		};
		
		this.closeDialog = function(){
			if (this.selectedFeature) {
				this.removeFeaturePopup(this.selectedFeature);
			}
			dijit.byId("newEditMapModal").hide();
		};
		
		this.saveScenarioAndClose = function(){
			getService('Scenario').setScenario(this.getScenarioObject());
			getService('Scenario').setDirtyFlag(true); // there could be unsaved chages so updating the scenario flag accordianly 
			this.closeDialog();
		};
		
		this.createToolTipsToPanel = function(){
			// path button 
			this.pathControl = query(".olControlDrawPathFeatureItemInactive")[0];
			new dijit.Tooltip({
				connectId: [this.pathControl],
				position:['before'],
				label: self.path_tooltip,
			});
			// wifi button 
			this.wifiControl = query(".olControlDrawWifiFeatureItemInactive")[0];
			new dijit.Tooltip({
				connectId: [this.wifiControl],
				position:['before'],
				label: self.wifi_tooltip,
			});
			// nogps button 
			this.nogpsControl = query(".olControlDrawNoGpsFeatureItemInactive")[0];
			new dijit.Tooltip({
				connectId: [this.nogpsControl],
				position:['before'],
				label: self.no_gps_tooltip,
			});
		};
		
		function setWidgetAttr(widgetId, attr, value) {
			var widget = dijit.byId(widgetId);
			if (widget) {
				widget.set(attr, value);
			} else {
				var node = dojo.byId(widgetId);
				if (node) {
					node[attr] = value;
					node.setAttribute(attr, value);
				}
			}
		}
		
		
		//initialize
		{
			// NLS strings
			var n = _pg_sim_nls;
			
			setWidgetAttr("sim_scenario_editor_go_input", "placeHolder", n.sim_scenario_editor_go_input_placeholder);
			setWidgetAttr("sim_scenario_editor_go_button", "label", n.sim_scenario_go);
			setWidgetAttr("sim_scenario_editor_cancel_button", "label", n.sim_scenario_cancel);
			setWidgetAttr("sim_scenario_editor_close_button", "label", n.sim_scenario_apply);
			
			self.no_gps_zone_title = n.sim_scenario_editor_no_gps_zone_title;
			self.access_point_title = n.sim_scenario_editor_access_point_title;
			self.route_point_title = n.sim_scenario_editor_route_point_title;
			self.path_tooltip = n.sim_scenario_editor_path_tooltip;
			self.wifi_tooltip = n.sim_scenario_editor_wifi_tooltip;
			self.no_gps_tooltip = n.sim_scenario_editor_no_gps_tooltip;
			
			self.fieldLabels = {
					'speed' : n.sim_scenario_editor_speed_label,
					'time' : n.sim_scenario_editor_time_label
			};
			self.DELETE_LABEL = n.sim_scenario_delete;
			self.DELETE_PATH_LABEL = n.sim_scenario_delete_path;
			
			var onPressGo = function(event) {
				if (event.keyCode == keys.ENTER) {
					self.goToLocation();
				}
			};

			// initialize buttons 
			if (typeof sim_scenario_editor_go_input != "undefined") {
				connect.connect(sim_scenario_editor_go_input, "onKeyPress", null, onPressGo);
			} else {
				connect.connect(dojo.byId("sim_scenario_editor_go_input"), "onkeypress", null, onPressGo);		
			}
			connect.connect(dojo.byId("sim_scenario_editor_go_button"), "onclick", this, "goToLocation");
			connect.connect(dojo.byId("sim_scenario_editor_cancel_button"), "onclick", this, "closeDialog");
			connect.connect(dojo.byId("sim_scenario_editor_close_button"), "onclick", this, "saveScenarioAndClose");
			
			if (window.mbsOpenLayersAvailable == true) {
				
				this.editorMap = new dojox.geo.openlayers.widget.Map({
					id : "scenarioEditorMapId"
				}, 'scenarioEditorMap');
				var height = Math.min(520, 0.6*dojo.body().offsetHeight);
				domStyle.set(this.editorMap.domNode, {
					width : 100 + "%",
					height : height + "px"
				});
				domStyle.set(dojo.byId("editorDialogContainer"), {
					height : (height+80) + "px"
				});
				this.editorMap.startup();
				
				var scenarioStyle = new ScenarioStyle();
				var styleMap = scenarioStyle.createStyleMap();
			
				// add wifi layer
				this.editableLayer = new OpenLayers.Layer.Vector("editable_layer",{
					rendererOptions: { zIndexing: true }, 
					eventListeners:{
						featureadded: function(evt) {
							if (self.initMapManually) return ;
							if (evt.feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.LineString' && !evt.feature.redrawF){
								self.clearAllPaths();
								initPathVertices(evt);
								self.controls.line.deactivate();
							}else if(evt.feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon' &&
									self.controls.wifi.active /* check the current control is wifi*/){
								initWifiFeature(evt);
								var strengthFeatures = initWifiCircles(evt.feature);
								self.controls.wifi.deactivate();
								self.editableLayer.addFeatures(strengthFeatures);									
							}else if (evt.feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Polygon' ){
								evt.feature.style = self.nogps_style;
								self.controls.polygon.deactivate();
							}
							self.editableLayer.redraw();
						},
		            	beforefeatureselected: function(evt) {
	          				onFeatureSelect(evt.feature);
	          			},
	          			featureunselected: function(evt) {
	          				onFeatureUnselect(evt.feature);
	          			},
	          			beforefeatureremoved: function(evt) {
	          				if (self.controls.modify.feature === evt.feature) {
	          					self.controls.modify.unselectFeature(evt.feature);
	          				}
	          			}
					},
					styleMap: styleMap
				});
				
				this.controls = {
				      line: new OpenLayers.Control.DrawFeature(this.editableLayer,
					      OpenLayers.Handler.Path, {displayClass : "olControlDrawPathFeature"}),
					  wifi: new OpenLayers.Control.DrawFeature(this.editableLayer,
			                  OpenLayers.Handler.RegularPolygon,
			                  {handlerOptions: {sides: 30},  displayClass: "olControlDrawWifiFeature"}),
			          polygon: new OpenLayers.Control.DrawFeature(this.editableLayer,
			        		  OpenLayers.Handler.Polygon , {displayClass: "olControlDrawNoGpsFeature"}),
			          modify: new OpenLayers.Control.ModifyFeature(this.editableLayer,{
			              		mode:  OpenLayers.Control.ModifyFeature.DRAG | OpenLayers.Control.ModifyFeature.RESIZE | OpenLayers.Control.ModifyFeature.ROTATE,
			              		createVertices :true,
			              		dragStart: function(feature, pixel) {
			              			// 'this' points to the ModifyFeature instance. 'this.feature' points to the feature being modified
			              			if (this.feature.attributes.wifi) {
			              				clearStrengthCircles(this.feature);
			              			}
			              		},
			              		dragComplete: function(vertex) {
			              			OpenLayers.Control.ModifyFeature.prototype.dragComplete.call(this, vertex);
			              			// 'this' points to the ModifyFeature instance. 'this.feature' points to the feature being modified
			              			if (this.feature.attributes.wifi) {
			              				//clearStrengthCircles(this.feature);
			              				var strengthFeatures = initWifiCircles(this.feature);
			              				self.editableLayer.addFeatures(strengthFeatures);
			              			}
									self.editableLayer.redraw();
			              		},
			              		vertexRenderIntent: 'modify'
			              	})
				};

	            var panel = new OpenLayers.Control.Panel({defaultControl: nav});
	            panel.addControls([
	                this.controls['line'],
	                this.controls['wifi'],
	                this.controls['polygon']
	            ]);
	            
	            this.editorMap.map.olMap.addLayer(this.editableLayer);
	            // adding control panel to map - 6 control
	            this.editorMap.map.olMap.addControl(panel);
	            // add navigation and attributes popup to map
				var nav = new OpenLayers.Control.Navigation({});
	            this.editorMap.map.olMap.addControl(nav);
				var mouspos = new OpenLayers.Control.MousePosition({
				    /**
				     * Method: formatOutput
				     * Copied from OpenLayers.Control.MousePosition, switched lat & lon
				     *
				     * Parameters:
				     * lonLat - {<OpenLayers.LonLat>} Location to display
				     */
				    formatOutput: function(lonLat) {
				        var digits = parseInt(this.numDigits);
				        var newHtml =
				            this.prefix +
				            lonLat.lat.toFixed(digits) +
				            this.separator + 
				            lonLat.lon.toFixed(digits) +
				            this.suffix;
				        return newHtml;
				    },
		        	prefix: 'UTM ',
		        	numDigits: 7,
	    	    	displayProjection: "EPSG:4326"
		    	});
	            this.editorMap.map.olMap.addControl(mouspos);
	            this.editorMap.map.olMap.addControl(this.controls.modify);

	            nav.activate();
	            this.controls.modify.activate();          		
	            
	            // pan/zoom control
	            this.editorMap.map.olMap.addControl(new OpenLayers.Control.PanZoomBar());
	            
	            // create the tooltip for the controller in the panel
	            this.createToolTipsToPanel();
				
				// initiating the path and pathlines for sync between the linestring of the path and the points creating the the linestring
				this.paths = {};
				this.pathLines = {};
				
				// initiate the wifi circles
				this.strengthCircles = {};
				
			
			}
			
		}
		
		
		
	});

});


