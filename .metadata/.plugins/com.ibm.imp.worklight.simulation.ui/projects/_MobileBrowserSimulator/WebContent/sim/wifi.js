dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
require(["dojo/dom",
         "dijit/Dialog",
         "dojo/store/Memory",
         "dojo/store/Observable",
         "dojo/Stateful",
         "dojo/query",
         "dojo/dom-construct",
         "widgets/Wifi",
         'dojo/parser'
         ], function(dom,Dialog, Memory,Observable,Stateful,Query,domConstruct, Wifi
        		 ){
	addService("WifiPlugin", function(){
		
		var self = this;
		var DEFAULT_SIGNAL_STRENGTH = 50;
		this.accessPointId = 1;
		this.inError = 0;
		
		this.PERMISSION = 0;
		this.DISABLED = 1;
		this.FAILED_START_SCAN = 2;
		
		// Public
		// Handle requests
		this.exec = function(action, args, callbackId){
			if (action == 'acquireWifi') {
				if (this.inError){ // in case thare is an error
					result = this.getErrorResult(callbackId);
					this.inError--;
					this.updateErrorButton();
				}
				else{
					result = this.getScanWifiResult(callbackId);
				}
				return result;
			}
			_consoleLog("WifiPlugin." + action + "()");
			return new PluginResult(callbackId, PluginResultStatus.INVALID_ACTION);
		};

		/**
		 *    	return the scan wifi results
		 *   	
		 *   	The result will be according to the Wifi store 
		 *   
		 */
		this.getScanWifiResult = function(callbackId){
			var wifis = this.wifiStore.query({visible:true});	
			return new PluginResult(callbackId, PluginResultStatus.OK,wifis , false);
		};
		
		/**
		 *    	return the error result according to the select button
		 *   
		 */
		this.getErrorResult = function(callbackId){
			var wifiErrorIndex  = this.getWifiErrorIndex();
			return new PluginResult(callbackId,PluginResultStatus.ERROR,this.getWifiError(wifiErrorIndex), false);
		};
		
		/**
		 * 	return a wifi error object according to the error index
		 */
		this.getWifiError = function(wifiErrorIndex){
			if (wifiErrorIndex == 0)
				return this.PERMISSION;
			else if (wifiErrorIndex == 1)
				return this.DISABLED;
			else if (wifiErrorIndex == 2)
				return this.FAILED_START_SCAN;
		};
		
		this.viewResults = 	function(results) {
			var container = dojo.byId("wifiContainer");
			var rows = [];

			// results object provides a forEach method for iteration
			results.forEach(insertRow);

			results.observe(function(item, removedIndex, insertedIndex) {
				// this will be called any time a item is added, removed, and updates
				if (removedIndex > -1) {
					removeRow(removedIndex);
				}
				if (insertedIndex > -1) {
					insertRow(item, insertedIndex);
				}
				
				//save data to store
				self.setWifisToLocalStore(results);
				
			}, true); // we can indicate to be notified of object updates as well

			function insertRow(item, i) {
				//create WIFI widget and place it in the container
				var row = new Wifi({
					SSID : item.SSID,
    		        MAC : item.MAC,
//    		        MAC1 : item.MAC1,
//    		        MAC2 : item.MAC2,
//    		        MAC3 : item.MAC3,
//    		        MAC4 : item.MAC4,
//    		        MAC5 : item.MAC5,
//    		        MAC6 : item.MAC6,
    		        strength : item.strength,
    		        wifiId : item.id,
    		        connected : item.connected,
    		        visible : item.visible,
    		        wifiStore : self.wifiStore,
    		    });
				domConstruct.place(row.domNode, container, i);
				
			}

			function removeRow(i) { // doesn't need to do anything as the widget is responsible for destroying itself
//				dijit.byId(Query(".wifiWidget",container)[i].id).hoverTooltip.destroy();
				dijit.byId(Query(".wifiWidget",container)[i].id).destroy();
			}
		}
		
		this.getAccessPointId = function(){
			return this.accessPointId++;
		};
		
		
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
				sim_wifi_error_button.attr("disabled", true);
				sim_wifi_error_type_select.attr("disabled", true);
				l = n.sim_common_error_pending_button;
			}
			else{
				sim_wifi_error_button.attr("disabled", false);
				sim_wifi_error_type_select.attr("disabled", false);
			}
			sim_wifi_error_button.set("label", l);
		};
		
		// get the value of the error from the select button
		this.getWifiErrorIndex = function(){
			return parseInt(sim_wifi_error_type_select.getValue());
		};
		
		
		this.unconnectAllWifi = function(){
			self.wifiStore.data.forEach(function(wifi){
    			wifi.connected = false;
    			self.wifiStore.put(wifi);
    		});
		};
		
		
		this.openEditWifi = function(wifi){
			var form = dijit.byId('wifi-form')
    		form.setValues(wifi);
    		var visibleCheckbox = dijit.byId('wifi-add-visible');
    		visibleCheckbox.setValue(wifi.visible);
    		var connectedInput = dijit.byId('wifi-add-connected');
    		
    		dijit.byId("wifiDialog").show();
		};
		
		this.getWifisFromLocalStore = function(){
			if(typeof(Storage)!=="undefined"){
				if (localStorage.wifis){
					try {
						return JSON.parse(localStorage.wifis);
					  } catch(e) {
						return [] ;
					  }
				}
				return  [];
			}
		};
		
		this.setWifisToLocalStore = function(wifis){
			if(typeof(Storage)!=="undefined"){
				localStorage.wifis = JSON.stringify(wifis);
			}
		};
		
		/**
		 * update Access Points
		 * 
		 */
		this.updateAcceesPoints = function(accessPoints){
			while (this.wifiStore.data.length){
				this.wifiStore.remove(this.wifiStore.data[0].id);
			}
			for (var i in accessPoints){
				dojo.mixin(accessPoints[i], {   id : self.getAccessPointId()  });
				if (accessPoints[i].strength){
					accessPoints[i].strength =  Math.round(accessPoints[i].strength);					
				};
				this.wifiStore.add(accessPoints[i]);
			}
			
		}
		// Initialization
		{
			var n = _pg_sim_nls;
			
			dojo.ready(function() {
		        self.wifis = self.getWifisFromLocalStore();
		        self.wifiStore = new Memory({data:self.wifis, idProperty: "id"});
		        self.wifiStore = Observable(self.wifiStore);
		        self.viewResults(self.wifiStore.query());
			
		        dojo.connect(dojo.byId("addAccessPointButton"), "click", function() {
		        	var form = dijit.byId('wifi-form');
		        	if(form.validate() /*&& form.getValues().SSID !=""*/){// this is not the right way to handle the varification of the 
		        		var newWifi = form.getValues();
		        		var mac = newWifi.MAC;//newWifi.MAC1 + newWifi.MAC2 + newWifi.MAC3 + newWifi.MAC4 + newWifi.MAC5 + newWifi.MAC6 ;
		        		newWifi.visible = (newWifi.visible.length != 0);
		        		var editMode = (newWifi.wifiId) ? true : false;
		        		var wifiId = editMode ? parseInt(newWifi.wifiId) : self.getAccessPointId();
		        		var connected = newWifi.connected == 'true';
		        		dojo.mixin(newWifi, {   id : wifiId , connected : connected , MAC : mac });
		        		if (editMode)
		        			self.wifiStore.put(newWifi);
	        			else
		        			self.wifiStore.add(newWifi);
		        		form.reset();
		        		dijit.byId("wifiDialog").hide();
		            }
		    	});
		        dojo.connect(dojo.byId("cancelAddWifi"), "click", function() {
		        	dijit.byId('wifiDialog').hide();
		        	dijit.byId('wifi-form').reset();
		        });
		        
			});
			self.updateErrorButton();
		}
	});
});
