define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/Wifi.html",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/on",
    	"dojo/mouse",
    	"dojo/_base/lang",
    	"dojo/_base/fx",
    	"dojo/dom-attr"
        ], 
        function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, domClass,domConstruct,domStyle,on,mouse,lang,
        		baseFx, domAttr){

	return declare("widgets.Wifi",  [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],{
	    templateString: template,
	    
	    baseClass: "wifiWidget",
	    unvisibleClass : "notvisible",
	    connectedClass : "connected",
	    wifiId : null,
	    MAC : null,
	    MAC1 : null,
	    MAC2 : null,
	    MAC3 : null,
	    MAC4 : null,
	    MAC5 : null,
	    MAC6 : null,
        SSID : null,
        strength : null,
        visible: true,
        connected: null,
        wifiStore :  null,
        id : null,
        hoverTooltip: null,
        
        title : "simple tooltip",
        
        // Colors for our background animation
        baseBackgroundColor: "#fff",
        mouseBackgroundColor: "#def",
        
        // A class to be applied to the root node in our template
        baseClass: "wifiWidget",

        // A reference to our background animation
        mouseAnim: null,
        
        IMG00 : './images/wifi_00.png',
        IMG25 : './images/wifi_25.png',
        IMG50 : './images/wifi_50.png',
        IMG75 : './images/wifi_75.png',
        IMG100 : './images/wifi_100.png',
        
        constructor : function(options){
//        	if (options.wifiId){
//        		this.id = options.wifiId;
//        	}
        },
        
        // killing child widgets
        uninitialize: function(options){
        	this.hoverTooltip.destroy();
        },
        
        deleteWifi : function(e){
        	this.wifiStore.remove(this.wifiId);
//        	domConstruct.destroy(this.domNode);
        	e.stopPropagation();
    	},
    	
    	/**
    	 * change the visible of a wifi
    	 *
    	 */
    	changeVisible : function(e){
    		var wifi = this.wifiStore.get(this.wifiId);
    		wifi.visible = !wifi.visible;
    		this.wifiStore.put(wifi);
    		e.stopPropagation();
    	},
    	dontPropogate : function(e){
    		e.stopPropagation();
    	},
    	
    	changeConnected : function(e){
    		var that = this;
    		
    		var wifi = this.wifiStore.get(this.wifiId);
    		var connected = !wifi.connected;
    		// set all other wifi to be disconnected
    		this.wifiStore.data.forEach(function(wifi){
    			wifi.connected = false;
    			that.wifiStore.put(wifi);
    		});
    		// set this wifi to be connected
    		wifi.connected = connected;
    		this.wifiStore.put(wifi);
    		
    		getService('Network Status').setNetworkToWifi();
    		
    		console.log("change connected");
    		e.stopPropagation();
    	},
    	
    	editWifi : function(){
    		getService('WifiPlugin').openEditWifi(this);
    	},
    	
    	hoverToolTip : function(){
	        if (!this.hoverTooltip) {
	        	this.hoverTooltip = new dijit.Tooltip({
	        			connectId:this.dataWrapper,
	        			label: "click to edit",
		        	});
	        }
    	},
    	
    	getImgUrl : function(){
    		if (this.strength < 20) return this.IMG00;
    		else if (this.strength < 40) return this.IMG25;
    		else if (this.strength < 60) return this.IMG50;
    		else if (this.strength < 80) return this.IMG75;
    		else if (this.strength <= 100) return this.IMG100;
    	},
    	
    	postCreate: function(){
    	    // Get a DOM node reference for the root of our widget
    	    var domNode = this.domNode;
    	 
    	    // Run any parent postCreate processes - can be done at any point
    	    this.inherited(arguments);
    	    
    	    //set the DOM node different parameter
    	    this.checkboxVisible.checked = this.visible;
    	    var connectedButtonText = (this.connected && this.visible)?"Disconnect" : "Connect";
    	    this.connectedButton.setLabel(connectedButtonText);
    	    var connectedText = (this.connected && this.visible)?"<b>Connected</b>" : "";
    	    this.connectedText.innerHTML = connectedText;
//    	    	this.connected && this.visible;
    	    this.connectedButton.set('disabled',!this.visible);
//    	    this.connectedButton.disabled = !this.visible;
    	    
    	    // toggle the dom visible class 
    		domClass.toggle(this.domNode, this.unvisibleClass, !this.visible);    	    
    		// toggle connected class
    		domClass.toggle(this.domNode, this.connectedClass, this.connected && this.visible);    	    
    	    
    	    // set the signal strength img according to the strength
    	    domAttr.set(this.signalImg, "src", this.getImgUrl());
    	    
    	    // Set our DOM node's background color to white -
    	    // smoothes out the mouseenter/leave event animations
    	    domStyle.set(domNode, "backgroundColor", this.baseBackgroundColor);
    	    // Set up our mouseenter/leave events
    	    // Using dijit/Destroyable's "own" method ensures that event handlers are unregistered when the widget is destroyed
    	    // Using dojo/mouse normalizes the non-standard mouseenter/leave events across browsers
    	    // Passing a third parameter to lang.hitch allows us to specify not only the context,
    	    // but also the first parameter passed to _changeBackground
    	    // create animation only if the class is visible
        	on(this.dataWrapper, mouse.enter, lang.hitch(this, "_changeBackground", this.mouseBackgroundColor));
        	on(this.dataWrapper, mouse.leave, lang.hitch(this, "_changeBackground", this.baseBackgroundColor));
	       
	        // connect dbclick event to edit the wifi
//	        dojo.connect(domNode, "dblclick", lang.hitch(this, "editWifi"));
	        on(this.connectedButton, "click", lang.hitch(this, "changeConnected"));
	        on(this.connectedButton, "hover", lang.hitch(this, "dontPropogate"));
	        
	        on(this.dataWrapper, "click", lang.hitch(this, "editWifi"));
	        this.hoverTooltip = new dijit.Tooltip({
    			connectId:this.dataWrapper,
    			label: "click to edit",
        	});
//	        on(this.dataWrapper,mouse.enter, lang.hitch(this, "hoverToolTip"));
    	},
    	
    	_changeBackground: function(newColor) {
    	    // If we have an animation, stop it
    	    if (this.mouseAnim) {
    	        this.mouseAnim.stop();
    	    }
    	 
    	    // Set up the new animation
    	    this.mouseAnim = baseFx.animateProperty({
    	        node: this.domNode,
    	        properties: {
    	            backgroundColor: newColor
    	        },
    	        onEnd: lang.hitch(this, function() {
    	            // Clean up our mouseAnim property
    	            this.mouseAnim = null;
    	        })
    	    }).play();
    	}
    	
	});
});
