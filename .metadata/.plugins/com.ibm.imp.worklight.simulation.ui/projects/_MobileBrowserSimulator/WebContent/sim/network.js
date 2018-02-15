dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
require(['dojo/parser']);
require(["dojo/store/Observable"]);
require(["dojo/dom",
         "dijit/Dialog",
         "dojo/store/Memory",
         "dojo/store/Observable",
         "dojo/Stateful",
         "dojo/query",
         "dojo/dom-construct",
         "widgets/Wifi"
         ], function(dom,Dialog, Memory,Observable,Stateful,Query,domConstruct, Wifi
        		 ){
	addService("Network Status", function(){

		var self = this;
		
		this.TYPE_UNKNOWN = "unknown";
		this.TYPE_ETHERNET = "ethernet";
		this.TYPE_WIFI = "wifi";
		this.TYPE_2G = "2g";
		this.TYPE_3G = "3g";
		this.TYPE_4G = "4g";
		this.TYPE_CELL = "cellular";
		this.TYPE_NONE = "none";
		
		
		var currentState = "offline";
		var callbacks = new Array();

		// Get network selected in UI
		var getNetwork = function(){
			var el = dijit.byId("network_type_select");
			var value = el.getValue();
			if (value == self.TYPE_NONE) {
				currentState = "offline";
			} else {
				currentState = "online";
			}
			return value;
		};

		// Public
		// Called by UI to send change in network status to device
		this.onChange = function(value){
			for ( var i = 0; i < callbacks.length; i++) {
				sendResult(new PluginResult(callbacks[i], PluginResultStatus.OK, value, true));
			}
			self.disconnectWifiIfConnectionIsNotWifi();
		};

		this.disconnectWifiIfConnectionIsNotWifi = function(){
			var select = dijit.byId('network_type_select');
			if (select.getValue() != self.TYPE_WIFI ){
				getService('WifiPlugin').unconnectAllWifi();
			}
		};
		
		this.onSelect = function(sel) {
		    var value = sel.options[sel.selectedIndex].value;  
		};
		// Public
		// Handle requests
		this.exec = function(action, args, callbackId){
			if (action == 'getConnectionInfo') {
				callbacks.push(callbackId);
				var r = getNetwork();
				return new PluginResult(callbackId, PluginResultStatus.OK, r, true); // keep
																						// callback
			}
			return new PluginResult(callbackId, PluginResultStatus.INVALID_ACTION);
		};
		
		this.setNetworkToWifi = function(){
			var select = dijit.byId('network_type_select');
			if (select.getValue() != self.TYPE_WIFI ){
				select.setValue(self.TYPE_WIFI);
			}
		};
		
		// Initialization
		{
			var n = _pg_sim_nls;
			wifi_dialog.set("title",  n.sim_scenario_editor_access_point_editor_title);
			new dijit.form.Select({
			    name: 'select2',
			    id : "network_type_select",
			    onChange : self.onChange,
			    style : 'width: 160px',
			    options: [
			      { label: n.sim_network_none, value: this.TYPE_NONE },
			      { label:  n.sim_network_ethernet, value: this.TYPE_ETHERNET, selected: true },
			      { label:  n.sim_network_wifi, value: this.TYPE_WIFI },
			      { label: n.sim_network_2g, value: this.TYPE_2G },
			      { label: n.sim_network_3g, value: this.TYPE_3G },
			      { label: n.sim_network_4g, value: this.TYPE_4G },
			      { label: n.sim_network_cell, value: this.TYPE_CELL },
			      { label: n.sim_network_unknown, value: this.TYPE_UNKNOWN }
			    ]
			  }).placeAt(dom.byId("networkForm"));
			
			getNetwork();
			
		}
	});
});
