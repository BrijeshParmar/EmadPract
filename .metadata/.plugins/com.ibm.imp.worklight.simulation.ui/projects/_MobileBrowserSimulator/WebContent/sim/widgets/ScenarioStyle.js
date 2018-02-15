/**
 * Common styling for OpenLayers features in the Scenario and Scenario Editor services
 */
define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare"], function(dojo, lang, declare) {
	if (typeof OpenLayers === "undefined") {
		throw "widgets.ScenarioStyle: Missing OpenLayers!";
	}
	return declare("widgets.ScenarioStyle", null, {
		/**
		 * Style setup for items on the map
		 * 
		 * There are 2 "render intents": default and select.
		 * Each intent (default, select) has a corresponding OpenLayers.Style object

		 * Each Style object has a set of Rules. These allow different styles to be used
		 * for the different feature & geometry types: wifi, noGps, path and path vertex.
		 * 
		 * Rules each have a filter and symbolizer. The filter determines on which Features
		 * to apply the symbolizer. The symbolizer contains the style details.
		 * 
		 */
		createStyleMap: function() {
			// make sure the Rules use the whole feature. Default context is just the feature attributes.
			var getContext = function(feature) {
				return feature;
			};
			var wifiFilter = new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.attributes && !!feature.attributes.wifi;					
				}
			});
			var mediumWifiFilter = new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.attributes && feature.attributes.strengthRegion === 'medium';					
				}
			});
			var highWifiFilter = new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.attributes && feature.attributes.strengthRegion === 'high';					
				}
			});
			var noGpsFilter =  new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.geometry && feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"
							&& !feature.attributes.wifi && !feature.attributes.internal;					
				}
			});
			var pathFilter =  new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.geometry && feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString";
				}
			});
			var pathVertexFilter =  new OpenLayers.Filter.Function({
				evaluate: function(feature) {
					return feature.geometry && feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point";
				}
			});
			var pathVertexDefaultSymbolizer = {
					strokeColor: "#c83737",
					strokeOpacity: 1,
	        		strokeLinecap : "square",
	        		strokeWidth: 3,
	        		fillColor: "#c83737",
	        		fillOpacity: 1,
	        		graphicZIndex: 1001,
	        		pointRadius: 4
			};
			var pathVertexSelectSymbolizer = {
					strokeColor: "#c83737",
					strokeOpacity: 1,
	        		strokeLinecap : "square",
	        		strokeWidth: 5,
	        		fillColor: "#c83737",
	        		fillOpacity: 1,
	        		graphicZIndex: 1001,
	        		pointRadius: 7
			};
			var pathDefaultSymbolizer = {
					strokeColor: "#c83737",
					strokeOpacity: 0.7,
	        		strokeLinecap : "square",
	        		strokeWidth: 6,
	        		graphicZIndex: 1000,
	        		pointerEvents: "visiblePainted"
			};
			var pathSelectSymbolizer = {
					strokeColor: "#c83737",
					strokeOpacity: 1,
	        		strokeLinecap : "square",
	        		strokeWidth: 8,
	        		graphicZIndex: 1000,
	        		pointerEvents:"visiblePainted"
			};
			var wifiDefaultSymbolizer = {
					strokeOpacity: 0.8,
					strokeColor: "#a5a5a5",
	        		strokeWidth: 2,
					fillColor: "#ffffff",
					fillOpacity: 0.7,
					graphicZIndex: 15
			};
			var wifiSelectSymbolizer = {
					strokeOpacity: 1,
					strokeColor: "#a5a5a5",
	        		strokeWidth: 5,
					fillColor: "#ffffff",
					fillOpacity: 0.7,
					graphicZIndex: 15
			};
			var mediumWifiDefaultSymbolizer = {
					fillOpacity: 0.0,
					fillColor: "#ffffff",
					strokeWidth: 2,
					strokeOpacity: 0.8,
					strokeColor: "#ffdd55",
					pointerEvents: 'none',
					graphicZIndex: 16
			};
			var mediumWifiSelectSymbolizer = {
					fillOpacity: 0.0,
					fillColor: "#ffffff",
					strokeWidth: 2,
					strokeOpacity: 0.8,
					strokeColor: "#ffdd55",
					pointerEvents: 'none',
					graphicZIndex: 16
			};
			var highWifiDefaultSymbolizer = {
					fillOpacity: 0.4,
					fillColor: "#ffffff",
					strokeWidth: 2,
					strokeOpacity: 0.8,
					strokeColor: "#ff7f2a",
					pointerEvents: 'none',
					graphicZIndex: 16
			};
			var highWifiSelectSymbolizer = {
					fillOpacity: 0.4,
					fillColor: "#ffffff",
					strokeWidth: 2,
					strokeOpacity: 0.8,
					strokeColor: "#ff7f2a",
					pointerEvents: 'none',
					graphicZIndex: 16					
			};
			var noGpsDefaultSymbolizer = {
	        		strokeOpacity: 0.5,
	        		strokeColor: "#374548",
	        		strokeWidth: 1,
	        		fillColor : "#6f8a91",
	        		fillOpacity : 0.6,
	        		graphicZIndex : 10
			};
			var noGpsSelectSymbolizer = {
	        		strokeOpacity: 1,
	        		strokeColor: "#374548",
	        		strokeWidth: 3,
	        		fillColor : "#6f8a91",
	        		fillOpacity : 0.6,
	        		graphicZIndex : 10
			};
            var modifySymbolizer = {
      			strokeColor: "#0088aa",
      			strokeWidth: 2,
      			strokeOpacity: 1,
      			fillColor: "#0088aa",
      			fillOpacity: 0.7,
      			pointRadius: 12
      		};

			
			var pathVertexDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: pathVertexFilter,
				symbolizer: pathVertexDefaultSymbolizer
			});
			var pathVertexSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: pathVertexFilter,
				symbolizer: pathVertexSelectSymbolizer
			});
			var pathDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: pathFilter,
				symbolizer: pathDefaultSymbolizer
			});
			var pathSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: pathFilter,
				symbolizer: pathSelectSymbolizer
			});
			var wifiDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: wifiFilter,
				symbolizer: wifiDefaultSymbolizer
			});
			var wifiSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: wifiFilter,
				symbolizer: wifiSelectSymbolizer
			});
			var mediumWifiDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: mediumWifiFilter,
				symbolizer: mediumWifiDefaultSymbolizer
			});
			var mediumWifiSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: mediumWifiFilter,
				symbolizer: mediumWifiSelectSymbolizer
			});
			var highWifiDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: highWifiFilter,
				symbolizer: highWifiDefaultSymbolizer
			});
			var highWifiSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: highWifiFilter,
				symbolizer: highWifiSelectSymbolizer
			});
			var noGpsDefaultRule = new OpenLayers.Rule({
				context: getContext,
				filter: noGpsFilter,
				symbolizer: noGpsDefaultSymbolizer
			});
			var noGpsSelectRule = new OpenLayers.Rule({
				context: getContext,
				filter: noGpsFilter,
				symbolizer: noGpsSelectSymbolizer
			});
			
			var defaultStyle = new OpenLayers.Style();
			// order of rules is important - they are evaluated in order until a match then stop
			defaultStyle.addRules([pathDefaultRule, pathVertexDefaultRule, mediumWifiDefaultRule, highWifiDefaultRule, wifiDefaultRule, noGpsDefaultRule]);

			var selectStyle = new OpenLayers.Style();
			// order of rules is important - they are evaluated in order until a match then stop
			selectStyle.addRules([pathSelectRule, pathVertexSelectRule, mediumWifiSelectRule, highWifiSelectRule, wifiSelectRule, noGpsSelectRule]);

			return new OpenLayers.StyleMap({'default': defaultStyle, 'select': selectStyle, 'modify': modifySymbolizer});			
		}
	});
});