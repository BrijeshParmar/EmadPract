require(["dojo/dom",
         "dojo/dom-style",
         "dojo/_base/connect",
         "dojo/query",
         "dojo/_base/array",
         "dojo/has",
         "dijit/focus",
         "widgets/ScenarioStyle"
         ], function(dom, domStyle, connect, query, array, has, focusUtil, ScenarioStyle){
	addService("Scenario", function(){
		var self = this;
		this.dataProjection = new OpenLayers.Projection("EPSG:4326");
		this.mapProjection = new OpenLayers.Projection("EPSG:900913");
		this.map = null;
		this.unsavedChanges = false;
		this.continueFunction = function(){};
		this.playing = false;

		
		// strengths used as triggers and wifi radii
		this.DEFAULT_MINIMAL_STRENGTH = 15;
		this.DEFAULT_MEDIUM_STRENGTH = 50;
		this.DEFAULT_HIGH_STRENGTH = 80;
		
		this.DEFAULT_FILE_NAME = 'scenario';
		this.DEFAULT_FILE_EXT = '.scenario';

		//scenario data
		this.scenarioJson = {};
		
		this.DEFAULT_TIME_INTERVAL = 1000;
		this.emptyScenario = {
				wifiPoints : "{\"type\":\"FeatureCollection\",\"features\":[]}",
				pathLine : "{\"type\":\"FeatureCollection\",\"features\":[]}",
				route : "{\"type\":\"FeatureCollection\",\"features\":[]}",
				noGps : "{\"type\":\"FeatureCollection\",\"features\":[]}"
		};
		
		
		/*
         * noGps zne style
         * grey style 
         */
//        this.nogps_style = {
//        		strokeOpacity: 0,
//        		fillColor : "#F02E2E",
//        		fillOpacity : 0.6,
//        		graphicZIndex : 10,
//        };
//		
//        
//        this.wifiStyleIndex = 0;
//        this.wifiColorStyleNumber = 6;
        /*
		 * wifi style
         * yellow style 
         */
//		this.wifi_styles = [
//		                    { strokeOpacity: 0, fillColor: "#ec008c", fillOpacity : 0.7 , graphicZIndex : 15, },
//		                    { strokeOpacity: 0, fillColor: "#00aeef", fillOpacity : 0.7, graphicZIndex : 15, },
//		                    { strokeOpacity: 0, fillColor: "#8dc63f", fillOpacity : 0.7, graphicZIndex : 15, },
//		                    { strokeOpacity: 0, fillColor: "#ffd400", fillOpacity : 0.7, graphicZIndex : 15, },
//		                    { strokeOpacity: 0, fillColor: "#662d91", fillOpacity : 0.7, graphicZIndex : 15, },
//		                    { strokeOpacity: 0, fillColor: "#f26522", fillOpacity : 0.7, graphicZIndex : 15, }
//		                    ]; 
        
        /*
         * path style
         * Green style 
         */
//        this.style_path = {
//        		strokeLinecap : "square",
//        		strokeColor: "#00FF00",
//        		strokeWidth: 3,
//        		fillColor: "#00FF00",
//        		fillOpacity : 1,
//        		graphicZIndex : 1000,
//        		pointRadius: 7,
//        		pointerEvents: "visiblePainted",
//        };
		
//        this.getWifiStyleIndex = function(){
//        	this.wifiStyleIndex +=1;
//        	return this.wifiStyleIndex%this.wifiColorStyleNumber;
//        };
//        
//        /**
//         * get the style of the wifi (cyclic)
//         */
//		this.getWifiStyle = function(){
//			return this.wifi_styles[this.getWifiStyleIndex()];
//		};
        
        
		/**
		 *  zoom the map to contain a set of features
		 */
		this.zoomToFeature = function(features){
			var bounds;
			if(features.length) {
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
				this.map.map.olMap.zoomToExtent(bounds);
			}
		};
		
		/**
		 *   take the wifi points as feature list and add them to the map
		 */
		this.addWifiToMap = function(wifiPoints){
			//add wifi circle on the map
			var wifiFeatures = [];
			var strengthFeatures = [];
			for (var i=0;i<wifiPoints.length;i++){
				var mycircle = OpenLayers.Geometry.Polygon.createRegularPolygon
				(
						wifiPoints[i].geometry.transform(),
						wifiPoints[i].attributes.radius,
						40,
						0
				);
				var featurecircle = new OpenLayers.Feature.Vector(mycircle);
				featurecircle.attributes = wifiPoints[i].attributes;
				featurecircle.attributes.wifi = true;
				wifiFeatures.push(featurecircle);
				
				// add a circle for "medium" strength
				var mediumgeom = OpenLayers.Geometry.Polygon.createRegularPolygon
				(
						wifiPoints[i].geometry.transform(),
						wifiPoints[i].attributes.radius * Math.sqrt(self.DEFAULT_MINIMAL_STRENGTH/self.DEFAULT_MEDIUM_STRENGTH),
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
						wifiPoints[i].geometry.transform(),
						wifiPoints[i].attributes.radius * Math.sqrt(self.DEFAULT_MINIMAL_STRENGTH/self.DEFAULT_HIGH_STRENGTH),
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
			}
			this.vectorLayer.removeAllFeatures();
			this.vectorLayer.addFeatures(wifiFeatures);
			this.vectorLayer.addFeatures(strengthFeatures);
			this.zoomToFeature(this.vectorLayer.features);
		};
		
		/**
		 * add to path to map. 
		 * There is a hidden assumption of only 1 path
		 */
		this.addPathToMap = function(pathFeatures){
			this.vectorLayer.addFeatures(pathFeatures);
			this.zoomToFeature(this.vectorLayer.features);
		};
		
		/**
		 * add no Gps zone to map
		 */
		this.addNOGpsZone = function(features){
			this.vectorLayer.addFeatures(features);
			this.zoomToFeature(this.vectorLayer.features);
		};
		
		// format object to convert from geojson to feature
		this.geojson_format = new OpenLayers.Format.GeoJSON({
	        'internalProjection': this.mapProjection,
	        'externalProjection': this.dataProjection,
	    });
		
		// get a geojeson string and return features
		this.getFeaturesFromGeoJson =  function(geojson){
			return this.geojson_format.read(geojson);
		};
		
		/**
		 *  set the scenario inforamation to local store
		 * 	@obj - the scenario object to store
		 *  
		 */
		this.setScenarioToLocalStore = function(scenarioJson){
			self.scenarioJson = scenarioJson;
			if(typeof(Storage)!=="undefined"){
				localStorage.scenario = JSON.stringify(scenarioJson);
			}
		};
		
		/**
		 *  get scenario info from the datastore
		 * 	if not available so return emptyScenario 
		 *
		 */
		this.getScenarioFromLocalStore = function(){
			if(typeof(Storage)!=="undefined"){
				if (localStorage.scenario){
					try {
						return JSON.parse(localStorage.scenario);
					  } catch(e) {
						return self.emptyScenario ;
					  }
				}
			}
			return  self.emptyScenario;
		};
		
		/**
		 * setScenario responsible to set the map and the scenario player
		 *  @json - json parameter with the scenario info
		 *   
		 */
		this.setScenario = function(json){
			if (!json) return ;
			sim_scenario_name_textbox.set('value', json.scenarioName);
			self.addWifiToMap(self.getFeaturesFromGeoJson(json.wifiPoints));
			self.addPathToMap(self.getFeaturesFromGeoJson(json.pathLine));
			var noGpsZones = self.getFeaturesFromGeoJson(json.noGps);
			self.addNOGpsZone(noGpsZones);
			var route = self.getFeaturesFromGeoJson(json.route);
			// set the wifi point in the scenario manger
			var wifiPoints = [];
			array.map(self.getFeaturesFromGeoJson(json.wifiPoints),function(point){
				point.geometry.transform(self.mapProjection,self.dataProjection);
				var res = point.attributes;
				dojo.mixin(res, {   longitude:point.geometry.x, latitude:point.geometry.y, visible:true });
				return wifiPoints.push(res);
			});
			getService('ScenarioManager').controller.initialize({route : route,
																 noGpsZones : noGpsZones,
																 wifiPoints  : wifiPoints,
																 timeInterval : self.DEFAULT_TIME_INTERVAL});
			self.setScenarioToLocalStore(json);
		};
		
		/**
		 *  the function is responsible to load the scenario info from a text file (json)
		 *  
		 *  
		 */
		this.loadFileAsText =  function(inputId)
		{
			var id = inputId ? inputId : "scenario_import_button";
			var fileToLoad = document.getElementById(id).files[0];
			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent) 
			{
				var textFromFileLoaded = fileLoadedEvent.target.result;
				var scenarioJson = JSON.parse(textFromFileLoaded );
				
				// set the new scenarion 
				self.setScenario(scenarioJson);
				
				
			};
			fileReader.readAsText(fileToLoad, "UTF-8");
		};

		this.hideWarningDialog = function(){
			dijit.byId("scenarioWarningDialog").hide();
		};
		
		this.setDirtyFlag = function(isDirty) {
			this.unsavedChanges = isDirty;
			sim_scenario_save_button.attr("disabled", !this.unsavedChanges);
//			var unsavedMarker = dojo.byId("sim_scenario_unsaved_marker");
//			dojo.removeClass(unsavedMarker, isDirty?'scenarioSaved':'scenarioUnsaved');
//			dojo.addClass(unsavedMarker, isDirty?'scenarioUnsaved':'scenarioSaved');
		};
				
		this.checkUnsavedChanges = function(successFunc){
			if (this.unsavedChanges){
				// set the continue function to be triggered if the user click continue
				this.continueFunction = function(){
											self.hideWarningDialog();
											successFunc();
				};
				dijit.byId("scenarioWarningDialog").show();
			}else{
				successFunc();
			}
		};
		
		this.loadScenario = function(e){
			var loadfunc = this.loadFileAsText;
			this.checkUnsavedChanges(loadfunc);
		};
		
		this.clickPlayStop = function(){
			this.playing = !this.playing;
			if (this.playing){
				getService('ScenarioManager').controller.continueTrack();
				this.switchToPlayMode();
			}else{
				getService('ScenarioManager').controller.stop();
				this.switchToPauseMode();
			}
		};
		
		/**
		 *  disable all life cycle capabilities while playing
		 */
		this.disableButtonsWhilePlay = function(){
			sim_scenario_save_button.attr("disabled", true);
			sim_scenario_edit_button.attr("disabled", true);
			sim_scenario_new_button.attr("disabled", true);
			// disable the special input file 
			sim_scenario_import_button.attr("disabled", true);
			dojo.byId('scenario_import_button').disabled = true;
			dojo.query('#scenario_import_button_wrapper').addClass('dijitDisabled').addClass('dijitButtonDisabled');
		};
		/**
		 *  enable all life cycle capabilities while pausing
		 */
		this.enableButtonsWhilePause = function(){
			sim_scenario_save_button.attr("disabled", !this.unsavedChanges);
			sim_scenario_edit_button.attr("disabled", false);
			sim_scenario_new_button.attr("disabled", false);
			// enable the special input file 
			sim_scenario_import_button.attr("disabled", false);
			dojo.byId('scenario_import_button').disabled = false;
			dojo.query('#scenario_import_button_wrapper').removeClass('dijitDisabled').removeClass('dijitButtonDisabled');
		};
		
		/**
		 * switch player to play mode
		 * 
		 * change button label
		 * disable relevant buttons
		 * change flag
		 */
		this.switchToPlayMode =function(){
			this.playing = true;
			sim_scenario_play_button.set("label", this.pauseLabel);
			this.disableButtonsWhilePlay();
		};

		/**
		 * switch player to Pause mode
		 * 
		 * change button label
		 * Enable relevant buttons
		 * change flag
		 */
		this.switchToPauseMode =function(){
			this.playing = false;
			sim_scenario_play_button.set("label", this.playLabel);
			this.enableButtonsWhilePause();
		};
		
		this.restart = function(e){
			getService('ScenarioManager').controller.start();
			this.switchToPlayMode();
		};
		
		this.updateLocation = function(location, accessPoints){
			for ( var i in this.markersLayer.markers){
				this.markersLayer.removeMarker(this.markersLayer.markers[i]);
			}
			var lonLat = new OpenLayers.LonLat(location.coords.longitude ,
					location.coords.latitude).transform(self.dataProjection,self.mapProjection);
			var size = new OpenLayers.Size(24,24);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			var icon = new OpenLayers.Icon('images/marker24.png', size, offset);
			this.markersLayer.addMarker(new OpenLayers.Marker(lonLat, icon));
		};
		
		
		this.openEditor = function(scenarioJson){
			scenarioJson = scenarioJson || { scenarioName: this.sim_scenario_name_textbox.get('value') };
			// init the editor 
			getService('ScenarioEditor').initEditorData(scenarioJson);
			//open the editor
			self.editorDialog.show();
			
		};	
		
		this.createNewScenario = function(){
			this.checkUnsavedChanges(this.openEditor);
		};
		
		this.editScenario = function(){
			this.openEditor(this.scenarioJson);
		};
		
		this.saveScenario = function(){
			var output = JSON.stringify(this.scenarioJson);
			this.saveTextAsFile(output);
		};
		

		function destroyClickedElement(event)
		{
			document.body.removeChild(event.target);
		}
		
		this.saveTextAsFile = function(textToWrite)	{
			var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
			var fileNameToSaveAs = this.scenarioJson.scenarioName ? this.scenarioJson.scenarioName + this.DEFAULT_FILE_EXT : this.DEFAULT_FILE_NAME  + this.DEFAULT_FILE_EXT;
		
			var existing = document.getElementById("hiddenExportScenario");
			if (existing) {
				existing.parentNode.removeChild(existing);
			}
			
			var downloadLink = document.createElement("a");
			downloadLink.setAttribute("id", "hiddenExportScenario");
			downloadLink.download = fileNameToSaveAs;
			
			downloadLink.innerHTML = "Download File";
			if (window.webkitURL != null)
			{
				// Chrome allows the link to be clicked programmatically.
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
				downloadLink.click();
			}
			else
			{
				// Firefox requires the user to actually click the link.
				downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				downloadLink.onclick = destroyClickedElement;
				document.body.appendChild(downloadLink);
				// this seems to work (as long as the above appendChild is there)
				if (downloadLink.click) {
					downloadLink.click();
				}
			}
			
			// assuming the user saved the file the flag of unsaved changes should be off
			this.setDirtyFlag(false);
		};


		

		// Initialization
		{
			var scenarioMapDiv = 'scenarioMapDiv';
			var scenarioEditMapDiv = 'scenarioEditMapDiv';
			
			// NLS strings
			var n = _pg_sim_nls;

			var hasIE = has("ie");
			if (typeof hasIE !== "undefined") {
				dojo.byId("scenario_widget").innerHTML = n.sim_scenario_usingIEgeolocation;
				return;
			}
			
			dojo.byId("sim_scenario_name_label").innerText = n.sim_scenario_editor_name;
			sim_scenario_new_button.set('label', n.sim_scenario_new);
			sim_scenario_save_button.set('label', n.sim_scenario_export);
			sim_scenario_play_button.set('label', n.sim_scenario_play);
			sim_scenario_restart_button.set('label', n.sim_scenario_restart);
			sim_scenario_unsaved_continue_button.set('label', n.sim_scenario_continue);
			sim_scenario_unsaved_cancel_button.set('label', n.sim_scenario_cancel);
			sim_scenario_edit_button.set('label', n.sim_scenario_edit);
			sim_scenario_name_textbox.set('placeHolder', n.sim_scenario_editor_name_textbox_placeholder);
			sim_scenario_name_textbox.set('promptMessage', n.sim_scenario_editor_name_textbox_promptMessage);
			sim_scenario_unsaved_dialog.set('title', n.sim_scenario_warning);
			dojo.byId("sim_scenario_unsaved_text").innerHTML = n.sim_scenario_unsaved_text;
			this.pauseLabel = n.sim_scenario_pause;
			this.playLabel = n.sim_scenario_play;

			
			//connect the onchange of the load button 
			// When onglobalevent executes, watcher.handler is invoked:
			
			this.editorDialog = dijit.byId("newEditMapModal");
			this.scenarioTitlePane = dijit.byId("_cordova_sim_scenario");
			
			// zoom to the map feature after the pane in open and the map div as available
			this.scenarioTitlePane.watch("open", function(attr, oldVal, newVal){
					self.zoomToFeature(self.vectorLayer.features);
			});
			
			dojo.connect(this.editorDialog, "onShow", null, function(e) {
				setTimeout(function(){
					getService('ScenarioEditor').afterShowDialog();
				},1000);
			});
			
			dojo.connect(sim_scenario_name_textbox, "onChange", this, function(value) {
				if (this.scenarioJson.scenarioName != value) {
					this.scenarioJson.scenarioName = value;
					this.setDirtyFlag(true);
				}
			});
			
			
			var loadButton = query("#scenario_import_button")[0]; //only one elemet with that id
			connect.connect(loadButton, "onchange", this, "loadScenario");
			
			// connect the new button to the event
			connect.connect(dojo.byId('createNewScenarioButton'), "onclick", this, "createNewScenario");
			// connect the edit button to the event
			connect.connect(dojo.byId('scenarioEditButton'), "onclick", this, "editScenario");
			// connect the save button to the event
			connect.connect(dojo.byId('scenarioSaveButton'), "onclick", this, "saveScenario");
			// connect the play button to the event
			connect.connect(dojo.byId('scenarioPlayButton'), "onclick", this, "clickPlayStop");
			// connect the restart button to the event
			connect.connect(dojo.byId('scenarioRestartButton'), "onclick", this, "restart");
			
			if (window.mbsOpenLayersAvailable == true) {
				this.map = new dojox.geo.openlayers.widget.Map({
					id : "scenarioMap"
				}, scenarioMapDiv);
				domStyle.set(this.map.domNode, {
					width : 100 + "%",
					height : 300 + "px"
				});
				this.map.startup();
				
				this.markersLayer = new OpenLayers.Layer.Markers( "Markers" );
				this.map.map.olMap.addLayer(this.markersLayer);
				
				// add wifi and path layer
				var scenarioStyle = new ScenarioStyle();
				var styleMap = scenarioStyle.createStyleMap();
				this.vectorLayer = new OpenLayers.Layer.Vector("scenario_features", {rendererOptions: { zIndexing: true }, styleMap: styleMap});
				this.map.map.olMap.addLayer(this.vectorLayer);
				
				//set layer indexes
				this.map.map.olMap.setLayerIndex(this.vectorLayer, 10);
				this.map.map.olMap.setLayerIndex(this.markersLayer, 99);
			}
			
			//set the scenario from local store (after all plugins are initialized)
			self.scenarioJson = this.getScenarioFromLocalStore();
			var setScenario = function() {
				self.setScenario(self.scenarioJson);
			};
			setTimeout(setScenario, 100);
			
			this.setDirtyFlag(false);
		}
	});
	
});
