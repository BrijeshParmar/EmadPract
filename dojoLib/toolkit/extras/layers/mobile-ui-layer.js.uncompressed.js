require({cache:{
'dojox/mobile/dh/HtmlContentHandler':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",
	"../lazyLoadUtils"
], function(dojo, array, declare, Deferred, domClass, domConstruct, registry, lazyLoadUtils){

	// module:
	//		dojox/mobile/dh/HtmlContentHandler

	return declare("dojox.mobile.dh.HtmlContentHandler", null, {
		// summary:
		//		A HTML content handler.
		// description:
		//		This module is a content handler that creates a view from HTML
		//		data. If widgets used in the HTML data are not available, they
		//		are loaded automatically before instantiation.

		parse: function(/*String*/ content, /*DomNode*/ target, /*DomNode?*/ refNode){
			// summary:
			//		Parses the given data and creates a new view at the given position.
			// content:
			//		Content data for a new view.
			// target:
			//		A DOM node under which a new view is created.
			// refNode:
			//		An optional reference DOM node before which a new view is created.
			if(this.execScript){
				content = this.execScript(content);
			}
			var container = domConstruct.create("div", {
				innerHTML: content,
				style: {visibility: "hidden"}
			});
			target.insertBefore(container, refNode);

			return Deferred.when(lazyLoadUtils.instantiateLazyWidgets(container), function(){
				// allows multiple root nodes in the fragment,
				// but transition will be performed to the 1st view.
				var view, i, len;
				for(i = 0, len = container.childNodes.length; i < len; i++){
					var n = container.firstChild;
					if(!view && n.nodeType === 1){
						view = registry.byNode(n);
					}
					target.insertBefore(container.firstChild, refNode); // reparent
				}
				target.removeChild(container);
				if(!view || !domClass.contains(view.domNode, "mblView")){
					console.log("HtmlContentHandler.parse: invalid view content");
					return null;
				}
				return view.id;
			});
		}
	});
});

},
'dojox/mobile/Audio':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/sniff",
	"dijit/_Contained",
	"dijit/_WidgetBase"
], function(declare, domConstruct, has, Contained, WidgetBase){
	// module:
	//		dojox/mobile/Audio

	return declare("dojox.mobile.Audio", [WidgetBase, Contained], {
		// summary:
		//		A thin wrapper around the HTML5 `<audio>` element.
		// description:
		//		dojox/mobile/Audio is a widget which plays audio. If all sources cannot 
		//		be played (typically, in desktop browsers that do not support `<audio>`), 
		//		dojox/mobile/Audio automatically replaces `<audio>` with `<embed>`, such 
		//		that the browser tries to play it with a suitable plug-in.
		
		// source: [const] Array
		//		An array of src and type,
		//		ex. [{src:"a.mp3", type:"audio/mpeg"}, {src:"a.ogg", type:"audio/ogg"}, ...].
		//		The src gives the path of the media resource. The type gives the
		//		type of the media resource.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		source: null,

		// width: [const] String
		//		The width of the embed element. 
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		width: "200px",

		// height: [const] String
		//		The height of the embed element.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		height: "15px",

		// _playable: [private] Boolean
		//		Internal flag.
		_playable: false,
		
		// _tag: [private] String
		//		The name of the tag ("audio").
		_tag: "audio",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			this.source = [];
		},

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this._tag);
		},

		_getEmbedRegExp: function(){
			// tags:
			//		private
			return has('ff') ? /audio\/mpeg/i :
				   has('ie') ? /audio\/wav/i :
				   null;
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			var i, len, re;
		 	if(this.domNode.canPlayType){
				if(this.source.length > 0){
					for(i = 0, len = this.source.length; i < len; i++){
						domConstruct.create("source", {src:this.source[i].src, type:this.source[i].type}, this.domNode);
						this._playable = this._playable || !!this.domNode.canPlayType(this.source[i].type);
					}
				}else{
					for(i = 0, len = this.domNode.childNodes.length; i < len; i++){
						var n = this.domNode.childNodes[i];
						if(n.nodeType === 1 && n.nodeName === "SOURCE"){
							this.source.push({src:n.src, type:n.type});
							this._playable = this._playable || !!this.domNode.canPlayType(n.type);
						}
					}
				}
			}
			has.add("mobile-embed-audio-video-support", true);	//It should move to staticHasFeatures
		 	if(has("mobile-embed-audio-video-support")){
				if(!this._playable){
					for(i = 0, len = this.source.length, re = this._getEmbedRegExp(); i < len; i++){
					 	if(this.source[i].type.match(re)){
							var node = domConstruct.create("embed", {
								src: this.source[0].src,
								type: this.source[0].type,
								width: this.width,
								height: this.height
							});
							this.domNode.parentNode.replaceChild(node, this.domNode);
							this.domNode = node;
							this._playable = true;
							break;
						}
					}
				}
			}
		}

	});
});

},
'dojox/mobile/TransitionEvent':function(){
define(["dojo/_base/declare", "dojo/on"], function(declare, on){

	return declare("dojox.mobile.TransitionEvent", null, {
		// summary:
		//		A class used to trigger view transitions.
		
		constructor: function(/*DomNode*/target, /*Object*/transitionOptions, /*Event?*/triggerEvent){
			// summary:
			//		Creates a transition event.
			// target:
			//		The DOM node that initiates the transition (for example a ListItem).
			// transitionOptions:
			//		Contains the transition options.
			// triggerEvent:
			//		The event that triggered the transition (for example a touch event on a ListItem).
			this.transitionOptions = transitionOptions;
			this.target = target;
			this.triggerEvent = triggerEvent||null;
		},

		dispatch: function(){
			// summary:
			//		Dispatches this transition event. Emits a "startTransition" event on the target.
			var opts = {bubbles:true, cancelable:true, detail: this.transitionOptions, triggerEvent: this.triggerEvent};	
			var evt = on.emit(this.target,"startTransition", opts);
		}
	});
});

},
'dojox/mobile/ViewController':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/Deferred",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/ready",
	"dijit/registry",
	"./ProgressIndicator",
	"./TransitionEvent",
	"./viewRegistry"
], function(dojo, array, connect, declare, lang, win, Deferred, dom, domClass, domConstruct, on, ready, registry, ProgressIndicator, TransitionEvent, viewRegistry){

	// module:
	//		dojox/mobile/ViewController

	var Controller = declare("dojox.mobile.ViewController", null, {
		// summary:
		//		A singleton class that controls view transition.
		// description:
		//		This class listens to the "startTransition" events and performs
		//		view transitions. If the transition destination is an external
		//		view specified with the url parameter, the view content is
		//		retrieved and parsed to create a new target view.

		// dataHandlerClass: Object
		//		The data handler class used to load external views,
		//		by default "dojox/mobile/dh/DataHandler"
		//		(see the Data Handlers page in the reference documentation).
		dataHandlerClass: "dojox/mobile/dh/DataHandler",
		// dataSourceClass: Object
		//		The data source class used to load external views,
		//		by default "dojox/mobile/dh/UrlDataSource"
		//		(see the Data Handlers page in the reference documentation).
		dataSourceClass: "dojox/mobile/dh/UrlDataSource",
		// fileTypeMapClass: Object
		//		The file type map class used to load external views,
		//		by default "dojox/mobile/dh/SuffixFileTypeMap"
		//		(see the Data Handlers page in the reference documentation).
		fileTypeMapClass: "dojox/mobile/dh/SuffixFileTypeMap",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			// tags:
			//		private
			this.viewMap = {};
			ready(lang.hitch(this, function(){
				on(win.body(), "startTransition", lang.hitch(this, "onStartTransition"));
			}));
		},

		findTransitionViews: function(/*String*/moveTo){
			// summary:
			//		Parses the moveTo argument and determines a starting view and a destination view.
			// returns: Array
			//		An array containing the currently showing view, the destination view
			//		and the transition parameters, or an empty array if the moveTo argument
			//		could not be parsed. 
			if(!moveTo){ return []; }
			// removes a leading hash mark (#) and params if exists
			// ex. "#bar&myParam=0003" -> "bar"
			moveTo.match(/^#?([^&?]+)(.*)/);
			var params = RegExp.$2;
			var view = registry.byId(RegExp.$1);
			if(!view){ return []; }
			for(var v = view.getParent(); v; v = v.getParent()){ // search for the topmost invisible parent node
				if(v.isVisible && !v.isVisible()){
					var sv = view.getShowingView();
					if(sv && sv.id !== view.id){
						view.show();
					}
					view = v;
				}
			}
			return [view.getShowingView(), view, params]; // fromView, toView, params
		},

		openExternalView: function(/*Object*/ transOpts, /*DomNode*/ target){
			// summary:
			//		Loads an external view and performs a transition to it.
			// returns: dojo/_base/Deferred
			//		Deferred object that resolves when the external view is
			//		ready and a transition starts. Note that it resolves before
			//		the transition is complete.
			// description:
			//		This method loads external view content through the
			//		dojox/mobile data handlers, creates a new View instance with
			//		the loaded content, and performs a view transition to the
			//		new view. The external view content can be specified with
			//		the url property of transOpts. The new view is created under
			//		a DOM node specified by target.
			//
			// example:
			//		This example loads view1.html, creates a new view under
			//		`<body>`, and performs a transition to the new view with the
			//		slide animation.
			//		
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    transition: "slide"
			//	|	}, win.body());
			//
			//
			// example:
			//		If you want to perform a view transition without animation,
			//		you can give transition:"none" to transOpts.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    transition: "none"
			//	|	}, win.body());
			//
			// example:
			//		If you want to dynamically create an external view, but do
			//		not want to perform a view transition to it, you can give noTransition:true to transOpts.
			//		This may be useful when you want to preload external views before the user starts using them.
			//
			//	|	var vc = ViewController.getInstance();
			//	|	vc.openExternalView({
			//	|	    url: "view1.html", 
			//	|	    noTransition: true
			//	|	}, win.body());
			//
			// example:
			//		To do something when the external view is ready:
			//
			//	|	var vc = ViewController.getInstance();
			//	|	Deferred.when(vc.openExternalView({...}, win.body()), function(){
			//	|	    doSomething();
			//	|	});

			var d = new Deferred();
			var id = this.viewMap[transOpts.url];
			if(id){
				transOpts.moveTo = id;
				if(transOpts.noTransition){
					registry.byId(id).hide();
				}else{
					new TransitionEvent(win.body(), transOpts).dispatch();
				}
				d.resolve(true);
				return d;
			}

			// if a fixed bottom bar exists, a new view should be placed before it.
			var refNode = null;
			for(var i = target.childNodes.length - 1; i >= 0; i--){
				var c = target.childNodes[i];
				if(c.nodeType === 1){
					var fixed = c.getAttribute("fixed") // TODO: Remove the non-HTML5-compliant attribute in 2.0
						|| c.getAttribute("data-mobile-fixed")
						|| (registry.byNode(c) && registry.byNode(c).fixed);
					if(fixed === "bottom"){
						refNode = c;
						break;
					}
				}
			}

			var dh = transOpts.dataHandlerClass || this.dataHandlerClass;
			var ds = transOpts.dataSourceClass || this.dataSourceClass;
			var ft = transOpts.fileTypeMapClass || this.fileTypeMapClass;
			require([dh, ds, ft], lang.hitch(this, function(DataHandler, DataSource, FileTypeMap){
				var handler = new DataHandler(new DataSource(transOpts.data || transOpts.url), target, refNode);
				var contentType = transOpts.contentType || FileTypeMap.getContentType(transOpts.url) || "html";
				handler.processData(contentType, lang.hitch(this, function(id){
					if(id){
						this.viewMap[transOpts.url] = transOpts.moveTo = id;
						if(transOpts.noTransition){
							registry.byId(id).hide();
						}else{
							new TransitionEvent(win.body(), transOpts).dispatch();
						}
						d.resolve(true);
					}else{
						d.reject("Failed to load "+transOpts.url);
					}
				}));
			}));
			return d;
		},

		onStartTransition: function(evt){
			// summary:
			//		A handler that performs view transition.
			evt.preventDefault();
			if(!evt.detail){ return; }
			var detail = evt.detail;
			if(!detail.moveTo && !detail.href && !detail.url && !detail.scene){ return; }

			if(detail.url && !detail.moveTo){
				var urlTarget = detail.urlTarget;
				var w = registry.byId(urlTarget);
				var target = w && w.containerNode || dom.byId(urlTarget);
				if(!target){
					w = viewRegistry.getEnclosingView(evt.target);
					target = w && w.domNode.parentNode || win.body();
				}
				var src = registry.getEnclosingWidget(evt.target);
				if(src && src.callback){
					detail.context = src;
					detail.method = src.callback;
				}
				this.openExternalView(detail, target);
				return;
			}else if(detail.href){
				if(detail.hrefTarget && detail.hrefTarget != "_self"){
					win.global.open(detail.href, detail.hrefTarget);
				}else{
					var view; // find top level visible view
					for(var v = viewRegistry.getEnclosingView(evt.target); v; v = viewRegistry.getParentView(v)){
						view = v;
					}
					if(view){
						view.performTransition(null, detail.transitionDir, detail.transition, evt.target, function(){location.href = detail.href;});
					}
				}
				return;
			}else if(detail.scene){
				connect.publish("/dojox/mobile/app/pushScene", [detail.scene]);
				return;
			}

			var arr = this.findTransitionViews(detail.moveTo),
				fromView = arr[0],
				toView = arr[1],
				params = arr[2];
			if(!location.hash && !detail.hashchange){
				viewRegistry.initialView = fromView;
			}
			if(detail.moveTo && toView){
				detail.moveTo = (detail.moveTo.charAt(0) === '#' ? '#' + toView.id : toView.id) + params;
			}
			if(!fromView || (detail.moveTo && fromView === registry.byId(detail.moveTo.replace(/^#?([^&?]+).*/, "$1")))){ return; }
			src = registry.getEnclosingWidget(evt.target);
			if(src && src.callback){
				detail.context = src;
				detail.method = src.callback;
			}
			fromView.performTransition(detail);
		}
	});
	Controller._instance = new Controller(); // singleton
	Controller.getInstance = function(){
		return Controller._instance;
	};
	return Controller;
});


},
'dojox/mobile/ToolBarButton':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"./sniff",
	"./_ItemBase",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ToolBarButton"
], function(declare, lang, win, domClass, domConstruct, domStyle, domAttr, has, ItemBase, BidiToolBarButton){

	// module:
	//		dojox/mobile/ToolBarButton

	var ToolBarButton = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiToolBarButton" : "dojox.mobile.ToolBarButton", ItemBase, {
		// summary:
		//		A button widget which is placed in the Heading widget.
		// description:
		//		ToolBarButton is a button which is typically placed in the
		//		Heading widget. It is a subclass of dojox/mobile/_ItemBase just
		//		like ListItem or IconItem. So, unlike Button, it has basically
		//		the same capability as ListItem or IconItem, such as icon
		//		support, transition, etc.

		// selected: Boolean
		//		If true, the button is in the selected state.
		selected: false,

		// arrow: [const] String
		//		Specifies "right" or "left" to be an arrow button.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		arrow: "",

		// light: [const] Boolean
		//		If true, this widget produces only a single `<span>` node when it
		//		has only an icon or only a label, and has no arrow. In that
		//		case, you cannot have both icon and label, or arrow even if you
		//		try to set them.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		light: true,

		// defaultColor: String
		//		CSS class for the default color.
		//		Note: If this button has an arrow (typically back buttons on iOS),
		//		the class selector used for it is the value of defaultColor + "45".
		//		For example, by default the arrow selector is "mblColorDefault45".
		defaultColor: "mblColorDefault",

		// selColor: String
		//		CSS class for the selected color.
		//		Note: If this button has an arrow (typically back buttons on iOS),
		//		the class selector used for it is the value of selColor + "45".
		//		For example, by default the selected arrow selector is "mblColorDefaultSel45".
		selColor: "mblColorDefaultSel",

		/* internal properties */
		baseClass: "mblToolBarButton",

		_selStartMethod: "touch",
		_selEndMethod: "touch",

		buildRendering: function(){
			if(!this.label && this.srcNodeRef){
				this.label = this.srcNodeRef.innerHTML;
			}
			this.label = lang.trim(this.label);
			this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ?
				this.srcNodeRef : domConstruct.create("span");
			domAttr.set(this.domNode, "role", "button");
			this.inherited(arguments);

			if(this.light && !this.arrow && (!this.icon || !this.label)){
				this.labelNode = this.tableNode = this.bodyNode = this.iconParentNode = this.domNode;
				domClass.add(this.domNode, this.defaultColor + " mblToolBarButtonBody" +
							 (this.icon ? " mblToolBarButtonLightIcon" : " mblToolBarButtonLightText"));
				return;
			}

			this.domNode.innerHTML = "";
			if(this.arrow === "left" || this.arrow === "right"){
				this.arrowNode = domConstruct.create("span", {
					className: "mblToolBarButtonArrow mblToolBarButton" +
					(this.arrow === "left" ? "Left" : "Right") + "Arrow " +
					(has("ie") < 10 ? "" : (this.defaultColor + " " + this.defaultColor + "45"))
				}, this.domNode);
				domClass.add(this.domNode, "mblToolBarButtonHas" +
					(this.arrow === "left" ? "Left" : "Right") + "Arrow");
			}
			this.bodyNode = domConstruct.create("span", {className:"mblToolBarButtonBody"}, this.domNode);
			this.tableNode = domConstruct.create("table", {cellPadding:"0",cellSpacing:"0",border:"0",role:"presentation"}, this.bodyNode);
			if(!this.label && this.arrow){
				// The class mblToolBarButtonText is needed for arrow shape too.
				// If the button has a label, the class is set by _setLabelAttr. If no label, do it here.
				this.tableNode.className = "mblToolBarButtonText";
			}

			var row = this.tableNode.insertRow(-1);
			this.iconParentNode = row.insertCell(-1);
			this.labelNode = row.insertCell(-1);
			this.iconParentNode.className = "mblToolBarButtonIcon";
			this.labelNode.className = "mblToolBarButtonLabel";

			if(this.icon && this.icon !== "none" && this.label){
				domClass.add(this.domNode, "mblToolBarButtonHasIcon");
				domClass.add(this.bodyNode, "mblToolBarButtonLabeledIcon");
			}

			domClass.add(this.bodyNode, this.defaultColor);
		},

		startup: function(){
			if(this._started){ return; }

			this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers

			this.inherited(arguments);
			if(!this._isOnLine){
				this._isOnLine = true;
				// retry applying the attribute for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingIcon; 
			}
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		_setLabelAttr: function(/*String*/text){
			// summary:
			//		Sets the button label text.
			this.inherited(arguments);
			domClass.toggle(this.tableNode, "mblToolBarButtonText", text || this.arrow); // also needed if only arrow
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			var replace = function(node, a, b){
				domClass.replace(node, a + " " + a + "45", b + " " + b + "45");
			};
			this.inherited(arguments);
			if(selected){
				domClass.replace(this.bodyNode, this.selColor, this.defaultColor);
				if(!(has("ie") < 10) && this.arrowNode){
					replace(this.arrowNode, this.selColor, this.defaultColor);
				}
			}else{
				domClass.replace(this.bodyNode, this.defaultColor, this.selColor);
				if(!(has("ie") < 10) && this.arrowNode){
					replace(this.arrowNode, this.defaultColor, this.selColor);
				}
			}
			domClass.toggle(this.domNode, "mblToolBarButtonSelected", selected);
			domClass.toggle(this.bodyNode, "mblToolBarButtonBodySelected", selected);
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.ToolBarButton", [ToolBarButton, BidiToolBarButton]) : ToolBarButton;
});

},
'dojox/mobile/_ListTouchMixin':function(){
define([
	"dojo/_base/declare",
	"dojo/touch",
	"./sniff",
	"dijit/form/_ListBase"
], function(declare, touch, has, ListBase){

	return declare( "dojox.mobile._ListTouchMixin", ListBase, {
		// summary:
		//		Focus-less menu to handle touch events consistently.
		// description:
		//		Focus-less menu to handle touch events consistently. Abstract
		//		method that must be defined externally:
		//
		//		- onClick: item was chosen (mousedown somewhere on the menu and mouseup somewhere on the menu).

		postCreate: function(){
			this.inherited(arguments);

			// For some reason in IE click event is fired immediately after user scrolled combobox control and released
			// his/her finger. As a fix we replace click with tap event that is fired correctly.
			if(!( (has("ie") === 10 || (!has("ie") && has("trident") > 6)) && typeof(MSGesture) !== "undefined")){
				this._listConnect("click", "_onClick");
			}else{
				this._listConnect(touch.press, "_onPress");

				var self = this,
					tapGesture = new MSGesture(),
					target;

				this._onPress = function(e){
					tapGesture.target = self.domNode;
					tapGesture.addPointer(e.pointerId);
					target = e.target;
				};

				this.on("MSGestureTap", function(e){
					self._onClick(e, target);
				});
			}
		},

		_onClick: function(/*Event*/ evt, /*DomNode*/ target){
			this._setSelectedAttr(target);
			this.onClick(target);
		}
	});
});

},
'dojox/mobile/_ItemBase':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/touch",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./TransitionEvent",
	"./iconUtils",
	"./sniff",
	"./viewRegistry",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_ItemBase"
], function(array, declare, lang, win, domClass, touch, registry, Contained, Container, 
	WidgetBase, TransitionEvent, iconUtils, has, viewRegistry, BidiItemBase){

	// module:
	//		dojox/mobile/_ItemBase

	var _ItemBase = declare(has("dojo-bidi") ? "dojox.mobile._NonBidiItemBase" : "dojox.mobile._ItemBase", [WidgetBase, Container, Contained], {
		// summary:
		//		A base class for item classes (e.g. ListItem, IconItem, etc.).
		// description:
		//		_ItemBase is a base class for widgets that have capability to
		//		make a view transition when clicked.

		// icon: String
		//		An icon image to display. The value can be either a path for an
		//		image file or a class name of a DOM button. If icon is not
		//		specified, the iconBase parameter of the parent widget is used.
		icon: "",

		// iconPos: String
		//		The position of an aggregated icon. IconPos is comma separated
		//		values like top,left,width,height (ex. "0,0,29,29"). If iconPos
		//		is not specified, the iconPos parameter of the parent widget is
		//		used.
		iconPos: "", // top,left,width,height (ex. "0,0,29,29")

		// alt: String
		//		An alternate text for the icon image.
		alt: "",

		// href: String
		//		A URL of another web page to go to.
		href: "",

		// hrefTarget: String
		//		A target that specifies where to open a page specified by
		//		href. The value will be passed to the 2nd argument of
		//		window.open().
		hrefTarget: "",

		// moveTo: String
		//		The id of the transition destination view which resides in the
		//		current page.
		//
		//		If the value has a hash sign ('#') before the id (e.g. #view1)
		//		and the dojo/hash module is loaded by the user application, the
		//		view transition updates the hash in the browser URL so that the
		//		user can bookmark the destination view. In this case, the user
		//		can also use the browser's back/forward button to navigate
		//		through the views in the browser history.
		//
		//		If null, transitions to a blank view.
		//		If '#', returns immediately without transition.
		moveTo: "",

		// scene: String
		//		The name of a scene. Used from dojox/mobile/app.
		scene: "",

		// clickable: Boolean
		//		If true, this item becomes clickable even if a transition
		//		destination (moveTo, etc.) is not specified.
		clickable: false,

		// url: String
		//		A URL of an html fragment page or JSON data that represents a
		//		new view content. The view content is loaded with XHR and
		//		inserted in the current page. Then a view transition occurs to
		//		the newly created view. The view is cached so that subsequent
		//		requests would not load the content again.
		url: "",

		// urlTarget: String
		//		Node id under which a new view will be created according to the
		//		url parameter. If not specified, The new view will be created as
		//		a sibling of the current view.
		urlTarget: "",

		// back: Boolean
		//		If true, history.back() is called when clicked.
		back: false,

		// transition: String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types, "slide", "fade", "flip", or from the
		//		extended transition types, "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, transition occurs immediately without animation.
		transition: "",

		// transitionDir: Number
		//		The transition direction. If 1, transition forward. If -1,
		//		transition backward. For example, the slide transition slides
		//		the view from right to left when dir == 1, and from left to
		//		right when dir == -1.
		transitionDir: 1,

		// transitionOptions: Object
		//		A hash object that holds transition options.
		transitionOptions: null,

		// callback: Function|String
		//		A callback function that is called when the transition has been
		//		finished. A function reference, or name of a function in
		//		context.
		callback: null,

		// label: String
		//		A label of the item. If the label is not specified, innerHTML is
		//		used as a label.
		label: "",

		// toggle: Boolean
		//		If true, the item acts like a toggle button.
		toggle: false,

		// selected: Boolean
		//		If true, the item is highlighted to indicate it is selected.
		selected: false,

		// tabIndex: String
		//		Tabindex setting for the item so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		
		// _setTabIndexAttr: [private] String
		//		Sets tabIndex to domNode.
		_setTabIndexAttr: "",

		/* internal properties */	

		// paramsToInherit: String
		//		Comma separated parameters to inherit from the parent.
		paramsToInherit: "transition,icon",

		// _selStartMethod: String
		//		Specifies how the item enters the selected state.
		//
		//		- "touch": Use touch events to enter the selected state.
		//		- "none": Do not change the selected state.
		_selStartMethod: "none", // touch or none

		// _selEndMethod: String
		//		Specifies how the item leaves the selected state.
		//
		//		- "touch": Use touch events to leave the selected state.
		//		- "timer": Use setTimeout to leave the selected state.
		//		- "none": Do not change the selected state.
		_selEndMethod: "none", // touch, timer, or none

		// _delayedSelection: Boolean
		//		If true, selection is delayed 100ms and canceled if dragged in
		//		order to avoid selection when flick operation is performed.
		_delayedSelection: false,

		// _duration: Number
		//		Duration of selection, milliseconds.
		_duration: 800,

		// _handleClick: Boolean
		//		If true, this widget listens to touch events.
		_handleClick: true,

		buildRendering: function(){
			this.inherited(arguments);
			this._isOnLine = this.inheritParams();
		},

		startup: function(){
			if(this._started){ return; }
			if(!this._isOnLine){
				this.inheritParams();
			}
			this._updateHandles();
			this.inherited(arguments);
		},

		inheritParams: function(){
			// summary:
			//		Copies from the parent the values of parameters specified 
			//		by the property paramsToInherit.
			var parent = this.getParent();
			if(parent){
				array.forEach(this.paramsToInherit.split(/,/), function(p){
					if(p.match(/icon/i)){
						var base = p + "Base", pos = p + "Pos";
						if(this[p] && parent[base] &&
							parent[base].charAt(parent[base].length - 1) === '/'){
							this[p] = parent[base] + this[p];
						}
						if(!this[p]){ this[p] = parent[base]; }
						if(!this[pos]){ this[pos] = parent[pos]; }
					}
					if(!this[p]){ this[p] = parent[p]; }
				}, this);
			}
			return !!parent;
		},

		_updateHandles: function(){
			// tags:
			//		private
			if(this._handleClick && this._selStartMethod === "touch"){
				if(!this._onTouchStartHandle){
					this._onTouchStartHandle = this.connect(this.domNode, touch.press, "_onTouchStart");
				}
			}else{
				if(this._onTouchStartHandle){
					this.disconnect(this._onTouchStartHandle);
					this._onTouchStartHandle = null;
				}
			}
		},
		
		getTransOpts: function(){
			// summary:
			//		Copies from the parent and returns the values of parameters  
			//		specified by the property paramsToInherit.
			var opts = this.transitionOptions || {};
			array.forEach(["moveTo", "href", "hrefTarget", "url", "target",
				"urlTarget", "scene", "transition", "transitionDir"], function(p){
				opts[p] = opts[p] || this[p];
			}, this);
			return opts; // Object
		},

		userClickAction: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined click action.
		},

		defaultClickAction: function(/*Event*/e){
			// summary:
			//		The default action of this item.
			this.handleSelection(e);
			if(this.userClickAction(e) === false){ return; } // user's click action
			this.makeTransition(e);
		},

		handleSelection: function(/*Event*/e){
			// summary:
			//		Handles this items selection state.

			// Before transitioning, we want the visual effect of selecting the item.
			// To ensure this effect happens even if _delayedSelection is true:
			if(this._delayedSelection){
				this.set("selected", true);
			} // the item will be deselected after transition.

			if(this._onTouchEndHandle){
				this.disconnect(this._onTouchEndHandle);
				this._onTouchEndHandle = null;
			}

			var p = this.getParent();
			if(this.toggle){
				this.set("selected", !this._currentSel);
			}else if(p && p.selectOne){
				this.set("selected", true);
			}else{
				if(this._selEndMethod === "touch"){
					this.set("selected", false);
				}else if(this._selEndMethod === "timer"){
					this.defer(function(){
						this.set("selected", false);
					}, this._duration);
				}
			}
		},

		makeTransition: function(/*Event*/e){
			// summary:
			//		Makes a transition.
			if(this.back && history){
				history.back();	
				return;
			}	
			if (this.href && this.hrefTarget && this.hrefTarget != "_self") {
				win.global.open(this.href, this.hrefTarget || "_blank");
				this._onNewWindowOpened(e);
				return;
			}
			var opts = this.getTransOpts();
			var doTransition = 
				!!(opts.moveTo || opts.href || opts.url || opts.target || opts.scene);
			if(this._prepareForTransition(e, doTransition ? opts : null) === false){ return; }
			if(doTransition){
				this.setTransitionPos(e);
				new TransitionEvent(this.domNode, opts, e).dispatch();
			}
		},

		_onNewWindowOpened: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Subclasses may want to implement it.
		},

		_prepareForTransition: function(/*Event*/e, /*Object*/transOpts){
			// summary:
			//		Subclasses may want to implement it.
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(this.getParent().isEditing || this.onTouchStart(e) === false){ return; } // user's touchStart action
			var enclosingScrollable = viewRegistry.getEnclosingScrollable(this.domNode);
			if(enclosingScrollable &&
				domClass.contains(enclosingScrollable.containerNode, "mblScrollableScrollTo2")){
				// #17165: do not select the item during scroll animation
				return;
			}
			if(!this._onTouchEndHandle && this._selStartMethod === "touch"){
				// Connect to the entire window. Otherwise, fail to receive
				// events if operation is performed outside this widget.
				// Expose both connect handlers in case the user has interest.
				this._onTouchMoveHandle = this.connect(win.body(), touch.move, "_onTouchMove");
				this._onTouchEndHandle = this.connect(win.body(), touch.release, "_onTouchEnd");
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			this._currentSel = this.selected;

			if(this._delayedSelection){
				// so as not to make selection when the user flicks on ScrollableView
				this._selTimer = this.defer(function(){
					this.set("selected", true);
				}, 100);
			}else{
				this.set("selected", true);
			}
		},

		onTouchStart: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle touchStart events.
			// tags:
			//		callback
		},

		_onTouchMove: function(e){
			// tags:
			//		private
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			if(Math.abs(x - this.touchStartX) >= 4 ||
			   Math.abs(y - this.touchStartY) >= 4){ // dojox/mobile/scrollable.threshold
				this.cancel();
				var p = this.getParent();
				if(p && p.selectOne){
					this._prevSel && this._prevSel.set("selected", true);
				}else{
					this.set("selected", false);
				}
			}
		},

		_disconnect: function(){
			// tags:
			//		private
			this.disconnect(this._onTouchMoveHandle);
			this.disconnect(this._onTouchEndHandle);
			this._onTouchMoveHandle = this._onTouchEndHandle = null;
		},

		cancel: function(){
			// summary:
			//		Cancels an ongoing selection (if any).
			if(this._selTimer){
				this._selTimer.remove(); 
				this._selTimer = null;
			}
			this._disconnect();
		},

		_onTouchEnd: function(e){
			// tags:
			//		private
			if(!this._selTimer && this._delayedSelection){ return; }
			this.cancel();
			this._onClick(e);
		},

		setTransitionPos: function(e){
			// summary:
			//		Stores the clicked position for later use.
			// description:
			//		Some of the transition animations (e.g. ScaleIn) need the
			//		clicked position.
			var w = this;
			while(true){
				w = w.getParent();
				if(!w || domClass.contains(w.domNode, "mblView")){ break; }
			}
			if(w){
				w.clickedPosX = e.clientX;
				w.clickedPosY = e.clientY;
			}
		},

		transitionTo: function(/*String|Object*/moveTo, /*String*/href, /*String*/url, /*String*/scene){
			// summary:
			//		Performs a view transition.
			// description:
			//		Given a transition destination, this method performs a view
			//		transition. This method is typically called when this item
			//		is clicked.
			var opts = (moveTo && typeof(moveTo) === "object") ? moveTo :
				{moveTo: moveTo, href: href, url: url, scene: scene,
				 transition: this.transition, transitionDir: this.transitionDir};
			new TransitionEvent(this.domNode, opts).dispatch();
		},

		_setIconAttr: function(icon){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this._pendingIcon = icon;  
				return; 
			} // icon may be invalid because inheritParams is not called yet
			this._set("icon", icon);
			this.iconNode = iconUtils.setIcon(icon, this.iconPos, this.iconNode, this.alt, this.iconParentNode, this.refNode, this.position);
		},

		_setLabelAttr: function(/*String*/text){
			// tags:
			//		private
			this._set("label", text);
			this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// description:
			//		Subclass should override.
			// tags:
			//		private
			if(selected){
				var p = this.getParent();
				if(p && p.selectOne){
					// deselect the currently selected item
					var arr = array.filter(p.getChildren(), function(w){
						return w.selected;
					});
					array.forEach(arr, function(c){
						this._prevSel = c;
						c.set("selected", false);
					}, this);
				}
			}
			this._set("selected", selected);
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._ItemBase", [_ItemBase, BidiItemBase]) : _ItemBase;
});

},
'dojox/mobile/Container':function(){
define([
	"dojo/_base/declare",
	"dijit/_Container",
	"./Pane"
], function(declare, Container, Pane){

	// module:
	//		dojox/mobile/Container

	return declare("dojox.mobile.Container", [Pane, Container], {
		// summary:
		//		A simple container-type widget.
		// description:
		//		Container is a simple general-purpose container widget.
		//		It is a widget, but can be regarded as a simple `<div>` element.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblContainer"
	});
});

},
'dojox/mobile/scrollable':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/touch",
	"dijit/registry",
	"dijit/form/_TextBoxMixin",
	"./sniff",
	"./_css3",
	"./_maskUtils",
	"dojo/_base/declare",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Scrollable"
], function(dojo, connect, event, lang, win, domClass, domConstruct, domStyle,
			 domGeom, touch, registry, TextBoxMixin, has, css3, maskUtils, declare, BidiScrollable){

	// module:
	//		dojox/mobile/scrollable

	// TODO: rename to Scrollable.js (capital S) for 2.0

	// TODO: shouldn't be referencing this dojox/mobile variable, would be better to require the mobile.js module
	var dm = lang.getObject("dojox.mobile", true);

	// feature detection
	has.add("translate3d", function(){
		if(has("css3-animations")){
			var elem = win.doc.createElement("div");
			elem.style[css3.name("transform")] = "translate3d(0px,1px,0px)";
			win.doc.documentElement.appendChild(elem);
			var v = win.doc.defaultView.getComputedStyle(elem, '')[css3.name("transform", true)];
			var hasTranslate3d = v && v.indexOf("matrix") === 0;
			win.doc.documentElement.removeChild(elem);
			return hasTranslate3d;
		}
	});

	var Scrollable = function(){
		// summary:
		//		Mixin for enabling touch scrolling capability.
		// description:
		//		Mixin for enabling touch scrolling capability.
		//		Mobile WebKit browsers do not allow scrolling inner DIVs. (For instance,
		//		on iOS you need the two-finger operation to scroll them.)
		//		That means you cannot have fixed-positioned header/footer bars.
		//		To solve this issue, this module disables the browsers default scrolling
		//		behavior, and rebuilds its own scrolling machinery by handling touch
		//		events. In this module, this.domNode has height "100%" and is fixed to
		//		the window, and this.containerNode scrolls. If you place a bar outside
		//		of this.containerNode, then it will be fixed-positioned while
		//		this.containerNode is scrollable.
		//
		//		This module has the following features:
		//
		//		- Scrolls inner DIVs vertically, horizontally, or both.
		//		- Vertical and horizontal scroll bars.
		//		- Flashes the scroll bars when a view is shown.
		//		- Simulates the flick operation using animation.
		//		- Respects header/footer bars if any.
	};

	lang.extend(Scrollable, {
		// fixedHeaderHeight: Number
		//		height of a fixed header
		fixedHeaderHeight: 0,

		// fixedFooterHeight: Number
		//		height of a fixed footer
		fixedFooterHeight: 0,

		// isLocalFooter: Boolean
		//		footer is view-local (as opposed to application-wide)
		isLocalFooter: false,

		// scrollBar: Boolean
		//		show scroll bar or not
		scrollBar: true,

		// scrollDir: String
		//		v: vertical, h: horizontal, vh: both, f: flip
		scrollDir: "v",

		// weight: Number
		//		frictional drag
		weight: 0.6,

		// fadeScrollBar: Boolean
		fadeScrollBar: true,

		// disableFlashScrollBar: Boolean
		disableFlashScrollBar: false,

		// threshold: Number
		//		drag threshold value in pixels
		threshold: 4,

		// constraint: Boolean
		//		bounce back to the content area
		constraint: true,

		// touchNode: DOMNode
		//		a node that will have touch event handlers
		touchNode: null,

		// propagatable: Boolean
		//		let touchstart event propagate up
		propagatable: true,

		// dirLock: Boolean
		//		disable the move handler if scroll starts in the unexpected direction
		dirLock: false,

		// height: String
		//		explicitly specified height of this widget (ex. "300px")
		height: "",

		// scrollType: Number
		//		- 1: use (-webkit-)transform:translate3d(x,y,z) style, use (-webkit-)animation for slide animation
		//		- 2: use top/left style,
		//		- 3: use (-webkit-)transform:translate3d(x,y,z) style, use (-webkit-)transition for slide animation
		//		- 0: use default value (3 for Android, iOS6+, and BlackBerry; otherwise 1)
		scrollType: 0,
		
		// _parentPadBorderExtentsBottom: [private] Number
		//		For Tooltip.js.
		_parentPadBorderExtentsBottom: 0,

		// _moved: [private] Boolean
		//		Flag that signals if the user have moved in (one of) the scroll
		//		direction(s) since touch start (a move under the threshold is ignored).
		_moved: false,

		init: function(/*Object?*/params){
			// summary:
			//		Initialize according to the given params.
			// description:
			//		Mixes in the given params into this instance. At least domNode
			//		and containerNode have to be given.
			//		Starts listening to the touchstart events.
			//		Calls resize(), if this widget is a top level widget.
			if(params){
				for(var p in params){
					if(params.hasOwnProperty(p)){
						this[p] = ((p == "domNode" || p == "containerNode") && typeof params[p] == "string") ?
							win.doc.getElementById(params[p]) : params[p]; // mix-in params
					}
				}
			}
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			if(typeof this.domNode.style.msTouchAction != "undefined"){
				this.domNode.style.msTouchAction = "none";
			}
			this.touchNode = this.touchNode || this.containerNode;
			this._v = (this.scrollDir.indexOf("v") != -1); // vertical scrolling
			this._h = (this.scrollDir.indexOf("h") != -1); // horizontal scrolling
			this._f = (this.scrollDir == "f"); // flipping views

			this._ch = []; // connect handlers
			this._ch.push(connect.connect(this.touchNode, touch.press, this, "onTouchStart"));
			if(has("css3-animations")){
				// flag for whether to use -webkit-transform:translate3d(x,y,z) or top/left style.
				// top/left style works fine as a workaround for input fields auto-scrolling issue,
				// so use top/left in case of Android by default.
				this._useTopLeft = this.scrollType ? this.scrollType === 2 : false;
				// Flag for using webkit transition on transform, instead of animation + keyframes.
				// (keyframes create a slight delay before the slide animation...)
				if(!this._useTopLeft){
					this._useTransformTransition = 
						this.scrollType ? this.scrollType === 3 : has("ios") >= 6 || has("android") || has("bb");
				}
				if(!this._useTopLeft){
					if(this._useTransformTransition){
						this._ch.push(connect.connect(this.containerNode, css3.name("transitionEnd"), this, "onFlickAnimationEnd"));
						// Note that there is no transitionstart event (#17822).
					}else{
						this._ch.push(connect.connect(this.containerNode, css3.name("animationEnd"), this, "onFlickAnimationEnd"));
						this._ch.push(connect.connect(this.containerNode, css3.name("animationStart"), this, "onFlickAnimationStart"));
	
						// Creation of keyframes takes a little time. If they are created
						// in a lazy manner, a slight delay is noticeable when you start
						// scrolling for the first time. This is to create keyframes up front.
						for(var i = 0; i < 3; i++){
							this.setKeyframes(null, null, i);
						}
					}
					if(has("translate3d")){ // workaround for flicker issue on iPhone and Android 3.x/4.0
						domStyle.set(this.containerNode, css3.name("transform"), "translate3d(0,0,0)");
					}
				}else{
					this._ch.push(connect.connect(this.containerNode, css3.name("transitionEnd"), this, "onFlickAnimationEnd"));
					// Note that there is no transitionstart event (#17822).
				}
			}

			this._speed = {x:0, y:0};
			this._appFooterHeight = 0;
			if(this.isTopLevel() && !this.noResize){
				this.resize();
			}
			var _this = this;
			setTimeout(function(){ 
				// Why not using widget.defer() instead of setTimeout()? Because this module
				// is not always mixed into a widget (ex. dojox/mobile/_ComboBoxMenu), and adding 
				// a check to call either defer or setTimeout has been considered overkill.
				_this.flashScrollBar();
			}, 600);
			
			// #16363: while navigating among input field using TAB (desktop keyboard) or 
			// NEXT (mobile soft keyboard), domNode.scrollTop gets modified (this holds even 
			// if the text widget has selectOnFocus at false, that is even if dijit's _FormWidgetMixin._onFocus 
			// does not trigger a global scrollIntoView). This messes up ScrollableView's own 
			// scrolling machinery. To avoid this misbehavior:
			if(win.global.addEventListener){ // all supported browsers but IE8
				// (for IE8, using attachEvent is not a solution, because it only works in bubbling phase)
				this._onScroll = function(e){
					if(!_this.domNode || _this.domNode.style.display === 'none'){ return; }
					var scrollTop = _this.domNode.scrollTop;
					var scrollLeft = _this.domNode.scrollLeft; 
					var pos;
					if(scrollTop > 0 || scrollLeft > 0){ 
						pos = _this.getPos(); 
						// Reset to zero while compensating using our own scroll: 
						_this.domNode.scrollLeft = 0; 
						_this.domNode.scrollTop = 0; 
						_this.scrollTo({x: pos.x - scrollLeft, y: pos.y - scrollTop}); // no animation 
					}
				};
				win.global.addEventListener("scroll", this._onScroll, true);
			}
			// #17062: Ensure auto-scroll when navigating focusable fields
			if(!this.disableTouchScroll && this.domNode.addEventListener){
				this._onFocusScroll = function(e){
					if(!_this.domNode || _this.domNode.style.display === 'none'){ return; }
					var node = win.doc.activeElement;
					var nodeRect, scrollableRect;
					if(node){
						nodeRect = node.getBoundingClientRect();
						scrollableRect = _this.domNode.getBoundingClientRect();
						if(nodeRect.height < _this.getDim().d.h){
							// do not call scrollIntoView for elements with a height
							// larger than the height of scrollable's content display
							// area (it would be ergonomically harmful).
							
							if(nodeRect.top < (scrollableRect.top + _this.fixedHeaderHeight)){
								// scrolling towards top (to bring into the visible area an element
								// located above it).
								_this.scrollIntoView(node, true);
							}else if((nodeRect.top + nodeRect.height) > 
								(scrollableRect.top + scrollableRect.height - _this.fixedFooterHeight)){
								// scrolling towards bottom (to bring into the visible area an element
								// located below it).
								_this.scrollIntoView(node, false);
							} // else do nothing (the focused node is already visible)
						}
					}
				};
				this.domNode.addEventListener("focus", this._onFocusScroll, true);
			}
		},

		isTopLevel: function(){
			// summary:
			//		Returns true if this is a top-level widget.
			// description:
			//		Subclass may want to override.
			return true;
		},

		cleanup: function(){
			// summary:
			//		Uninitialize the module.
			if(this._ch){
				for(var i = 0; i < this._ch.length; i++){
					connect.disconnect(this._ch[i]);
				}
				this._ch = null;
			}
			if(this._onScroll && win.global.removeEventListener){ // all supported browsers but IE8
				win.global.removeEventListener("scroll", this._onScroll, true);
				this._onScroll = null;
			}
			
			if(this._onFocusScroll && this.domNode.removeEventListener){
				this.domNode.removeEventListener("focus", this._onFocusScroll, true);
				this._onFocusScroll = null;
			} 
		},

		findDisp: function(/*DomNode*/node){
			// summary:
			//		Finds the currently displayed view node from my sibling nodes.
			if(!node.parentNode){ return null; }

			// the given node is the first candidate
			if(node.nodeType === 1 && domClass.contains(node, "mblSwapView") && node.style.display !== "none"){
				return node;
			}

			var nodes = node.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblView") && n.style.display !== "none"){
					return n;
				}
			}
			return node;
		},

		getScreenSize: function(){
			// summary:
			//		Returns the dimensions of the browser window.
			return {
				h: win.global.innerHeight||win.doc.documentElement.clientHeight||win.doc.documentElement.offsetHeight,
				w: win.global.innerWidth||win.doc.documentElement.clientWidth||win.doc.documentElement.offsetWidth
			};
		},

		resize: function(e){
			// summary:
			//		Adjusts the height of the widget.
			// description:
			//		If the height property is 'inherit', the height is inherited
			//		from its offset parent. If 'auto', the content height, which
			//		could be smaller than the entire screen height, is used. If an
			//		explicit height value (ex. "300px"), it is used as the new
			//		height. If nothing is specified as the height property, from the
			//		current top position of the widget to the bottom of the screen
			//		will be the new height.

			// moved from init() to support dynamically added fixed bars
			this._appFooterHeight = (this._fixedAppFooter) ? this._fixedAppFooter.offsetHeight : 0;
			if(this.isLocalHeader){
				this.containerNode.style.marginTop = this.fixedHeaderHeight + "px";
			}

			// Get the top position. Same as dojo.position(node, true).y
			var top = 0;
			for(var n = this.domNode; n && n.tagName != "BODY"; n = n.offsetParent){
				n = this.findDisp(n); // find the first displayed view node
				if(!n){ break; }
				top += n.offsetTop + domGeom.getBorderExtents(n).h;
			}

			// adjust the height of this view
			var	h,
				screenHeight = this.getScreenSize().h,
				dh = screenHeight - top - this._appFooterHeight; // default height
			if(this.height === "inherit"){
				if(this.domNode.offsetParent){
					h = domGeom.getContentBox(this.domNode.offsetParent).h - domGeom.getBorderExtents(this.domNode).h + "px";
				}
			}else if(this.height === "auto"){
				var parent = this.domNode.offsetParent;
				if(parent){
					this.domNode.style.height = "0px";
					var	parentRect = parent.getBoundingClientRect(),
						scrollableRect = this.domNode.getBoundingClientRect(),
						contentBottom = parentRect.bottom - this._appFooterHeight - this._parentPadBorderExtentsBottom;
					if(scrollableRect.bottom >= contentBottom){ // use entire screen
						dh = screenHeight - (scrollableRect.top - parentRect.top) - this._appFooterHeight - this._parentPadBorderExtentsBottom;
					}else{ // stretch to fill predefined area
						dh = contentBottom - scrollableRect.bottom;
					}
				}
				// content could be smaller than entire screen height
				var contentHeight = Math.max(this.domNode.scrollHeight, this.containerNode.scrollHeight);
				h = (contentHeight ? Math.min(contentHeight, dh) : dh) + "px";
			}else if(this.height){
				h = this.height;
			}
			if(!h){
				h = dh + "px";
			}
			if(h.charAt(0) !== "-" && // to ensure that h is not negative (e.g. "-10px")
				h !== "default"){
				this.domNode.style.height = h;
			}

			if(!this._conn){
				// to ensure that the view is within a scrolling area when resized.
				this.onTouchEnd();
			}
		},

		onFlickAnimationStart: function(e){
			if(e){
				event.stop(e);
			}
		},

		onFlickAnimationEnd: function(e){
			if(has("ios")){
				this._keepInputCaretInActiveElement();
			}
			if(e){
				var an = e.animationName;
				if(an && an.indexOf("scrollableViewScroll2") === -1){
					if(an.indexOf("scrollableViewScroll0") !== -1){ // scrollBarV
						if(this._scrollBarNodeV){ domClass.remove(this._scrollBarNodeV, "mblScrollableScrollTo0"); }
					}else if(an.indexOf("scrollableViewScroll1") !== -1){ // scrollBarH
						if(this._scrollBarNodeH){ domClass.remove(this._scrollBarNodeH, "mblScrollableScrollTo1"); }
					}else{ // fade or others
						if(this._scrollBarNodeV){ this._scrollBarNodeV.className = ""; }
						if(this._scrollBarNodeH){ this._scrollBarNodeH.className = ""; }
					}
					return;
				}
				if(this._useTransformTransition || this._useTopLeft){
					var n = e.target;
					if(n === this._scrollBarV || n === this._scrollBarH){
						var cls = "mblScrollableScrollTo" + (n === this._scrollBarV ? "0" : "1");
						if(domClass.contains(n, cls)){
							domClass.remove(n, cls);
						}else{
							n.className = "";
						}
						return;
					}
				}
				if(e.srcElement){
					event.stop(e);
				}
			}
			this.stopAnimation();
			if(this._bounce){
				var _this = this;
				var bounce = _this._bounce;
				setTimeout(function(){
					_this.slideTo(bounce, 0.3, "ease-out");
				}, 0);
				_this._bounce = undefined;
			}else{
				this.hideScrollBar();
				this.removeCover();
			}
		},

		isFormElement: function(/*DOMNode*/node){
			// summary:
			//		Returns true if the given node is a form control.
			if(node && node.nodeType !== 1){ node = node.parentNode; }
			if(!node || node.nodeType !== 1){ return false; }
			var t = node.tagName;
			return (t === "SELECT" || t === "INPUT" || t === "TEXTAREA" || t === "BUTTON");
		},

		onTouchStart: function(e){
			// summary:
			//		User-defined function to handle touchStart events.
			if(this.disableTouchScroll){ return; }
			if(this._conn && (new Date()).getTime() - this.startTime < 500){
				return; // ignore successive onTouchStart calls
			}
			if(!this._conn){
				this._conn = [];
				this._conn.push(connect.connect(win.doc, touch.move, this, "onTouchMove"));
				this._conn.push(connect.connect(win.doc, touch.release, this, "onTouchEnd"));
			}

			this._aborted = false;
			if(domClass.contains(this.containerNode, "mblScrollableScrollTo2")){
				this.abort();
			}else{ // reset scrollbar class especially for reseting fade-out animation
				if(this._scrollBarNodeV){ this._scrollBarNodeV.className = ""; }
				if(this._scrollBarNodeH){ this._scrollBarNodeH.className = ""; }
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			this.startTime = (new Date()).getTime();
			this.startPos = this.getPos();
			this._dim = this.getDim();
			this._time = [0];
			this._posX = [this.touchStartX];
			this._posY = [this.touchStartY];
			this._locked = false;
			this._moved = false;

			this._preventDefaultInNextTouchMove = true; // #17502
			if(!this.isFormElement(e.target)){
				// Call preventDefault to avoid browser scroll, except for form elements 
				// for which doing it in touch.press would forbid the virtual keyboard 
				// from showing up (for form elements which are text widgets, preventDefault
				// is called in touch.move). 
				this.propagatable ? e.preventDefault() : event.stop(e);
				this._preventDefaultInNextTouchMove = false;
			}
		},

		onTouchMove: function(e){
			// summary:
			//		User-defined function to handle touchMove events.
			if(this._locked){ return; }
			
			if(this._preventDefaultInNextTouchMove){ // #17502
				this._preventDefaultInNextTouchMove = false; // only in the first touch.move
				var enclosingWidget = registry.getEnclosingWidget(
					// On touch-enabled devices, e.target can be different in touch.move than in
					// touch.start. Hence:
					((e.targetTouches && e.targetTouches.length === 1) ? e.targetTouches[0] : e).target);
				if(enclosingWidget && enclosingWidget.isInstanceOf(TextBoxMixin)){
					// For touches on text widgets for which e.preventDefault() has not been
					// called in onTouchStart, call it in onTouchMove() to avoid browser scroll.
					// Not done on other elements such that for instance a native slider
					// can still handle touchmove events.
					this.propagatable ? e.preventDefault() : event.stop(e);
				}
			}
			
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			var dx = x - this.touchStartX;
			var dy = y - this.touchStartY;
			var to = {x:this.startPos.x + dx, y:this.startPos.y + dy};
			var dim = this._dim;

			dx = Math.abs(dx);
			dy = Math.abs(dy);
			if(this._time.length == 1){ // the first TouchMove after TouchStart
				if(this.dirLock){
					if(this._v && !this._h && dx >= this.threshold && dx >= dy ||
						(this._h || this._f) && !this._v && dy >= this.threshold && dy >= dx){
						this._locked = true;
						return;
					}
				}
				if(this._v && this._h){ // scrollDir="hv"
					if(dy < this.threshold &&
						dx < this.threshold){
						return;
					}
				}else{
					if(this._v && dy < this.threshold ||
						(this._h || this._f) && dx < this.threshold){
						return;
					}
				}
				this._moved = true;
				this.addCover();
				this.showScrollBar();
			}

			var weight = this.weight;
			if(this._v && this.constraint){
				if(to.y > 0){ // content is below the screen area
					to.y = Math.round(to.y * weight);
				}else if(to.y < -dim.o.h){ // content is above the screen area
					if(dim.c.h < dim.d.h){ // content is shorter than display
						to.y = Math.round(to.y * weight);
					}else{
						to.y = -dim.o.h - Math.round((-dim.o.h - to.y) * weight);
					}
				}
			}
			if((this._h || this._f) && this.constraint){
				if(to.x > 0){
					to.x = Math.round(to.x * weight);
				}else if(to.x < -dim.o.w){
					if(dim.c.w < dim.d.w){
						to.x = Math.round(to.x * weight);
					}else{
						to.x = -dim.o.w - Math.round((-dim.o.w - to.x) * weight);
					}
				}
			}
			this.scrollTo(to);

			var max = 10;
			var n = this._time.length; // # of samples
			if(n >= 2){
				this._moved = true;
				// Check the direction of the finger move.
				// If the direction has been changed, discard the old data.
				var d0, d1;
				if(this._v && !this._h){
					d0 = this._posY[n - 1] - this._posY[n - 2];
					d1 = y - this._posY[n - 1];
				}else if(!this._v && this._h){
					d0 = this._posX[n - 1] - this._posX[n - 2];
					d1 = x - this._posX[n - 1];
				}
				if(d0 * d1 < 0){ // direction changed
					// leave only the latest data
					this._time = [this._time[n - 1]];
					this._posX = [this._posX[n - 1]];
					this._posY = [this._posY[n - 1]];
					n = 1;
				}
			}
			if(n == max){
				this._time.shift();
				this._posX.shift();
				this._posY.shift();
			}
			this._time.push((new Date()).getTime() - this.startTime);
			this._posX.push(x);
			this._posY.push(y);
		},

		_keepInputCaretInActiveElement: function(){
			var activeElement = win.doc.activeElement;
			var initialValue;
			if(activeElement && (activeElement.tagName == "INPUT" || activeElement.tagName == "TEXTAREA")){
				initialValue = activeElement.value;
				if(activeElement.type == "number" || activeElement.type == "week"){
					if(initialValue){
						activeElement.value = activeElement.value + 1;
					}else{
						activeElement.value = (activeElement.type == "week") ? "2013-W10" : 1;
					}
					activeElement.value = initialValue;
				}else{
					activeElement.value = activeElement.value + " ";
					activeElement.value = initialValue;
				}
			}
		},

		onTouchEnd: function(/*Event*/e){
			// summary:
			//		User-defined function to handle touchEnd events.
			if(this._locked){ return; }
			var speed = this._speed = {x:0, y:0};
			var dim = this._dim;
			var pos = this.getPos();
			var to = {}; // destination
			if(e){
				if(!this._conn){ return; } // if we get onTouchEnd without onTouchStart, ignore it.
				for(var i = 0; i < this._conn.length; i++){
					connect.disconnect(this._conn[i]);
				}
				this._conn = null;

				var clicked = false;
				if(!this._aborted && !this._moved){
					clicked = true;
				}
				if(clicked){ // clicked, not dragged or flicked
					this.hideScrollBar();
					this.removeCover();
					// need to send a synthetic click?
					if(has("touch") && has("clicks-prevented") && !this.isFormElement(e.target)){
						var elem = e.target;
						if(elem.nodeType != 1){
							elem = elem.parentNode;
						}
						setTimeout(function(){
							dm._sendClick(elem, e);
						});
					}
					return;
				}
				speed = this._speed = this.getSpeed();
			}else{
				if(pos.x == 0 && pos.y == 0){ return; } // initializing
				dim = this.getDim();
			}

			if(this._v){
				to.y = pos.y + speed.y;
			}
			if(this._h || this._f){
				to.x = pos.x + speed.x;
			}

			if(this.adjustDestination(to, pos, dim) === false){ return; }
			if(this.constraint){
				if(this.scrollDir == "v" && dim.c.h < dim.d.h){ // content is shorter than display
					this.slideTo({y:0}, 0.3, "ease-out"); // go back to the top
					return;
				}else if(this.scrollDir == "h" && dim.c.w < dim.d.w){ // content is narrower than display
					this.slideTo({x:0}, 0.3, "ease-out"); // go back to the left
					return;
				}else if(this._v && this._h && dim.c.h < dim.d.h && dim.c.w < dim.d.w){
					this.slideTo({x:0, y:0}, 0.3, "ease-out"); // go back to the top-left
					return;
				}
			}

			var duration, easing = "ease-out";
			var bounce = {};
			if(this._v && this.constraint){
				if(to.y > 0){ // going down. bounce back to the top.
					if(pos.y > 0){ // started from below the screen area. return quickly.
						duration = 0.3;
						to.y = 0;
					}else{
						to.y = Math.min(to.y, 20);
						easing = "linear";
						bounce.y = 0;
					}
				}else if(-speed.y > dim.o.h - (-pos.y)){ // going up. bounce back to the bottom.
					if(pos.y < -dim.o.h){ // started from above the screen top. return quickly.
						duration = 0.3;
						to.y = dim.c.h <= dim.d.h ? 0 : -dim.o.h; // if shorter, move to 0
					}else{
						to.y = Math.max(to.y, -dim.o.h - 20);
						easing = "linear";
						bounce.y = -dim.o.h;
					}
				}
			}
			if((this._h || this._f) && this.constraint){
				if(to.x > 0){ // going right. bounce back to the left.
					if(pos.x > 0){ // started from right of the screen area. return quickly.
						duration = 0.3;
						to.x = 0;
					}else{
						to.x = Math.min(to.x, 20);
						easing = "linear";
						bounce.x = 0;
					}
				}else if(-speed.x > dim.o.w - (-pos.x)){ // going left. bounce back to the right.
					if(pos.x < -dim.o.w){ // started from left of the screen top. return quickly.
						duration = 0.3;
						to.x = dim.c.w <= dim.d.w ? 0 : -dim.o.w; // if narrower, move to 0
					}else{
						to.x = Math.max(to.x, -dim.o.w - 20);
						easing = "linear";
						bounce.x = -dim.o.w;
					}
				}
			}
			this._bounce = (bounce.x !== undefined || bounce.y !== undefined) ? bounce : undefined;

			if(duration === undefined){
				var distance, velocity;
				if(this._v && this._h){
					velocity = Math.sqrt(speed.x*speed.x + speed.y*speed.y);
					distance = Math.sqrt(Math.pow(to.y - pos.y, 2) + Math.pow(to.x - pos.x, 2));
				}else if(this._v){
					velocity = speed.y;
					distance = to.y - pos.y;
				}else if(this._h){
					velocity = speed.x;
					distance = to.x - pos.x;
				}
				if(distance === 0 && !e){ return; } // #13154
				duration = velocity !== 0 ? Math.abs(distance / velocity) : 0.01; // time = distance / velocity
			}
			this.slideTo(to, duration, easing);
		},

		adjustDestination: function(/*Object*/to, /*Object*/pos, /*Object*/dim){
			// summary:
			//		A stub function to be overridden by subclasses.
			// description:
			//		This function is called from onTouchEnd(). The purpose is to give its
			//		subclasses a chance to adjust the destination position. If this
			//		function returns false, onTouchEnd() returns immediately without
			//		performing scroll.
			// to:
			//		The destination position. An object with x and y.
			// pos:
			//		The current position. An object with x and y.
			// dim:
			//		Dimension information returned by getDim().			

			// subclass may want to implement
			return true; // Boolean
		},

		abort: function(){
			// summary:
			//		Aborts scrolling.
			// description:
			//		This function stops the scrolling animation that is currently
			//		running. It is called when the user touches the screen while
			//		scrolling.
			this._aborted = true;
			this.scrollTo(this.getPos());
			this.stopAnimation();
		},

		stopAnimation: function(){
			// summary:
			//		Stops the currently running animation.
			domClass.remove(this.containerNode, "mblScrollableScrollTo2");
			if(this._scrollBarV){
				this._scrollBarV.className = "";
			}
			if(this._scrollBarH){
				this._scrollBarH.className = "";
			}
			if(this._useTransformTransition || this._useTopLeft){
				this.containerNode.style[css3.name("transition")] = "";
				if(this._scrollBarV) { this._scrollBarV.style[css3.name("transition")] = ""; }
				if(this._scrollBarH) { this._scrollBarH.style[css3.name("transition")] = ""; }
			}
		},

		scrollIntoView: function(/*DOMNode*/node, /*Boolean?*/alignWithTop, /*Number?*/duration){
			// summary:
			//		Scrolls the pane until the searching node is in the view.
			// node:
			//		A DOM node to be searched for view.
			// alignWithTop:
			//		If true, aligns the node at the top of the pane.
			//		If false, aligns the node at the bottom of the pane.
			// duration:
			//		Duration of scrolling in seconds. (ex. 0.3)
			//		If not specified, scrolls without animation.
			// description:
			//		Just like the scrollIntoView method of DOM elements, this
			//		function causes the given node to scroll into view, aligning it
			//		either at the top or bottom of the pane.

			if(!this._v){ return; } // cannot scroll vertically

			var c = this.containerNode,
				h = this.getDim().d.h, // the height of ScrollableView's content display area
				top = 0;

			// Get the top position of node relative to containerNode
			for(var n = node; n !== c; n = n.offsetParent){
				if(!n || n.tagName === "BODY"){ return; } // exit if node is not a child of scrollableView
				top += n.offsetTop;
			}
			// Calculate scroll destination position
			var y = alignWithTop ? Math.max(h - c.offsetHeight, -top) : Math.min(0, h - top - node.offsetHeight);

			// Scroll to destination position
			(duration && typeof duration === "number") ? 
				this.slideTo({y: y}, duration, "ease-out") : this.scrollTo({y: y});
		},

		getSpeed: function(){
			// summary:
			//		Returns an object that indicates the scrolling speed.
			// description:
			//		From the position and elapsed time information, calculates the
			//		scrolling speed, and returns an object with x and y.
			var x = 0, y = 0, n = this._time.length;
			// if the user holds the mouse or finger more than 0.5 sec, do not move.
			if(n >= 2 && (new Date()).getTime() - this.startTime - this._time[n - 1] < 500){
				var dy = this._posY[n - (n > 3 ? 2 : 1)] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
				var dx = this._posX[n - (n > 3 ? 2 : 1)] - this._posX[(n - 6) >= 0 ? n - 6 : 0];
				var dt = this._time[n - (n > 3 ? 2 : 1)] - this._time[(n - 6) >= 0 ? n - 6 : 0];
				y = this.calcSpeed(dy, dt);
				x = this.calcSpeed(dx, dt);
			}
			return {x:x, y:y};
		},

		calcSpeed: function(/*Number*/distance, /*Number*/time){
			// summary:
			//		Calculate the speed given the distance and time.
			return Math.round(distance / time * 100) * 4;
		},

		scrollTo: function(/*Object*/to, /*Boolean?*/doNotMoveScrollBar, /*DomNode?*/node){
			// summary:
			//		Scrolls to the given position immediately without animation.
			// to:
			//		The destination position. An object with x and y.
			//		ex. {x:0, y:-5}
			// doNotMoveScrollBar:
			//		If true, the scroll bar will not be updated. If not specified,
			//		it will be updated.
			// node:
			//		A DOM node to scroll. If not specified, defaults to
			//		this.containerNode.

			// scroll events
			var scrollEvent, beforeTopHeight, afterBottomHeight;
			var doScroll = true;
			if(!this._aborted && this._conn){ // No scroll event if the call to scrollTo comes from abort or onTouchEnd
				if(!this._dim){
					this._dim = this.getDim();
				}
				beforeTopHeight = (to.y > 0)?to.y:0;
				afterBottomHeight = (this._dim.o.h + to.y < 0)?-1 * (this._dim.o.h + to.y):0;
				scrollEvent = {bubbles: false,
						cancelable: false,
						x: to.x,
						y: to.y,
						beforeTop: beforeTopHeight > 0,
						beforeTopHeight: beforeTopHeight,
						afterBottom: afterBottomHeight > 0,
						afterBottomHeight: afterBottomHeight};
				// before scroll event
				doScroll = this.onBeforeScroll(scrollEvent);
			}
			
			if(doScroll){
				var s = (node || this.containerNode).style;
				if(has("css3-animations")){
					if(!this._useTopLeft){
						if(this._useTransformTransition){
							s[css3.name("transition")] = "";	
						}
						s[css3.name("transform")] = this.makeTranslateStr(to);
					}else{
						s[css3.name("transition")] = "";
						if(this._v){
							s.top = to.y + "px";
						}
						if(this._h || this._f){
							s.left = to.x + "px";
						}
					}
				}else{
					if(this._v){
						s.top = to.y + "px";
					}
					if(this._h || this._f){
						s.left = to.x + "px";
					}
				}
				if(has("ios")){
					this._keepInputCaretInActiveElement();
				}
				if(!doNotMoveScrollBar){
					this.scrollScrollBarTo(this.calcScrollBarPos(to));
				}
				if(scrollEvent){
					// After scroll event
					this.onAfterScroll(scrollEvent);
				}
			}
		},

		onBeforeScroll: function(/*Event*/e){
			// e: Event
			//		the scroll event, that contains the following attributes:
			//		x (x coordinate of the scroll destination),
			//		y (y coordinate of the scroll destination),
			//		beforeTop (a boolean that is true if the scroll detination is before the top of the scrollable),
			//		beforeTopHeight (the number of pixels before the top of the scrollable for the scroll destination),
			//		afterBottom (a boolean that is true if the scroll destination is after the bottom of the scrollable),
			//		afterBottomHeight (the number of pixels after the bottom of the scrollable for the scroll destination)
			// summary:
			//		called before a scroll is initiated. If this method returns false,
			//		the scroll is canceled.
			// tags:
			//		callback
			return true;
		},

		onAfterScroll: function(/*Event*/e){
			// e: Event
			//		the scroll event, that contains the following attributes:
			//		x (x coordinate of the scroll destination),
			//		y (y coordinate of the scroll destination),
			//		beforeTop (a boolean that is true if the scroll detination is before the top of the scrollable),
			//		beforeTopHeight (the number of pixels before the top of the scrollable for the scroll destination),
			//		afterBottom (a boolean that is true if the scroll destination is after the bottom of the scrollable),
			//		afterBottomHeight (the number of pixels after the bottom of the scrollable for the scroll destination)
			// summary:
			//		called after a scroll has been performed.
			// tags:
			//		callback
		},
		
		slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing){
			// summary:
			//		Scrolls to the given position with the slide animation.
			// to:
			//		The scroll destination position. An object with x and/or y.
			//		ex. {x:0, y:-5}, {y:-29}, etc.
			// duration:
			//		Duration of scrolling in seconds. (ex. 0.3)
			// easing:
			//		The name of easing effect which webkit supports.
			//		"ease", "linear", "ease-in", "ease-out", etc.

			this._runSlideAnimation(this.getPos(), to, duration, easing, this.containerNode, 2);
			this.slideScrollBarTo(to, duration, easing);
		},

		makeTranslateStr: function(/*Object*/to){
			// summary:
			//		Constructs a string value that is passed to the -webkit-transform property.
			// to:
			//		The destination position. An object with x and/or y.
			// description:
			//		Return value example: "translate3d(0px,-8px,0px)"

			var y = this._v && typeof to.y == "number" ? to.y+"px" : "0px";
			var x = (this._h||this._f) && typeof to.x == "number" ? to.x+"px" : "0px";
			return has("translate3d") ?
					"translate3d("+x+","+y+",0px)" : "translate("+x+","+y+")";
		},

		getPos: function(){
			// summary:
			//		Gets the top position in the midst of animation.
			if(has("css3-animations")){
				var s = win.doc.defaultView.getComputedStyle(this.containerNode, '');
				if(!this._useTopLeft){
					var m = s[css3.name("transform")];
					if(m && m.indexOf("matrix") === 0){
						var arr = m.split(/[,\s\)]+/);
						// IE10 returns a matrix3d
						var i = m.indexOf("matrix3d") === 0 ? 12 : 4;
						return {y:arr[i+1] - 0, x:arr[i] - 0};
					}
					return {x:0, y:0};
				}else{
					return {x:parseInt(s.left) || 0, y:parseInt(s.top) || 0};
				}
			}else{
				// this.containerNode.offsetTop does not work here,
				// because it adds the height of the top margin.
				var y = parseInt(this.containerNode.style.top) || 0;
				return {y:y, x:this.containerNode.offsetLeft};
			}
		},

		getDim: function(){
			// summary:
			//		Returns various internal dimensional information needed for calculation.

			var d = {};
			// content width/height
			d.c = {h:this.containerNode.offsetHeight, w:this.containerNode.offsetWidth};

			// view width/height
			d.v = {h:this.domNode.offsetHeight + this._appFooterHeight, w:this.domNode.offsetWidth};

			// display width/height
			d.d = {h:d.v.h - this.fixedHeaderHeight - this.fixedFooterHeight - this._appFooterHeight, w:d.v.w};

			// overflowed width/height
			d.o = {h:d.c.h - d.v.h + this.fixedHeaderHeight + this.fixedFooterHeight + this._appFooterHeight, w:d.c.w - d.v.w};
			return d;
		},

		showScrollBar: function(){
			// summary:
			//		Shows the scroll bar.
			// description:
			//		This function creates the scroll bar instance if it does not
			//		exist yet, and calls resetScrollBar() to reset its length and
			//		position.

			if(!this.scrollBar){ return; }

			var dim = this._dim;
			if(this.scrollDir == "v" && dim.c.h <= dim.d.h){ return; }
			if(this.scrollDir == "h" && dim.c.w <= dim.d.w){ return; }
			if(this._v && this._h && dim.c.h <= dim.d.h && dim.c.w <= dim.d.w){ return; }

			var createBar = function(self, dir){
				var bar = self["_scrollBarNode" + dir];
				if(!bar){
					var wrapper = domConstruct.create("div", null, self.domNode);
					var props = { position: "absolute", overflow: "hidden" };
					if(dir == "V"){
						props.right = "2px";
						props.width = "5px";
					}else{
						props.bottom = (self.isLocalFooter ? self.fixedFooterHeight : 0) + 2 + "px";
						props.height = "5px";
					}
					domStyle.set(wrapper, props);
					wrapper.className = "mblScrollBarWrapper";
					self["_scrollBarWrapper"+dir] = wrapper;

					bar = domConstruct.create("div", null, wrapper);
					domStyle.set(bar, css3.add({
						opacity: 0.6,
						position: "absolute",
						backgroundColor: "#606060",
						fontSize: "1px",
						MozBorderRadius: "2px",
						zIndex: 2147483647 // max of signed 32-bit integer
					}, {
						borderRadius: "2px",
						transformOrigin: "0 0"
					}));
					domStyle.set(bar, dir == "V" ? {width: "5px"} : {height: "5px"});
					self["_scrollBarNode" + dir] = bar;
				}
				return bar;
			};
			if(this._v && !this._scrollBarV){
				this._scrollBarV = createBar(this, "V");
			}
			if(this._h && !this._scrollBarH){
				this._scrollBarH = createBar(this, "H");
			}
			this.resetScrollBar();
		},

		hideScrollBar: function(){
			// summary:
			//		Hides the scroll bar.
			// description:
			//		If the fadeScrollBar property is true, hides the scroll bar with
			//		the fade animation.

			if(this.fadeScrollBar && has("css3-animations")){
				if(!dm._fadeRule){
					var node = domConstruct.create("style", null, win.doc.getElementsByTagName("head")[0]);
					node.textContent =
						".mblScrollableFadeScrollBar{"+
						"  " + css3.name("animation-duration", true) + ": 1s;"+
						"  " + css3.name("animation-name", true) + ": scrollableViewFadeScrollBar;}"+
						"@" + css3.name("keyframes", true) + " scrollableViewFadeScrollBar{"+
						"  from { opacity: 0.6; }"+
						"  to { opacity: 0; }}";
					dm._fadeRule = node.sheet.cssRules[1];
				}
			}
			if(!this.scrollBar){ return; }
			var f = function(bar, self){
				domStyle.set(bar, css3.add({
					opacity: 0
				}, {
					animationDuration: ""
				}));
				// do not use fade animation in case of using top/left on Android
				// since it causes screen flicker during adress bar's fading out
				if(!(self._useTopLeft && has('android'))){
					bar.className = "mblScrollableFadeScrollBar";
				}
			};
			if(this._scrollBarV){
				f(this._scrollBarV, this);
				this._scrollBarV = null;
			}
			if(this._scrollBarH){
				f(this._scrollBarH, this);
				this._scrollBarH = null;
			}
		},

		calcScrollBarPos: function(/*Object*/to){
			// summary:
			//		Calculates the scroll bar position.
			// description:
			//		Given the scroll destination position, calculates the top and/or
			//		the left of the scroll bar(s). Returns an object with x and y.
			// to:
			//		The scroll destination position. An object with x and y.
			//		ex. {x:0, y:-5}			

			var pos = {};
			var dim = this._dim;
			var f = function(wrapperH, barH, t, d, c){
				var y = Math.round((d - barH - 8) / (d - c) * t);
				if(y < -barH + 5){
					y = -barH + 5;
				}
				if(y > wrapperH - 5){
					y = wrapperH - 5;
				}
				return y;
			};
			if(typeof to.y == "number" && this._scrollBarV){
				pos.y = f(this._scrollBarWrapperV.offsetHeight, this._scrollBarV.offsetHeight, to.y, dim.d.h, dim.c.h);
			}
			if(typeof to.x == "number" && this._scrollBarH){
				pos.x = f(this._scrollBarWrapperH.offsetWidth, this._scrollBarH.offsetWidth, to.x, dim.d.w, dim.c.w);
			}
			return pos;
		},

		scrollScrollBarTo: function(/*Object*/to){
			// summary:
			//		Moves the scroll bar(s) to the given position without animation.
			// to:
			//		The destination position. An object with x and/or y.
			//		ex. {x:2, y:5}, {y:20}, etc.

			if(!this.scrollBar){ return; }
			if(this._v && this._scrollBarV && typeof to.y == "number"){
				if(has("css3-animations")){
					if(!this._useTopLeft){
						if(this._useTransformTransition){
							this._scrollBarV.style[css3.name("transition")] = "";
						}
						this._scrollBarV.style[css3.name("transform")] = this.makeTranslateStr({y:to.y});
					}else{
						domStyle.set(this._scrollBarV, css3.add({
							top: to.y + "px"
						}, {
							transition: ""
						}));
					}
				}else{
					this._scrollBarV.style.top = to.y + "px";
				}
			}
			if(this._h && this._scrollBarH && typeof to.x == "number"){
				if(has("css3-animations")){
					if(!this._useTopLeft){
						if(this._useTransformTransition){
							this._scrollBarH.style[css3.name("transition")] = "";
						}
						this._scrollBarH.style[css3.name("transform")] = this.makeTranslateStr({x:to.x});
					}else{
						domStyle.set(this._scrollBarH, css3.add({
							left: to.x + "px"
						}, {
							transition: ""
						}));
					}
				}else{
					this._scrollBarH.style.left = to.x + "px";
				}
			}
		},

		slideScrollBarTo: function(/*Object*/to, /*Number*/duration, /*String*/easing){
			// summary:
			//		Moves the scroll bar(s) to the given position with the slide animation.
			// to:
			//		The destination position. An object with x and y.
			//		ex. {x:0, y:-5}
			// duration:
			//		Duration of the animation in seconds. (ex. 0.3)
			// easing:
			//		The name of easing effect which webkit supports.
			//		"ease", "linear", "ease-in", "ease-out", etc.

			if(!this.scrollBar){ return; }
			var fromPos = this.calcScrollBarPos(this.getPos());
			var toPos = this.calcScrollBarPos(to);
			if(this._v && this._scrollBarV){
				this._runSlideAnimation({y:fromPos.y}, {y:toPos.y}, duration, easing, this._scrollBarV, 0);
			}
			if(this._h && this._scrollBarH){
				this._runSlideAnimation({x:fromPos.x}, {x:toPos.x}, duration, easing, this._scrollBarH, 1);
			}
		},

		_runSlideAnimation: function(/*Object*/from, /*Object*/to, /*Number*/duration, /*String*/easing, /*DomNode*/node, /*Number*/idx){
			// tags:
			//		private
			
			// idx: 0:scrollbarV, 1:scrollbarH, 2:content
			if(has("css3-animations")){
				if(!this._useTopLeft){
					if(this._useTransformTransition){
						// for iOS6 (maybe others?): use -webkit-transform + -webkit-transition
						if(to.x === undefined){ to.x = from.x; }
						if(to.y === undefined){ to.y = from.y; }
						 // make sure we actually change the transform, otherwise no webkitTransitionEnd is fired.
						if(to.x !== from.x || to.y !== from.y){
							this.onFlickAnimationStart(); // needed because there is no transitionstart event.
							domStyle.set(node, css3.add({}, {
								transitionProperty: css3.name("transform"),
								transitionDuration: duration + "s",
								transitionTimingFunction: easing
							}));
							var t = this.makeTranslateStr(to);
							setTimeout(function(){ // setTimeout is needed to prevent webkitTransitionEnd not fired
								domStyle.set(node, css3.add({}, {
									transform: t
								}));
							}, 0);
							domClass.add(node, "mblScrollableScrollTo"+idx);
						} else {
							// transform not changed, just hide the scrollbar
							this.hideScrollBar();
							this.removeCover();
						}
					}else{
						// use -webkit-transform + -webkit-animation
						this.setKeyframes(from, to, idx);
						domStyle.set(node, css3.add({}, {
							animationDuration: duration + "s",
							animationTimingFunction: easing
						}));
						domClass.add(node, "mblScrollableScrollTo"+idx);
						if(idx == 2){
							this.scrollTo(to, true, node);
						}else{
							this.scrollScrollBarTo(to);
						}
					}
				}else if(to.x !== undefined || to.y !== undefined){
					this.onFlickAnimationStart(); // #17822: needed because there is no transitionstart event.
					domStyle.set(node, css3.add({}, {
						// #17822 when scrolling on one direction, avoid unnecessarily animating
						// both top and left, because this leads to two transitionend events fired 
						// instead of one in some browsers (Safari/iOS7 at least).
						transitionProperty: (to.x !== undefined && to.y !== undefined) ?
							"top, left" :
							to.y !== undefined ? "top" : "left",
						transitionDuration: duration + "s",
						transitionTimingFunction: easing
					}));
					setTimeout(function(){ // setTimeout is needed to prevent webkitTransitionEnd not fired
						var style = {};
						if(to.x !== undefined){
							style.left = to.x + "px";
						}
						if(to.y !== undefined){
							style.top = to.y + "px";
						}
						domStyle.set(node, style);
					}, 0);
					domClass.add(node, "mblScrollableScrollTo"+idx);
				}
			}else if(dojo.fx && dojo.fx.easing && duration){
				// If you want to support non-webkit browsers,
				// your application needs to load necessary modules as follows:
				//
				// | dojo.require("dojo.fx");
				// | dojo.require("dojo.fx.easing");
				//
				// This module itself does not make dependency on them.
				// TODO: for 2.0 the dojo global is going away. Use require("dojo/fx") and require("dojo/fx/easing") instead.
				
				var self = this;
				var s = dojo.fx.slideTo({
					node: node,
					duration: duration*1000,
					left: to.x,
					top: to.y,
					easing: (easing == "ease-out") ? dojo.fx.easing.quadOut : dojo.fx.easing.linear,
					onBegin: function(){ // #17822
						if(idx == 2){
							self.onFlickAnimationStart();
						}
					},
					onEnd: function(){
						if(idx == 2){
							self.onFlickAnimationEnd();
						}
					}
				}).play();
			}else{
				// directly jump to the destination without animation
				if(idx == 2){
					this.onFlickAnimationStart(); // #17822
					this.scrollTo(to, false, node);
					this.onFlickAnimationEnd();
				}else{
					this.scrollScrollBarTo(to);
				}
			}
		},

		resetScrollBar: function(){
			// summary:
			//		Resets the scroll bar length, position, etc.
			var f = function(wrapper, bar, d, c, hd, v){
				if(!bar){ return; }
				var props = {};
				props[v ? "top" : "left"] = hd + 4 + "px"; // +4 is for top or left margin
				var t = (d - 8) <= 0 ? 1 : d - 8;
				props[v ? "height" : "width"] = t + "px";
				domStyle.set(wrapper, props);
				var l = Math.round(d * d / c); // scroll bar length
				l = Math.min(Math.max(l - 8, 5), t); // -8 is for margin for both ends
				bar.style[v ? "height" : "width"] = l + "px";
				domStyle.set(bar, {"opacity": 0.6});
			};
			var dim = this.getDim();
			f(this._scrollBarWrapperV, this._scrollBarV, dim.d.h, dim.c.h, this.fixedHeaderHeight, true);
			f(this._scrollBarWrapperH, this._scrollBarH, dim.d.w, dim.c.w, 0);
			this.createMask();
		},

		createMask: function(){
			// summary:
			//		Creates a mask for a scroll bar edge.
			// description:
			//		This function creates a mask that hides corners of one scroll
			//		bar edge to make it round edge. The other side of the edge is
			//		always visible and round shaped with the border-radius style.
			if(!(has("mask-image"))){ return; }
			if(this._scrollBarWrapperV){
				var h = this._scrollBarWrapperV.offsetHeight;
				maskUtils.createRoundMask(this._scrollBarWrapperV, 0, 0, 0, 0, 5, h, 2, 2, 0.5);
			}
			if(this._scrollBarWrapperH){
				var w = this._scrollBarWrapperH.offsetWidth;
				maskUtils.createRoundMask(this._scrollBarWrapperH, 0, 0, 0, 0, w, 5, 2, 2, 0.5);
			}
		},

		flashScrollBar: function(){
			// summary:
			//		Shows the scroll bar instantly.
			// description:
			//		This function shows the scroll bar, and then hides it 300ms
			//		later. This is used to show the scroll bar to the user for a
			//		short period of time when a hidden view is revealed.
			if(this.disableFlashScrollBar || !this.domNode){ return; }
			this._dim = this.getDim();
			if(this._dim.d.h <= 0){ return; } // dom is not ready
			this.showScrollBar();
			var _this = this;
			setTimeout(function(){
				_this.hideScrollBar();
			}, 300);
		},

		addCover: function(){
			// summary:
			//		Adds the transparent DIV cover.
			// description:
			//		The cover is to prevent DOM events from affecting the child
			//		widgets such as a list widget. Without the cover, for example,
			//		child widgets may receive a click event and respond to it
			//		unexpectedly when the user flicks the screen to scroll.
			//		Note that only the desktop browsers need the cover.

			if(!has("touch") && !this.noCover){
				if(!dm._cover){
					dm._cover = domConstruct.create("div", null, win.doc.body);
					dm._cover.className = "mblScrollableCover";
					domStyle.set(dm._cover, {
						backgroundColor: "#ffff00",
						opacity: 0,
						position: "absolute",
						top: "0px",
						left: "0px",
						width: "100%",
						height: "100%",
						zIndex: 2147483647 // max of signed 32-bit integer
					});
					this._ch.push(connect.connect(dm._cover, touch.press, this, "onTouchEnd"));
				}else{
					dm._cover.style.display = "";
				}
				this.setSelectable(dm._cover, false);
				this.setSelectable(this.domNode, false);
			}
		},

		removeCover: function(){
			// summary:
			//		Removes the transparent DIV cover.

			if(!has("touch") && dm._cover){
				dm._cover.style.display = "none";
				this.setSelectable(dm._cover, true);
				this.setSelectable(this.domNode, true);
			}
		},

		setKeyframes: function(/*Object*/from, /*Object*/to, /*Number*/idx){
			// summary:
			//		Programmatically sets key frames for the scroll animation.

			if(!dm._rule){
				dm._rule = [];
			}
			// idx: 0:scrollbarV, 1:scrollbarH, 2:content
			if(!dm._rule[idx]){
				var node = domConstruct.create("style", null, win.doc.getElementsByTagName("head")[0]);
				node.textContent =
					".mblScrollableScrollTo"+idx+"{" + css3.name("animation-name", true) + ": scrollableViewScroll"+idx+";}"+
					"@" + css3.name("keyframes", true) + " scrollableViewScroll"+idx+"{}";
				dm._rule[idx] = node.sheet.cssRules[1];
			}
			var rule = dm._rule[idx];
			if(rule){
				if(from){
					rule.deleteRule(has("webkit")?"from":0);
					(rule.insertRule||rule.appendRule).call(rule, "from { " + css3.name("transform", true) + ": "+this.makeTranslateStr(from)+"; }");
				}
				if(to){
					if(to.x === undefined){ to.x = from.x; }
					if(to.y === undefined){ to.y = from.y; }
					rule.deleteRule(has("webkit")?"to":1);
					(rule.insertRule||rule.appendRule).call(rule, "to { " + css3.name("transform", true) + ": "+this.makeTranslateStr(to)+"; }");
				}
			}
		},

		setSelectable: function(/*DomNode*/node, /*Boolean*/selectable){
			// summary:
			//		Sets the given node as selectable or unselectable.
			 
			// dojo.setSelectable has dependency on dojo.query. Redefine our own.
			node.style.KhtmlUserSelect = selectable ? "auto" : "none";
			node.style.MozUserSelect = selectable ? "" : "none";
			node.onselectstart = selectable ? null : function(){return false;};
			if(has("ie")){
				node.unselectable = selectable ? "" : "on";
				var nodes = node.getElementsByTagName("*");
				for(var i = 0; i < nodes.length; i++){
					nodes[i].unselectable = selectable ? "" : "on";
				}
			}
		}
	});
	Scrollable = has("dojo-bidi") ? declare("dojox.mobile.Scrollable", [Scrollable, BidiScrollable]) : Scrollable;
	lang.setObject("dojox.mobile.scrollable", Scrollable);

	return Scrollable;
});

},
'dojox/mobile/DatePicker':function(){
define([
	"dojo/_base/lang",
	"./_PickerChooser!DatePicker"
], function(lang, DatePicker){

	// module:
	//		dojox/mobile/DatePicker

	// TODO: need to list all the properties/methods in the interface provided by
	// SpinWheelDatePicker / ValuePickerDatePicker
		
	/*=====
	return function(){
		// summary:
		//		A wrapper widget around SpinWheelDatePicker or ValuePickerDatePicker.
		//		It should be used with the automatic theme loader, dojox/mobile/deviceTheme.
		//		Returns ValuePickerDatePicker when the current theme is "android" or "holodark".
		//		Returns SpinWheelDatePicker otherwise.
	};
	=====*/
	return lang.setObject("dojox.mobile.DatePicker", DatePicker);
});

},
'dojox/mobile/SpinWheelDatePicker':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"./_DatePickerMixin",
	"./SpinWheel",
	"./SpinWheelSlot"
], function(array, declare, domClass, DatePickerMixin, SpinWheel, SpinWheelSlot){

	// module:
	//		dojox/mobile/SpinWheelDatePicker

	return declare("dojox.mobile.SpinWheelDatePicker", [SpinWheel, DatePickerMixin], {
		// summary:
		//		A SpinWheel-based date picker widget.
		// description:
		//		SpinWheelDatePicker is a date picker widget. It is a subclass of
		//		dojox/mobile/SpinWheel. It has three slots: year, month, and day.

		slotClasses: [
			SpinWheelSlot,
			SpinWheelSlot,
			SpinWheelSlot
		],

		slotProps: [
			{labelFrom:1970, labelTo:2038},
			{},
			{}
		],

		buildRendering: function(){
			this.initSlots();
			this.inherited(arguments);
			domClass.add(this.domNode, "mblSpinWheelDatePicker");
			this._conn = [
				this.connect(this.slots[0], "onFlickAnimationEnd", "_onYearSet"),
				this.connect(this.slots[1], "onFlickAnimationEnd", "_onMonthSet"),
				this.connect(this.slots[2], "onFlickAnimationEnd", "_onDaySet")
			];
		},

		disableValues: function(/*Number*/daysInMonth){
			// summary:
			//		Disables the end days of the month to match the specified
			//		number of days of the month.
			array.forEach(this.slots[2].panelNodes, function(panel){
				for(var i = 27; i < 31; i++){
					domClass.toggle(panel.childNodes[i], "mblSpinWheelSlotLabelGray", i >= daysInMonth);
				}
			});
		}
	});
});

},
'dojox/mobile/Accordion':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./iconUtils",
	"./lazyLoadUtils",
	"./_css3",
	"./common",
	"require",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Accordion"
], function(array, declare, lang, has, domClass, domConstruct, domAttr, Contained, Container, WidgetBase, iconUtils, lazyLoadUtils, css3, common, require, BidiAccordion){

	// module:
	//		dojox/mobile/Accordion

	// inner class
	var _AccordionTitle = declare([WidgetBase, Contained], {
		// summary:
		//		A widget for the title of the accordion.
	
		// label: String
		//		The title of the accordion.
		label: "Label",
		
		// icon1: String
		//		A path for the unselected (typically dark) icon. If icon is not
		//		specified, the iconBase parameter of the parent widget is used.
		icon1: "",

		// icon2: String
		//		A path for the selected (typically highlight) icon. If icon is
		//		not specified, the iconBase parameter of the parent widget or
		//		icon1 is used.
		icon2: "",

		// iconPos1: String
		//		The position of an aggregated unselected (typically dark)
		//		icon. IconPos1 is a comma-separated list of values like
		//		top,left,width,height (ex. "0,0,29,29"). If iconPos1 is not
		//		specified, the iconPos parameter of the parent widget is used.
		iconPos1: "",

		// iconPos2: String
		//		The position of an aggregated selected (typically highlight)
		//		icon. IconPos2 is a comma-separated list of values like
		//		top,left,width,height (ex. "0,0,29,29"). If iconPos2 is not
		//		specified, the iconPos parameter of the parent widget or
		//		iconPos1 is used.
		iconPos2: "",

		// selected: Boolean
		//		If true, the widget is in the selected state.
		selected: false,

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblAccordionTitle",

		buildRendering: function(){
			this.inherited(arguments);

			var a = this.anchorNode = domConstruct.create("a", {
				className: "mblAccordionTitleAnchor",
				role: "presentation"
			}, this.domNode);

			// text box
			this.textBoxNode = domConstruct.create("div", {className:"mblAccordionTitleTextBox"}, a);
			this.labelNode = domConstruct.create("span", {
				className: "mblAccordionTitleLabel",
				innerHTML: this._cv ? this._cv(this.label) : this.label
			}, this.textBoxNode);
			this._isOnLine = this.inheritParams();

			domAttr.set(this.textBoxNode, "role", "tab"); // A11Y
			domAttr.set(this.textBoxNode, "tabindex", "0");
		},

		postCreate: function(){
			this.connect(this.domNode, "onclick", "_onClick");
			common.setSelectable(this.domNode, false);
		},

		inheritParams: function(){
			var parent = this.getParent();
			if(parent){
				if(this.icon1 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon1 = parent.iconBase + this.icon1;
				}
				if(!this.icon1){ this.icon1 = parent.iconBase; }
				if(!this.iconPos1){ this.iconPos1 = parent.iconPos; }
				if(this.icon2 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon2 = parent.iconBase + this.icon2;
				}
				if(!this.icon2){ this.icon2 = parent.iconBase || this.icon1; }
				if(!this.iconPos2){ this.iconPos2 = parent.iconPos || this.iconPos1; }
			}
			return !!parent;
		},

		_setIcon: function(icon, n){
			// tags:
			//		private
			if(!this.getParent()){ return; } // icon may be invalid because inheritParams is not called yet
			this._set("icon" + n, icon);
			if(!this["iconParentNode" + n]){
				this["iconParentNode" + n] = domConstruct.create("div",
					{className:"mblAccordionIconParent mblAccordionIconParent" + n}, this.anchorNode, "first");
			}
			this["iconNode" + n] = iconUtils.setIcon(icon, this["iconPos" + n],
				this["iconNode" + n], this.alt, this["iconParentNode" + n]);
			this["icon" + n] = icon;
			domClass.toggle(this.domNode, "mblAccordionHasIcon", icon && icon !== "none");
			if(has("dojo-bidi") && !this.getParent().isLeftToRight()){
				this.getParent()._setIconDir(this["iconParentNode" + n]);
			}
		},

		_setIcon1Attr: function(icon){
			// tags:
			//		private
			this._setIcon(icon, 1);
		},

		_setIcon2Attr: function(icon){
			// tags:
			//		private
			this._setIcon(icon, 2);
		},

		startup: function(){
			if(this._started){ return; }
			if(!this._isOnLine){
				this.inheritParams();
			}
			if(!this._isOnLine){
				this.set({ // retry applying the attribute
					icon1: this.icon1,
					icon2: this.icon2
				});
			}
			this.inherited(arguments);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.onClick(e) === false){ return; } // user's click action
			var p = this.getParent();
			if(!p.fixedHeight && this.contentWidget.domNode.style.display !== "none"){
				p.collapse(this.contentWidget, !p.animation);
			}else{
				p.expand(this.contentWidget, !p.animation);
			}
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks
			// tags:
			//		callback
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// tags:
			//		private
			domClass.toggle(this.domNode, "mblAccordionTitleSelected", selected);
			this._set("selected", selected);
		}
	});

	var Accordion = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiAccordion" : "dojox.mobile.Accordion", [WidgetBase, Container, Contained], {
		// summary:
		//		A container widget that can display a group of child panes in a stacked format.
		// description:
		//		Typically, dojox/mobile/Pane, dojox/mobile/Container, or dojox/mobile/ContentPane are 
		//		used as child widgets, but Accordion requires no specific child widget. 
		//		Accordion supports three modes for opening child panes: multiselect, fixed-height,
		//		and single-select. Accordion can have rounded corners, and it can lazy-load the 
		//		content modules.

		// iconBase: String
		//		The default icon path for child widgets.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child widgets.
		iconPos: "",

		// fixedHeight: Boolean
		//		If true, the entire accordion widget has fixed height regardless
		//		of the height of each pane; in this mode, there is always an open pane and
		//		collapsing a pane can only be done by opening a different pane.
		fixedHeight: false,

		// singleOpen: Boolean
		//		If true, only one pane is open at a time. The current open pane
		//		is collapsed, when another pane is opened.
		singleOpen: false,

		// animation: Boolean
		//		If true, animation is used when a pane is opened or
		//		collapsed. The animation works only on webkit browsers.
		animation: true,

		// roundRect: Boolean
		//		If true, the widget shows rounded corners.
		//		Adding the "mblAccordionRoundRect" class to domNode has the same effect.
		roundRect: false,

		/* internal properties */
		duration: .3, // [seconds]

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblAccordion",

		// _openSpace: [private] Number|String 
		_openSpace: 1,

		buildRendering: function(){
			this.inherited(arguments);
			domAttr.set(this.domNode, "role", "tablist"); // A11Y
			domAttr.set(this.domNode, "aria-multiselectable", !this.singleOpen); // A11Y
		},
		
		startup: function(){
			if(this._started){ return; }

			if(domClass.contains(this.domNode, "mblAccordionRoundRect")){
				this.roundRect = true;
			}else if(this.roundRect){
				domClass.add(this.domNode, "mblAccordionRoundRect");
			}

			if(this.fixedHeight){
				this.singleOpen = true;
			}
			var children = this.getChildren();
			array.forEach(children, this._setupChild, this);
			var sel;
			var posinset = 1;
			array.forEach(children, function(child){
				child.startup();
				child._at.startup();
				this.collapse(child, true);
				domAttr.set(child._at.textBoxNode, "aria-setsize", children.length);
				domAttr.set(child._at.textBoxNode, "aria-posinset", posinset++);
				if(child.selected){
					sel = child;
				}
			}, this);
			if(!sel && this.fixedHeight){
				sel = children[children.length - 1];
			}
			if(sel){
				this.expand(sel, true);
			}else{
				this._updateLast();
			}
			this.defer(function(){ this.resize(); });

			this._started = true;
		},

		_setupChild: function(/*Widget*/ child){
			// tags:
			//		private
			if(child.domNode.style.overflow != "hidden"){
				child.domNode.style.overflow = this.fixedHeight ? "auto" : "hidden";
			}
			child._at = new _AccordionTitle({
				label: child.label,
				alt: child.alt,
				icon1: child.icon1,
				icon2: child.icon2,
				iconPos1: child.iconPos1,
				iconPos2: child.iconPos2,
				contentWidget: child
			});
			domConstruct.place(child._at.domNode, child.domNode, "before");
			domClass.add(child.domNode, "mblAccordionPane");
			domAttr.set(child._at.textBoxNode, "aria-controls", child.domNode.id); // A11Y
			domAttr.set(child.domNode, "role", "tabpanel"); // A11Y
			domAttr.set(child.domNode, "aria-labelledby", child._at.id); // A11Y
		},

		addChild: function(/*Widget*/ widget, /*int?*/ insertIndex){
			this.inherited(arguments);
			if(this._started){
				this._setupChild(widget);
				widget._at.startup();
				if(widget.selected){
					this.expand(widget, true);
					this.defer(function(){
						widget.domNode.style.height = "";
					});
				}else{
					this.collapse(widget);
				}
				this._addChildAriaAttrs();
			}
		},

		removeChild: function(/*Widget|int*/ widget){
			if(typeof widget == "number"){
				widget = this.getChildren()[widget];
			}
			if(widget){
				widget._at.destroy();
			}
			this.inherited(arguments);
			this._addChildAriaAttrs();
		},
		
		_addChildAriaAttrs: function(){
			var posinset = 1;
			var children = this.getChildren();
			array.forEach(children, function(child){
				domAttr.set(child._at.textBoxNode, "aria-posinset", posinset++);
				domAttr.set(child._at.textBoxNode, "aria-setsize", children.length);
			});
		},

		getChildren: function(){
			return array.filter(this.inherited(arguments), function(child){
				return !(child instanceof _AccordionTitle);
			});
		},

		getSelectedPanes: function(){
			return array.filter(this.getChildren(), function(pane){
				return pane.domNode.style.display != "none";
			});
		},

		resize: function(){
			if(this.fixedHeight){
				var panes = array.filter(this.getChildren(), function(child){ // active pages
					return child._at.domNode.style.display != "none";
				});
				var openSpace = this.domNode.clientHeight; // height of all panes
				array.forEach(panes, function(child){
					openSpace -= child._at.domNode.offsetHeight;
				});
				this._openSpace = openSpace > 0 ? openSpace : 0;
				var sel = this.getSelectedPanes()[0];
				sel.domNode.style[css3.name("transition")] = "";
				sel.domNode.style.height = this._openSpace + "px";
			}
		},

		_updateLast: function(){
			// tags:
			//		private
			var children = this.getChildren();
			array.forEach(children, function(c, i){
				// add "mblAccordionTitleLast" to the last, closed accordion title
				domClass.toggle(c._at.domNode, "mblAccordionTitleLast",
					i === children.length - 1 && !domClass.contains(c._at.domNode, "mblAccordionTitleSelected"))
			}, this);
		},

		expand: function(/*Widget*/pane, /*boolean*/noAnimation){
			// summary:
			//		Expands the given pane to make it visible.
			// pane:
			//		A pane widget to expand.
			// noAnimation:
			//		If true, the pane expands immediately without animation effect.
			if(pane.lazy){
				lazyLoadUtils.instantiateLazyWidgets(pane.containerNode, pane.requires);
				pane.lazy = false;
			}
			var children = this.getChildren();
			array.forEach(children, function(c, i){
				c.domNode.style[css3.name("transition")] = noAnimation ? "" : "height "+this.duration+"s linear";
				if(c === pane){
					c.domNode.style.display = "";
					var h;
					if(this.fixedHeight){
						h = this._openSpace;
					}else{
						h = parseInt(c.height || c.domNode.getAttribute("height")); // ScrollableView may have the height property
						if(!h){
							c.domNode.style.height = "";
							h = c.domNode.offsetHeight;
							c.domNode.style.height = "0px";
						}
					}
					this.defer(function(){ // necessary for webkitTransition to work
						c.domNode.style.height = h + "px";
					});
					this.select(pane);
				}else if(this.singleOpen){
					this.collapse(c, noAnimation);
				}
			}, this);
			this._updateLast();
			domAttr.set(pane.domNode, "aria-expanded", "true"); // A11Y
			domAttr.set(pane.domNode, "aria-hidden", "false"); // A11Y
		},

		collapse: function(/*Widget*/pane, /*boolean*/noAnimation){
			// summary:
			//		Collapses the given pane to close it.
			// pane:
			//		A pane widget to collapse.
			// noAnimation:
			//		If true, the pane collapses immediately without animation effect.
			if(pane.domNode.style.display === "none"){ return; } // already collapsed
			pane.domNode.style[css3.name("transition")] = noAnimation ? "" : "height "+this.duration+"s linear";
			pane.domNode.style.height = "0px";
			if(!has("css3-animations") || noAnimation){
				pane.domNode.style.display = "none";
				this._updateLast();
			}else{
				// Adding a webkitTransitionEnd handler to panes may cause conflict
				// when the panes already have the one. (e.g. ScrollableView)
				var _this = this;
				_this.defer(function(){
					pane.domNode.style.display = "none";
					_this._updateLast();

					// Need to call parent view's resize() especially when the Accordion is
					// on a ScrollableView, the ScrollableView is scrolled to
					// the bottom, and then expand any other pane while in the
					// non-fixed singleOpen mode.
					if(!_this.fixedHeight && _this.singleOpen){
						for(var v = _this.getParent(); v; v = v.getParent()){
							if(domClass.contains(v.domNode, "mblView")){
								if(v && v.resize){ v.resize(); }
								break;
							}
						}
					}
				}, this.duration*1000);
			}
			this.deselect(pane);
			domAttr.set(pane.domNode, "aria-expanded", "false"); // A11Y
			domAttr.set(pane.domNode, "aria-hidden", "true"); // A11Y
		},

		select: function(/*Widget*/pane){
			// summary:
			//		Highlights the title bar of the given pane.
			// pane:
			//		A pane widget to highlight.
			pane._at.set("selected", true);
			domAttr.set(pane._at.textBoxNode, "aria-selected", "true"); // A11Y
		},

		deselect: function(/*Widget*/pane){
			// summary:
			//		Unhighlights the title bar of the given pane.
			// pane:
			//		A pane widget to unhighlight.
			pane._at.set("selected", false);
			domAttr.set(pane._at.textBoxNode, "aria-selected", "false"); // A11Y
		}
	});
	
	Accordion.ChildWidgetProperties = {
		// summary:
		//		These properties can be specified for the children of a dojox/mobile/Accordion.

		// alt: String
		//		The alternate text of the Accordion title.
		alt: "",
		// label: String
		//		The label of the Accordion title.
		label: "",
		// icon1: String
		//		The unselected icon of the Accordion title.
		icon1: "",
		// icon2: String
		//		The selected icon of the Accordion title.
		icon2: "",
		// iconPos1: String
		//		The position ("top,left,width,height") of the unselected aggregated icon of the Accordion title.
		iconPos1: "",
		// iconPos2: String
		//		The position ("top,left,width,height") of the selected aggregated icon of the Accordion title.
		iconPos2: "",
		// selected: Boolean
		//		The selected state of the Accordion title.
		selected: false,
		// lazy: Boolean
		//		Specifies that the Accordion child must be lazily loaded.
		lazy: false
	};

	// Since any widget can be specified as an Accordion child, mix ChildWidgetProperties
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	lang.extend(WidgetBase, /*===== {} || =====*/ Accordion.ChildWidgetProperties);

	return has("dojo-bidi") ? declare("dojox.mobile.Accordion", [Accordion, BidiAccordion]) : Accordion;
});

},
'dojox/mobile/TreeView':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dijit/registry",
	"./Heading",
	"./ListItem",
	"./ProgressIndicator",
	"./RoundRectList",
	"./ScrollableView",
	"./viewRegistry",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/TreeView"
], function(kernel, array, declare, lang, win, domConstruct, registry, Heading, ListItem, ProgressIndicator, RoundRectList, ScrollableView, viewRegistry, has, BidiTreeView){

	// module:
	//		dojox/mobile/TreeView

	kernel.experimental("dojox.mobile.TreeView");

	var TreeView = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTreeView" : "dojox.mobile.TreeView", ScrollableView, {
		// summary:
		//		A scrollable view with tree-style navigation.
		// description:
		//		This widget can be connected to a dojox/data/FileStore as a
		//		quick directory browser. You may use it when implementing the
		//		Master-Detail pattern.

		postCreate: function(){
			this._load();
			this.inherited(arguments);
		},
		
		_customizeListItem: function(listItemArgs){
		},

		_load: function(){
			this.model.getRoot(
				lang.hitch(this, function(item){
					var scope = this;
					var list = new RoundRectList();
					var node = {};
					var listItemArgs = {
						label: scope.model.rootLabel,
						moveTo: '#',
						onClick: function(){ scope.handleClick(this); },
						item: item
					};
					this._customizeListItem(listItemArgs);
					var listitem = new ListItem(listItemArgs);
					list.addChild(listitem);
					this.addChild(list);
				})
			)
		},

		handleClick: function(li){
			// summary:
			//		Called when the user clicks a tree item.
			// li: dojox/mobile/ListItem
			//		The item that the user clicked.
			var newViewId = "view_";
			if(li.item[this.model.newItemIdAttr]){
				newViewId += li.item[this.model.newItemIdAttr];
			}else{
				newViewId += "rootView";
			}
			newViewId = newViewId.replace('/', '_');
			if(registry.byId(newViewId)){  // view already exists, just transition to it
				registry.byNode(li.domNode).transitionTo(newViewId);
				return;
			}

			var prog = ProgressIndicator.getInstance();
			win.body().appendChild(prog.domNode);
			prog.start();

			this.model.getChildren(li.item,
				lang.hitch(this, function(items){
					var scope = this;
					var list = new RoundRectList();
					array.forEach(items, function(item, i){
						var listItemArgs = {
							item: item,
							label: item[scope.model.store.label],
							transition: "slide"
						};
						scope._customizeListItem(listItemArgs);
						if(scope.model.mayHaveChildren(item)){
							listItemArgs.moveTo = '#';
							listItemArgs.onClick = function(){ scope.handleClick(this); };
						}
						var listitem = new ListItem(listItemArgs);
						list.addChild(listitem);
					});

					var heading = new Heading({
						label: "Dynamic View",
						back: "Back",
						moveTo: viewRegistry.getEnclosingView(li.domNode).id,
						dir: this.isLeftToRight() ? "ltr" : "rtl"
					});

					var newView = ScrollableView({
						id: newViewId,
						dir: this.isLeftToRight() ? "ltr" : "rtl"
					}, domConstruct.create("div", null, win.body()));
					newView.addChild(heading);
					newView.addChild(list);
					newView.startup();
					prog.stop();
					registry.byNode(li.domNode).transitionTo(newView.id);
				})
			)
		}
	});
	
	return has("dojo-bidi") ? declare("dojox.mobile.TreeView", [TreeView, BidiTreeView]) : TreeView;		
});

},
'dojox/mobile/TimePicker':function(){
define([
	"dojo/_base/lang",
	"./_PickerChooser!TimePicker"
], function(lang, TimePicker){

	/*=====
	return function(){
		// module:
		//		dojox/mobile/TimePicker
		// summary:
		//		A wrapper widget around SpinWheelTimePicker or ValuePickerTimePicker.
		//		Returns ValuePickerTimePicker when the current theme is "android" or "holodark".
		//		Returns SpinWheelTimePicker otherwise.

		 // TODO: need to list all the properties/methods in the interface provided by
		 // SpinWheelTimePicker / ValuePickerTimePicker
	 };
	=====*/

	return lang.setObject("dojox.mobile.TimePicker", TimePicker);
});

},
'dojox/mobile/compat':function(){
define([
	"dojo/_base/lang",
	"dojo/sniff"
], function(lang, has){
	// module:
	//		dojox/mobile/compat

	var dm = lang.getObject("dojox.mobile", true);
	// TODO: Use feature detection instead, but this would require a major rewrite of _compat
	// to detect each feature and plug the corresponding compat code if needed.
	// Currently the compat code is a workaround for too many different things to be able to
	// decide based on feature detection. So for now we just disable _compat on the mobile browsers
	// that are known to support enough CSS3: all webkit-based browsers, IE10 (Windows [Phone] 8) and IE11+.
	if(!(has("webkit") || has("ie") === 10) || (!has("ie") && has("trident") > 6)){
		var s = "dojox/mobile/_compat"; // assign to a variable so as not to be picked up by the build tool
		require([s]);
	}
	
	/*=====
	return {
		// summary:
		//		CSS3 compatibility module.
		// description:
		//		This module provides to dojox/mobile support for some of the CSS3 features 
		//		in non-CSS3 browsers, such as IE or Firefox.
		//		If you require this module, when running in a non-CSS3 browser it directly 
		//		replaces some of the methods of	dojox/mobile classes, without any subclassing. 
		//		This way, HTML pages remain the same regardless of whether this compatibility 
		//		module is used or not.
		//
		//		Example of usage: 
		//		|	require([
		//		|		"dojox/mobile",
		//		|		"dojox/mobile/compat",
		//		|		...
		//		|	], function(...){
		//		|		...
		//		|	});
		//
		//		This module also loads compatibility CSS files, which have a -compat.css
		//		suffix. You can use either the `<link>` tag or `@import` to load theme
		//		CSS files. Then, this module searches for the loaded CSS files and loads
		//		compatibility CSS files. For example, if you load dojox/mobile/themes/iphone/iphone.css
		//		in a page, this module automatically loads dojox/mobile/themes/iphone/iphone-compat.css.
		//		If you explicitly load iphone-compat.css with `<link>` or `@import`,
		//		this module will not load again the already loaded file.
		//
		//		Note that, by default, compatibility CSS files are only loaded for CSS files located
		//		in a directory containing a "mobile/themes" path. For that, a matching is done using 
		//		the default pattern	"/\/mobile\/themes\/.*\.css$/". If a custom theme is not located 
		//		in a directory containing this path, the data-dojo-config needs to specify a custom 
		//		pattern using the "mblLoadCompatPattern" configuration parameter, for instance:
		// |	data-dojo-config="mblLoadCompatPattern: /\/mycustomtheme\/.*\.css$/"
	};
	=====*/
	return dm;
});

},
'dojox/mobile/pageTurningUtils':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"./_css3"
], function(kernel, array, connect, event, domClass, domConstruct, domStyle, css3){
	// module:
	//		dojox/mobile/pageTurningUtils
	
	kernel.experimental("dojox.mobile.pageTurningUtils");

	return function(){
		// summary:
		//		Utilities to provide page turning effects just like turning a real book.
		// example:
		// |	require([
		// |		"dojo/ready",
		// |		"dojox/mobile/pageTurningUtils"
		// |	], function(ready, pageTurningUtils){
		// |		var utils = new pageTurningUtils();
		// |		ready(function(){
		// |			utils.init(300, 400); // Specify width and height by pixels
		// |			utils.initCatalog(document.getElementById("catalog"));
		// |		});
		// |	);
		// |	<div id="catalog">
		// |		<div id="page1">
		// |			<div id="front1"><img src="img1.png"></div>
		// |			<div id="back1"><img src="img2.png"></div>
		// |		</div>
		// |		<div id="page2">
		// |			<div id="front2"><img src="img3.png"></div>
		// |			<div id="back2"><img src="img4.png"></div>
		// |		</div>
		// |		<div id="page3">
		// |			<div id="front3"><img src="img5.png"></div>
		// |			<div id="back3"></div>
		// |		</div>
		// |	</div>

		this.w = 0;
		this.h = 0;
		this.turnfrom = "top";
		this.page = 1;
		this.dogear = 1.0;
		this.duration = 2;
		this.alwaysDogeared = false;

		/* Internal properties */
		this._styleParams = {};
		this._catalogNode = null;
		this._currentPageNode = null;
		this._transitionEndHandle = null;

		this.init = function(/*int*/w, /*int*/h, /*String?*/turnfrom, 
							/*int?*/page, /*Number?*/dogear, /*Number?*/duration,
							/*Boolean?*/alwaysDogeared){
			// summary:
			//		Sets property values necessary for calculating the style parameters
			//		for page positioning and page turning effects.
			// w: int
			//		The width of each page by pixels. You cannot specify it by percentage.
			// h: int
			//		The height of each page by pixels. You cannot specify it by percentage.
			// turnfrom: String?
			//		Specifies from which side/corner the page turning starts. 
			//		You can choose from "top", "bottom" or "left". Defaults to "top".
			//		If "top", each page is turned from top-right corner of the page.
			//		If "bottom", each page is turned from bottom-right corner of the page.
			//		And if "left", each page is turned from top-left corner of the page.
			//		The page is shown as dog-eared except the case of "bottom".
			// page: int?
			//		The number of pages shown in the screen at a time.
			//		This parameter should be either of 1 or 2. Defaults to 1.
			//		If 1, the only one side of two facing pages are shown. 
			//		If 2, the two facing pages are shown at a time.
			// dogear: Number?
			//		The ratio of actual dog-ear width to the maximum dog-ear width which is
			//		11 percent of the page width (= 0.11 * w).
			//		This parameter should be a float number between 0 and 1. Defaults to 1.
			//		The actual dog-ear width is calculated by the following formula:
			// |		0.11 * w * dogear.
			//		This parameter is ignored if "bottom" is specified to turnfrom parameter.
			// duration: Number?
			//		The duration of page turning animations by seconds. (ex. 1.5, 3, etc)
			//		Defaults to 2.
			// alwaysDogeared: Boolean?
			//		Specifies whether all pages are always dog-eared or not.
			//		If true, all pages are always dog-eared.
			//		If false, only the current page is dog-eared while the others are not.
			//		This parameter is ignored if "bottom" is specified to turnfrom parameter.
			
			// Set property values
			this.w = w;
			this.h = h;
			this.turnfrom = turnfrom ? turnfrom : this.turnfrom;
			this.page = page ? page : this.page;
			this.dogear = typeof dogear !== 'undefined' ? dogear : this.dogear;
			this.duration = typeof duration !== 'undefined' ? duration : this.duration;
			this.alwaysDogeared = typeof alwaysDogeared !== 'undefined' ? alwaysDogeared : this.alwaysDogeared;
			
			if(this.turnfrom === "bottom"){ // dog-ear is not supported if using "bottom"
				this.alwaysDogeared = true;
			}
			// Calculate style parameters for page positioning and page turning effects
			this._calcStyleParams();
		};

		this._calcStyleParams = function(){
			// tags:
			//		private
			var tan58 = Math.tan(58 * Math.PI/180),
				cos32 = Math.cos(32 * Math.PI/180),
				sin32 = Math.sin(32 * Math.PI/180),
				tan32 = Math.tan(32 * Math.PI/180),
				w = this.w,
				h = this.h,
				page = this.page,
				turnfrom = this.turnfrom,
				params = this._styleParams;
			
			// Calculate each div size and position based on the page turning algorithm
			//	 fw: frontWidth, fh: frontHeight, dw: dogear, cx: posX, cy: posY,
			//	 dx: dogearX, dy: dogearY, fy:actualPagePos
			var fold = w * tan58,
				Q = fold,
				fw = Q * sin32 + Q * cos32 * tan58,
				fh = fold + w + w/tan58,
				dw = w * 0.11 * this.dogear,
				pw = w - dw,
				base = pw * cos32,
				cx, cy, dx, dy, fy; // These params depend on the types of "turnfrom" parameter
			
			switch(this.turnfrom){ // TODO Should separate each case as a plugin?
			case "top":
				cx = fw - base;
				cy = base * tan58;
				dx = fw - dw;
				dy = cy + pw/tan58 - 7;
				fy = cy/cos32;
				
				params.init = {
					page: css3.add({
						top: -fy + "px",
						left: (-fw + (page === 2 ? w : 0)) + "px",
						width: fw + "px",
						height: fh + "px"
					}, {
						transformOrigin: "100% 0%"
					}),
					front: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					back: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					shadow: {
						display: "",
						left: fw + "px",
						height: h * 1.5 + "px"
					}
				};
				params.turnForward = {
					page: css3.add({}, {
						transform: "rotate(0deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ fw + "px," + fy +"px) rotate(0deg)",
						transformOrigin: "-110px -18px"
					}),
					back: css3.add({}, {
						transform: "translate("+ (fw - w) + "px," + fy +"px) rotate(0deg)",
						transformOrigin: "0px 0px"
					})
				};
				params.turnBackward = {
					page: css3.add({}, {
						transform: "rotate(-32deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ cx + "px," + cy +"px) rotate(32deg)",
						transformOrigin: "0px 0px"
					}),
					back: css3.add({}, {
						transform: "translate("+ dx + "px," + dy +"px) rotate(-32deg)",
						transformOrigin: "0px 0px"
					})
				};
				break;
				
			case "bottom":
				cx = fw - (h * sin32 + w * cos32) - 2;
				cy = fh - (h + w/tan32) * cos32;
				dx = fw;
				dy = fh - w/sin32 - h;
				fy = fh - w/tan32 - h;
				
				params.init = {
					page: css3.add({
						top: (-fy + 50) + "px",
						left: (-fw + (page === 2 ? w : 0)) + "px",
						width: fw + "px",
						height: fh + "px"
					}, {
						transformOrigin: "100% 100%"
					}),
					front: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					back: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					shadow: {
						display: "none"
					}
				};
				params.turnForward = {
					page: css3.add({}, {
						transform: "rotate(0deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ fw + "px," + fy +"px) rotate(0deg)",
						transformOrigin: "-220px 35px"
					}),
					back: css3.add({}, {
						transform: "translate("+ (w * 2) + "px," + fy +"px) rotate(0deg)",
						transformOrigin: "0px 0px"
					})
				};
				params.turnBackward = {
					page: css3.add({}, {
						transform: "rotate(32deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ cx + "px," + cy +"px) rotate(-32deg)",
						transformOrigin: "0px 0px"
					}),
					back: css3.add({}, {
						transform: "translate("+ dx + "px," + dy +"px) rotate(0deg)",
						transformOrigin: "0px 0px"
					})
				};
				break;
				
			case "left":
				cx = -w;
				cy = pw/tan32 - 2;
				dx = -pw;
				dy = fy = pw/sin32 + dw * sin32;
				
				params.init = {
					page: css3.add({
						top: -cy + "px",
						left: w + "px",
						width: fw + "px",
						height: fh + "px"
					}, {
						transformOrigin: "0% 0%"
					}),
					front: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					back: css3.add({
						width: w + "px",
						height: h + "px"
					}, {
						boxShadow: "0 0"
					}),
					shadow: {
						display: "",
						left: "-4px",
						height: ((page === 2 ? h * 1.5 : h) + 50) + "px"
					}
				};
				params.turnForward = {
					page: css3.add({}, {
						transform: "rotate(0deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ cx + "px," + cy +"px) rotate(0deg)",
						transformOrigin: "160px 68px"
					}),
					back: css3.add({}, {
						transform: "translate(0px," + cy +"px) rotate(0deg)",
						transformOrigin: "0px 0px"
					})
				};
				params.turnBackward = {
					page: css3.add({}, {
						transform: "rotate(32deg)"
					}),
					front: css3.add({}, {
						transform: "translate("+ (-dw) + "px," + dy +"px) rotate(-32deg)",
						transformOrigin: "0px 0px"
					}),
					back: css3.add({}, {
						transform: "translate("+ dx + "px," + dy +"px) rotate(32deg)",
						transformOrigin: "top right"
					})
				};
				break;
			}
			
			params.init.catalog = { // catalogNode
				width: (page === 2 ? w * 2 : w) + "px",
				height: ((page === 2 ? h * 1.5 : h) + (turnfrom == "top" ? 0 : 50)) + "px"
			};
		};

		this.getChildren = function(/*DomNode*/node){
			return array.filter(node.childNodes, function(n){ return n.nodeType === 1; });
		};

		this.getPages = function(){
			// summary:
			//		Get the array of all page nodes.
			return this._catalogNode ? this.getChildren(this._catalogNode) : null;
		};

		this.getCurrentPage = function(){
			// summary:
			//		Get the current page node.
			return this._currentPageNode;
		};

		this.getIndexOfPage = function(/*DomNode*/pageNode, /*DomNode[]?*/pages){
			if(!pages){
				pages = this.getPages();
			}
			for(var i=0; i<pages.length; i++){
				if(pageNode === pages[i]){ return i; }
			}
			return -1;
		};

		this.getNextPage = function(/*DomNode*/pageNode){
			for(var n = pageNode.nextSibling; n; n = n.nextSibling){
				if(n.nodeType === 1){ return n; }
			}
			return null;
		};

		this.getPreviousPage = function(/*DomNode*/pageNode){
			for(var n = pageNode.previousSibling; n; n = n.previousSibling){
				if(n.nodeType === 1){ return n; }
			}
			return null;
		};

		this.isPageTurned = function(/*DomNode*/pageNode){
			return pageNode.style[css3.name("transform")] == "rotate(0deg)";
		};

		this._onPageTurned = function(e){
			event.stop(e);
			if(domClass.contains(e.target, "mblPageTurningPage")){
				this.onPageTurned(e.target);
			}
		};

		this.onPageTurned = function(/*DomNode*/ /*===== pageNode =====*/){
			// summary:
			//		Stub function to which your application connects 
			//		to handle the event when each page is tured 
			// description:
			//		Called just after each page is turned.
		};

		this.initCatalog = function(/*DomNode*/catalogNode){
			// summary:
			//		Initializes the specified catalog/book.
			// description:
			//		Apply style class and other various styles to the specified catalog node
			//		for initialization.
			//		This function must be called every time when property values
			//		are changed by calling this.init(...) function.
			// catalogNode: DOMNode
			//		The catalog node to be initialized.
			
			if(this._catalogNode != catalogNode){
				if(this._transitionEndHandle){
					connect.disconnect(this._transitionEndHandle);
				}
				this._transitionEndHandle = connect.connect(catalogNode, css3.name("transitionEnd"), this, "_onPageTurned");
				this._catalogNode = catalogNode;
			}
			
			// Initialize catalog node
			domClass.add(catalogNode, "mblPageTurningCatalog");
			domStyle.set(catalogNode, this._styleParams.init.catalog);
			
			// Initialize child pages
			var pages = this.getPages();
			array.forEach(pages, function(pageNode){
				this.initPage(pageNode);
			}, this);
			
			this.resetCatalog();
		};

		this._getBaseZIndex = function(){
			// Check z-index of catalogNode
			return this._catalogNode.style.zIndex || 0;
		};

		this.resetCatalog = function(){
			// summary:
			//		Resets the catalog by adjust the state of child pages.
			// description:
			//		Adjust z-index and dog-ear show/hide state of each child page.
			//		This function must be called when you add a new page 
			//		or remove some page after initialization.
			
			// Adjust z-index and dog-ear of child pages
			var pages = this.getPages(),
				len = pages.length,
				base = this._getBaseZIndex();
			for(var i = len - 1; i>=0; i--){
				var pageNode = pages[i];
				this.showDogear(pageNode);
				if(this.isPageTurned(pageNode)){
					pageNode.style.zIndex = base + len + 1;
				}else{
					pageNode.style.zIndex = base + len - i;
					!this.alwaysDogeared && this.hideDogear(pageNode);
					this._currentPageNode = pageNode;
				}
			}
			if(!this.alwaysDogeared && this._currentPageNode != pages[len - 1]){
				this.showDogear(this._currentPageNode);
			}
		};

		this.initPage = function(/*DomNode*/pageNode, /*int?*/dir){
			// summary:
			//		Initializes the specified page.
			// description:
			//		Apply style class and other various styles to the specified page node
			//		for initialization.
			//		This function must be called when you add a new page after initialization.
			// pageNode: DOMNode
			//		The page node to be initialized.
			// dir: int?
			//		Specified whether the page is turned or not at initialization.
			//		This parameter should be either of 1 or -1.
			//		If 1, the page is turned at initialization. If -1, it is not turned.
			
			// Create shadow node if not exist
			var childNodes = this.getChildren(pageNode);
			while(childNodes.length < 3){
				pageNode.appendChild(domConstruct.create("div", null));
				childNodes = this.getChildren(pageNode);
			}
			
			// Check if it is the first time to initialize this page node or not
			var isFirst = !domClass.contains(pageNode, "mblPageTurningPage");
			
			// Apply style class
			domClass.add(pageNode, "mblPageTurningPage");
			domClass.add(childNodes[0], "mblPageTurningFront"); // frontNode
			domClass.add(childNodes[1], "mblPageTurningBack"); // backNode
			domClass.add(childNodes[2], "mblPageTurningShadow"); // shadowNode
			
			// Apply styles
			var p = this._styleParams.init;
			domStyle.set(pageNode, p.page);
			domStyle.set(childNodes[0], p.front); // frontNode
			domStyle.set(childNodes[1], p.back); // backNode
			p.shadow && domStyle.set(childNodes[2], p.shadow); // shadowNode
			
			if(!dir){
				// Determine whether to turn this page or not
				if(isFirst && this._currentPageNode){
					var pages = this.getPages();
					dir = this.getIndexOfPage(pageNode) < this.getIndexOfPage(this._currentPageNode) ? 1 : -1;
				}else{
					dir = this.isPageTurned(pageNode) ? 1 : -1;
				}
			}
			this._turnPage(pageNode, dir, 0);
		};

		this.turnToNext = function(/*Number?*/duration){
			// summary:
			//		Turns a page forward.
			// description:
			//		The current page is turned forward if it is not the last page of the book.
			// duration: Number?
			//		The duration of page turning animations by seconds. (ex. 1.5, 3, etc)
			//		If this parameter is omitted, this.duration property value is used.
			var nextPage = this.getNextPage(this._currentPageNode);
			if(nextPage){
				this._turnPage(this._currentPageNode, 1, duration);
				this._currentPageNode = nextPage;
			}
		};

		this.turnToPrev = function(/*Number?*/duration){
			// summary:
			//		Turns a page backward.
			// description:
			//		The current page is turned backward if it is not the first page of the book.
			// duration: Number?
			//		The duration of page turning animations by seconds. (ex. 1.5, 3, etc)
			//		If this parameter is omitted, this.duration property value is used.
			var prevPage = this.getPreviousPage(this._currentPageNode);
			if(prevPage){
				this._turnPage(prevPage, -1, duration);
				this._currentPageNode = prevPage;
			}
		};

		this.goTo = function(/*int*/index){
			// summary:
			//		Jumps to the specified page without page turning animations.
			// index: int
			//		The index of the page you want to jump to.
			var pages = this.getPages();
			if(this._currentPageNode === pages[index] || pages.length <= index) { return; }
			
			var goBackward = index < this.getIndexOfPage(this._currentPageNode, pages);
			while(this._currentPageNode !== pages[index]) {
				goBackward ? this.turnToPrev(0) : this.turnToNext(0);
			}
		};

		this._turnPage = function(/*DomNode*/pageNode, /*int*/dir, /*Number?*/duration){
			// tags:
			//		private
			var childNodes = this.getChildren(pageNode),
				d = ((typeof duration !== 'undefined') ? duration : this.duration) + "s",
				p = (dir === 1) ? this._styleParams.turnForward : this._styleParams.turnBackward;
			
			// Apply styles for page turning animations
			p.page[css3.name("transitionDuration")] = d;
			domStyle.set(pageNode, p.page);
			
			p.front[css3.name("transitionDuration")] = d;
			domStyle.set(childNodes[0], p.front); // frontNode
			
			p.back[css3.name("transitionDuration")] = d;
			domStyle.set(childNodes[1], p.back); // backNode
			
			// Adjust z-index and dog-ear
			var pages = this.getPages(),
				nextPage = this.getNextPage(pageNode),
				len = pages.length,
				base = this._getBaseZIndex();
			if(dir === 1){
				pageNode.style.zIndex = base + len + 1;
				if(!this.alwaysDogeared && nextPage && this.getNextPage(nextPage)){
					this.showDogear(nextPage);
				}
			}else{
				if(nextPage){
					nextPage.style.zIndex = base + len - this.getIndexOfPage(nextPage, pages);
					!this.alwaysDogeared && this.hideDogear(nextPage);
				}
			}
		};

		this.showDogear = function(/*DomNode*/pageNode){
			// summary:
			//		Shows the dog-ear.
			var childNodes = this.getChildren(pageNode);;
			domStyle.set(pageNode, "overflow", "");
			childNodes[1] && domStyle.set(childNodes[1], "display", ""); // backNode
			childNodes[2] && domStyle.set(childNodes[2], "display", this.turnfrom === "bottom" ? "none" : ""); // shadowNode
		};

		this.hideDogear = function(/*DomNode*/pageNode){
			// summary:
			//		Hides the dog-ear.
			if(this.turnfrom === "bottom"){ return; }
			
			var childNodes = this.getChildren(pageNode);
			domStyle.set(pageNode, "overflow", "visible");
			childNodes[1] && domStyle.set(childNodes[1], "display", "none"); // backNode
			childNodes[2] && domStyle.set(childNodes[2], "display", "none"); // shadowNode
		};
	};
});

},
'dojox/mobile/FormLayout':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"./Container",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/FormLayout"
], function(declare, domClass, Container, has, BidiFormLayout){

	// module:
	//		dojox/mobile/FormLayout

	var FormLayout = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiFormLayout" : "dojox.mobile.FormLayout", Container, {
		// summary:
		//		A responsive container to create mobile forms.
		// description:
		//		This container layouts form widgets according to the screen size.
		//		Each row of a form is made of a <label> and a <fieldset> that contains one or more form widgets.
		//		By default, if the width of the screen if greater than 500px, the <label> and the <fieldset> are positioned on the same line.
		//		Otherwise they are stacked vertically. You can force how a <label> and its <fieldset> are positioned using the
		//		'columns' property.
		//		Form controls are: "dojox/mobile/Button", "dojox/mobile/CheckBox", "dojox/mobile/ComboBox",
		//		"dojox/mobile/RadioButton", "dojox/mobile/Slider", "dojox/mobile/TextBox", "dojox/mobile/SearchBox",
		//		"dojox/mobile/ExpandingTextArea", "dojox/mobile/ToggleButton".
		// example:
		// |	<div data-dojo-type="dojox/mobile/FormLayout" data-dojo-props="columns:'two', rightAlign:true">
		// |		<div>
		// |			<label>Name:</label>
		// |			<fieldset>
		// |				<input data-dojo-type="dojox/mobile/TextBox">
		// |			</fieldset>
		// |		</div>
		// |		<div>
		// |			<label>Make a choice:</label>
		// |			<fieldset>
		// |				<input type="radio" id="rb1" data-dojo-type="dojox/mobile/RadioButton" name="mobileRadio" checked><label for="rb1">Small</label>
		// |				<input type="radio" id="rb2" data-dojo-type="dojox/mobile/RadioButton" name="mobileRadio" checked><label for="rb2">Medium</label>
		// |				<input type="radio" id="rb3" data-dojo-type="dojox/mobile/RadioButton" name="mobileRadio" checked><label for="rb3">Large</label>
		// |			</fieldset>
		// |		</div>
		// |	</div>


		// columns: [const] "auto" | "single" | "two"
		//		This property controls how a <label> and its <fieldset> are positioned. The <label> can be on the same line
		//		than its <fieldset> (two columns) or on top of it (single column).
		//		If set to "auto", the number of columns depends on the width of the screen: Two columns
		//		if the width of the screen is larger than 500px, one column otherwise. The width of the screen is determined using CSS
		//		Media Queries.
		//		Setting this property to "single" or "two" allows to force the layout used whatever the width of the screen.
		//		Default value for this property is "auto".
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		columns: "auto",

		// rightAlign: [const] Boolean
		//		This property controls the horizontal position of control(s) in a <fieldset>. It applies only
		//		to forms that have two columns (see 'columns' property).
		//		Default value for this property is false.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		rightAlign: false,

		/* internal properties */

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblFormLayout",

		buildRendering: function(){
			this.inherited(arguments);
			if(this.columns == "auto"){
				domClass.add(this.domNode, "mblFormLayoutAuto");
			}else if(this.columns == "single"){
				domClass.add(this.domNode, "mblFormLayoutSingleCol");
			}else if(this.columns == "two"){
				domClass.add(this.domNode, "mblFormLayoutTwoCol");
			}
			if(this.rightAlign){
				domClass.add(this.domNode, "mblFormLayoutRightAlign");
			}
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.FormLayout", [FormLayout, BidiFormLayout]) : FormLayout;
});

},
'dojox/mobile/_EditableIconMixin':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/touch",
	"dijit/registry",
	"./IconItem",
	"./sniff",
	"./viewRegistry",
	"./_css3"
], function(array, connect, declare, event, lang, win, domGeometry, domStyle, touch, registry, IconItem, has, viewRegistry, css3){

	// module:
	//		dojox/mobile/_EditableIconMixin

	return declare("dojox.mobile._EditableIconMixin", null, {
		// summary:
		//		A mixin for IconContainer to make it editable.

		deleteIconForEdit: "mblDomButtonBlackCircleCross",
		threshold: 4, // drag threshold value in pixels

		destroy: function(){
			// summary:
			//		Destroys the container.
			if(this._blankItem){
				this._blankItem.destroy();
			}
			this.inherited(arguments);
		},

		startEdit: function(){
			// summary:
			//		Starts the editing.
			if(!this.editable || this.isEditing){ return; }

			this.isEditing = true;
			if(!this._handles){
				this._handles = [
					this.connect(this.domNode, css3.name("transitionStart"), "_onTransitionStart"),
					this.connect(this.domNode, css3.name("transitionEnd"), "_onTransitionEnd")
				];
			}

			var count = 0;
			array.forEach(this.getChildren(), function(w){
				this.defer(function(){
					w.set("deleteIcon", this.deleteIconForEdit);
					if(w.deleteIconNode){
						w._deleteHandle = this.connect(w.deleteIconNode, "onclick", "_deleteIconClicked");
					}
					w.highlight(0);
				}, 15*count++);
			}, this);

			connect.publish("/dojox/mobile/startEdit", [this]); // pubsub
			this.onStartEdit(); // callback
		},

		endEdit: function(){
			// summary:
			//		Ends the editing.
			if(!this.isEditing){ return; }

			array.forEach(this.getChildren(), function(w){
				w.unhighlight();
				if(w._deleteHandle){
					this.disconnect(w._deleteHandle);
					w._deleteHandle = null;
				}
				w.set("deleteIcon", "");
			}, this);

			this._movingItem = null;
			if(this._handles){
				array.forEach(this._handles, this.disconnect, this);
				this._handles = null;
			}

			connect.publish("/dojox/mobile/endEdit", [this]); // pubsub
			this.onEndEdit(); // callback
			this.isEditing = false;
		},

		scaleItem: function(/*Widget*/widget, /*Number*/ratio){
			// summary:
			//		Scales an item according to the specified ratio.
			domStyle.set(widget.domNode, css3.add({}, {
				transition: has("android") ? "" : css3.name("transform", true) + " .1s ease-in-out",
				transform: ratio == 1 ? "" : "scale(" + ratio + ")"
			}));			
		},

		_onTransitionStart: function(e){
			// tags:
			//		private
			event.stop(e);
		},

		_onTransitionEnd: function(e){
			// tags:
			//		private
			event.stop(e);
			var w = registry.getEnclosingWidget(e.target);
			w._moving = false;
			domStyle.set(w.domNode, css3.name("transition"), "");
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(!this._blankItem){
				this._blankItem = new IconItem();
				this._blankItem.domNode.style.visibility = "hidden";
				this._blankItem._onClick = function(){};
			}
			var item = this._movingItem = registry.getEnclosingWidget(e.target);
			var iconPressed = false;
			var n;
			for(n = e.target; n !== item.domNode; n = n.parentNode){
				if(n === item.iconNode){
					iconPressed = true;
					break;
				}
			}
			if(!iconPressed){ return; }

			if(!this._conn){
				this._conn = [
					this.connect(this.domNode, touch.move, "_onTouchMove"),
					this.connect(win.doc, touch.release, "_onTouchEnd")
				];
			}
			this._touchStartPosX = e.touches ? e.touches[0].pageX : e.pageX;
			this._touchStartPosY = e.touches ? e.touches[0].pageY : e.pageY;
			if(this.isEditing){
				this._onDragStart(e);
			}else{
				// set timer to detect long press
				this._pressTimer = this.defer(function(){
					this.startEdit();
					this._onDragStart(e);
				}, 1000);
			}
		},

		_onDragStart: function(e){
			// tags:
			//		private
			this._dragging = true;

			var movingItem = this._movingItem;
			if(movingItem.get("selected")){
				movingItem.set("selected", false);
			}
			this.scaleItem(movingItem, 1.1);

			var x = e.touches ? e.touches[0].pageX : e.pageX;
			var y = e.touches ? e.touches[0].pageY : e.pageY;
			
			var enclosingScrollable = viewRegistry.getEnclosingScrollable(movingItem.domNode);
			var dx = 0;
			var dy = 0;
			if(enclosingScrollable){ // this node is placed inside a scrollable
				var pos = enclosingScrollable.getPos();
				dx = pos.x;
				dy = pos.y;
				event.stop(e);
			}
			
			var startPos = this._startPos = domGeometry.position(movingItem.domNode, true);
			this._offsetPos = {
				x: startPos.x - x - dx,
				y: startPos.y - y - dy
			};

			this._startIndex = this.getIndexOfChild(movingItem);
			this.addChild(this._blankItem, this._startIndex);
			this.moveChild(movingItem, this.getChildren().length);
			domStyle.set(movingItem.domNode, {
				position: "absolute",
				top: (startPos.y - dy) + "px",
				left: (startPos.x - dx) + "px",
				zIndex: 100
			});
		},

		_onTouchMove: function(e){
			// tags:
			//		private
			var x = e.touches ? e.touches[0].pageX : e.pageX;
			var y = e.touches ? e.touches[0].pageY : e.pageY;
			if(this._dragging){
				domStyle.set(this._movingItem.domNode, {
					top: (this._offsetPos.y + y) + "px",
					left: (this._offsetPos.x + x) + "px"
				});
				this._detectOverlap({x: x, y: y});
				event.stop(e);
			}else{
				var dx = Math.abs(this._touchStartPosX - x);
				var dy = Math.abs(this._touchStartPosY - y);
				if (dx > this.threshold || dy > this.threshold) {
					this._clearPressTimer();					
				}
			}
		},

		_onTouchEnd: function(e){
			// tags:
			//		private
			this._clearPressTimer();
			if(this._conn){
				array.forEach(this._conn, this.disconnect, this);
				this._conn = null;				
			}

			if(this._dragging){
				this._dragging = false;

				var movingItem = this._movingItem;
				this.scaleItem(movingItem, 1.0);
				domStyle.set(movingItem.domNode, {
					position: "",
					top: "",
					left: "",
					zIndex: ""
				});
				var startIndex = this._startIndex;
				var endIndex = this.getIndexOfChild(this._blankItem);
				this.moveChild(movingItem, endIndex);
				this.removeChild(this._blankItem);
				connect.publish("/dojox/mobile/moveIconItem", [this, movingItem, startIndex, endIndex]); // pubsub
				this.onMoveItem(movingItem, startIndex, endIndex); // callback
			}
		},

		_clearPressTimer: function(){
			// tags:
			//		private
			if(this._pressTimer){
				this._pressTimer.remove();
				this._pressTimer = null;
			}
		},

		_detectOverlap: function(/*Object*/point){
			// tags:
			//		private
			var children = this.getChildren(),
				blankItem = this._blankItem,
				blankPos = domGeometry.position(blankItem.domNode, true),
				blankIndex = this.getIndexOfChild(blankItem),
				dir = 1,
				i, w, pos;
			if(this._contains(point, blankPos)){
				return;
			}else if(point.y < blankPos.y || (point.y <= blankPos.y + blankPos.h && point.x < blankPos.x)){
				dir = -1;
			}
			for(i = blankIndex + dir; i>=0 && i<children.length-1; i += dir){
				w = children[i];
				if(w._moving){ continue; }
				pos = domGeometry.position(w.domNode, true);
				if(this._contains(point, pos)){
					this.defer(function(){
						this.moveChildWithAnimation(blankItem, dir == 1 ? i+1 : i);
					});
					break;
				}else if((dir == 1 && pos.y > point.y) || (dir == -1 && pos.y + pos.h < point.y)){
					break;
				}
			}
		},

		_contains: function(point, pos){
			// tags:
			//		private
			return pos.x < point.x && point.x < pos.x + pos.w && pos.y < point.y && point.y < pos.y + pos.h;
		},

		_animate: function(/*int*/from, /*int*/to){
			// tags:
			//		private
			if(from == to) { return; }
			var dir = from < to ? 1 : -1;
			var children = this.getChildren();
			var posArray = [];
			var i, j;
			for(i=from; i!=to; i+=dir){
				posArray.push({
					t: (children[i+dir].domNode.offsetTop - children[i].domNode.offsetTop) + "px",
					l: (children[i+dir].domNode.offsetLeft - children[i].domNode.offsetLeft) + "px"
				});
			}
			for(i=from, j=0; i!=to; i+=dir, j++){
				var w = children[i];
				w._moving = true;
				domStyle.set(w.domNode, {
					top: posArray[j].t,
					left: posArray[j].l
				});
				this.defer(lang.hitch(w, function(){
					domStyle.set(this.domNode, css3.add({
						top: "0px",
						left: "0px"
					}, {
						transition: "top .3s ease-in-out, left .3s ease-in-out"
					}));
				}), j*10);
			}
		},

		removeChildWithAnimation: function(/*Widget|Number*/widget){
			// summary:
			//		Removes the given child with animation.
			var index = (typeof widget === "number") ? widget : this.getIndexOfChild(widget);
			this.removeChild(widget);

			// Show remove animation
			if(this._blankItem){
				// #16868 - no _blankItem if calling deleteItem() programmatically, that is
				// without _onTouchStart() being called.
				this.addChild(this._blankItem);
			}
			this._animate(index, this.getChildren().length - 1);
			if(this._blankItem){
				this.removeChild(this._blankItem);
			}
		},

		moveChild: function(/*Widget|Number*/widget, /*Number?*/insertIndex){
			// summary:
			//		Moves a child without animation.
			this.addChild(widget, insertIndex);
			this.paneContainerWidget.addChild(widget.paneWidget, insertIndex);
		},

		moveChildWithAnimation: function(/*Widget|Number*/widget, /*Number?*/insertIndex){
			// summary:
			//		Moves a child with animation.	
			var index = this.getIndexOfChild(this._blankItem);
			this.moveChild(widget, insertIndex);

			// Show move animation
			this._animate(index, insertIndex);
		},

		_deleteIconClicked: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.deleteIconClicked(e) === false){ return; } // user's click action
			var item = registry.getEnclosingWidget(e.target);
			this.deleteItem(item);
		},

		deleteIconClicked: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks for the delete icon.
			// tags:
			//		callback
		},

		deleteItem: function(/*Widget*/item){
			// summary:
			//		Deletes the given item.
			if(item._deleteHandle){
				this.disconnect(item._deleteHandle);
			}
			this.removeChildWithAnimation(item);

			connect.publish("/dojox/mobile/deleteIconItem", [this, item]); // pubsub
			this.onDeleteItem(item); // callback

			item.destroy();
		},

		onDeleteItem: function(/*Widget*/item){
			// summary:
			//		Stub function to connect to from your application.
		},

		onMoveItem: function(/*Widget*/item, /*int*/from, /*int*/to){
			// summary:
			//		Stub function to connect to from your application.
		},

		onStartEdit: function(){
			// summary:
			//		Stub function to connect to from your application.
		},

		onEndEdit: function(){
			// summary:
			//		Stub function to connect to from your application.
		},

		_setEditableAttr: function(/*Boolean*/editable){
			// tags:
			//		private
			this._set("editable", editable);
			if(editable && !this._touchStartHandle){ // Allow users to start editing by long press on IconItems
				this._touchStartHandle = this.connect(this.domNode, touch.press, "_onTouchStart");
			}else if(!editable && this._touchStartHandle){
				this.disconnect(this._touchStartHandle);
				this._touchStartHandle = null;
			}
		}
	});
});

},
'dojox/mobile/SwapView':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"./View",
	"./_ScrollableMixin",
	"./sniff",
	"./_css3",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/SwapView"
], function(array, connect, declare, dom, domClass, registry, View, ScrollableMixin, has, css3, BidiSwapView){

	// module:
	//		dojox/mobile/SwapView

	var SwapView = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiSwapView" : "dojox.mobile.SwapView", [View, ScrollableMixin], {
		// summary:
		//		A container that can be swiped horizontally.
		// description:
		//		SwapView is a container widget which can be swiped horizontally. 
		//		SwapView is a subclass of dojox/mobile/View. It allows the user to 
		//		swipe the screen left or right to move between the views. When 
		//		SwapView is swiped, it finds an adjacent SwapView to open. When 
		//		the transition is done, a topic "/dojox/mobile/viewChanged" is 
		//		published. Note that, to behave properly, the SwapView needs to 
		//		occupy the entire width of the screen.

		/* internal properties */	
		// scrollDir: [private] String
		//		Scroll direction, used by dojox/mobile/scrollable (always "f" for this class).
		scrollDir: "f",
		// weight: [private] Number
		//		Frictional weight used to compute scrolling speed.
		weight: 1.2,

		// _endOfTransitionTimeoutHandle: [private] Object
		//		The handle (returned by _WidgetBase.defer) for the timeout set on touchEnd in case
		//      the end of transition event is not fired by the browser.
		_endOfTransitionTimeoutHandle: null,

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "mblSwapView");
			this.setSelectable(this.domNode, false);
			this.containerNode = this.domNode;
			this.subscribe("/dojox/mobile/nextPage", "handleNextPage");
			this.subscribe("/dojox/mobile/prevPage", "handlePrevPage");
			this.noResize = true; // not to call resize() from scrollable#init
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			this.inherited(arguments); // scrollable#resize() will be called
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onTouchStart: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchStart events.
			if(this._siblingViewsInMotion()){  // Ignore touchstart if the views are already in motion
				this.propagatable ? e.preventDefault() : event.stop(e);
				return;
			}
			var fromTop = this.domNode.offsetTop;
			var nextView = this.nextView(this.domNode);
			if(nextView){
				nextView.stopAnimation();
				domClass.add(nextView.domNode, "mblIn");
				// Temporarily add padding to align with the fromNode while transition
				nextView.containerNode.style.paddingTop = fromTop + "px";
			}
			var prevView = this.previousView(this.domNode);
			if(prevView){
				prevView.stopAnimation();
				domClass.add(prevView.domNode, "mblIn");
				// Temporarily add padding to align with the fromNode while transition
				prevView.containerNode.style.paddingTop = fromTop + "px";
			}
			this._setSiblingViewsInMotion(true);
			this.inherited(arguments);
		},

		onTouchEnd: function(/*Event*/e){
			if(e){
				if(!this._moved){ // No transition / animation following touchend in this case
					this._setSiblingViewsInMotion(false);
				}else{ // There might be a transition / animation following touchend
					// As the webkitTransitionEndEvent is not always fired, make sure we call this._setSiblingViewsInMotion(false) even
					// if the event is not fired (and onFlickAnimationEnd is not called as a result)
					this._endOfTransitionTimeoutHandle = this.defer(function(){
						this._setSiblingViewsInMotion(false);
					}, 1000);
				}
			}
			this.inherited(arguments);
		},

		handleNextPage: function(/*Widget*/w){
			// summary:
			//		Called when the "/dojox/mobile/nextPage" topic is published.
			var refNode = w.refId && dom.byId(w.refId) || w.domNode;
			if(this.domNode.parentNode !== refNode.parentNode){ return; }
			if(this.getShowingView() !== this){ return; }
			this.goTo(1);
		},

		handlePrevPage: function(/*Widget*/w){
			// summary:
			//		Called when the "/dojox/mobile/prevPage" topic is published.
			var refNode = w.refId && dom.byId(w.refId) || w.domNode;
			if(this.domNode.parentNode !== refNode.parentNode){ return; }
			if(this.getShowingView() !== this){ return; }
			this.goTo(-1);
		},

		goTo: function(/*Number*/dir, /*String?*/moveTo){
			// summary:
			//		Moves to the next or previous view.
			var view = moveTo ? registry.byId(moveTo) :
				((dir == 1) ? this.nextView(this.domNode) : this.previousView(this.domNode));
			if(view && view !== this){
				this.stopAnimation(); // clean-up animation states
				view.stopAnimation();
				this.domNode._isShowing = false; // update isShowing flag
				view.domNode._isShowing = true;
				this.performTransition(view.id, dir, "slide", null, function(){
					connect.publish("/dojox/mobile/viewChanged", [view]);
				});
			}
		},

		isSwapView: function(/*DomNode*/node){
			// summary:
			//		Returns true if the given node is a SwapView widget.
			return (node && node.nodeType === 1 && domClass.contains(node, "mblSwapView"));
		},

		nextView: function(/*DomNode*/node){
			// summary:
			//		Returns the next view.
			for(var n = node.nextSibling; n; n = n.nextSibling){
				if(this.isSwapView(n)){ return registry.byNode(n); }
			}
			return null;
		},

		previousView: function(/*DomNode*/node){
			// summary:
			//		Returns the previous view.
			for(var n = node.previousSibling; n; n = n.previousSibling){
				if(this.isSwapView(n)){ return registry.byNode(n); }
			}
			return null;
		},

		scrollTo: function(/*Object*/to){
			// summary:
			//		Overrides dojox/mobile/scrollable.scrollTo().
			if(!this._beingFlipped){
				var newView, x;
				if(to.x){
					if(to.x < 0){
						newView = this.nextView(this.domNode);
						x = to.x + this.domNode.offsetWidth;
					}else{
						newView = this.previousView(this.domNode);
						x = to.x - this.domNode.offsetWidth;
					}
				}
				if(newView){
					if(newView.domNode.style.display === "none"){
						newView.domNode.style.display = "";
						newView.resize();
					}
					newView._beingFlipped = true;
					newView.scrollTo({x:x});
					newView._beingFlipped = false;
				}
			}
			this.inherited(arguments);
		},

		findDisp: function(/*DomNode*/node){
			// summary:
			//		Overrides dojox/mobile/scrollable.findDisp().
			// description:
			//		When this function is called from scrollable.js, there are
			//		two visible views, one is the current view, the other is the
			//		next view. This function returns the current view, not the
			//		next view, which has the mblIn class.
			if(!domClass.contains(node, "mblSwapView")){
				return this.inherited(arguments);
			}
			if(!node.parentNode){ return null; }
			var nodes = node.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblSwapView")
				    && !domClass.contains(n, "mblIn") && n.style.display !== "none"){
					return n;
				}
			}
			return node;
		},

		slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing, /*Object?*/fake_pos){
			// summary:
			//		Overrides dojox/mobile/scrollable.slideTo().
			if(!this._beingFlipped){
				var w = this.domNode.offsetWidth;
				var pos = fake_pos || this.getPos();
				var newView, newX;
				if(pos.x < 0){ // moving to left
					newView = this.nextView(this.domNode);
					if(pos.x < -w/4){ // slide to next
						if(newView){
							to.x = -w;
							newX = 0;
						}
					}else{ // go back
						if(newView){
							newX = w;
						}
					}
				}else{ // moving to right
					newView = this.previousView(this.domNode);
					if(pos.x > w/4){ // slide to previous
						if(newView){
							to.x = w;
							newX = 0;
						}
					}else{ // go back
						if(newView){
							newX = -w;
						}
					}
				}

				if(newView){
					newView._beingFlipped = true;
					newView.slideTo({x:newX}, duration, easing);
					newView._beingFlipped = false;
					newView.domNode._isShowing = (newView && newX === 0);
				}
				this.domNode._isShowing = !(newView && newX === 0);
			}
			this.inherited(arguments);
		},

		onAnimationEnd: function(/*Event*/e){
			// summary:
			//		Overrides dojox/mobile/View.onAnimationEnd().
			if(e && e.target && domClass.contains(e.target, "mblScrollableScrollTo2")){ return; }
			this.inherited(arguments);
		},

		onFlickAnimationEnd: function(/*Event*/e){
			if(this._endOfTransitionTimeoutHandle){
				this._endOfTransitionTimeoutHandle = this._endOfTransitionTimeoutHandle.remove();
			}
			// summary:
			//		Overrides dojox/mobile/scrollable.onFlickAnimationEnd().
			if(e && e.target && !domClass.contains(e.target, "mblScrollableScrollTo2")){ return; }
			this.inherited(arguments);

			if(this.domNode._isShowing){
				// Hide all the views other than the currently showing one.
				// Otherwise, when the orientation is changed, other views
				// may appear unexpectedly.
				array.forEach(this.domNode.parentNode.childNodes, function(c){
					if(this.isSwapView(c)){
						domClass.remove(c, "mblIn");
						if(!c._isShowing){
							c.style.display = "none";
							c.style[css3.name("transform")] = "";
							c.style.left = "0px"; // top/left mode needs this
							// reset the temporaty padding on the container node
							c.style.paddingTop = "";
						}
					}
				}, this);
				connect.publish("/dojox/mobile/viewChanged", [this]);
				// Reset the temporary padding
				this.containerNode.style.paddingTop = "";
			}else if(!has("css3-animations")){
				this.containerNode.style.left = "0px"; // compat mode needs this
			}
			this._setSiblingViewsInMotion(false);
		},

		_setSiblingViewsInMotion: function(/*Boolean*/inMotion){
			var inMotionAttributeValue = inMotion ? "true" : false;
			var parent = this.domNode.parentNode;
			if(parent){
				parent.setAttribute("data-dojox-mobile-swapview-inmotion", inMotionAttributeValue);
			}
		},

		_siblingViewsInMotion: function(){
			var parent = this.domNode.parentNode;
			if(parent){
				return parent.getAttribute("data-dojox-mobile-swapview-inmotion") == "true";
			}else{
				return false;
			}
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.SwapView", [SwapView, BidiSwapView]) : SwapView;
});

},
'dojox/mobile/SpinWheelTimePicker':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"./_TimePickerMixin",
	"./SpinWheel",
	"./SpinWheelSlot"
], function(declare, domClass, TimePickerMixin, SpinWheel, SpinWheelSlot){

	// module:
	//		dojox/mobile/SpinWheelTimePicker

	return declare("dojox.mobile.SpinWheelTimePicker", [SpinWheel, TimePickerMixin], {
		// summary:
		//		A SpinWheel-based time picker widget.
		// description:
		//		SpinWheelTimePicker is a time picker widget. It is a subclass of
		//		dojox/mobile/SpinWheel. It has two slots: hour and minute.

		slotClasses: [
			SpinWheelSlot,
			SpinWheelSlot
		],

		slotProps: [
			{labelFrom:0, labelTo:23, style:{width:"50px", textAlign:"right"}},
			{labelFrom:0, labelTo:59, zeroPad:2, style:{width:"40px", textAlign:"right"}}
		],

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "mblSpinWheelTimePicker");
		}
	});
});

},
'dojox/mobile/PageIndicator':function(){
define([
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"dojo/i18n!dojox/mobile/nls/messages"
], function(connect, declare, dom, domClass, domConstruct, registry, Contained, WidgetBase, messages){

	// module:
	//		dojox/mobile/PageIndicator

	return declare("dojox.mobile.PageIndicator", [WidgetBase, Contained],{
		// summary:
		//		A current page indicator.
		// description:
		//		PageIndicator displays a series of gray and white dots to
		//		indicate which page is currently being viewed. It can typically
		//		be used with dojox/mobile/SwapView. It is also internally used
		//		in dojox/mobile/Carousel.

		// refId: String
		//		An ID of a DOM node to be searched. Siblings of the reference
		//		node will be searched for views. If not specified, this.domNode
		//		will be the reference node.
		refId: "",

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblPageIndicator",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.setAttribute("role", "img");
			this._tblNode = domConstruct.create("table", {className:"mblPageIndicatorContainer"}, this.domNode);
			this._tblNode.insertRow(-1);
			this.connect(this.domNode, "onclick", "_onClick");
			this.subscribe("/dojox/mobile/viewChanged", function(view){
				this.reset();
			});
		},

		startup: function(){
			var _this = this;
			_this.defer(function(){ // to wait until views' visibility is determined
				_this.reset();
			});
		},

		reset: function(){
			// summary:
			//		Updates the indicator.
			var r = this._tblNode.rows[0];
			var i, c, a = [], dot, value = 0;
			var refNode = (this.refId && dom.byId(this.refId)) || this.domNode;
			var children = refNode.parentNode.childNodes;
			for(i = 0; i < children.length; i++){
				c = children[i];
				if(this.isView(c)){
					a.push(c);
				}
			}
			if(r.cells.length !== a.length){
				domConstruct.empty(r);
				for(i = 0; i < a.length; i++){
					c = a[i];
					dot = domConstruct.create("div", {className:"mblPageIndicatorDot"});
					r.insertCell(-1).appendChild(dot);
				}
			}
			if(a.length === 0){ return; }
			var currentView = registry.byNode(a[0]).getShowingView();
			for(i = 0; i < r.cells.length; i++){
				dot = r.cells[i].firstChild;
				if(a[i] === currentView.domNode){
					value = i + 1;
					domClass.add(dot, "mblPageIndicatorDotSelected");
				}else{
					domClass.remove(dot, "mblPageIndicatorDotSelected");
				}
			}
			if (r.cells.length)  {
				this.domNode.setAttribute("alt", messages["PageIndicatorLabel"].replace("$0", value).replace("$1", r.cells.length));
			} else {
				this.domNode.removeAttribute("alt");
			}
		},

		isView: function(node){
			// summary:
			//		Returns true if the given node is a view.
			return (node && node.nodeType === 1 && domClass.contains(node, "mblView")); // Boolean
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.onClick(e) === false){ return; } // user's click action
			if(e.target !== this.domNode){ return; }
			if(e.layerX < this._tblNode.offsetLeft){
				connect.publish("/dojox/mobile/prevPage", [this]);
			}else if(e.layerX > this._tblNode.offsetLeft + this._tblNode.offsetWidth){
				connect.publish("/dojox/mobile/nextPage", [this]);
			}
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		}
	});
});

},
'dojox/mobile/_DataListMixin':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/registry",
	"./_DataMixin",
	"./ListItem",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_StoreListMixin"
], function(array, declare, registry, DataMixin, ListItem, has, BidiDataListMixin){

	// module:
	//		dojox/mobile/_DataListMixin

	var _DataListMixin = declare(has("dojo-bidi") ? "dojox.mobile._NonBidiDataListMixin" : "dojox.mobile._DataListMixin", DataMixin, {
		// summary:
		//		Mixin for widgets to generate the list items corresponding to
		//		the data provider object.
		// description:
		//		By mixing this class into the widgets, the list item nodes are
		//		generated as the child nodes of the widget and automatically
		//		regenerated whenever the corresponding data items are modified.

		// append: Boolean
		//		If true, refresh() does not clear the existing items.
		append: false,

		// itemMap: Object
		//		An optional parameter mapping field names from the store to ItemList name.
		// example:
		//	|	itemMap:{text:'label', profile_image_url:'icon' }
		itemMap: null,

		// itemRenderer: ListItem class or subclass
		//		The class used to create list items. Default is dojox/mobile/ListItem.
		itemRenderer: ListItem,

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.store){ return; }
			var store = this.store;
			this.store = null;
			this.setStore(store, this.query, this.queryOptions);
		},

		createListItem: function(/*Object*/item){
			// summary:
			//		Creates a list item widget.
			var attr = {};
			var arr = this.store.getLabelAttributes(item);
			var labelAttr = arr ? arr[0] : null;
			array.forEach(this.store.getAttributes(item), function(name){
				if(name === labelAttr){
					attr["label"] = this.store.getLabel(item);
				}else{
					attr[(this.itemMap && this.itemMap[name]) || name] = this.store.getValue(item, name);
				}
			}, this);
			// TODO this code should be like for textDir in the bidi mixin createListItem method
			// however for that dynamic set/get of the dir property must be supported first
			// that is why for now as a workaround we keep the code here
			if(has("dojo-bidi") && typeof attr["dir"] == "undefined"){
				attr["dir"] = this.isLeftToRight() ? "ltr" : "rtl";
			}
			var w = new this.itemRenderer(attr);
			item._widgetId = w.id;
			return w;
		},
		generateList: function(/*Array*/items, /*Object*/dataObject){
			// summary:
			//		Given the data, generates a list of items.
			if(!this.append){
				array.forEach(this.getChildren(), function(child){
					child.destroyRecursive();
				});
			}
			array.forEach(items, function(item, index){
				this.addChild(this.createListItem(item));
			}, this);
		},

		onComplete: function(/*Array*/items, /*Object*/request){
			// summary:
			//		An handler that is called after the fetch completes.
			this.generateList(items, request);
		},

		onError: function(/*Object*/errorData, /*Object*/request){
			// summary:
			//		An error handler.
		},

		onSet: function(/*Object*/item, /*String*/attribute, /*Object|Array*/oldValue, /*Object|Array*/newValue){
			// summary:
			//		See dojo/data/api/Notification.onSet().
		},

		onNew: function(/*Object*/newItem, /*Object?*/parentInfo){
			// summary:
			//		See dojo/data/api/Notification.onNew().
			this.addChild(this.createListItem(newItem));
		},

		onDelete: function(/*Object*/deletedItem){
			// summary:
			//		See dojo/data/api/Notification.onDelete().
			registry.byId(deletedItem._widgetId).destroyRecursive();
		},

		onStoreClose: function(/*Object?*/request){
			// summary:
			//		Refresh list on close.
			if(this.store.clearOnClose){
				this.refresh();
			}
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._DataListMixin", [_DataListMixin, BidiDataListMixin]) : _DataListMixin;	
});

},
'dojox/mobile/Icon':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"./iconUtils",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Icon"
], function(declare, lang, domClass, domConstruct, iconUtils, has, BidiIcon){

	// module:
	//		dojox/mobile/Icon

	var Icon = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiIcon" : "dojox.mobile.Icon", null, {
		// summary:
		//		A wrapper for image icon, CSS sprite icon, or DOM Button.
		// description:
		//		Icon is a simple utility class for creating an image icon, a CSS sprite icon, 
		//		or a DOM Button. It calls dojox/mobile/iconUtils.createIcon() with the 
		//		appropriate parameters to create an icon. 
		//		Note that this module is not a widget, that is it does not inherit 
		//		from dijit/_WidgetBase.
		// example:
		//		Image icon:
		//	|	<div data-dojo-type="dojox.mobile.Icon"
		//	|		data-dojo-props='icon:"images/tab-icon-12h.png"'></div>
		//
		//		CSS sprite icon:
		//	|	<div data-dojo-type="dojox.mobile.Icon"
		//	|		data-dojo-props='icon:"images/tab-icons.png",iconPos:"29,116,29,29"'></div>
		//
		//		DOM Button:
		//	|	<div data-dojo-type="dojox.mobile.Icon"
		//	|		data-dojo-props='icon:"mblDomButtonBlueCircleArrow"'></div>

		// icon: [const] String
		//		An icon to display. The value can be either a path for an image
		//		file or a class name of a DOM button.
		//		Note that changing the value of the property after the icon
		//		creation has no effect.
		icon: "",

		// iconPos: [const] String
		//		The position of an aggregated icon. IconPos is comma separated
		//		values like top,left,width,height (ex. "0,0,29,29").
		//		Note that changing the value of the property after the icon
		//		creation has no effect.
		iconPos: "",

		// alt: [const] String
		//		An alt text for the icon image.
		//		Note that changing the value of the property after the icon
		//		creation has no effect.
		alt: "",

		// tag: String
		//		The name of the HTML tag to create as this.domNode.
		tag: "div",

		constructor: function(/*Object?*/args, /*DomNode?*/node){
			// summary:
			//		Creates a new instance of the class.
			// args:
			//		Contains properties to be set.
			// node:
			//		The DOM node. If none is specified, it is automatically created. 
			if(args){
				lang.mixin(this, args);
			}
			this.domNode = node || domConstruct.create(this.tag);
			iconUtils.createIcon(this.icon, this.iconPos, null, this.alt, this.domNode);
			this._setCustomTransform();
		},
		_setCustomTransform: function(){
			// summary:
			//		To be implemented in bidi/Icon.js.
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.Icon", [Icon, BidiIcon]) : Icon;
});

},
'dojox/mobile/ScrollableView':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",	// registry.byNode
	"./View",
	"./_ScrollableMixin"
], function(array, declare, domClass, domConstruct, registry, View, ScrollableMixin){

	// module:
	//		dojox/mobile/ScrollableView

	return declare("dojox.mobile.ScrollableView", [View, ScrollableMixin], {
		// summary:
		//		A container that has a touch scrolling capability.
		// description:
		//		ScrollableView is a subclass of View (dojox/mobile/View).
		//		Unlike the base View class, ScrollableView's domNode always stays
		//		at the top of the screen and its height is "100%" of the screen.
		//		Inside this fixed domNode, the containerNode scrolls. The browser's
		//		default scrolling behavior is disabled, and the scrolling mechanism is
		//		reimplemented in JavaScript. Thus the user does not need to use the
		//		two-finger operation to scroll the inner DIV (containerNode).
		//		The main purpose of this widget is to realize fixed-positioned header
		//		and/or footer bars.

		// scrollableParams: Object
		//		Parameters for dojox/mobile/scrollable.init().
		scrollableParams: null,

		// keepScrollPos: Boolean
		//		Overrides dojox/mobile/View/keepScrollPos.
		keepScrollPos: false,

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			this.scrollableParams = {noResize: true};
		},

		buildRendering: function(){
			this.inherited(arguments);
			domClass.add(this.domNode, "mblScrollableView");
			this.domNode.style.overflow = "hidden";
			this.domNode.style.top = "0px";
			this.containerNode = domConstruct.create("div",
				{className:"mblScrollableViewContainer"}, this.domNode);
			this.containerNode.style.position = "absolute";
			this.containerNode.style.top = "0px"; // view bar is relative
			if(this.scrollDir === "v"){
				this.containerNode.style.width = "100%";
			}
		},

		startup: function(){
			if(this._started){ return; }
			// user can initialize the app footers using a value for fixedFooter (we keep this value for non regression of existing apps)
			if(this.fixedFooter && !this.isLocalFooter){
				this._fixedAppFooter = this.fixedFooter;
				this.fixedFooter = "";
			}
			this.reparent();
			this.inherited(arguments);
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			this.inherited(arguments); // scrollable#resize() will be called
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
			this._dim = this.getDim(); // update dimension cache
			if(this._conn){
				// if a resize happens during a scroll, update the scrollbar
				this.resetScrollBar();
			}
		},

		isTopLevel: function(/*Event*/e){
			// summary:
			//		Returns true if this is a top-level widget.
			//		Overrides dojox/mobile/scrollable.isTopLevel.
			var parent = this.getParent && this.getParent();
			return (!parent || !parent.resize); // top level widget
		},

		addFixedBar: function(/*Widget*/widget){
			// summary:
			//		Adds a view local fixed bar to this widget.
			// description:
			//		This method can be used to programmatically add a view local
			//		fixed bar to ScrollableView. The bar is appended to this
			//		widget's domNode. The addChild API cannot be used for this
			//		purpose, because it adds the given widget to containerNode.
			var c = widget.domNode;
			var fixed = this.checkFixedBar(c, true);
			if(!fixed){ return; }
			// Fixed bar has to be added to domNode, not containerNode.
			this.domNode.appendChild(c);
			if(fixed === "top"){
				this.fixedHeaderHeight = c.offsetHeight;
				this.isLocalHeader = true;
			}else if(fixed === "bottom"){
				this.fixedFooterHeight = c.offsetHeight;
				this.isLocalFooter = true;
				c.style.bottom = "0px";
			}
			this.resize();
		},

		reparent: function(){
			// summary:
			//		Moves all the children, except header and footer, to
			//		containerNode.
			var i, idx, len, c;
			for(i = 0, idx = 0, len = this.domNode.childNodes.length; i < len; i++){
				c = this.domNode.childNodes[idx];
				// search for view-specific header or footer
				if(c === this.containerNode || this.checkFixedBar(c, true)){
					idx++;
					continue;
				}
				this.containerNode.appendChild(this.domNode.removeChild(c));
			}
		},

		onAfterTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Overrides View.onAfterTransitionIn to flash the scroll bar
			//		after performing a view transition.
			this.flashScrollBar();
		},

		getChildren: function(){
			// summary:
			//		Overrides _WidgetBase.getChildren to add local fixed bars,
			//		which are not under containerNode, to the children array.
			var children = this.inherited(arguments);
			var fixedWidget;
			if(this.fixedHeader && this.fixedHeader.parentNode === this.domNode){
				fixedWidget = registry.byNode(this.fixedHeader);
				if(fixedWidget){
					children.push(fixedWidget);
				}
			}
			if(this.fixedFooter && this.fixedFooter.parentNode === this.domNode){
				fixedWidget = registry.byNode(this.fixedFooter);
				if(fixedWidget){
					children.push(fixedWidget);
				}
			}
			return children;
		},

		_addTransitionPaddingTop: function(/*String|Integer*/ value){
			// add padding top to the view in order to get alignment during the transition
			this.domNode.style.paddingTop = value + "px";
			this.containerNode.style.paddingTop = value + "px";
		},

		_removeTransitionPaddingTop: function(){
			// remove padding top from the view after the transition
			this.domNode.style.paddingTop = "";
			this.containerNode.style.paddingTop = "";
		}

	});
});

},
'dijit/form/_SearchMixin':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/keys", // keys
	"dojo/_base/lang", // lang.clone lang.hitch
	"dojo/query", // query
	"dojo/string", // string.substitute
	"dojo/when",
	"../registry"	// registry.byId
], function(declare, keys, lang, query, string, when, registry){

	// module:
	//		dijit/form/_SearchMixin


	return declare("dijit.form._SearchMixin", null, {
		// summary:
		//		A mixin that implements the base functionality to search a store based upon user-entered text such as
		//		with `dijit/form/ComboBox` or `dijit/form/FilteringSelect`
		// tags:
		//		protected

		// pageSize: Integer
		//		Argument to data provider.
		//		Specifies maximum number of search results to return per query
		pageSize: Infinity,

		// store: [const] dojo/store/api/Store
		//		Reference to data provider object used by this ComboBox.
		//		The store must accept an object hash of properties for its query. See `query` and `queryExpr` for details.
		store: null,

		// fetchProperties: Object
		//		Mixin to the store's fetch.
		//		For example, to set the sort order of the ComboBox menu, pass:
		//	|	{ sort: [{attribute:"name",descending: true}] }
		//		To override the default queryOptions so that deep=false, do:
		//	|	{ queryOptions: {ignoreCase: true, deep: false} }
		fetchProperties:{},

		// query: Object
		//		A query that can be passed to `store` to initially filter the items.
		//		ComboBox overwrites any reference to the `searchAttr` and sets it to the `queryExpr` with the user's input substituted.
		query: {},

		// list: [const] String
		//		Alternate to specifying a store.  Id of a dijit/form/DataList widget.
		list: "",
		_setListAttr: function(list){
			// Avoid having list applied to the DOM node, since it has native meaning in modern browsers
			this._set("list", list);
		},

		// searchDelay: Integer
		//		Delay in milliseconds between when user types something and we start
		//		searching based on that value
		searchDelay: 200,

		// searchAttr: String
		//		Search for items in the data store where this attribute (in the item)
		//		matches what the user typed
		searchAttr: "name",

		// queryExpr: String
		//		This specifies what query is sent to the data store,
		//		based on what the user has typed.  Changing this expression will modify
		//		whether the results are only exact matches, a "starting with" match,
		//		etc.
		//		`${0}` will be substituted for the user text.
		//		`*` is used for wildcards.
		//		`${0}*` means "starts with", `*${0}*` means "contains", `${0}` means "is"
		queryExpr: "${0}*",

		// ignoreCase: Boolean
		//		Set true if the query should ignore case when matching possible items
		ignoreCase: true,

		_patternToRegExp: function(pattern){
			// summary:
			//		Helper function to convert a simple pattern to a regular expression for matching.
			// description:
			//		Returns a regular expression object that conforms to the defined conversion rules.
			//		For example:
			//
			//		- ca*   -> /^ca.*$/
			//		- *ca*  -> /^.*ca.*$/
			//		- *c\*a*  -> /^.*c\*a.*$/
			//		- *c\*a?*  -> /^.*c\*a..*$/
			//
			//		and so on.
			// pattern: string
			//		A simple matching pattern to convert that follows basic rules:
			//
			//		- * Means match anything, so ca* means match anything starting with ca
			//		- ? Means match single character.  So, b?b will match to bob and bab, and so on.
			//		- \ is an escape character.  So for example, \* means do not treat * as a match, but literal character *.
			//
			//		To use a \ as a character in the string, it must be escaped.  So in the pattern it should be
			//		represented by \\ to be treated as an ordinary \ character instead of an escape.

			return new RegExp("^" + pattern.replace(/(\\.)|(\*)|(\?)|\W/g, function(str, literal, star, question){
				return star ? ".*" : question ? "." : literal ? literal : "\\" + str;
			}) + "$", this.ignoreCase ? "mi" : "m");
		},

		_abortQuery: function(){
			// stop in-progress query
			if(this.searchTimer){
				this.searchTimer = this.searchTimer.remove();
			}
			if(this._queryDeferHandle){
				this._queryDeferHandle = this._queryDeferHandle.remove();
			}
			if(this._fetchHandle){
				if(this._fetchHandle.abort){
					this._cancelingQuery = true;
					this._fetchHandle.abort();
					this._cancelingQuery = false;
				}
				if(this._fetchHandle.cancel){
					this._cancelingQuery = true;
					this._fetchHandle.cancel();
					this._cancelingQuery = false;
				}
				this._fetchHandle = null;
			}
		},

		_processInput: function(/*Event*/ evt){
			// summary:
			//		Handles input (keyboard/paste) events
			if(this.disabled || this.readOnly){ return; }
			var key = evt.charOrCode;

			// except for cutting/pasting case - ctrl + x/v
			if("type" in evt && evt.type.substring(0,3) == "key" && (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != 'x' && key != 'v')) || key == keys.SHIFT)){
				return; // throw out weird key combinations and spurious events
			}

			var doSearch = false;
			this._prev_key_backspace = false;

			switch(key){
				case keys.DELETE:
				case keys.BACKSPACE:
					this._prev_key_backspace = true;
					this._maskValidSubsetError = true;
					doSearch = true;
					break;

				default:
					// Non char keys (F1-F12 etc..) shouldn't start a search..
					// Ascii characters and IME input (Chinese, Japanese etc.) should.
					//IME input produces keycode == 229.
					doSearch = typeof key == 'string' || key == 229;
			}
			if(doSearch){
				// need to wait a tad before start search so that the event
				// bubbles through DOM and we have value visible
				if(!this.store){
					this.onSearch();
				}else{
					this.searchTimer = this.defer("_startSearchFromInput", 1);
				}
			}
		},

		onSearch: function(/*===== results, query, options =====*/){
			// summary:
			//		Callback when a search completes.
			//
			// results: Object
			//		An array of items from the originating _SearchMixin's store.
			//
			// query: Object
			//		A copy of the originating _SearchMixin's query property.
			//
			// options: Object
			//		The additional parameters sent to the originating _SearchMixin's store, including: start, count, queryOptions.
			//
			// tags:
			//		callback
		},

		_startSearchFromInput: function(){
			this._startSearch(this.focusNode.value);
		},

		_startSearch: function(/*String*/ text){
			// summary:
			//		Starts a search for elements matching text (text=="" means to return all items),
			//		and calls onSearch(...) when the search completes, to display the results.

			this._abortQuery();
			var
				_this = this,
				// Setup parameters to be passed to store.query().
				// Create a new query to prevent accidentally querying for a hidden
				// value from FilteringSelect's keyField
				query = lang.clone(this.query), // #5970
				options = {
					start: 0,
					count: this.pageSize,
					queryOptions: {		// remove for 2.0
						ignoreCase: this.ignoreCase,
						deep: true
					}
				},
				qs = string.substitute(this.queryExpr, [text.replace(/([\\\*\?])/g, "\\$1")]),
				q,
				startQuery = function(){
					var resPromise = _this._fetchHandle = _this.store.query(query, options);
					if(_this.disabled || _this.readOnly || (q !== _this._lastQuery)){
						return;
					} // avoid getting unwanted notify
					when(resPromise, function(res){
						_this._fetchHandle = null;
						if(!_this.disabled && !_this.readOnly && (q === _this._lastQuery)){ // avoid getting unwanted notify
							when(resPromise.total, function(total){
								res.total = total;
								var pageSize = _this.pageSize;
								if(isNaN(pageSize) || pageSize > res.total){ pageSize = res.total; }
								// Setup method to fetching the next page of results
								res.nextPage = function(direction){
									//	tell callback the direction of the paging so the screen
									//	reader knows which menu option to shout
									options.direction = direction = direction !== false;
									options.count = pageSize;
									if(direction){
										options.start += res.length;
										if(options.start >= res.total){
											options.count = 0;
										}
									}else{
										options.start -= pageSize;
										if(options.start < 0){
											options.count = Math.max(pageSize + options.start, 0);
											options.start = 0;
										}
									}
									if(options.count <= 0){
										res.length = 0;
										_this.onSearch(res, query, options);
									}else{
										startQuery();
									}
								};
								_this.onSearch(res, query, options);
							});
						}
					}, function(err){
						_this._fetchHandle = null;
						if(!_this._cancelingQuery){	// don't treat canceled query as an error
							console.error(_this.declaredClass + ' ' + err.toString());
						}
					});
				};

			lang.mixin(options, this.fetchProperties);

			// Generate query
			if(this.store._oldAPI){
				// remove this branch for 2.0
				q = qs;
			}else{
				// Query on searchAttr is a regex for benefit of dojo/store/Memory,
				// but with a toString() method to help dojo/store/JsonRest.
				// Search string like "Co*" converted to regex like /^Co.*$/i.
				q = this._patternToRegExp(qs);
				q.toString = function(){ return qs; };
			}

			// set _lastQuery, *then* start the timeout
			// otherwise, if the user types and the last query returns before the timeout,
			// _lastQuery won't be set and their input gets rewritten
			this._lastQuery = query[this.searchAttr] = q;
			this._queryDeferHandle = this.defer(startQuery, this.searchDelay);
		},

		//////////// INITIALIZATION METHODS ///////////////////////////////////////

		constructor: function(){
			this.query={};
			this.fetchProperties={};
		},

		postMixInProperties: function(){
			if(!this.store){
				var list = this.list;
				if(list){
					this.store = registry.byId(list);
				}
			}
			this.inherited(arguments);
		}
	});
});

},
'dojox/mobile/_maskUtils':function(){
define([
	"dojo/_base/window",
	"dojo/dom-style",
	"./sniff"
], function(win, domStyle, has){

	has.add("mask-image-css", function(global, doc, elt){
		return typeof doc.getCSSCanvasContext === "function" && typeof elt.style.webkitMaskImage !== "undefined";
	});

	// Indicates whether image mask is available (either via css mask image or svg)
	has.add("mask-image", function(){
		return has("mask-image-css") || has("svg");
	});

	var cache = {};

	return {
		// summary:
		//		Utility methods to clip rounded corners of various elements (Switch, ScrollablePane, scrollbars in scrollable widgets).
		//		Uses -webkit-mask-image on webkit, or SVG on other browsers.
		
		createRoundMask: function(/*DomNode*/node, x, y, r, b, w, h, rx, ry, e){
			// summary:
			//		Creates and sets a mask for the specified node.
			
			var tw = x + w + r;
			var th = y + h + b;
			
			if(has("mask-image-css")){			// use -webkit-mask-image
				var id = ("DojoMobileMask" + x + y + w + h + rx + ry).replace(/\./g, "_");
				if (!cache[id]) {
					cache[id] = 1;
					var ctx = win.doc.getCSSCanvasContext("2d", id, tw, th);
					ctx.beginPath();
					if (rx == ry) {
						// round arc
						if(rx == 2 && w == 5){
							// optimized case for vertical scrollbar
							ctx.fillStyle = "rgba(0,0,0,0.5)";
							ctx.fillRect(1, 0, 3, 2);
							ctx.fillRect(0, 1, 5, 1);
							ctx.fillRect(0, h - 2, 5, 1);
							ctx.fillRect(1, h - 1, 3, 2);
							ctx.fillStyle = "rgb(0,0,0)";
							ctx.fillRect(0, 2, 5, h - 4);
						}else if(rx == 2 && h == 5){
							// optimized case for horizontal scrollbar
							ctx.fillStyle = "rgba(0,0,0,0.5)";
							ctx.fillRect(0, 1, 2, 3);
							ctx.fillRect(1, 0, 1, 5);
							ctx.fillRect(w - 2, 0, 1, 5);
							ctx.fillRect(w - 1, 1, 2, 3);
							ctx.fillStyle = "rgb(0,0,0)";
							ctx.fillRect(2, 0, w - 4, 5);
						}else{
							// general case
							ctx.fillStyle = "#000000";
							ctx.moveTo(x+rx, y);
							ctx.arcTo(x, y, x, y+rx, rx);
							ctx.lineTo(x, y+h - rx);
							ctx.arcTo(x, y+h, x+rx, y+h, rx);
							ctx.lineTo(x+w - rx, y+h);
							ctx.arcTo(x+w, y+h, x+w, y+rx, rx);
							ctx.lineTo(x+w, y+rx);
							ctx.arcTo(x+w, y, x+w - rx, y, rx);
						}
					} else {
						// elliptical arc
						var pi = Math.PI;
						ctx.scale(1, ry / rx);
						ctx.moveTo(x+rx, y);
						ctx.arc(x+rx, y+rx, rx, 1.5 * pi, 0.5 * pi, true);
						ctx.lineTo(x+w - rx, y+2 * rx);
						ctx.arc(x+w - rx, y+rx, rx, 0.5 * pi, 1.5 * pi, true);
					}
					ctx.closePath();
					ctx.fill();
				}
				node.style.webkitMaskImage = "-webkit-canvas(" + id + ")";
			}else if(has("svg")){		// add an SVG image to clip the corners.
				if(node._svgMask){
					node.removeChild(node._svgMask);
				}
				var bg = null;
				for(var p = node.parentNode; p; p = p.parentNode){
					bg = domStyle.getComputedStyle(p).backgroundColor;
					if(bg && bg != "transparent" && !bg.match(/rgba\(.*,\s*0\s*\)/)){
						break;
					}
				}
				var svgNS = "http://www.w3.org/2000/svg";
				var svg = win.doc.createElementNS(svgNS, "svg");
				svg.setAttribute("width", tw);
				svg.setAttribute("height", th);
				svg.style.position = "absolute";
				svg.style.pointerEvents = "none";
				svg.style.opacity = "1";
				svg.style.zIndex = "2147483647"; // max int
				var path = win.doc.createElementNS(svgNS, "path");
				e = e || 0;
				rx += e;
				ry += e;
				// TODO: optimized cases for scrollbars as in webkit case?
				var d = " M" + (x + rx - e) + "," + (y - e) + " a" + rx + "," + ry + " 0 0,0 " + (-rx) + "," + ry + " v" + (-ry) + " h" + rx + " Z" +
						" M" + (x - e) + "," + (y + h - ry + e) + " a" + rx + "," + ry + " 0 0,0 " + rx + "," + ry + " h" + (-rx) + " v" + (-ry) + " z" +
						" M" + (x + w - rx + e) + "," + (y + h + e) + " a" + rx + "," + ry + " 0 0,0 " + rx + "," + (-ry) + " v" + ry + " h" + (-rx) + " z" +
						" M" + (x + w + e) + "," + (y + ry - e) + " a" + rx + "," + ry + " 0 0,0 " + (-rx) + "," + (-ry) + " h" + rx + " v" + ry + " z";
				if(y > 0){
					d += " M0,0 h" + tw + " v" + y + " h" + (-tw) + " z";
				}
				if(b > 0){
					d += " M0," + (y + h) + " h" + tw + " v" + b + " h" + (-tw) + " z";
				}
				path.setAttribute("d", d);
				path.setAttribute("fill", bg);
				path.setAttribute("stroke", bg);
				path.style.opacity = "1";
				svg.appendChild(path); 
				node._svgMask = svg;
				node.appendChild(svg);
			}
		}
	};
});

},
'dojox/mobile/bookmarkable':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/hash",
	"dijit/registry",
	"./TransitionEvent",
	"./View",
	"./viewRegistry"
], function(array, connect, lang, win, hash, registry, TransitionEvent, View, viewRegistry){

	// module:
	//		dojox/mobile/bookmarkable

	var b = {
		// summary:
		//		Utilities to make the view transitions bookmarkable.

		// settingHash: [private] Boolean
		//		Whether the browser URL needs to be updated to include the hash.
		settingHash: false,
		
		// transitionInfo: Array
		//		An array containing information about the transition.
		transitionInfo: [],

		getTransitionInfo: function(/*String*/ fromViewId, /*String*/ toViewId){
			// summary:
			//		Returns an array containing the transition information.
			return this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")]; // Array
		},

		addTransitionInfo: function(/*String*/ fromViewId, /*String*/ toViewId, /*Object*/args){
			// summary:
			//		Adds transition information.
			this.transitionInfo[fromViewId.replace(/^#/, "") + ":" + toViewId.replace(/^#/, "")] = args;
		},

		findTransitionViews: function(/*String*/moveTo){
			// summary:
			//		Searches for a starting view and a destination view.
			if(!moveTo){ return []; }
			var view = registry.byId(moveTo.replace(/^#/, ""));
			if(!view){ return []; }
			for(var v = view.getParent(); v; v = v.getParent()){ // search for the topmost invisible parent node
				if(v.isVisible && !v.isVisible()){
					view = v;
				}
			}
			// fromView, toView
			return [view.getShowingView(), view]; // Array 
		},

		onHashChange: function(value){
			// summary:
			//		Called on "/dojo/hashchange" events.
			if(this.settingHash){
				this.settingHash = false;
				return;
			}
			var params = this.handleFragIds(value);
			params.hashchange = true;
			new TransitionEvent(win.body(), params).dispatch();
		},

		handleFragIds: function(/*String*/fragIds){
			// summary:
			//		Analyzes the given hash (fragment id).
			// description:
			//		Given a comma-separated list of view IDs, this method
			//		searches for a transition destination, and makes all the
			//		views in the hash visible.

			var arr, moveTo;
			if(!fragIds){
				moveTo = viewRegistry.initialView.id;
				arr = this.findTransitionViews(moveTo);
			}else{
				var ids = fragIds.replace(/^#/, "").split(/,/);
				for(var i = 0; i < ids.length; i++){
					// Search for a transition destination view.

					var view = registry.byId(ids[i]);

					// Skip a visible view. Visible view can't be a destination candidate.
					if(view.isVisible()){ continue; }

					// Check if all the ancestors are in the fragIds.
					// If not, obviously the view was NOT visible before the previous transition.
					// That means the previous transition can't happen from that view,
					// which means the view can't be a destination.
					var success = true;
					for(var v = viewRegistry.getParentView(view); v; v = viewRegistry.getParentView(v)){
						if(array.indexOf(ids, v.id) === -1){
							success = false;
							break;
						}
					}
					if(!success){
						// Simply make the view visible without transition.
						array.forEach(view.getSiblingViews(), function(v){
							v.domNode.style.display = (v === view) ? "" : "none";
						});
						continue;
					}

					arr = this.findTransitionViews(ids[i]);
					if(arr.length === 2){
						moveTo = ids[i];
						// The destination found. But continue the loop to make
						// the other views in the fragIds visible.
					}
				}
			}

			var args = this.getTransitionInfo(arr[0].id, arr[1].id);
			var dir = 1;
			if(!args){
				args = this.getTransitionInfo(arr[1].id, arr[0].id);
				dir = -1;
			}

			return {
				moveTo: "#" + moveTo,
				transitionDir: args ? args.transitionDir * dir : 1,
				transition: args ? args.transition : "none"
			};
		},

		setFragIds: function(/*Widget*/toView){
			// summary:
			//		Updates the hash (fragment id) in the browser URL.
			// description:
			//		The hash value consists of one or more visible view ids
			//		separated with commas.

			var arr = array.filter(viewRegistry.getViews(), function(v){ return v.isVisible(); });
			this.settingHash = true;
			hash(array.map(arr, function(v){ return v.id; }).join(","));
		}
	};

	connect.subscribe("/dojo/hashchange", null, function(){ b.onHashChange.apply(b, arguments); });

	lang.extend(View, {
		getTransitionInfo: function(){ b.getTransitionInfo.apply(b, arguments); },
		addTransitionInfo: function(){ b.addTransitionInfo.apply(b, arguments); },
		handleFragIds: function(){ b.handleFragIds.apply(b, arguments); },
		setFragIds: function(){ b.setFragIds.apply(b, arguments); }
	});

	return b;
});

},
'dojox/mobile/RoundRectDataList':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"./RoundRectList",
	"./_DataListMixin"
], function(kernel, declare, RoundRectList, DataListMixin){

	// module:
	//		dojox/mobile/RoundRectDataList

	kernel.deprecated("dojox/mobile/RoundRectDataList", 
		"Use dojox/mobile/RoundRectStoreList instead", "2.0");
		
	return declare("dojox.mobile.RoundRectDataList", [RoundRectList, DataListMixin], {
		// summary:
		//		A dojo/data-enabled version of RoundRectList.
		// description:
		//		RoundRectDataList is a subclass RoundRectList which
		//		can generate ListItems according to the given dojo/data store.
	});
});

},
'dojox/mobile/sniff':function(){
define([
	"dojo/_base/kernel",
	"dojo/sniff"
], function(kernel, has){

	kernel.deprecated("dojox/mobile/sniff", "Use dojo/sniff instead", "2.0");
	
	// TODO: remove this in 2.0
	has.add("iphone", has("ios"));

	/*=====
	return {
		// summary:
		//		Deprecated: use dojo/sniff instead.
		//		On iOS, dojox/mobile/sniff sets "iphone" to the same value as "ios"
		//		for compatibility with earlier versions, but this should be considered deprecated.
		//		In future versions, "iphone" will be set only when running on an iPhone (not iPad on iPod).
	};
	=====*/
	return has;
});

},
'dijit/form/nls/ComboBox':function(){
define({ root:
//begin v1.x content
({
		previousMessage: "Previous choices",
		nextMessage: "More choices"
})
//end v1.x content
,
"zh": true,
"zh-tw": true,
"uk": true,
"tr": true,
"th": true,
"sv": true,
"sl": true,
"sk": true,
"ru": true,
"ro": true,
"pt": true,
"pt-pt": true,
"pl": true,
"nl": true,
"nb": true,
"ko": true,
"kk": true,
"ja": true,
"it": true,
"id": true,
"hu": true,
"hr": true,
"he": true,
"fr": true,
"fi": true,
"es": true,
"el": true,
"de": true,
"da": true,
"cs": true,
"ca": true,
"bg": true,
"az": true,
"ar": true
});

},
'dojox/mobile/DataCarousel':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"./Carousel",
	"./_DataMixin"
], function(kernel, declare, Carousel, DataMixin){

	// module:
	//		dojox/mobile/DataCarousel

	kernel.deprecated("dojox/mobile/DataCarousel", "Use dojox/mobile/StoreCarousel instead", 2.0);
	return declare("dojox.mobile.DataCarousel", [Carousel, DataMixin], {
		// summary:
		//		A dojo/data-enabled Carousel.
		// description:
		//		DataCarousel is a subclass of dojox/mobile/Carousel which
		//		can generate contents according to the given dojo/data store.
	});
});

},
'dojox/mobile/dh/UrlDataSource':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/xhr"
], function(declare, lang, xhr){

	// module:
	//		dojox/mobile/dh/UrlDataSource

	return declare("dojox.mobile.dh.UrlDataSource", null, {
		// summary:
		//		A component that accesses the given URL and fetches the data as text.

		text: "",

		_url: "",

		constructor: function(/*String*/ url){
			// summary:
			//		Creates a new instance of the class.
			this._url = url;
		},

		getData: function(){
			// summary:
			//		Returns a Deferred that accesses the given URL and fetches the data as text.
			var obj = xhr.get({
				url: this._url,
				handleAs: "text"
			});
			obj.addCallback(lang.hitch(this, function(response, ioArgs){
				this.text = response;
			}));
			obj.addErrback(function(error){
				console.log("Failed to load "+this._url+"\n"+(error.description||error));
			});
			return obj; // Deferred
		}
	});
});

},
'dojox/mobile/ProgressIndicator':function(){
define([
	"dojo/_base/config",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/has",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"./_css3",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ProgressIndicator"
], function(config, declare, lang, domClass, domConstruct, domGeometry, domStyle, has, Contained, WidgetBase, css3, BidiProgressIndicator){

	// module:
	//		dojox/mobile/ProgressIndicator

	var cls = declare("dojox.mobile.ProgressIndicator", [WidgetBase, Contained], {
		// summary:
		//		A progress indication widget.
		// description:
		//		ProgressIndicator is a round spinning graphical representation
		//		that indicates the current task is ongoing.

		// interval: Number
		//		The time interval in milliseconds for updating the spinning
		//		indicator.
		interval: 100,

		// size: [const] Number
		//		The size of the indicator in pixels.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		size: 40,

		// removeOnStop: Boolean
		//		If true, this widget is removed from the parent node
		//		when stop() is called.
		removeOnStop: true,

		// startSpinning: Boolean
		//		If true, calls start() to run the indicator at startup.
		startSpinning: false,

		// center: Boolean
		//		If true, the indicator is displayed as center aligned.
		center: true,

		// colors: String[]
		//		An array of indicator colors. 12 colors have to be given.
		//		If colors are not specified, CSS styles
		//		(mblProg0Color - mblProg11Color) are used.
		colors: null,

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.	
		baseClass: "mblProgressIndicator",

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			this.colors = [];
			this._bars = [];
		},

		buildRendering: function(){
			this.inherited(arguments);
			if(this.center){
				domClass.add(this.domNode, "mblProgressIndicatorCenter");
			}
			this.containerNode = domConstruct.create("div", {className:"mblProgContainer"}, this.domNode);
			this.spinnerNode = domConstruct.create("div", null, this.containerNode);
			for(var i = 0; i < 12; i++){
				var div = domConstruct.create("div", {className:"mblProg mblProg"+i}, this.spinnerNode);
				this._bars.push(div);
			}
			this.scale(this.size);
			if(this.startSpinning){
				this.start();
			}
		},

		scale: function(/*Number*/size){
			// summary:
			//		Changes the size of the indicator.
			// size:
			//		The size of the indicator in pixels.
			var scale = size / 40;
			domStyle.set(this.containerNode, css3.add({}, {
				transform: "scale(" + scale + ")",
				transformOrigin: "0 0"
			}));
			domGeometry.setMarginBox(this.domNode, {w:size, h:size});
			domGeometry.setMarginBox(this.containerNode, {w:size / scale, h:size / scale});
		},

		start: function(){
			// summary:
			//		Starts the spinning of the ProgressIndicator.
			if(this.imageNode){
				var img = this.imageNode;
				var l = Math.round((this.containerNode.offsetWidth - img.offsetWidth) / 2);
				var t = Math.round((this.containerNode.offsetHeight - img.offsetHeight) / 2);
				img.style.margin = t+"px "+l+"px";
				return;
			}
			var cntr = 0;
			var _this = this;
			var n = 12;
			this.timer = setInterval(function(){
				cntr--;
				cntr = cntr < 0 ? n - 1 : cntr;
				var c = _this.colors;
				for(var i = 0; i < n; i++){
					var idx = (cntr + i) % n;
					if(c[idx]){
						_this._bars[i].style.backgroundColor = c[idx];
					}else{
						domClass.replace(_this._bars[i],
										 "mblProg" + idx + "Color",
										 "mblProg" + (idx === n - 1 ? 0 : idx + 1) + "Color");
					}
				}
			}, this.interval);
		},

		stop: function(){
			// summary:
			//		Stops the spinning of the ProgressIndicator.
			if(this.timer){
				clearInterval(this.timer);
			}
			this.timer = null;
			if(this.removeOnStop && this.domNode && this.domNode.parentNode){
				this.domNode.parentNode.removeChild(this.domNode);
			}
		},

		setImage: function(/*String*/file){
			// summary:
			//		Sets an indicator icon image file (typically animated GIF).
			//		If null is specified, restores the default spinner.
			if(file){
				this.imageNode = domConstruct.create("img", {src:file}, this.containerNode);
				this.spinnerNode.style.display = "none";
			}else{
				if(this.imageNode){
					this.containerNode.removeChild(this.imageNode);
					this.imageNode = null;
				}
				this.spinnerNode.style.display = "";
			}
		},

		destroy: function(){
			this.inherited(arguments);
			if(this === cls._instance){
				cls._instance = null;
			}
		}
	});
	cls = has("dojo-bidi") ? declare("dojox.mobile.ProgressIndicator", [cls, BidiProgressIndicator]) : cls;
	cls._instance = null;
	cls.getInstance = function(props){
		if(!cls._instance){
			cls._instance = new cls(props);
		}
		return cls._instance;
	};

	return cls;
});

},
'dojox/mobile/Opener':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"./Tooltip",
	"./Overlay",
	"./lazyLoadUtils"
], function(declare, Deferred, lang, win, domClass, domConstruct, domStyle, domGeometry, Tooltip, Overlay, lazyLoadUtils){

	var isOverlay = domClass.contains(win.doc.documentElement, "dj_phone");
	
	var cls = declare("dojox.mobile.Opener", isOverlay ? Overlay : Tooltip, {
		// summary:
		//		A non-templated popup widget that will use either Tooltip or 
		//		Overlay depending on screen size.

		// lazy: String
		//		If true, the content of the widget, which includes dojo markup,
		//		is instantiated lazily. That is, only when the widget is opened
		//		by the user, the required modules are loaded and the content
		//		widgets are instantiated.
		lazy: false,

		// requires: String
		//		Comma-separated required module names to be lazily loaded. This
		//		is effective only when lazy=true. All the modules specified with
		//		dojoType and their depending modules are automatically loaded
		//		when the widget is opened. However, if you need other extra
		//		modules to be loaded, use this parameter.
		requires: "",

		buildRendering: function(){
			this.inherited(arguments);
			this.cover = domConstruct.create('div', {
				onclick: lang.hitch(this, '_onBlur'), 'class': 'mblOpenerUnderlay',
				style: { position: isOverlay ? 'absolute' : 'fixed', backgroundColor:'transparent', overflow:'hidden', zIndex:'-1' }
			}, this.domNode, 'first');
		},

		onShow: function(/*DomNode*/node){},
		onHide: function(/*DomNode*/node, /*Anything*/v){},

		show: function(node, positions){
			if(this.lazy){
				this.lazy = false;
				var _this = this;
				return Deferred.when(lazyLoadUtils.instantiateLazyWidgets(this.domNode, this.requires), function(){
					return _this.show(node, positions);
				});
			}
			this.node = node;
			this.onShow(node);
			domStyle.set(this.cover, { top:'0px', left:'0px', width:'0px', height:'0px' }); // move cover temporarily to calculate domNode vertical position correctly
			this._resizeCover(domGeometry.position(this.domNode, false)); // must be before this.inherited(arguments) for Tooltip sizing
			return this.inherited(arguments);
		},

		hide: function(/*Anything*/ val){
			this.inherited(arguments);
			this.onHide(this.node, val);
		},
		
		_reposition: function(){
			// tags:
			//		private
			var popupPos = this.inherited(arguments);
			this._resizeCover(popupPos);
			return popupPos;
		},

		_resizeCover: function(popupPos){
			// tags:
			//		private
			if(isOverlay){
				if(parseInt(domStyle.get(this.cover, 'top')) != -popupPos.y || parseInt(domStyle.get(this.cover, 'height')) != popupPos.y){
					var x = Math.max(popupPos.x, 0); // correct onorientationchange values
					domStyle.set(this.cover, { top:-popupPos.y+'px', left:-x+'px', width:popupPos.w+x+'px', height:popupPos.y+'px' });
				}
			}else{
				domStyle.set(this.cover, { 
					width:Math.max(win.doc.documentElement.scrollWidth || win.body().scrollWidth || win.doc.documentElement.clientWidth)+'px', 
					height:Math.max(win.doc.documentElement.scrollHeight || win.body().scrollHeight || win.doc.documentElement.clientHeight)+'px' 
				});
			}			
		},

		_onBlur: function(e){
			// tags:
			//		private
			var ret = this.onBlur(e);
			if(ret !== false){ // only exactly false prevents hide()
				this.hide(e);
			}
			return ret;
		}
	});
	cls.prototype.baseClass += " mblOpener"; // add to either mblOverlay or mblTooltip
	return cls;
});

},
'dojox/mobile':function(){
define([
	".",
	"dojo/_base/lang",
	"dojox/mobile/_base"
], function(dojox, lang, base){
	lang.getObject("mobile", true, dojox);
	/*=====
	return {
		// summary:
		//		Deprecated.  Should require dojox/mobile classes directly rather than trying to access them through
		//		this module.
	};
	=====*/
	return dojox.mobile;
});

},
'dojox/mobile/common':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/kernel",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/domReady",
	"dojo/ready",
	"dojo/touch",
	"dijit/registry",
	"./sniff",
	"./uacss" // (no direct references)
], function(array, config, connect, lang, win, kernel, dom, domClass, domConstruct, domReady, ready, touch, registry, has){

	// module:
	//		dojox/mobile/common

	var dm = lang.getObject("dojox.mobile", true);

	// tell dojo/touch to generate synthetic clicks immediately
	// and regardless of preventDefault() calls on touch events
	win.doc.dojoClick = true;
	/// ... but let user disable this by removing dojoClick from the document
	if(has("touch")){
		// Do we need to send synthetic clicks when preventDefault() is called on touch events?
		// This is normally true on anything except Android 4.1+ and IE10+, but users reported
		// exceptions like Galaxy Note 2. So let's use a has("clicks-prevented") flag, and let
		// applications override it through data-dojo-config="has:{'clicks-prevented':true}" if needed.
		has.add("clicks-prevented", !(has("android") >= 4.1 || (has("ie") === 10) || (!has("ie") && has("trident") > 6)));
		if(has("clicks-prevented")){
			dm._sendClick = function(target, e){
				// dojo/touch will send a click if dojoClick is set, so don't do it again.
				for(var node = target; node; node = node.parentNode){
					if(node.dojoClick){
						return;
					}
				}
				var ev = win.doc.createEvent("MouseEvents"); 
				ev.initMouseEvent("click", true, true, win.global, 1, e.screenX, e.screenY, e.clientX, e.clientY); 
				target.dispatchEvent(ev);
			};
		}
	}

	dm.getScreenSize = function(){
		// summary:
		//		Returns the dimensions of the browser window.
		return {
			h: win.global.innerHeight || win.doc.documentElement.clientHeight,
			w: win.global.innerWidth || win.doc.documentElement.clientWidth
		};
	};

	dm.updateOrient = function(){
		// summary:
		//		Updates the orientation specific CSS classes, 'dj_portrait' and
		//		'dj_landscape'.
		var dim = dm.getScreenSize();
		domClass.replace(win.doc.documentElement,
				  dim.h > dim.w ? "dj_portrait" : "dj_landscape",
				  dim.h > dim.w ? "dj_landscape" : "dj_portrait");
	};
	dm.updateOrient();

	dm.tabletSize = 500;
	dm.detectScreenSize = function(/*Boolean?*/force){
		// summary:
		//		Detects the screen size and determines if the screen is like
		//		phone or like tablet. If the result is changed,
		//		it sets either of the following css class to `<html>`:
		//
		//		- 'dj_phone'
		//		- 'dj_tablet'
		//
		//		and it publishes either of the following events:
		//
		//		- '/dojox/mobile/screenSize/phone'
		//		- '/dojox/mobile/screenSize/tablet'

		var dim = dm.getScreenSize();
		var sz = Math.min(dim.w, dim.h);
		var from, to;
		if(sz >= dm.tabletSize && (force || (!this._sz || this._sz < dm.tabletSize))){
			from = "phone";
			to = "tablet";
		}else if(sz < dm.tabletSize && (force || (!this._sz || this._sz >= dm.tabletSize))){
			from = "tablet";
			to = "phone";
		}
		if(to){
			domClass.replace(win.doc.documentElement, "dj_"+to, "dj_"+from);
			connect.publish("/dojox/mobile/screenSize/"+to, [dim]);
		}
		this._sz = sz;
	};
	dm.detectScreenSize();

	// dojox/mobile.hideAddressBarWait: Number
	//		The time in milliseconds to wait before the fail-safe hiding address
	//		bar runs. The value must be larger than 800.
	dm.hideAddressBarWait = typeof(config.mblHideAddressBarWait) === "number" ?
		config.mblHideAddressBarWait : 1500;

	dm.hide_1 = function(){
		// summary:
		//		Internal function to hide the address bar.
		// tags:
		//		private
		scrollTo(0, 1);
		dm._hidingTimer = (dm._hidingTimer == 0) ? 200 : dm._hidingTimer * 2;
		setTimeout(function(){ // wait for a while for "scrollTo" to finish
			if(dm.isAddressBarHidden() || dm._hidingTimer > dm.hideAddressBarWait){
				// Succeeded to hide address bar, or failed but timed out 
				dm.resizeAll();
				dm._hiding = false;
			}else{
				// Failed to hide address bar, so retry after a while
				setTimeout(dm.hide_1, dm._hidingTimer);
			}
		}, 50); //50ms is an experiential value
	};

	dm.hideAddressBar = function(/*Event?*/evt){
		// summary:
		//		Hides the address bar.
		// description:
		//		Tries to hide the address bar a couple of times. The purpose is to do 
		//		it as quick as possible while ensuring the resize is done after the hiding
		//		finishes.
		if(dm.disableHideAddressBar || dm._hiding){ return; }
		dm._hiding = true;
		dm._hidingTimer = has("ios") ? 200 : 0; // Need to wait longer in case of iPhone
		var minH = screen.availHeight;
		if(has('android')){
			minH = outerHeight / devicePixelRatio;
			// On some Android devices such as Galaxy SII, minH might be 0 at this time.
			// In that case, retry again after a while. (200ms is an experiential value)
			if(minH == 0){
				dm._hiding = false;
				setTimeout(function(){ dm.hideAddressBar(); }, 200);
			}
			// On some Android devices such as HTC EVO, "outerHeight/devicePixelRatio"
			// is too short to hide address bar, so make it high enough
			if(minH <= innerHeight){ minH = outerHeight; }
			// On Android 2.2/2.3, hiding address bar fails when "overflow:hidden" style is
			// applied to html/body element, so force "overflow:visible" style
			if(has('android') < 3){
				win.doc.documentElement.style.overflow = win.body().style.overflow = "visible";
			}
		}
		if(win.body().offsetHeight < minH){ // to ensure enough height for scrollTo to work
			win.body().style.minHeight = minH + "px";
			dm._resetMinHeight = true;
		}
		setTimeout(dm.hide_1, dm._hidingTimer);
	};

	dm.isAddressBarHidden = function(){
		return pageYOffset === 1;
	};

	dm.resizeAll = function(/*Event?*/evt, /*Widget?*/root){
		// summary:
		//		Calls the resize() method of all the top level resizable widgets.
		// description:
		//		Finds all widgets that do not have a parent or the parent does not
		//		have the resize() method, and calls resize() for them.
		//		If a widget has a parent that has resize(), calling widget's
		//		resize() is its parent's responsibility.
		// evt:
		//		Native event object
		// root:
		//		If specified, searches the specified widget recursively for top-level
		//		resizable widgets.
		//		root.resize() is always called regardless of whether root is a
		//		top level widget or not.
		//		If omitted, searches the entire page.
		if(dm.disableResizeAll){ return; }
		connect.publish("/dojox/mobile/resizeAll", [evt, root]); // back compat
		connect.publish("/dojox/mobile/beforeResizeAll", [evt, root]);
		if(dm._resetMinHeight){
			win.body().style.minHeight = dm.getScreenSize().h + "px";
		} 
		dm.updateOrient();
		dm.detectScreenSize();
		var isTopLevel = function(w){
			var parent = w.getParent && w.getParent();
			return !!((!parent || !parent.resize) && w.resize);
		};
		var resizeRecursively = function(w){
			array.forEach(w.getChildren(), function(child){
				if(isTopLevel(child)){ child.resize(); }
				resizeRecursively(child);
			});
		};
		if(root){
			if(root.resize){ root.resize(); }
			resizeRecursively(root);
		}else{
			array.forEach(array.filter(registry.toArray(), isTopLevel),
					function(w){ w.resize(); });
		}
		connect.publish("/dojox/mobile/afterResizeAll", [evt, root]);
	};

	dm.openWindow = function(url, target){
		// summary:
		//		Opens a new browser window with the given URL.
		win.global.open(url, target || "_blank");
	};

	dm._detectWindowsTheme = function(){
		// summary:
		//		Detects if the "windows" theme is used,
		//		if it is used, set has("windows-theme") and
		//		add the .windows_theme class on the document.
		
		// Avoid unwanted (un)zoom on some WP8 devices (at least Nokia Lumia 920) 
		if(navigator.userAgent.match(/IEMobile\/10\.0/)){
			domConstruct.create("style", 
				{innerHTML: "@-ms-viewport {width: auto !important}"}, win.doc.head);
		}

		var setWindowsTheme = function(){
			domClass.add(win.doc.documentElement, "windows_theme");
			kernel.experimental("Dojo Mobile Windows theme", "Behavior and appearance of the Windows theme are experimental.");
		};

		// First see if the "windows-theme" feature has already been set explicitly
		// in that case skip aut-detect
		var windows = has("windows-theme");
		if(windows !== undefined){
			if(windows){
				setWindowsTheme();
			}
			return;
		}

		// check css
		var i, j;

		var check = function(href){
			// TODO: find a better regexp to match?
			if(href && href.indexOf("/windows/") !== -1){
				has.add("windows-theme", true);
				setWindowsTheme();
				return true;
			}
			return false;
		};

		// collect @import
		var s = win.doc.styleSheets;
		for(i = 0; i < s.length; i++){
			if(s[i].href){ continue; }
			var r = s[i].cssRules || s[i].imports;
			if(!r){ continue; }
			for(j = 0; j < r.length; j++){
				if(check(r[j].href)){
					return;
				}
			}
		}

		// collect <link>
		var elems = win.doc.getElementsByTagName("link");
		for(i = 0; i < elems.length; i++){
			if(check(elems[i].href)){
				return;
			}
		}
	};

	if(config.mblApplyPageStyles !== false){
		domClass.add(win.doc.documentElement, "mobile");
	}
	if(has('chrome')){
		// dojox/mobile does not load uacss (only _compat does), but we need dj_chrome.
		domClass.add(win.doc.documentElement, "dj_chrome");
	}

	if(win.global._no_dojo_dm){
		// deviceTheme seems to be loaded from a script tag (= non-dojo usage)
		var _dm = win.global._no_dojo_dm;
		for(var i in _dm){
			dm[i] = _dm[i];
		}
		dm.deviceTheme.setDm(dm);
	}

	// flag for Android transition animation flicker workaround
	has.add('mblAndroidWorkaround', 
			config.mblAndroidWorkaround !== false && has('android') < 3, undefined, true);
	has.add('mblAndroid3Workaround', 
			config.mblAndroid3Workaround !== false && has('android') >= 3, undefined, true);

	dm._detectWindowsTheme();

	dm.setSelectable = function(/*Node*/node, /*Boolean*/selectable){
		var nodes, i;
		node = dom.byId(node);
		if (has("ie") <= 9){
			// (IE < 10) Fall back to setting/removing the
			// unselectable attribute on the element and all its children
			// except the input element (see https://bugs.dojotoolkit.org/ticket/13846)
			nodes = node.getElementsByTagName("*");
			i = nodes.length;
			if(selectable){
				node.removeAttribute("unselectable");
				while(i--){
					nodes[i].removeAttribute("unselectable");
				}
			}else{
				node.setAttribute("unselectable", "on");
				while(i--){
					if (nodes[i].tagName !== "INPUT"){
						nodes[i].setAttribute("unselectable", "on");
					}
				}
			}
		}else{
			domClass.toggle(node, "unselectable", !selectable);
		}
	};

	// Set the background style using dojo/domReady, not dojo/ready, to ensure it is already
	// set at widget initialization time. (#17418) 
	domReady(function(){
		domClass.add(win.body(), "mblBackground");
	});

	ready(function(){
		dm.detectScreenSize(true);
		if(config.mblAndroidWorkaroundButtonStyle !== false && has('android')){
			// workaround for the form button disappearing issue on Android 2.2-4.0
			domConstruct.create("style", {innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;} audio::-webkit-media-controls-play-button,video::-webkit-media-controls-play-button{-webkit-appearance:media-play-button;} video::-webkit-media-controls-fullscreen-button{-webkit-appearance:media-fullscreen-button;}"}, win.doc.head, "first");
		}
		if(has('mblAndroidWorkaround')){
			// add a css class to show view offscreen for android flicker workaround
			domConstruct.create("style", {innerHTML:".mblView.mblAndroidWorkaround{position:absolute;top:-9999px !important;left:-9999px !important;}"}, win.doc.head, "last");
		}

		var f = dm.resizeAll;
		// Address bar hiding
		var isHidingPossible =
			navigator.appVersion.indexOf("Mobile") != -1 && // only mobile browsers
			// #17455: hiding Safari's address bar works in iOS < 7 but this is 
			// no longer possible since iOS 7. Hence, exclude iOS 7 and later: 
			!(has("ios") >= 7);
		// You can disable the hiding of the address bar with the following dojoConfig:
		// var dojoConfig = { mblHideAddressBar: false };
		// If unspecified, the flag defaults to true.
		if((config.mblHideAddressBar !== false && isHidingPossible) ||
			config.mblForceHideAddressBar === true){
			dm.hideAddressBar();
			if(config.mblAlwaysHideAddressBar === true){
				f = dm.hideAddressBar;
			}
		}

		var ios6 = has("ios") >= 6; // Full-screen support for iOS6 or later
		if((has('android') || ios6) && win.global.onorientationchange !== undefined){
			var _f = f;
			var curSize, curClientWidth, curClientHeight;
			if(ios6){
				curClientWidth = win.doc.documentElement.clientWidth;
				curClientHeight = win.doc.documentElement.clientHeight;
			}else{ // Android
				// Call resize for the first resize event after orientationchange
				// because the size information may not yet be up to date when the 
				// event orientationchange occurs.
				f = function(evt){
					var _conn = connect.connect(null, "onresize", null, function(e){
						connect.disconnect(_conn);
						_f(e);
					});
				};
				curSize = dm.getScreenSize();
			};
			// Android: Watch for resize events when the virtual keyboard is shown/hidden.
			// The heuristic to detect this is that the screen width does not change
			// and the height changes by more than 100 pixels.
			//
			// iOS >= 6: Watch for resize events when entering or existing the new iOS6 
			// full-screen mode. The heuristic to detect this is that clientWidth does not
			// change while the clientHeight does change.
			connect.connect(null, "onresize", null, function(e){
				if(ios6){
					var newClientWidth = win.doc.documentElement.clientWidth,
						newClientHeight = win.doc.documentElement.clientHeight;
					if(newClientWidth == curClientWidth && newClientHeight != curClientHeight){
						// full-screen mode has been entered/exited (iOS6)
						_f(e);
					}
					curClientWidth = newClientWidth;
					curClientHeight = newClientHeight;
				}else{ // Android
					var newSize = dm.getScreenSize();
					if(newSize.w == curSize.w && Math.abs(newSize.h - curSize.h) >= 100){
						// keyboard has been shown/hidden (Android)
						_f(e);
					}
					curSize = newSize;
				}
			});
		}
		
		connect.connect(null, win.global.onorientationchange !== undefined
			? "onorientationchange" : "onresize", null, f);
		win.body().style.visibility = "visible";
	});

	// TODO: return functions declared above in this hash, rather than
	// dojox.mobile.

	/*=====
	return {
		// summary:
		//		A common module for dojox/mobile.
		// description:
		//		This module includes common utility functions that are used by
		//		dojox/mobile widgets. Also, it provides functions that are commonly
		//		necessary for mobile web applications, such as the hide address bar
		//		function.
	};
	=====*/
	return dm;
});

},
'dojox/mobile/IconMenu':function(){
define([
	"dojo/_base/declare",
	"dojo/sniff",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/IconMenu",
	"./IconMenuItem"
], function(declare, has, domClass, domConstruct, domStyle, domAttr, Contained, Container, WidgetBase, BidiIconMenu){
	// module:
	//		dojox/mobile/IconMenu

	var IconMenu = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiIconMenu" : "dojox.mobile.IconMenu", [WidgetBase, Container, Contained], {
		// summary:
		//		A pop-up menu.
		// description:
		//		The dojox/mobile/IconMenu widget displays a pop-up menu just
		//		like iPhone's call options menu that is shown while you are on a
		//		call. Each menu item must be dojox/mobile/IconMenuItem.

		// transition: String
		//		The default animated transition effect for child items.
		transition: "slide",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",

		// cols: Number
		//		The number of child items in a row.
		cols: 3,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "ul",

		/* internal properties */
		selectOne: false,
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblIconMenu",
		
		// childItemClass: String
		//		The name of the CSS class of menu items.
		childItemClass: "mblIconMenuItem",

		// _createTerminator: [private] Boolean
		_createTerminator: false,

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			domAttr.set(this.domNode, "role", "menu");
			this.inherited(arguments);

			if(this._createTerminator){
				var t = this._terminator = domConstruct.create("br");
				t.className = this.childItemClass + "Terminator";
				this.domNode.appendChild(t);
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.refresh();
			this.inherited(arguments);
		},

		refresh: function(){
			var p = this.getParent();
			if(p){
				domClass.remove(p.domNode, "mblSimpleDialogDecoration");
			}
			var children = this.getChildren();
			if(this.cols){
				var nRows = Math.ceil(children.length / this.cols);
				var w = Math.floor(100/this.cols);
				var _w = 100 - w*this.cols;
				var h = Math.floor(100 / nRows);
				var _h = 100 - h*nRows;
				if(has("ie")){
					_w--;
					_h--;
				}
			}
			for(var i = 0; i < children.length; i++){
				var item = children[i];
				if(this.cols){
					var first = ((i % this.cols) === 0); // first column
					var last = (((i + 1) % this.cols) === 0); // last column
					var rowIdx = Math.floor(i / this.cols);
					domStyle.set(item.domNode, {
						width: w + (last ? _w : 0) + "%",
						height: h + ((rowIdx + 1 === nRows) ? _h : 0) + "%"
					});
					domClass.toggle(item.domNode, this.childItemClass + "FirstColumn", first);
					domClass.toggle(item.domNode, this.childItemClass + "LastColumn", last);
					domClass.toggle(item.domNode, this.childItemClass + "FirstRow", rowIdx === 0);
					domClass.toggle(item.domNode, this.childItemClass + "LastRow", rowIdx + 1 === nRows);
				}
			};
		},

		addChild: function(widget, /*Number?*/insertIndex){
			this.inherited(arguments);
			this.refresh();
		},

		hide: function(){
			var p = this.getParent();
			if(p && p.hide){
				p.hide();
			}
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.IconMenu", [IconMenu, BidiIconMenu]) : IconMenu;
});

},
'dojox/mobile/_PickerBase':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_PickerBase"
], function(array, declare, Contained, Container, WidgetBase, has, _BidiPickerBase){

	// module:
	//		dojox/mobile/_PickerBase

	var _PickerBase = declare(has("dojo-bidi") ? "dojox.mobile.NonBidi_PickerBase" : "dojox.mobile._PickerBase", [WidgetBase, Container, Contained],{
		// summary:
		//		A base class for picker classes (e.g. SpinWheel, ValuePicker).

		/*=====
		// values: Array
		//		An array of slot values.
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		values: "",
		=====*/
		
		/*=====
		// colors: Array
		//		An array of slot colors.
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		colors: "",
		=====*/
		
		/* internal properties */

		// slotClasses: [protected] Array
		//		An array of slot classes. This property is intended to be used
		//		when you create a subclass of this widget that has specific slots.
		slotClasses: [],

		// slotProps: [protected] Array
		//		An array of property objects for each slot class specified in
		//		slotClasses. This property is intended to be used when you
		//		create a subclass of this widget that has specific slots.
		slotProps: [],

		// slotOrder: [protected] Array
		//		An array of index of slotClasses and slotProps.
		//		If there are three slots and slotOrder=[2,1,0], the slots are
		//		displayed in reversed order. This property is intended to be used
		//		when you create a subclass of this widget that has specific slots.
		slotOrder: [],

		buildRendering: function(){
			this.inherited(arguments);
			this.slots = [];
			for(var i = 0; i < this.slotClasses.length; i++){
				var idx = this.slotOrder.length ? this.slotOrder[i] : i;
				var slot = new this.slotClasses[idx](this.slotProps[idx]);
				this.addChild(slot);
				this.slots[idx] = slot;
			}
		},

		startup: function(){
			if(this._started){ return; }
			this._duringStartup = true;
			this.inherited(arguments);
			this.reset();
			delete this._duringStartup;
		},

		getSlots: function(){
			// summary:
			//		Returns an array of child slot widgets.
			return this.slots.length ? this.slots :
				array.filter(this.getChildren(), function(c){
					return c.declaredClass.indexOf("Slot") !== -1;
				});
		},

		_getValuesAttr: function(){
			// summary:
			//		Returns an array of slot values.
			// tags:
			//		private
			return array.map(this.getSlots(), function(w){
				return w.get("value");
			});
		},

		_setValuesAttr: function(/*Array*/a){
			// summary:
			//		Sets the slot values.
			// tags:
			//		private
			array.forEach(this.getSlots(), function(w, i){
				w.set("value", a[i]);
			});
		},

		_setColorsAttr: function(/*Array*/a){
			// summary:
			//		Sets the slot colors.
			// tags:
			//		private
			array.forEach(this.getSlots(), function(w, i){
				w.setColor && w.setColor(a[i]);
			});
		},

		reset: function(){
			// summary:
			//		Resets the picker to show the initial values.
			array.forEach(this.getSlots(), function(w){
				w.setInitialValue();
			});
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._PickerBase", [_PickerBase, _BidiPickerBase]) : _PickerBase;
});

},
'dojox/mobile/iconUtils':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"./sniff"
], function(array, config, connect, event, lang, win, domClass, domConstruct, domStyle, has){

	var dm = lang.getObject("dojox.mobile", true);

	// module:
	//		dojox/mobile/iconUtils

	var IconUtils = function(){
		// summary:
		//		Utilities to create an icon (image, CSS sprite image, or DOM Button).

		this.setupSpriteIcon = function(/*DomNode*/iconNode, /*String*/iconPos){
			// summary:
			//		Sets up CSS sprite for a foreground image.
			if(iconNode && iconPos){
				var arr = array.map(iconPos.split(/[ ,]/),function(item){return item-0});
				var t = arr[0]; // top
				var r = arr[1] + arr[2]; // right
				var b = arr[0] + arr[3]; // bottom
				var l = arr[1]; // left
				domStyle.set(iconNode, {
					position: "absolute",
					clip: "rect("+t+"px "+r+"px "+b+"px "+l+"px)",
					top: (iconNode.parentNode ? domStyle.get(iconNode, "top") : 0) - t + "px",
					left: -l + "px"
				});
				domClass.add(iconNode, "mblSpriteIcon");
			}
		};

		this.createDomButton = function(/*DomNode*/refNode, /*Object?*/style, /*DomNode?*/toNode){
			// summary:
			//		Creates a DOM button.
			// description:
			//		DOM button is a simple graphical object that consists of one or
			//		more nested DIV elements with some CSS styling. It can be used
			//		in place of an icon image on ListItem, IconItem, and so on.
			//		The kind of DOM button to create is given as a class name of
			//		refNode. The number of DIVs to create is searched from the style
			//		sheets in the page. However, if the class name has a suffix that
			//		starts with an underscore, like mblDomButtonGoldStar_5, then the
			//		suffixed number is used instead. A class name for DOM button
			//		must starts with 'mblDomButton'.
			// refNode:
			//		A node that has a DOM button class name.
			// style:
			//		A hash object to set styles to the node.
			// toNode:
			//		A root node to create a DOM button. If omitted, refNode is used.

			if(!this._domButtons){
				if(has("webkit")){
					var findDomButtons = function(sheet, dic){
						// summary:
						//		Searches the style sheets for DOM buttons.
						// description:
						//		Returns a key-value pair object whose keys are DOM
						//		button class names and values are the number of DOM
						//		elements they need.
						var i, j;
						if(!sheet){
							var _dic = {};
							var ss = win.doc.styleSheets;
							for (i = 0; i < ss.length; i++){
								ss[i] && findDomButtons(ss[i], _dic);
							}
							return _dic;
						}
						var rules = sheet.cssRules || [];
						for (i = 0; i < rules.length; i++){
							var rule = rules[i];
							if(rule.href && rule.styleSheet){
								findDomButtons(rule.styleSheet, dic);
							}else if(rule.selectorText){
								var sels = rule.selectorText.split(/,/);
								for (j = 0; j < sels.length; j++){
									var sel = sels[j];
									var n = sel.split(/>/).length - 1;
									if(sel.match(/(mblDomButton\w+)/)){
										var cls = RegExp.$1;
										if(!dic[cls] || n > dic[cls]){
											dic[cls] = n;
										}
									}
								}
							}
						}
						return dic;
					};
					this._domButtons = findDomButtons();
				}else{
					this._domButtons = {};
				}
			}

			var s = refNode.className;
			var node = toNode || refNode;
			if(s.match(/(mblDomButton\w+)/) && s.indexOf("/") === -1){
				var btnClass = RegExp.$1;
				var nDiv = 4;
				if(s.match(/(mblDomButton\w+_(\d+))/)){
					nDiv = RegExp.$2 - 0;
				}else if(this._domButtons[btnClass] !== undefined){
					nDiv = this._domButtons[btnClass];
				}
				var props = null;
				if(has("bb") && config.mblBBBoxShadowWorkaround !== false){
					// Removes box-shadow because BlackBerry incorrectly renders it.
					props = {style:"-webkit-box-shadow:none"};
				}
				for(var i = 0, p = node; i < nDiv; i++){
					p = p.firstChild || domConstruct.create("div", props, p);
				}
				if(toNode){
					setTimeout(function(){
						domClass.remove(refNode, btnClass);
					}, 0);
					domClass.add(toNode, btnClass);
				}
			}else if(s.indexOf(".") !== -1){ // file name
				domConstruct.create("img", {src:s}, node);
			}else{
				return null;
			}
			domClass.add(node, "mblDomButton");
			!!style && domStyle.set(node, style);
			return node;
		};

		this.createIcon = function(/*String*/icon, /*String?*/iconPos, /*DomNode?*/node, /*String?*/title, /*DomNode?*/parent, /*DomNode?*/refNode, /*String?*/pos){
			// summary:
			//		Creates or updates an icon node
			// description:
			//		If node exists, updates the existing node. Otherwise, creates a new one.
			// icon:
			//		Path for an image, or DOM button class name.
			title = title || "";
			if(icon && icon.indexOf("mblDomButton") === 0){
				// DOM button
				if(!node){
					node = domConstruct.create("div", null, refNode || parent, pos);
				}else{
					if(node.className.match(/(mblDomButton\w+)/)){
						domClass.remove(node, RegExp.$1);
					}
				}
				node.title = title;
				domClass.add(node, icon);
				this.createDomButton(node);
			}else if(icon && icon !== "none"){
				// Image
				if(!node || node.nodeName !== "IMG"){
					node = domConstruct.create("img", {
						alt: title
					}, refNode || parent, pos);
				}
				node.src = (icon || "").replace("${theme}", dm.currentTheme);
				this.setupSpriteIcon(node, iconPos);
				if(iconPos && parent){
					var arr = iconPos.split(/[ ,]/);
					domStyle.set(parent, {
						position: "relative",
						width: arr[2] + "px",
						height: arr[3] + "px"
					});
					domClass.add(parent, "mblSpriteIconParent");
				}
				connect.connect(node, "ondragstart", event, "stop");
			}
			return node;
		};

		this.iconWrapper = false;
		this.setIcon = function(/*String*/icon, /*String*/iconPos, /*DomNode*/iconNode, /*String?*/alt, /*DomNode*/parent, /*DomNode?*/refNode, /*String?*/pos){
			// summary:
			//		A setter function to set an icon.
			// description:
			//		This function is intended to be used by icon setters (e.g. _setIconAttr)
			// icon:
			//		An icon path or a DOM button class name.
			// iconPos:
			//		The position of an aggregated icon. IconPos is comma separated
			//		values like top,left,width,height (ex. "0,0,29,29").
			// iconNode:
			//		An icon node.
			// alt:
			//		An alt text for the icon image.
			// parent:
			//		Parent node of the icon.
			// refNode:
			//		A node reference to place the icon.
			// pos:
			//		The position of the icon relative to refNode.
			if(!parent || !icon && !iconNode){ return null; }
			if(icon && icon !== "none"){ // create or update an icon
				if(!this.iconWrapper && icon.indexOf("mblDomButton") !== 0 && !iconPos){ // image
					if(iconNode && iconNode.tagName === "DIV"){
						domConstruct.destroy(iconNode);
						iconNode = null;
					}
					iconNode = this.createIcon(icon, null, iconNode, alt, parent, refNode, pos);
					domClass.add(iconNode, "mblImageIcon");
				}else{ // sprite or DOM button
					if(iconNode && iconNode.tagName === "IMG"){
						domConstruct.destroy(iconNode);
						iconNode = null;
					}
					iconNode && domConstruct.empty(iconNode);
					if(!iconNode){
						iconNode = domConstruct.create("div", null, refNode || parent, pos);
					}
					this.createIcon(icon, iconPos, null, null, iconNode);
					if(alt){
						iconNode.title = alt;
					}
				}
				domClass.remove(parent, "mblNoIcon");
				return iconNode;
			}else{ // clear the icon
				domConstruct.destroy(iconNode);
				domClass.add(parent, "mblNoIcon");
				return null;
			}
		};
	};

	// Return singleton.  (TODO: can we replace IconUtils class and singleton w/a simple hash of functions?)
	return new IconUtils();
});

},
'dojox/mobile/Heading':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/registry",
	"./common",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./ProgressIndicator",
	"./ToolBarButton",
	"./View",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Heading"
], function(array, connect, declare, lang, win, domClass, domConstruct, domStyle, domAttr, registry, common, Contained, Container, WidgetBase, ProgressIndicator, ToolBarButton, View, has, BidiHeading){

	// module:
	//		dojox/mobile/Heading

	var dm = lang.getObject("dojox.mobile", true);

	var Heading = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiHeading" : "dojox.mobile.Heading", [WidgetBase, Container, Contained],{
		// summary:
		//		A widget that represents a navigation bar.
		// description:
		//		Heading is a widget that represents a navigation bar, which
		//		usually appears at the top of an application. It usually
		//		displays the title of the current view and can contain a
		//		navigational control. If you use it with
		//		dojox/mobile/ScrollableView, it can also be used as a fixed
		//		header bar or a fixed footer bar. In such cases, specify the
		//		fixed="top" attribute to be a fixed header bar or the
		//		fixed="bottom" attribute to be a fixed footer bar. Heading can
		//		have one or more ToolBarButton widgets as its children.

		// back: String
		//		A label for the navigational control to return to the previous View.
		back: "",

		// href: String
		//		A URL to open when the navigational control is pressed.
		href: "",

		// moveTo: String
		//		The id of the transition destination of the navigation control.
		//		If the value has a hash sign ('#') before the id (e.g. #view1)
		//		and the dojox/mobile/bookmarkable module is loaded by the user application,
		//		the view transition updates the hash in the browser URL so that the
		//		user can bookmark the destination view. In this case, the user
		//		can also use the browser's back/forward button to navigate
		//		through the views in the browser history.
		//
		//		If null, transitions to a blank view.
		//		If '#', returns immediately without transition.
		moveTo: "",

		// transition: String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types, "slide", "fade", "flip", or from the
		//		extended transition types, "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, transition occurs immediately without animation.
		transition: "slide",

		// label: String
		//		A title text of the heading. If the label is not specified, the
		//		innerHTML of the node is used as a label.
		label: "",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// tag: String
		//		A name of HTML tag to create as domNode.
		tag: "h1",

		// busy: Boolean
		//		If true, a progress indicator spins on this widget.
		busy: false,

		// progStyle: String
		//		A css class name to add to the progress indicator.
		progStyle: "mblProgWhite",

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.	
		baseClass: "mblHeading",

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || win.doc.createElement(this.tag);
			}
			this.inherited(arguments);
			
			if(!this.templateString){ // true if this widget is not templated
				if(!this.label){
					array.forEach(this.domNode.childNodes, function(n){
						if(n.nodeType == 3){
							var v = lang.trim(n.nodeValue);
							if(v){
								this.label = v;
								this.labelNode = domConstruct.create("span", {innerHTML:v}, n, "replace");
							}
						}
					}, this);
				}
				if(!this.labelNode){
					this.labelNode = domConstruct.create("span", null, this.domNode);
				}
				this.labelNode.className = "mblHeadingSpanTitle";
				this.labelDivNode = domConstruct.create("div", {
					className: "mblHeadingDivTitle",
					innerHTML: this.labelNode.innerHTML
				}, this.domNode);
			}

			if(this.labelDivNode){
				domAttr.set(this.labelDivNode, "role", "heading"); //a11y
				domAttr.set(this.labelDivNode, "aria-level", "1");
			}

			common.setSelectable(this.domNode, false);
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent && this.getParent();
			if(!parent || !parent.resize){ // top level widget
				var _this = this;
				_this.defer(function(){ // necessary to render correctly
					_this.resize();
				});
			}
			this.inherited(arguments);
		},

		resize: function(){
			if(this.labelNode){
				// find the rightmost left button (B), and leftmost right button (C)
				// +-----------------------------+
				// | |A| |B|             |C| |D| |
				// +-----------------------------+
				var leftBtn, rightBtn;
				var children = this.containerNode.childNodes;
				for(var i = children.length - 1; i >= 0; i--){
					var c = children[i];
					if(c.nodeType === 1 && domStyle.get(c, "display") !== "none"){
						if(!rightBtn && domStyle.get(c, "float") === "right"){
							rightBtn = c;
						}
						if(!leftBtn && domStyle.get(c, "float") === "left"){
							leftBtn = c;
						}
					}
				}

				if(!this.labelNodeLen && this.label){
					this.labelNode.style.display = "inline";
					this.labelNodeLen = this.labelNode.offsetWidth;
					this.labelNode.style.display = "";
				}

				var bw = this.domNode.offsetWidth; // bar width
				var rw = rightBtn ? bw - rightBtn.offsetLeft + 5 : 0; // rightBtn width
				var lw = leftBtn ? leftBtn.offsetLeft + leftBtn.offsetWidth + 5 : 0; // leftBtn width
				var tw = this.labelNodeLen || 0; // title width
				domClass[bw - Math.max(rw,lw)*2 > tw ? "add" : "remove"](this.domNode, "mblHeadingCenterTitle");
			}
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		_setBackAttr: function(/*String*/back){
			// tags:
			//		private
			this._set("back", back);
			if(!this.backButton){
				this.backButton = new ToolBarButton({
					arrow: "left",
					label: back,
					moveTo: this.moveTo,
					back: !this.moveTo && !this.href, // use browser history unless moveTo or href
					href: this.href,
					transition: this.transition,
					transitionDir: -1,
					dir: this.isLeftToRight() ? "ltr" : "rtl"
				});
				this.backButton.placeAt(this.domNode, "first");
			}else{
				this.backButton.set("label", back);
			}
			this.resize();
		},
		
		_setMoveToAttr: function(/*String*/moveTo){
			// tags:
			//		private
			this._set("moveTo", moveTo);
			if(this.backButton){
				this.backButton.set("moveTo", moveTo);
				this.backButton.set("back", !moveTo && !this.href);
			}
		},
		
		_setHrefAttr: function(/*String*/href){
			// tags:
			//		private
			this._set("href", href);
			if(this.backButton){
				this.backButton.set("href", href);
				this.backButton.set("back", !this.moveTo && !href);
			}
		},
		
		_setTransitionAttr: function(/*String*/transition){
			// tags:
			//		private
			this._set("transition", transition);
			if(this.backButton){
				this.backButton.set("transition", transition);
			}
		},
		
		_setLabelAttr: function(/*String*/label){
			// tags:
			//		private
			this._set("label", label);
			this.labelNode.innerHTML = this.labelDivNode.innerHTML = this._cv ? this._cv(label) : label;
			delete this.labelNodeLen;
		},

		_setBusyAttr: function(/*Boolean*/busy){
			// tags:
			//		private
			var prog = this._prog;
			if(busy){
				if(!prog){
					prog = this._prog = new ProgressIndicator({size:30, center:false});
					domClass.add(prog.domNode, this.progStyle);
				}
				domConstruct.place(prog.domNode, this.domNode, "first");
				prog.start();
			}else if(prog){
				prog.stop();
			}
			this._set("busy", busy);
		}	
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Heading", [Heading, BidiHeading]) : Heading;
});

},
'dojox/main':function(){
define(["dojo/_base/kernel"], function(dojo) {
	// module:
	//		dojox/main

	/*=====
	return {
		// summary:
		//		The dojox package main module; dojox package is somewhat unusual in that the main module currently just provides an empty object.
		//		Apps should require modules from the dojox packages directly, rather than loading this module.
	};
	=====*/

	return dojo.dojox;
});
},
'dojox/mobile/LongListMixin':function(){
define([ "dojo/_base/array",
         "dojo/_base/lang",
         "dojo/_base/declare",
         "dojo/sniff",
         "dojo/dom-construct",
         "dojo/dom-geometry",
         "dijit/registry",
         "./common",
         "./viewRegistry" ],
		function(array, lang, declare, has, domConstruct, domGeometry, registry, dm, viewRegistry){

	// module:
	//		dojox/mobile/LongListMixin
	// summary:
	//		A mixin that enhances performance of long lists contained in scrollable views.

	return declare("dojox.mobile.LongListMixin", null, {
		// summary:
		//		This mixin enhances performance of very long lists contained in scrollable views.
		// description:
		//		LongListMixin enhances a list contained in a ScrollableView
		//		so that only a subset of the list items are actually contained in the DOM
		//		at any given time. 
		//		The parent must be a ScrollableView or another scrollable component
		//		that inherits from the dojox.mobile.scrollable mixin, otherwise the mixin has
		//		no effect. Also, editable lists are not yet supported, so lazy scrolling is
		//		disabled if the list's 'editable' attribute is true.
		//		If this mixin is used, list items must be added, removed or reordered exclusively
		//		using the addChild and removeChild methods of the list. If the DOM is modified
		//		directly (for example using list.containerNode.appendChild(...)), the list
		//		will not behave correctly.
		
		// pageSize: int
		//		Items are loaded in the DOM by chunks of this size.
		pageSize: 20,
		
		// maxPages: int
		//		When this limit is reached, previous pages will be unloaded.
		maxPages: 5,
		
		// unloadPages: int
		//		Number of pages that will be unloaded when maxPages is reached.
		unloadPages: 1,
		
		startup : function(){
			if(this._started){ return; }
			
			this.inherited(arguments);

			if(!this.editable){

				this._sv = viewRegistry.getEnclosingScrollable(this.domNode);

				if(this._sv){

					// Get all children already added (e.g. through markup) and initialize _items
					this._items = this.getChildren();

					// remove all existing items from the old container node
					this._clearItems();

					this.containerNode = domConstruct.create("div", null, this.domNode);

					// listen to scrollTo and slideTo from the parent scrollable object

					this.connect(this._sv, "scrollTo", lang.hitch(this, this._loadItems), true);
					this.connect(this._sv, "slideTo", lang.hitch(this, this._loadItems), true);

					// The _topDiv and _bottomDiv elements are place holders for the items
					// that are not actually in the DOM at the top and bottom of the list.

					this._topDiv = domConstruct.create("div", null, this.domNode, "first");
					this._bottomDiv = domConstruct.create("div", null, this.domNode, "last");

					this._reloadItems();
				}
			}
		},
		
		_loadItems : function(toPos){
			// summary:	Adds and removes items to/from the DOM when the list is scrolled.
			
			var sv = this._sv; 			// ScrollableView
			var h = sv.getDim().d.h;
			if(h <= 0){ return; } 			// view is hidden

			var cury = -sv.getPos().y; // current y scroll position
			var posy = toPos ? -toPos.y : cury;

			// get minimum and maximum visible y positions:
			// we use the largest area including both the current and new position
			// so that all items will be visible during slideTo animations
			var visibleYMin = Math.min(cury, posy),
				visibleYMax = Math.max(cury, posy) + h;
			
			// add pages at top and bottom as required to fill the visible area
			while(this._loadedYMin > visibleYMin && this._addBefore()){ }
			while(this._loadedYMax < visibleYMax && this._addAfter()){ }
		},
		
		_reloadItems: function(){
			// summary:	Resets the internal state and reloads items according to the current scroll position.

			// remove all loaded items
			this._clearItems();
			
			// reset internal state
			this._loadedYMin = this._loadedYMax = 0;
			this._firstIndex = 0;
			this._lastIndex = -1;
			this._topDiv.style.height = "0px";
			
			this._loadItems();
		},
		
		_clearItems: function(){
			// summary: Removes all currently loaded items.
			var c = this.containerNode;
			array.forEach(registry.findWidgets(c), function(item){
				c.removeChild(item.domNode);
			});
		},
		
		_addBefore: function(){
			// summary:	Loads pages of items before the currently visible items to fill the visible area.
			
			var i, count;
			
			var oldBox = domGeometry.getMarginBox(this.containerNode);
			
			for(count = 0, i = this._firstIndex-1; count < this.pageSize && i >= 0; count++, i--){
				var item = this._items[i];
				domConstruct.place(item.domNode, this.containerNode, "first");
				if(!item._started){
					item.startup();
				}
				this._firstIndex = i;
			}
			
			var newBox = domGeometry.getMarginBox(this.containerNode);

			this._adjustTopDiv(oldBox, newBox);
			
			if(this._lastIndex - this._firstIndex >= this.maxPages*this.pageSize){
				var toRemove = this.unloadPages*this.pageSize;
				for(i = 0; i < toRemove; i++){
					this.containerNode.removeChild(this._items[this._lastIndex - i].domNode);
				}
				this._lastIndex -= toRemove;
				
				newBox = domGeometry.getMarginBox(this.containerNode);
			}

			this._adjustBottomDiv(newBox);
			
			return count == this.pageSize;
		},
		
		_addAfter: function(){
			// summary:	Loads pages of items after the currently visible items to fill the visible area.
			
			var i, count;
			
			var oldBox = null;
			
			for(count = 0, i = this._lastIndex+1; count < this.pageSize && i < this._items.length; count++, i++){
				var item = this._items[i];
				domConstruct.place(item.domNode, this.containerNode);
				if(!item._started){
					item.startup();
				}
				this._lastIndex = i;
			}
			if(this._lastIndex - this._firstIndex >= this.maxPages*this.pageSize){
				oldBox = domGeometry.getMarginBox(this.containerNode);
				var toRemove = this.unloadPages*this.pageSize;
				for(i = 0; i < toRemove; i++){
					this.containerNode.removeChild(this._items[this._firstIndex + i].domNode);
				}
				this._firstIndex += toRemove;
			}
			
			var newBox = domGeometry.getMarginBox(this.containerNode);

			if(oldBox){
				this._adjustTopDiv(oldBox, newBox);
			}
			this._adjustBottomDiv(newBox);

			return count == this.pageSize;
		},
		
		_adjustTopDiv: function(oldBox, newBox){
			// summary:	Adjusts the height of the top filler div after items have been added/removed.
			
			this._loadedYMin -= newBox.h - oldBox.h;
			this._topDiv.style.height = this._loadedYMin + "px";
		},
		
		_adjustBottomDiv: function(newBox){
			// summary:	Adjusts the height of the bottom filler div after items have been added/removed.
			
			// the total height is an estimate based on the average height of the already loaded items
			var h = this._lastIndex > 0 ? (this._loadedYMin + newBox.h) / this._lastIndex : 0;
			h *= this._items.length - 1 - this._lastIndex;
			this._bottomDiv.style.height = h + "px";
			this._loadedYMax = this._loadedYMin + newBox.h;
		},
		
		_childrenChanged : function(){
			// summary: Called by addChild/removeChild, updates the loaded items.
			
			// Whenever an item is added or removed, this may impact the loaded items,
			// so we have to clear all loaded items and recompute them. We cannot afford 
			// to do this on every add/remove, so we use a timer to batch these updates.
			// There would probably be a way to update the loaded items on the fly
			// in add/removeChild, but at the cost of much more code...
			if(!this._qs_timer){
				this._qs_timer = this.defer(function(){
					delete this._qs_timer;
					this._reloadItems();
				});
			}
		},

		resize: function(){
			// summary: Loads/unloads items to fit the new size
			this.inherited(arguments);
			if(this._items){
				this._loadItems();
			}
		},
		
		// The rest of the methods are overrides of _Container and _WidgetBase.
		// We must override them because children are not all added to the DOM tree
		// under the list node, only a subset of them will really be in the DOM,
		// but we still want the list to look as if all children were there.

		addChild : function(/* dijit._Widget */widget, /* int? */insertIndex){
			// summary: Overrides dijit._Container
			if(this._items){
				if( typeof insertIndex == "number"){
					this._items.splice(insertIndex, 0, widget);
				}else{
					this._items.push(widget);
				}
				this._childrenChanged();
			}else{
				this.inherited(arguments);
			}
		},

		removeChild : function(/* Widget|int */widget){
			// summary: Overrides dijit._Container
			if(this._items){
				this._items.splice(typeof widget == "number" ? widget : this._items.indexOf(widget), 1);
				this._childrenChanged();
			}else{
				this.inherited(arguments);
			}
		},

		getChildren : function(){
			// summary: Overrides dijit._WidgetBase
			if(this._items){
				return this._items.slice(0);
			}else{
				return this.inherited(arguments);
			}
		},

		_getSiblingOfChild : function(/* dijit._Widget */child, /* int */dir){
			// summary: Overrides dijit._Container

			if(this._items){
				var index = this._items.indexOf(child);
				if(index >= 0){
					index = dir > 0 ? index++ : index--;
				}
				return this._items[index];
			}else{
				return this.inherited(arguments);
			}
		},
		
		generateList: function(/*Array*/items){
			// summary:
			//		Overrides dojox.mobile._StoreListMixin when the list is a store list.
			
			if(this._items && !this.append){
				// _StoreListMixin calls destroyRecursive to delete existing items, not removeChild,
				// so we must remove all logical items (i.e. clear _items) before reloading the store.
				// And since the superclass destroys all children returned by getChildren(), and
				// this would actually return no children because _items is now empty, we must
				// destroy all children manually first.
				array.forEach(this.getChildren(), function(child){
					child.destroyRecursive();
				});
				this._items = [];
			}
			this.inherited(arguments);
		}
	});
});

},
'dojox/mobile/RoundRectList':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase"
], function(array, declare, event, lang, win, domConstruct, domAttr, Contained, Container, WidgetBase){

	// module:
	//		dojox/mobile/RoundRectList

	return declare("dojox.mobile.RoundRectList", [WidgetBase, Container, Contained], {
		// summary:
		//		A rounded rectangle list.
		// description:
		//		RoundRectList is a rounded rectangle list, which can be used to
		//		display a group of items. Each item must be a dojox/mobile/ListItem.

		// transition: String
		//		The default animated transition effect for child items.
		transition: "slide",

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",

		// select: String
		//		Selection mode of the list. The check mark is shown for the
		//		selected list item(s). The value can be "single", "multiple", or "".
		//		If "single", there can be only one selected item at a time.
		//		If "multiple", there can be multiple selected items at a time.
		//		If "", the check mark is not shown.
		select: "",

		// stateful: Boolean
		//		If true, the last selected item remains highlighted.
		stateful: false,

		// syncWithViews: [const] Boolean
		//		If true, this widget listens to view transition events to be
		//		synchronized with view's visibility.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		syncWithViews: false,

		// editable: [const] Boolean
		//		If true, the list can be reordered.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		editable: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "ul",

		/* internal properties */
		// editableMixinClass: String
		//		The name of the mixin class.
		editableMixinClass: "dojox/mobile/_EditableListMixin",
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRectList",
		
		// filterBoxClass: String
		//		The name of the CSS class added to the DOM node inside which is placed the 
		//		dojox/mobile/SearchBox created when mixing dojox/mobile/FilteredListMixin.
		//		The default value is "mblFilteredRoundRectListSearchBox".  
		filterBoxClass: "mblFilteredRoundRectListSearchBox",

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			if(this.select){
				domAttr.set(this.domNode, "role", "listbox");
				if(this.select === "multiple"){
					domAttr.set(this.domNode, "aria-multiselectable", "true");
				}
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			if(this.editable){
				require([this.editableMixinClass], lang.hitch(this, function(module){
					declare.safeMixin(this, new module());
				}));
			}
			this.connect(this.domNode, "onselectstart", event.stop);

			if(this.syncWithViews){ // see also TabBar#postCreate
				var f = function(view, moveTo, dir, transition, context, method){
					var child = array.filter(this.getChildren(), function(w){
						return w.moveTo === "#" + view.id || w.moveTo === view.id; })[0];
					if(child){ child.set("selected", true); }
				};
				this.subscribe("/dojox/mobile/afterTransitionIn", f);
				this.subscribe("/dojox/mobile/startView", f);
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onCheckStateChanged: function(/*Widget*//*===== listItem, =====*/ /*String*//*===== newState =====*/){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called when the check state has been changed.
		},

		_setStatefulAttr: function(stateful){
			// tags:
			//		private
			this._set("stateful", stateful);
			this.selectOne = stateful;
			array.forEach(this.getChildren(), function(child){
				child.setArrow && child.setArrow();
			});
		},

		deselectItem: function(/*dojox/mobile/ListItem*/item){
			// summary:
			//		Deselects the given item.
			item.set("selected", false);
		},

		deselectAll: function(){
			// summary:
			//		Deselects all the items.
			array.forEach(this.getChildren(), function(child){
				child.set("selected", false);
			});
		},

		selectItem: function(/*ListItem*/item){
			// summary:
			//		Selects the given item.
			item.set("selected", true);
		}
	});
});

},
'dojox/mobile/FixedSplitter':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"dojo/has"
], function(array, declare, win, domClass, domGeometry, Contained, Container, WidgetBase, has){

	// module:
	//		dojox/mobile/FixedSplitter

	return declare("dojox.mobile.FixedSplitter", [WidgetBase, Container, Contained], {
		// summary:
		//		A layout container that splits the window horizontally or
		//		vertically.
		// description:
		//		FixedSplitter is a very simple container widget that layouts its
		//		child DOM nodes side by side either horizontally or
		//		vertically. An example usage of this widget would be to realize
		//		the split view on iPad. There is no visual splitter between the
		//		children, and there is no function to resize the child panes
		//		with drag-and-drop. If you need a visual splitter, you can
		//		specify a border of a child DOM node with CSS.
		//
		//		FixedSplitter has no knowledge of its child widgets.
		//		dojox/mobile/Container, dojox/mobile/Pane, or dojox/mobile/ContentPane 
		//		can be used as a child widget of FixedSplitter.
		//
		//		- Use dojox/mobile/Container if your content consists of ONLY
		//		  Dojo widgets.
		//		- Use dojox/mobile/Pane if your content is an inline HTML
		//		  fragment (may or may not include Dojo widgets).
		//		- Use dojox/mobile/ContentPane if your content is an external
		//		  HTML fragment (may or may not include Dojo widgets).
		//
		// example:
		//	|	<div data-dojo-type="dojox.mobile.FixedSplitter" orientation="H">
		//	|		<div data-dojo-type="dojox.mobile.Pane"
		//	|			style="width:200px;border-right:1px solid black;">
		//	|			pane #1 (width=200px)
		//	|		</div>
		//	|		<div data-dojo-type="dojox.mobile.Pane">
		//	|			pane #2
		//	|		</div>
		//	|	</div>

		// orientation: String
		//		The direction of split. If "H" is specified, panes are split
		//		horizontally. If "V" is specified, panes are split vertically.
		orientation: "H",

		// variablePane: Number
		//		The index of a pane that fills the remainig space.
		//		If -1, the last child pane fills the remaining space.
		variablePane: -1,

		// screenSizeAware: Boolean
		//		If true, dynamically load a screen-size-aware module.
		screenSizeAware: false,

		// screenSizeAwareClass: String
		//		A screen-size-aware module to load.
		screenSizeAwareClass: "dojox/mobile/ScreenSizeAware",

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblFixedSplitter",

		startup: function(){
			if(this._started){ return; }
			domClass.add(this.domNode, this.baseClass + this.orientation);

			var parent = this.getParent(), f;
			if(!parent || !parent.resize){ // top level widget
				var _this = this;
				f = function(){
					_this.defer(function(){
						_this.resize();
					});
				};
			}

			if(this.screenSizeAware){
				require([this.screenSizeAwareClass], function(module){
					module.getInstance();
					f && f();
				});
			}else{
				f && f();
			}

			this.inherited(arguments);
		},

		resize: function(){
			var paddingTop = domGeometry.getPadExtents(this.domNode).t;
			var wh = this.orientation === "H" ? "w" : "h", // width/height
				tl = this.orientation === "H" ? "l" : "t", // top/left
				props1 = {}, props2 = {},
				i, c, h,
				a = [], offset = 0, total = 0,
				children = array.filter(this.domNode.childNodes, function(node){ return node.nodeType == 1; }),
				idx = this.variablePane == -1 ? children.length - 1 : this.variablePane;
			for(i = 0; i < children.length; i++){
				if(i != idx){
					a[i] = domGeometry.getMarginBox(children[i])[wh];
					total += a[i];
				}
			}

			if(this.orientation == "V"){
				if(this.domNode.parentNode.tagName == "BODY"){
					if(array.filter(win.body().childNodes, function(node){ return node.nodeType == 1; }).length == 1){
						h = (win.global.innerHeight||win.doc.documentElement.clientHeight);
					}
				}
			}
			var l = (h || domGeometry.getMarginBox(this.domNode)[wh]) - total;
			if(this.orientation === "V"){
				l -= paddingTop;
			}
			props2[wh] = a[idx] = l;
			c = children[idx];
			domGeometry.setMarginBox(c, props2);
			c.style[this.orientation === "H" ? "height" : "width"] = "";
			// dojox.mobile mirroring support
			if(has("dojo-bidi") && (this.orientation=="H" && !this.isLeftToRight())){
				offset = l;
				for(i = children.length - 1; i >= 0; i--){
					c = children[i];
					props1[tl] = l - offset;
					domGeometry.setMarginBox(c, props1);
					if(this.orientation === "H"){
						c.style.top = paddingTop +"px";
					}else{
						c.style.left = "";
					}
					offset -= a[i];
				}
			}else{
				if(this.orientation === "V"){
					offset = offset ? offset + paddingTop : paddingTop;
				}

				for(i = 0; i < children.length; i++){
					c = children[i];
					props1[tl] = offset;

					domGeometry.setMarginBox(c, props1);
					if(this.orientation === "H"){
						c.style.top = paddingTop +"px";
					}else{
						c.style.left = "";
					}
					offset += a[i];
				}
			}

			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		_setOrientationAttr: function(/*String*/orientation){
			// summary:
			//		Sets the direction of split.
			// description:
			//		The value must be either "H" or "V".
			//		If "H" is specified, panes are split horizontally.
			//		If "V" is specified, panes are split vertically.
			// tags:
			//		private
			var s = this.baseClass;
			domClass.replace(this.domNode, s + orientation, s + this.orientation);
			this.orientation = orientation;
			if(this._started){
				this.resize();
			}
		}
	});
});

},
'dojox/mobile/RadioButton':function(){
define([
	"dojo/_base/declare",
	"dijit/form/_RadioButtonMixin",
	"./CheckBox"
], function(declare, RadioButtonMixin, CheckBox){

	return declare("dojox.mobile.RadioButton", [CheckBox, RadioButtonMixin], {
		// summary:
		//		A non-templated radio button widget that can be in two states (checked or not checked).

		// _setTypeAttr: [private] Function 
		//		Overrides the automatic assignment of type to nodes, because it causes
		//		exception on IE. Instead, the type must be specified as this.type
		//		when the node is created, as part of the original DOM.
		_setTypeAttr: null,

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRadioButton"
	});
});

},
'dojox/mobile/viewRegistry':function(){
define([
	"dojo/_base/array",
	"dojo/dom-class",
	"dijit/registry"
], function(array, domClass, registry){

	// module:
	//		dojox/mobile/viewRegistry

	var viewRegistry = {
		// summary:
		//		A registry of existing views.

		// length: Number
		//		The number of registered views.
		length: 0,
		
		// hash: [private] Object
		//		The object used to register views.
		hash: {},
		
		// initialView: [private] dojox/mobile/View
		//		The initial view.
		initialView: null,

		add: function(/*dojox/mobile/View*/ view){
			// summary:
			//		Adds a view to the registry.
			this.hash[view.id] = view;
			this.length++;
		},

		remove: function(/*String*/ id){
			// summary:
			//		Removes a view from the registry.
			if(this.hash[id]){
				delete this.hash[id];
				this.length--;
			}
		},

		getViews: function(){
			// summary:
			//		Gets all registered views.
			// returns: Array
			var arr = [];
			for(var i in this.hash){
				arr.push(this.hash[i]);
			}
			return arr;
		},

		getParentView: function(/*dojox/mobile/View*/ view){
			// summary:
			//		Gets the parent view of the specified view.
			// returns: dojox/mobile/View
			for(var v = view.getParent(); v; v = v.getParent()){
				if(domClass.contains(v.domNode, "mblView")){ return v; }
			}
			return null;
		},

		getChildViews: function(/*dojox/mobile/View*/ parent){
			// summary:
			//		Gets the children views of the specified view.
			// returns: Array
			return array.filter(this.getViews(), function(v){ return this.getParentView(v) === parent; }, this);
		},

		getEnclosingView: function(/*DomNode*/ node){
			// summary:
			//		Gets the view containing the specified DOM node.
			// returns: dojox/mobile/View
			for(var n = node; n && n.tagName !== "BODY"; n = n.parentNode){
				if(n.nodeType === 1 && domClass.contains(n, "mblView")){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getEnclosingScrollable: function(/*DomNode*/ node){
			// summary:
			//		Gets the dojox/mobile/scrollable object containing the specified DOM node.
			// returns: dojox/mobile/scrollable
			for(var w = registry.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.scrollableParams && w._v){ return w; }
			}
			return null;
		}
	};

	return viewRegistry;
});

},
'dojox/mobile/dh/SuffixFileTypeMap':function(){
define([
	"dojo/_base/lang"
], function(lang){

	// module:
	//		dojox/mobile/dh/SuffixFileTypeMap

	var o = {
		// summary:
		//		A component that provides a map for determining content-type from
		//		the suffix of the URL.
	};
	lang.setObject("dojox.mobile.dh.SuffixFileTypeMap", o);

	o.map = {
		"html": "html",
		"json": "json"
	};

	o.add = function(/*String*/ key, /*String*/ contentType){
		// summary:
		//		Adds a handler class for the given content type.
		this.map[key] = contentType;
	};

	o.getContentType = function(/*String*/ fileName){
		// summary:
		//		Returns the handler class for the given content type.		
		var fileType = (fileName || "").replace(/.*\./, "");
		return this.map[fileType];
	};

	return o;
});

},
'dojox/mobile/FixedSplitterPane':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"./Container"
], function(kernel, declare, Container){

	kernel.deprecated("dojox/mobile/FixedSplitterPane", "Use dojox/mobile/Container instead", 2.0);

	// module:
	//		dojox/mobile/FixedSplitterPane

	return declare("dojox.mobile.FixedSplitterPane", Container, {
		// summary:
		//		Deprecated widget. Use dojox/mobile/Container instead.

		baseClass: "mblFixedSplitterPane"
	});
});

},
'dojox/mobile/_StoreMixin':function(){
define([
	"dojo/_base/Deferred",
	"dojo/_base/declare"
], function(Deferred, declare){

	// module:
	//		dojox/mobile/_StoreMixin

	return declare("dojox.mobile._StoreMixin", null, {
		// summary:
		//		Mixin for widgets to enable dojo/store data store.
		// description:
		//		By mixing this class into a widget, it can get data through a
		//		dojo/store data store. The widget must implement the following
		//		methods to handle the retrieved data:
		//
		//		- onComplete(/*Array*/items), onError(/*Object*/errorData),
		//		- onUpdate(/*Object*/item, /*Number*/insertedInto), and
		//		- onDelete(/*Object*/item, /*Number*/removedFrom).
	
		// store: Object
		//		Reference to data provider object used by this widget.
		store: null,

		// query: Object
		//		A query that can be passed to 'store' to initially filter the items.
		query: null,

		// queryOptions: Object
		//		An optional parameter for the query.
		queryOptions: null,

		// labelProperty: String
		//		A property name (a property in the dojo/store item) that specifies that item's label.
		labelProperty: "label",

		// childrenProperty: String
		//		A property name (a property in the dojo/store item) that specifies that item's children.
		childrenProperty: "children",

		setStore: function(/*dojo/store/api/Store*/store, /*String*/query, /*Object*/queryOptions){
			// summary:
			//		Sets the store to use with this widget.
			if(store === this.store){ return null; }
			if(store){
				store.getValue = function(item, property){
					return item[property];
				};
			}
			this.store = store;
			this._setQuery(query, queryOptions);
			return this.refresh();
		},

		setQuery: function(/*String*/query, /*Object*/queryOptions){
			this._setQuery(query, queryOptions);
			return this.refresh();
		},

		_setQuery: function(/*String*/query, /*Object*/queryOptions){
			// tags:
			//		private
			this.query = query;
			this.queryOptions = queryOptions || this.queryOptions;
		},

		refresh: function(){
			// summary:
			//		Fetches the data and generates the list items.
			if(!this.store){ return null; }
			var _this = this;
			var promise = this.store.query(this.query, this.queryOptions);
			Deferred.when(promise, function(results){
				if(results.items){
					results = results.items; // looks like dojo/data style items array
				}
				if(promise.observe){
					if(_this._observe_h){
						_this._observe_h.remove();
					}
					_this._observe_h = promise.observe(function(object, previousIndex, newIndex){
						if(previousIndex != -1){
							if(newIndex != previousIndex){
								// item removed or moved
								_this.onDelete(object, previousIndex);
								if(newIndex != -1){
									if (_this.onAdd) {
										 // new widget with onAdd method defined
										_this.onAdd(object, newIndex);
									} else {
										// TODO remove in 2.0
										// compatibility with 1.8: onAdd did not exist, add was handled by onUpdate
										_this.onUpdate(object, newIndex);
									}
								}
							}else{
								// item modified
								// if onAdd is not defined, we are "bug compatible" with 1.8 and we do nothing.
								// TODO remove test in 2.0
								if(_this.onAdd){
									_this.onUpdate(object, newIndex);
								}
							}
						}else if(newIndex != -1){
							// item added
							if(_this.onAdd){
								 // new widget with onAdd method defined
								_this.onAdd(object, newIndex);
							}else{
								// TODO remove in 2.0
								// compatibility with 1.8: onAdd did not exist, add was handled by onUpdate
								_this.onUpdate(object, newIndex);
							}
						}
					}, true); // we want to be notified of updates
				}
				_this.onComplete(results);
			}, function(error){
				_this.onError(error);
			});
			return promise;
		},

		destroy: function(){
			if(this._observe_h){
				this._observe_h = this._observe_h.remove();
			}
			this.inherited(arguments);
		}

/*=====
		// Subclass MUST implement the following methods.

		, onComplete: function(items){
			// summary:
			//		A handler that is called after the fetch completes.
		},

		onError: function(errorData){
			// summary:
			//		An error handler.
		},

		onUpdate: function(item, insertedInto){
			// summary:
			//		Called when an existing data item has been modified in the store.
			//		Note: for compatibility with previous versions where only onUpdate was present,
			//		if onAdd is not defined, onUpdate will be called instead.
		},

		onDelete: function(item, removedFrom){
			// summary:
			//		Called when a data item has been removed from the store.
		},
		
		// Subclass should implement the following methods.

		onAdd: function(item, insertedInto){
			// summary:
			//		Called when a new data item has been added to the store.
			//		Note: for compatibility with previous versions where this function did not exist,
			//		if onAdd is not defined, onUpdate will be called instead.
		}
=====*/
	});
});

},
'dojox/mobile/Badge':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"./iconUtils",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Badge"
], function(declare, lang, domClass, domConstruct, iconUtils, has, BidiBadge){
	// module:
	//		dojox/mobile/Badge

	var Badge = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiBadge" : "dojox.mobile.Badge", null, {
		// summary:
		//		A utility class to create and update a badge node.
		// description:
		//		Badge is not a widget, but a simple utility class for creating and 
		//		updating a badge node. A badge consists of a simple DOM button. 
		//		It is intended to be used from other widgets such as dojox/mobile/IconItem 
		//		or dojox/mobile/TabBarButton.

		// value: [const] String
		//		A text to show in a badge.
		//		Note that changing the value of the property after the badge
		//		creation has no effect.
		value: "0",

		// className: [const] String
		//		A CSS class name of a DOM button.
		className: "mblDomButtonRedBadge",

		// fontSize: [const] Number
		//		Font size in pixel. The other style attributes are determined by the DOM
		//		button itself.
		//		Note that changing the value of the property after the badge
		//		creation has no effect.
		fontSize: 16, // [px]

		constructor: function(/*Object?*/params, /*DomNode?*/node){
			// summary:
			//		Creates a new instance of the class.
			// params:
			//		Contains properties to be set.
			// node:
			//		The DOM node. If none is specified, it is automatically created. 
			if (params){
				lang.mixin(this, params);
			}
			this.domNode = node ? node : domConstruct.create("div");
			domClass.add(this.domNode, "mblBadge");
			if(this.domNode.className.indexOf("mblDomButton") === -1){
				domClass.add(this.domNode, this.className);
			}
			if(this.fontSize !== 16){
				this.domNode.style.fontSize = this.fontSize + "px";
			}
			iconUtils.createDomButton(this.domNode);
			this.setValue(this.value);
		},

		getValue: function(){
			// summary:
			//		Returns the text shown in the badge.
			return this.domNode.firstChild.innerHTML || "";
		},

		setValue: function(/*String*/value){
			// summary:
			//		Set a label text to the badge.
			this.domNode.firstChild.innerHTML = value;
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Badge", [Badge, BidiBadge]) : Badge;
});

},
'dojox/mobile/Overlay':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/window",
	"dijit/_WidgetBase",
	"dojo/_base/array",
	"dijit/registry",
	"dojo/touch",
	"./viewRegistry",
	"./_css3"
], function(declare, lang, has, win, domClass, domGeometry, domStyle, windowUtils, WidgetBase, array, registry, touch, viewRegistry, css3){

	return declare("dojox.mobile.Overlay", WidgetBase, {
		// summary:
		//		A non-templated widget that animates up from the bottom, 
		//		overlaying the current content.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblOverlay mblOverlayHidden",

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// set containerNode so that getChildren() works
				this.containerNode = this.domNode;
			}
		},

		_reposition: function(){
			// summary:
			//		Position the overlay at the bottom
			// tags:
			//		private
			var popupPos = domGeometry.position(this.domNode);
			var vp = windowUtils.getBox();
			// search for the scrollable parent if any 
			var scrollableParent = viewRegistry.getEnclosingScrollable(this.domNode);
			// update vp scroll position if the overlay is inside a scrollable
		 	if(scrollableParent){
		 		vp.t -= scrollableParent.getPos().y;
		 	}
		 	// reposition if needed 
		 	if((popupPos.y+popupPos.h) != vp.h // TODO: should be a has() test for position:fixed not scrolling
				|| (domStyle.get(this.domNode, 'position') != 'absolute' && has('android') < 3)){ // android 2.x supports position:fixed but child transforms don't persist
				popupPos.y = vp.t + vp.h - popupPos.h;
				domStyle.set(this.domNode, { position: "absolute", top: popupPos.y + "px", bottom: "auto" });
			}
			return popupPos;
		},

		show: function(/*DomNode?*/aroundNode){
			// summary:
			//		Scroll the overlay up into view
			array.forEach(registry.findWidgets(this.domNode), function(w){
				if(w && w.height == "auto" && typeof w.resize == "function"){
					w.resize();
				}
			});
			var popupPos = this._reposition();
			if(aroundNode){
				var aroundPos = domGeometry.position(aroundNode);
				if(popupPos.y < aroundPos.y){ // if the aroundNode is under the popup, try to scroll it up
					// TODO: if this widget has a scrollable parent, use its scrollTo method to make sure the aroundNode is visible?
					win.global.scrollBy(0, aroundPos.y + aroundPos.h - popupPos.y);
					this._reposition();
				}
			}
			var _domNode = this.domNode;
			domClass.replace(_domNode, ["mblCoverv", "mblIn"], ["mblOverlayHidden", "mblRevealv", "mblOut", "mblReverse", "mblTransition"]);
			this.defer(function(){
				var handler = this.connect(_domNode, css3.name("transitionEnd"), function(){
					this.disconnect(handler);
					domClass.remove(_domNode, ["mblCoverv", "mblIn", "mblTransition"]);
					this._reposition();
				});
				domClass.add(_domNode, "mblTransition");
			}, 100);
			var skipReposition = false;

			this._moveHandle = this.connect(win.doc.documentElement, touch.move,
				function(){
					skipReposition = true;
				}
			);
			this._repositionTimer = setInterval(lang.hitch(this, function(){
				if(skipReposition){ // don't reposition if busy
					skipReposition = false;
					return;
				}
				this._reposition();
			}), 50); // yield a short time to allow for consolidation for better CPU throughput
			return popupPos;
		},

		hide: function(){
			// summary:
			//		Scroll the overlay down and then make it invisible
			var _domNode = this.domNode;
			if(this._moveHandle){
				this.disconnect(this._moveHandle);
				this._moveHandle = null;
				clearInterval(this._repositionTimer);
				this._repositionTimer = null;
			}
			if(has("css3-animations")){
				domClass.replace(_domNode, ["mblRevealv", "mblOut", "mblReverse"], ["mblCoverv", "mblIn", "mblOverlayHidden", "mblTransition"]);
				this.defer(function(){
					var handler = this.connect(_domNode, css3.name("transitionEnd"), function(){
						this.disconnect(handler);
						domClass.replace(_domNode, ["mblOverlayHidden"], ["mblRevealv", "mblOut", "mblReverse", "mblTransition"]);
					});
					domClass.add(_domNode, "mblTransition");
				}, 100);
			}else{
				domClass.replace(_domNode, ["mblOverlayHidden"], ["mblCoverv", "mblIn", "mblRevealv", "mblOut", "mblReverse"]);
			}
		},

		onBlur: function(/*Event*/e){
			return false; // touching outside the overlay area does not call hide()
		}
	});
});

},
'dojox/mobile/IconItem':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"./_ItemBase",
	"./Badge",
	"./TransitionEvent",
	"./iconUtils",
	"./lazyLoadUtils",
	"./viewRegistry",
	"./_css3",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/IconItem"
], function(declare, event, lang, has, win, domClass, domConstruct, domGeometry, domStyle, ItemBase, Badge, TransitionEvent, iconUtils, lazyLoadUtils, viewRegistry, css3, BidiIconItem){

	// module:
	//		dojox/mobile/IconItem

	var IconItem = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiIconItem" : "dojox.mobile.IconItem", ItemBase, {
		// summary:
		//		An icon item widget.
		// description:
		//		IconItem represents an item that has an application component
		//		and its icon image. You can tap the icon to open the
		//		corresponding application component. You can also use the icon
		//		to move to a different view by specifying either of the moveTo,
		//		href or url parameters.

		// lazy: String
		//		If true, the content of the widget, which includes dojo markup,
		//		is instantiated lazily. That is, only when the widget is opened
		//		by the user, the required modules are loaded and the content
		//		widgets are instantiated.
		//		This option works both in the sync and async loader mode.
		lazy: false,

		// requires: String
		//		Comma-separated required module names to be lazily loaded. This
		//		property is effective only when lazy=true. All the modules
		//		specified with data-dojo-type and their depending modules are
		//		automatically loaded by the IconItem when it is opened.
		//		However, if you need other extra modules to be loaded, use this parameter.
		//		This option works both in the sync and async loader mode.
		requires: "",

		// timeout: String
		//		Duration of highlight in seconds.
		timeout: 10,

		// content: String
		//		An HTML fragment to embed as icon content.
		content: "",

		// badge: String
		//		A text to show in a badge (ex. "55").
		badge: "",

		// badgeClass: String
		//		A class name of a DOM button for a badge.
		badgeClass: "mblDomButtonRedBadge",

		// deletable: Boolean
		//		If true, you can delete this IconItem by clicking on the delete
		//		icon during edit mode.
		//		If false, the delete icon is not displayed during edit mode so
		//		that it cannot be deleted.
		deletable: true,

		// deleteIcon: String
		//		A delete icon to display at the top-left corner of the item
		//		during edit mode. The value can be either a path for an image
		//		file or a class name of a DOM button.
		deleteIcon: "",

		// tag: String
		//		A name of the HTML tag to create as domNode.
		tag: "li",

		/* internal properties */	
		// Note these are overrides for similar properties defined in _ItemBase.
		paramsToInherit: "transition,icon,deleteIcon,badgeClass,deleteIconTitle,deleteIconRole",
		baseClass: "mblIconItem",
		_selStartMethod: "touch",
		_selEndMethod: "none",

		destroy: function(){
			if(this.badgeObj){
				delete this.badgeObj;
			}
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);

			if(this.srcNodeRef){
				// reparent
				this._tmpNode = domConstruct.create("div");
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this._tmpNode.appendChild(this.srcNodeRef.firstChild);
				}
			}

			this.iconDivNode = domConstruct.create("div", {className:"mblIconArea"}, this.domNode);
			this.iconParentNode = domConstruct.create("div", {className:"mblIconAreaInner"}, this.iconDivNode);
			this.labelNode = domConstruct.create("span", {className:"mblIconAreaTitle"}, this.iconDivNode);

			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }

			var p = this.getParent();
			require([p.iconItemPaneClass], lang.hitch(this, function(module){
				var w = this.paneWidget = new module(p.iconItemPaneProps);
				this.containerNode = w.containerNode;
				if(this._tmpNode){
					// reparent
					for(var i = 0, len = this._tmpNode.childNodes.length; i < len; i++){
						w.containerNode.appendChild(this._tmpNode.firstChild);
					}
					this._tmpNode = null;
				}
				p.paneContainerWidget.addChild(w, this.getIndexInParent());
				w.set("label", this.label);
				this._clickCloseHandle = this.connect(w.closeIconNode, "onclick", "_closeIconClicked");
				this._keydownCloseHandle = this.connect(w.closeIconNode, "onkeydown", "_closeIconClicked"); // for desktop browsers
			}));

			this.inherited(arguments);
			if(!this._isOnLine){
				this._isOnLine = true;
				// retry applying the attribute for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingIcon; 
			}
			if(!this.icon && p.defaultIcon){
				this.set("icon", p.defaultIcon);
			}

			this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
			this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers
		},

		highlight: function(/*Number?*/timeout){
			// summary:
			//		Shakes the icon 10 seconds.
			domClass.add(this.iconDivNode, "mblVibrate");
			timeout = (timeout !== undefined) ? timeout : this.timeout;
			if(timeout > 0){
				var _this = this;
				_this.defer(function(){
					_this.unhighlight();
				}, timeout*1000);
			}
		},

		unhighlight: function(){
			// summary:
			//		Stops shaking the icon.
			if(!has("ie") && has("trident") === 7){
				// Workaround on IE11: if just removing the style, the icon continues to shake
				domStyle.set(this.iconDivNode, "animation-name", "");
			}
			domClass.remove(this.iconDivNode, "mblVibrate");
		},

		isOpen: function(e){
			// summary:
			//		Returns true if the icon is open.
			return this.paneWidget.isOpen();
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.getParent().isEditing || e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		_onNewWindowOpened: function(e){
			// Override from _ItemBase
			this.set("selected", false);
		},

		_prepareForTransition: function(e, transOpts){
			// Override from _ItemBase
			if(transOpts){
				this.defer(function(d){
					this.set("selected", false);
				}, 1500);
				return true;
			}else{
				if(this.getParent().transition === "below" && this.isOpen()){
					this.close();
				}else{
					this.open(e);
				}
				return false;
			}
		},

		_closeIconClicked: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e){
				if(e.type === "keydown" && e.keyCode !== 13){ return; }
				if(this.closeIconClicked(e) === false){ return; } // user's click action
				this.defer(function(d){ this._closeIconClicked(); });
				return;
			}
			this.close();
		},

		closeIconClicked: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks for the close icon.
			// tags:
			//		callback
		},

		open: function(e){
			// summary:
			//		Opens the icon content, or makes a transition.
			var parent = this.getParent(); // IconContainer
			if(this.transition === "below"){
				if(parent.single){
					parent.closeAll();
				}
				this._open_1();
			}else{
				parent._opening = this;
				if(parent.single){
					this.paneWidget.closeHeaderNode.style.display = "none";
					if(!this.isOpen()){
						parent.closeAll();
					}
					parent.appView._heading.set("label", this.label);
				}
				this.moveTo = parent.id + "_mblApplView";
				new TransitionEvent(this.domNode, this.getTransOpts(), e).dispatch();
			}
		},

		_open_1: function(){
			// summary:
			//		Opens the icon content for the 'below' transition.
			// tags:
			//		private
			this.paneWidget.show();
			this.unhighlight();
			if(this.lazy){
				lazyLoadUtils.instantiateLazyWidgets(this.containerNode, this.requires);
				this.lazy = false;
			}
			this.scrollIntoView(this.paneWidget.domNode);
			this.onOpen();
		},

		scrollIntoView: function(/*DomNode*/node){
			// summary:
			//		Scrolls until the given node is in the view.
			var s = viewRegistry.getEnclosingScrollable(node);
			if(s){ // this node is placed inside scrollable
				var dim = s.getDim();
				if(dim.c.h >= dim.d.h){ // #16306: only if the content is larger than the display area 
					s.scrollIntoView(node, true);
				}
			}else{
				win.global.scrollBy(0, domGeometry.position(node, false).y);
			}
		},

		close: function(/*Boolean?*/noAnimation){
			// summary:
			//		Closes the icon content.
			if(!this.isOpen()){ return; }
			this.set("selected", false);
			if(has("css3-animations") && !noAnimation){
				var contentNode = this.paneWidget.domNode;
				if(this.getParent().transition == "below"){
					domClass.add(contentNode, "mblCloseContent mblShrink");
					var nodePos = domGeometry.position(contentNode, true);
					var targetPos = domGeometry.position(this.domNode, true);
					var origin = (targetPos.x + targetPos.w/2 - nodePos.x) + "px " + (targetPos.y + targetPos.h/2 - nodePos.y) + "px";
					domStyle.set(contentNode, css3.add({}, { transformOrigin:origin }));
				}else{
					domClass.add(contentNode, "mblCloseContent mblShrink0");
				}
			}else{
				this.paneWidget.hide();
			}
			this.onClose();
		},

		onOpen: function(){
			// summary:
			//		Stub method to allow the application to connect.
		},

		onClose: function(){
			// summary:
			//		Stub method to allow the application to connect.
		},

		_setLabelAttr: function(/*String*/text){
			// tags:
			//		private
			this.label = text;
			var s = this._cv ? this._cv(text) : text;
			this.labelNode.innerHTML = s;
			if(this.paneWidget){
				this.paneWidget.set("label", text);
			}
		},

		_getBadgeAttr: function(){
			// tags:
			//		private
			return this.badgeObj ? this.badgeObj.getValue() : null;
		},

		_setBadgeAttr: function(/*String*/value){
			// tags:
			//		private
			if(!this.badgeObj){
				this.badgeObj = new Badge({fontSize:14, className:this.badgeClass});
				domStyle.set(this.badgeObj.domNode, {
					position: "absolute",
					top: "-2px",
					right: "2px"
				});
			}
			this.badgeObj.setValue(value);
			if(value){
				this.iconDivNode.appendChild(this.badgeObj.domNode);
			}else{
				this.iconDivNode.removeChild(this.badgeObj.domNode);
			}
		},

		_setDeleteIconAttr: function(icon){
			// tags:
			//		private
			if(!this.getParent()){ return; } // icon may be invalid because inheritParams is not called yet

			this._set("deleteIcon", icon);
			icon = this.deletable ? icon : "";
			this.deleteIconNode = iconUtils.setIcon(icon, this.deleteIconPos, this.deleteIconNode, 
					this.deleteIconTitle || this.alt, this.iconDivNode);
			if(this.deleteIconNode){
				domClass.add(this.deleteIconNode, "mblIconItemDeleteIcon");
				if(this.deleteIconRole){
					this.deleteIconNode.setAttribute("role", this.deleteIconRole);
				}
			}
		},

		_setContentAttr: function(/*String|DomNode*/data){
			// tags:
			//		private
			var root;
			if(!this.paneWidget){
				if(!this._tmpNode){
					this._tmpNode = domConstruct.create("div");
				}
				root = this._tmpNode;
			}else{
				root = this.paneWidget.containerNode;
			}

			if(typeof data === "object"){
				domConstruct.empty(root);
				root.appendChild(data);
			}else{
				root.innerHTML = data;
			}
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// tags:
			//		private
			this.inherited(arguments);
			this.iconNode && domStyle.set(this.iconNode, "opacity",
						 selected ? this.getParent().pressedIconOpacity : 1);
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.IconItem", [IconItem, BidiIconItem]) : IconItem;
});

},
'dojox/mobile/_ComboBoxMenu':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/form/_ComboBoxMenuMixin",
	"dijit/_WidgetBase",
	"./_ListTouchMixin",
	"./scrollable",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_ComboBoxMenu"
],
	function(dojo, declare, domClass, domConstruct, ComboBoxMenuMixin, WidgetBase, ListTouchMixin, Scrollable, has, BidiComboBoxMenu){
	// module:
	//		dojox/mobile/_ComboBoxMenu

	var _ComboBoxMenu = declare(has("dojo-bidi") ? "dojox.mobile._NonBidiComboBoxMenu" : "dojox.mobile._ComboBoxMenu", [WidgetBase, ListTouchMixin, ComboBoxMenuMixin], {
		// summary:
		//		Focus-less menu for internal use in dojox/mobile/ComboBox.
		//		Abstract methods that must be defined externally:
		//
		//		- onChange: item was explicitly chosen (mousedown somewhere on the menu and mouseup somewhere on the menu);
		//		- onPage: next(1) or previous(-1) button pressed.
		// tags:
		//		private

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblComboBoxMenu",
		
		buildRendering: function(){
			this.domNode = this.focusNode = domConstruct.create("div", { "class":"mblReset" });
			this.containerNode = domConstruct.create("div", { style: { position:"absolute", top:0, left:0 } }, this.domNode); // needed for scrollable
			this.previousButton = domConstruct.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuPreviousButton", role:"option" }, this.containerNode);
			this.nextButton = domConstruct.create("div", { "class":"mblReset mblComboBoxMenuItem mblComboBoxMenuNextButton", role:"option" }, this.containerNode);
			this.inherited(arguments);
		},

		_createMenuItem: function(){
			// override of the method from dijit/form/_ComboBoxMenu.
			return domConstruct.create("div", {
				"class": "mblReset mblComboBoxMenuItem" +(this.isLeftToRight() ? "" : " mblComboBoxMenuItemRtl"),
				role: "option"
			});
		},

		onSelect: function(/*DomNode*/ node){
			// summary:
			//		Add selected CSS.
			domClass.add(node, "mblComboBoxMenuItemSelected");
		},

		onDeselect: function(/*DomNode*/ node){
			// summary:
			//		Remove selected CSS.
			domClass.remove(node, "mblComboBoxMenuItemSelected");
		},

		onOpen: function(){
			// summary:
			//		Called when the menu opens.
			this.scrollable.init({
				domNode: this.domNode,
				containerNode: this.containerNode
			});
			this.scrollable.scrollTo({x:0, y:0});
		},

		onClose: function(){
			// summary:
			//		Called when the menu closes.
			this.scrollable.cleanup();
		},

		postCreate: function(){
			this.inherited(arguments);
			this.scrollable = new Scrollable();
			this.scrollable.resize = function(){}; // resize changes the height rudely
			// #18000
			var self = this;
			this.scrollable.isLeftToRight = function(){
				return self.isLeftToRight();
			};
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._ComboBoxMenu", [_ComboBoxMenu, BidiComboBoxMenu]) : _ComboBoxMenu;
});

},
'dojox/mobile/StoreCarousel':function(){
define([
	"dojo/_base/declare",
	"./Carousel",
	"./_StoreMixin"
], function(declare, Carousel, StoreMixin){

	// module:
	//		dojox/mobile/StoreCarousel

	return declare("dojox.mobile.StoreCarousel", [Carousel, StoreMixin], {
		// summary:
		//		A dojo/store enabled Carousel.
		// description:
		//		StoreCarousel is a subclass of dojox/mobile/Carousel which
		//		can generate contents according to the given dojo/store store.
	});
});

},
'dojox/mobile/EdgeToEdgeCategory':function(){
define([
	"dojo/_base/declare",
	"./RoundRectCategory"
], function(declare, RoundRectCategory){

	// module:
	//		dojox/mobile/EdgeToEdgeCategory

	return declare("dojox.mobile.EdgeToEdgeCategory", RoundRectCategory, {
		// summary:
		//		A category header for an edge-to-edge list.
		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblEdgeToEdgeCategory";

			if(this.type && this.type == "long"){
				this.domNode.className += " mblEdgeToEdgeCategoryLong";
			}
		}
	});
});

},
'dojox/mobile/TextBox':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dijit/_WidgetBase",
	"dijit/form/_FormValueMixin",
	"dijit/form/_TextBoxMixin",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/TextBox"
], function(declare, domConstruct, WidgetBase, FormValueMixin, TextBoxMixin, has, BidiTextBox){

	var TextBox = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTextBox" : "dojox.mobile.TextBox", [WidgetBase, FormValueMixin, TextBoxMixin],{
		// summary:
		//		A non-templated base class for textbox form inputs

		baseClass: "mblTextBox",

		// Override automatic assigning type --> node, it causes exception on IE8.
		// Instead, type must be specified as this.type when the node is created, as part of the original DOM
		_setTypeAttr: null,

		// Map widget attributes to DOMNode attributes.
		_setPlaceHolderAttr: function(/*String*/value){
			value = this._cv ? this._cv(value) : value;
			this._set("placeHolder", value);
			this.textbox.setAttribute("placeholder", value);
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = domConstruct.create("input", {"type":this.type});
			}
			this.inherited(arguments);
			this.textbox = this.focusNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.textbox, "onmouseup", function(){ this._mouseIsDown = false; });
			this.connect(this.textbox, "onmousedown", function(){ this._mouseIsDown = true; });
			this.connect(this.textbox, "onfocus", function(e){
				this._onFocus(this._mouseIsDown ? "mouse" : e);
				this._mouseIsDown = false;
			});
			this.connect(this.textbox, "onblur", "_onBlur");
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.TextBox", [TextBox, BidiTextBox]) : TextBox;	
});

},
'dojox/mobile/TextArea':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"./TextBox"
], function(declare, domConstruct, TextBox){

	return declare("dojox.mobile.TextArea",TextBox, {
		// summary:
		//		Non-templated TEXTAREA widget.
		// description:
		//		A textarea widget that wraps an HTML TEXTAREA element.
		//		Takes all the parameters (name, value, etc.) that a vanilla textarea takes.
		// example:
		// |	<textarea dojoType="dojox.mobile.TextArea">...</textarea>

		baseClass: "mblTextArea",

		postMixInProperties: function(){
			 // Copy value from srcNodeRef, unless user specified a value explicitly (or there is no srcNodeRef)
			// TODO: parser will handle this in 2.0
			if(!this.value && this.srcNodeRef){
				this.value = this.srcNodeRef.value;
			}
			this.inherited(arguments);
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = domConstruct.create("textarea", {});
			}
			this.inherited(arguments);
		}
	});
});

},
'dojox/mobile/FilteredListMixin':function(){
define([
	"require",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/aspect",
	"dijit/registry",
	"./SearchBox",
	"./ScrollableView",
	"./viewRegistry"
], function(require, array, declare, lang, dom, domClass, domConstruct,  
			aspect, registry, SearchBox, ScrollableView, viewRegistry){

	// module:
	//		dojox/mobile/FilteredListMixin

	return declare("dojox.mobile.FilteredListMixin", null, {
		// summary:
		//		Mixin for filtered lists.
		// description:
		//		This mixin adds filtering capabilities to all dojox/mobile list widgets:
		//		dojox/mobile/RoundRectList and any of its subclasses (RoundRectStoreList, 
		//		RoundRectDataList, EdgeToEdgeList, EdgeToEdgeStoreList, EdgeToEdgeDataList).
		//		When mixing this class into a list widget, the list items are dynamically 
		//		filtered depending on the filtering string that the user enters in a 
		//		dojox/mobile/SearchBox. 
		//
		//		This mixin supports the following use-cases:
		//		1. For user's convenience, by simply mixing this class into a list widget 
		//		the mixin creates a dojox/mobile/SearchBox and a dojox/mobile/ScrollableView. 
		//		The list is placed inside the ScrollableView and the SearchBox, which allows
		//		filtering the list, is placed on top of the ScrollableView.
		//		2. Alternatively, the user can create (and style) the instance of dojox/mobile/SearchBox, 
		//		and specify its id using the property filterBoxRef of this mixin. This allows
		//		placing the SearchBox anywhere in the DOM, while the mixin takes care of 
		//		the necessary glue to ensure the list is filtered according to the filter criteria
		//		entered in the SearchBox.
		//
		//		The filtering works for lists backed by a store (dojo/store or dojo/data), as well 
		//		as for lists not backed by a store. When filtering a list backed by a store 
		//		containing hierarchical data (data items that are children of a parent data item), 
		//		the store must support recursive search queries such that the filtering can match 
		//		child items.
		//
		//		For configuration purposes, the instance of dojox/mobile/SearchBox can be retrieved
		//		using the method getFilterBox(). If a dojox/mobile/ScrollableView is created by
		//		this mixin, it can be retrieved using getScrollableView().
		//
		// example:
		// |	<!-- Markup use-case: -->
		// |	<!-- SearchBox and ScrollableView created by the mixin. -->
		// |	<!-- Filtered EdgeToEdgeStoreList created in markup. -->
		// |	<div data-dojo-type="dojox/mobile/View">
		// |		<h1 data-dojo-type="dojox/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<ul data-dojo-type="dojox/mobile/EdgeToEdgeStoreList"
		// |			data-dojo-mixins="dojox/mobile/FilteredListMixin"
		// |			data-dojo-props="placeHolder: 'Search', store: myStore"></ul>
		// |	</div>
		// example:
		// |	<!-- Markup use-case: -->
		// |	<!-- SearchBox and ScrollableView created by the mixin. -->
		// |	<!-- Filtered RoundRectList created in markup. --> 
		// |	<div data-dojo-type="dojox/mobile/View">
		// |		<h1 data-dojo-type="dojox/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<ul id="list" data-dojo-type="dojox/mobile/RoundRectList"
		// |			data-dojo-mixins="dojox/mobile/FilteredListMixin"
		// |			data-dojo-props="placeHolder: 'Search'">
		// |			<li data-dojo-type="dojox/mobile/ListItem">Item 1</li>
		// |			<li data-dojo-type="dojox/mobile/ListItem">Item 2</li>
		// |			...
		// |		</ul>
		// |	</div>
		// example:
		// |	// Programmatic use-case:
		// |	// SearchBox and ScrollableView created by the mixin.
		// |	// Filtered EdgeToEdgeStoreList created programmatically.
		// |	require(["dojo/_base/declare", "dojo/ready", "dojox/mobile", "dojox/mobile/EdgeToEdgeStoreList", 
		// |			"dojox/mobile/FilteredListMixin", ...],	function(declare, ready, registry, ...){
		// |		ready(function(){
		// |			var listWidget =
		// |				new declare([EdgeToEdgeStoreList, FilteredListMixin])(
		// |					{placeHolder: 'Search', store: myStore, "filteredList"});
		// |			listWidget.startup();
		// |		});
		// |	});
		// |	...
		// |	<div id="view" data-dojo-type="dojox/mobile/View">
		// |		<h1 data-dojo-type="dojox/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<div id="filteredList">
		// |	</div>
		// example:
		// |	<!-- Markup use-case: -->
		// |	<!-- SearchBox and ScrollableView provided by the user. -->
		// |	<!-- Filtered EdgeToEdgeDataList created in markup. --> 
		// |	<div data-dojo-type="dojox/mobile/View">
		// |		<h1 data-dojo-type="dojox/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<input id="filterBox" data-dojo-type="dojox/mobile/SearchBox" type="search"
		// |			class="mblFilteredEdgeToEdgeListSearchBox">		
		// |		<div data-dojo-type="dojox/mobile/ScrollableView">
		// |			<ul data-dojo-type="dojox/mobile/EdgeToEdgeDataList" 
		// |				data-dojo-mixins="dojox/mobile/FilteredListMixin"
		// |				data-dojo-props="filterBoxRef: 'filterBox', placeHolder: 'Search', store: myStore"></ul>
		// |		</div>
		// |	</div>
		// example:
		// |	// Programmatic use-case:
		// |	// SearchBox and ScrollableView provided by the user.
		// |	// Filtered EdgeToEdgeStoreList created programmatically.
		// |	require(["dojo/_base/declare", "dojo/ready", "dijit/registry", "dojox/mobile",
		// |			"dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/FilteredListMixin",
		// |			"dojox/mobile/ScrollableView", ...], function(declare, ready, registry, ...){
		// |		ready(function(){
		// |			var view = registry.byId("scrollableView");
		// |			var listWidget =
		// |				new declare([EdgeToEdgeStoreList, FilteredListMixin])(
		// |					{id:"list", filterBoxRef: 'filterBox', placeHolder: 'Search', store: myStore});
		// |			listWidget.placeAt(view.containerNode);
		// |			listWidget.startup();
		// |		});
		// |	});
		// |	...
		// |	<div data-dojo-type="dojox/mobile/View">
		// |		<h1 data-dojo-type="dojox/mobile/Heading" data-dojo-props="fixed: 'top'">Some heading</h1>
		// |		<input id="filterBox" data-dojo-type="dojox/mobile/SearchBox" type="search"
		// |			class="mblFilteredEdgeToEdgeListSearchBox">		
		// |		<div id="scrollableView" data-dojo-type="dojox/mobile/ScrollableView">
		// |	</div>

		// Implementation notes:
		// - The mixin requires dojox/mobile/ScrollableView statically. It could be required
		// dynamically, only when needed, that is in the use-case when the mixin creates the 
		// ScrollableView by itself. But this would create an usability trouble: if the user 
		// would want to get the instance of ScrollableView in a dojo/ready (say, for configuring
		// it), he would need to require it upfront, to cope with the case of asynchronous 
		// loading. Thus, requiring it statically has been preferred, because it avoids this
		// constraint on user's side and it is not a serious overhead, because in practice 
		// the filtering is used for long lists, for which a ScrollableView is anyway likely 
		// to be used. 
		// - Differently, the loading of the store/data modules is performed dynamically,
		// in order to avoid their overhead when they are not actually needed.
		
		// filterBoxRef: String
		//		The reference for the search box allowing to enter the filtering criteria.
		//		Only used at construction time:
		//		- If unspecified, the mixin creates a dojox/mobile/SearchBox and 
		//		a dojox/mobile/ScrollableView. The list is placed inside the ScrollableView and the
		//		SearchBox, wrapped in a DIV, is placed on top of the ScrollableView.
		//		- If the string is the id of a widget which is an instance of dojox/mobile/SearchBox 
		//		or a subclass, the mixin uses this SearchBox for filtering the list.
		//		- If the id is specified but does not reference a dojox/mobile/SearchBox or 
		//		subclass, an error is thrown. 
		filterBoxRef: null,
		
		// placeHolder: String
		//		Defines a hint to help users fill out the input field (as defined in HTML 5) of the 
		//		dojox/mobile/SearchBox. This should only contain plain text	(no HTML markup).
		//		When the SearchBox is provided by the user (not created by this mixin), its placeHolder
		//		property takes precedence.
		placeHolder: "",
		
		// filterBoxVisible: Boolean
		//		A flag which allows to show or hide the dojox/mobile/SearchBox associated with
		//		the list.
		filterBoxVisible: true,
		
		// _filterBox: [private] dojox/mobile/SearchBox
		//		The instance of dojox/mobile/SearchBox used by this mixin. 
		//		Stored for getFilterBox().
		_filterBox: null,
		
		// _createdFilterBox: [private] dojox/mobile/SearchBox
		//		The instance of dojox/mobile/SearchBox created by this mixin, or null if none
		//		has been created. Stored for being able to destroy it together with the list widget.
		_createdFilterBox: null,
		
		// _createdScrollableView: [private] dojox/mobile/ScrollableView
		//		The instance of dojox/mobile/ScrollableView created by this mixin, if any. 
		//		Stored for getScrollableView() and for being able to destroy it together 
		//		with the list widget.
		_createdScrollableView: null,
		
		startup: function(){
			if(this._started){ return; }
			
			this.inherited(arguments);
			
			if(this.filterBoxRef){
				// Case #1: search box provided by the user
				this._filterBox = registry.byId(this.filterBoxRef);
				
				if (this._filterBox && this._filterBox.isInstanceOf(SearchBox)){ 
					// If the list is backed by a dojox/mobile/_StoreListMixin, it
					// has a labelProperty which is given precedence. 
					this._filterBox.set("searchAttr", this.labelProperty ? this.labelProperty : "label");
					if(!this._filterBox.placeHolder){
						// Give precedence to the placeHolder that may be specified on the provided SearchBox
						this._filterBox.set("placeHolder", this.placeHolder);
					}
					this._filterBox.on("search", lang.hitch(this, "_onFilter"));
				}else{
					throw new Error("Cannot find a widget of type dojox/mobile/SearchBox or subclass " +
						"at the specified filterBoxRef: " + this.filterBoxRef);
				}
			}else{ 
				// Case #2: automatic mode. The mixin creates a SearchBox and a ScrollableView.
				this._filterBox =
					new SearchBox({
						// If the list is backed by a dojox/mobile/_StoreListMixin, it
						// has a labelProperty which is given precedence. 
						searchAttr: this.labelProperty ? this.labelProperty : "label",
						ignoreCase: true,
						incremental: true,
						onSearch: lang.hitch(this, "_onFilter"),
						selectOnClick: true,
						placeHolder: this.placeHolder
				});
				
				// Store them to be able to destroy them together with the list (see destroy()).
				this._createdFilterBox = this._filterBox; 
				this._createdScrollableView = new ScrollableView();
				
				var currentDomNode = this.domNode,
					listParentNode = this.domNode.parentNode;
				listParentNode.replaceChild(this._createdScrollableView.domNode, this.domNode);
				// Put the list inside the ScrollableView:
				domConstruct.place(currentDomNode, this._createdScrollableView.containerNode);
				
				var searchBoxParentDiv = domConstruct.create("div");
				// Put the SearchBox as child of the DIV 
				domConstruct.place(this._createdFilterBox.domNode, searchBoxParentDiv);
				// Put the DIV as sibling of the ScrollableView: 
				domConstruct.place(searchBoxParentDiv, this._createdScrollableView.domNode, "before");
					
				if(this.filterBoxClass){
					// Only adding the class when the mixin creates the SearchBox by itself.
					domClass.add(searchBoxParentDiv, this.filterBoxClass);
				}
					
				this._createdFilterBox.startup();
				this._createdScrollableView.startup();
				this._createdScrollableView.resize();
			}
			
			// Do not use this.getScrollableView() here, because this doesn't cover the
			// use-case when the scrollable is not created by this mixin.
			var sv = viewRegistry.getEnclosingScrollable(this.domNode);
			if(sv){
				this.connect(sv, "onFlickAnimationEnd", lang.hitch(this, function(){
					if(!this._filterBox.focusNode.value){ // if search criteria is empty
						// store the scroll position such that we can reset the 
						// initial scroll when the user goes back to the unfiltered
						// list (as done by some native mobile apps). 
						this._previousUnfilteredScrollPos = sv.getPos();
					}
				}));
			}
			
			if(!this.store){
				this._createStore(this._initStore);
			}else{
				this._initStore();
			}
		},
		
		_setFilterBoxVisibleAttr: function(/* Boolean */ visible){
			// tags:
			//		private
			this._set("filterBoxVisible", visible);
			if (this._filterBox && this._filterBox.domNode){
				this._filterBox.domNode.style.display = visible ? "" : "none";
			}
		},
		
		_setPlaceHolderAttr: function(/* String */ placeHolder){
			// tags:
			//		private
			this._set("placeHolder", placeHolder);
			if (this._filterBox){ // allow update after construction time
				this._filterBox.set("placeHolder", placeHolder);
			}
		},
		
		getFilterBox: function(){
			// summary:
			//		Returns the dojox/mobile/SearchBox widget used for entering the filtering criteria.
			//		If an instance has been referenced at construction time using the property filterBoxRef,
			//		this instance is returned. Otherwise, returns the instance created by the mixin.
			//		This function allows the user to get the instance of SearchBox in order to customize
			//		its parameters. 
			return this._filterBox;
		},
		
		getScrollableView: function(){
			// summary:
			//		Returns the instance of dojox/mobile/ScrollableView created by this mixin,
			//		or null if none has been created. The mixin creates a ScrollableView if and
			//		only if the property filterBoxRef is unspecified.
			//		This function allows the user to get the instance of ScrollableView in order to
			//		customize its parameters.
			return this._createdScrollableView;
		},
		
		_initStore: function(){
			// description:
			//		Initializes the store.
			// tags:
			//		private
			var store = this.store;
			if(!store.get || !store.query){ // if old store (dojo/data)
				// Detect the old dojo/data stores (since the stores don't actually extend a common
				// base class, there is no direct way to do this check. Hence we rely on the presence 
				// or absence of these two properties of the new stores which are required for the
				// list widgets).
				// TODO: to be removed when removing the support for lists backed by the old dojo/data 
				// (EdgeToEdgeDataStore, RoundRectDataList).
				require(["dojo/store/DataStore"], lang.hitch(this, function(DataStore){
					// wrap the dojo/data store into a dojo/store
					store = new DataStore({store: store});	
					this._filterBox.store = store;				
				}));
			}else{
				this._filterBox.store = store;
			}
		},
	
		_createStore: function(initStoreFunction/* Function */){
			// summary:
			//		Creates the store.
			// description:
			//		This method is used when the list is not backed by a store. In this case,
			//		a store is created and filled with items containing the text of the list items.
			// tags:
			//		private
			require(["./_StoreListMixin", "dojo/store/Memory"], lang.hitch(this, function(module, Memory){
				declare.safeMixin(this, new module());
					
				this.append = true; // to avoid that _StoreListMixin.generateList destroys the items
					
				// _StoreListMixin.createListItem creates a new item. Instead, we want to reuse the
				// original item instance, hence:
				this.createListItem = function(/*Object*/item){
					return item.listItem;
				};
					
				aspect.before(this, "generateList", function(){
					// remove all children
					array.forEach(this.getChildren(), function(child){
						child.domNode.parentNode.removeChild(child.domNode);
					});
				});
					
				// Collect the text from the list items
				var items = [];
				var text = null;
				array.forEach(this.getChildren(), function(child){
					text = child.label ? child.label : (child.domNode.innerText || child.domNode.textContent);
					items.push({label: text, listItem: child});
				});
				var listData = {items: items};
				// store for the dojox/mobile/EdgeToEdgeStoreList
				var store = new Memory({idProperty:"label", data: listData});
				this.store = null;
				this.query = {};
				this.setStore(store, this.query, this.queryOptions);
				lang.hitch(this, initStoreFunction)();
			}));
		},
		
		_onFilter: function(results, query, options){
			// summary:
			//		Internal handler for filtering events.
			// tags:
			//		private
			if(this.onFilter(results, query, options) === false){ return; } // user's filtering action
			this.setQuery(query);
			
			// Do not use this.getScrollableView() because this doesn't cover the
			// use-case when the scrollable is not created by this mixin.
			var sv = viewRegistry.getEnclosingScrollable(this.domNode);
			if(sv){
				// When the user goes back to the unfiltered list, restore the previous 
				// scroll position stored for unfiltered list (as done by some native mobile apps).
				// Otherwise, reset the scroll position, to ensure that the new subset of 
				// items is visible. 
				sv.scrollTo(this._filterBox.focusNode.value ?
					{x:0, y:0} :
					this._previousUnfilteredScrollPos || {x:0, y:0});
			}
		},
		
		onFilter: function(/*===== results, query, options =====*/){
			// summary:
			//		User-defined function to handle filter actions. If the function returns false,
			//		the filtering is cancelled.
			// tags:
			//		callback
		},
		
		destroy: function(/*Boolean?*/ preserveDom){
			// summary:
			//		Destroys the widget. If the list has created dojox/mobile/SearchBox 
			//		or dojox/mobile/ScrollableView widgets, these widgets are also destroyed.
			// preserveDom: Boolean
			//		If true, this method will leave the original DOM structure alone.
		
			this.inherited(arguments);
			
			// Only destroy widgets created (thus, owned) by this mixin (if any).
			if(this._createdFilterBox){ 
				this._createdFilterBox.destroy(preserveDom);
				this._createdFilterBox = null;
			}
			if(this._createdScrollableView){ 
				this._createdScrollableView.destroy(preserveDom);
				this._createdScrollableView = null;
			}
		}
	});
});

},
'dojox/mobile/Carousel':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./lazyLoadUtils",
	"./CarouselItem",
	"./PageIndicator",
	"./SwapView",
	"require",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Carousel",
	"dojo/i18n!dojox/mobile/nls/messages"
], function(array, connect, declare, event, lang, has, domClass, domConstruct, domStyle, registry, Contained, Container, WidgetBase, lazyLoadUtils, CarouselItem, PageIndicator, SwapView, require, BidiCarousel, messages){

	// module:
	//		dojox/mobile/Carousel

	var Carousel = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiCarousel" : "dojox.mobile.Carousel", [WidgetBase, Container, Contained], {
		// summary:
		//		A carousel widget that manages a list of images.
		// description:
		//		The carousel widget manages a list of images that can be
		//		displayed horizontally, and allows the user to scroll through
		//		the list and select a single item.
		//
		//		This widget itself has no data store support, but there are two
		//		subclasses, dojox/mobile/DataCarousel and dojox/mobile/StoreCarousel,
		//		available for generating the contents from a data store.
		//		To feed data into a Carousel through a dojo/data, use DataCarousel.
		//		To feed data into a Carousel through a dojo/store, use StoreCarousel.
		//
		//		The Carousel widget loads and instantiates its item contents in
		//		a lazy manner. For example, if the number of visible items
		//		(see the property numVisible) is 2, the widget creates 4 items, 2 for the
		//		initial pane and 2 for the next page, at startup time. If you
		//		swipe the page to open the second page, the widget creates 2 more
		//		items for the third page. If the item to create is a dojo widget,
		//		its module is dynamically loaded automatically before instantiation.

		// numVisible: Number
		//		The number of visible items.
		numVisible: 2,

		// itemWidth: Number
		//		The number of visible items (=numVisible) is determined by
		//		(carousel_width / itemWidth).
		//		If itemWidth is specified, numVisible is automatically calculated.
		//		If resize() is called, numVisible is recalculated and the layout
		//		is changed accordingly.
		itemWidth: 0,

		// title: String
		//		A title of the carousel to be displayed on the title bar.
		title: "",

		// pageIndicator: [const] Boolean
		//		If true, a page indicator, a series of small dots that indicate
		//		the current page, is displayed on the title bar.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		pageIndicator: true,

		// navButton: [const] Boolean
		//		If true, navigation buttons are displayed on the title bar.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		navButton: false,

		// height: [const] String
		//		Explicitly specified height of the widget (ex. "300px"). If
		//		"inherit" is specified, the height is inherited from its offset
		//		parent.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		height: "",

		// selectable: Boolean
		//		If true, an item can be selected by clicking it.
		selectable: true,

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblCarousel",

		buildRendering: function(){
			this.containerNode = domConstruct.create("div", {className: "mblCarouselPages", id: this.id + "_pages"});
			this.inherited(arguments);
			var i, len;
			if(this.srcNodeRef){
				// reparent
				for(i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.firstChild);
				}
			}

			this.headerNode = domConstruct.create("div", {className: "mblCarouselHeaderBar"}, this.domNode);

			if(this.navButton){
				this.btnContainerNode = domConstruct.create("div", {
					className: "mblCarouselBtnContainer"
				}, this.headerNode);
				domStyle.set(this.btnContainerNode, "float", "right"); // workaround for webkit rendering problem
				this.prevBtnNode = domConstruct.create("button", {
					className: "mblCarouselBtn",
					title: messages["CarouselPrevious"],
					innerHTML: "&lt;",
					"aria-controls": this.containerNode.id
				}, this.btnContainerNode);
				this.nextBtnNode = domConstruct.create("button", {
					className: "mblCarouselBtn",
					title: messages["CarouselNext"],
					innerHTML: "&gt;",
					"aria-controls": this.containerNode.id
				}, this.btnContainerNode);
				this._prevHandle = this.connect(this.prevBtnNode, "onclick", "onPrevBtnClick");
				this._nextHandle = this.connect(this.nextBtnNode, "onclick", "onNextBtnClick");
			}

			if(this.pageIndicator){
				if(!this.title){
					this.title = "&nbsp;";
				}
				this.piw = new PageIndicator();
				this.headerNode.appendChild(this.piw.domNode);
			}

			this.titleNode = domConstruct.create("div", {
				className: "mblCarouselTitle"
			}, this.headerNode);

			this.domNode.appendChild(this.containerNode);
			this.subscribe("/dojox/mobile/viewChanged", "handleViewChanged");
			this.connect(this.domNode, "onclick", "_onClick");
			this.connect(this.domNode, "onkeydown", "_onClick");
			this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
			this.selectedItemIndex = -1;
			this.items = [];
		},

		startup: function(){
			if(this._started){ return; }

			var h;
			if(this.height === "inherit"){
				if(this.domNode.offsetParent){
					h = this.domNode.offsetParent.offsetHeight + "px";
				}
			}else if(this.height){
				h = this.height;
			}
			if(h){
				this.domNode.style.height = h;
			}

			if(this.store){
				if(!this.setStore){
					throw new Error("Use StoreCarousel or DataCarousel instead of Carousel.");
				}
				var store = this.store;
				this.store = null;
				this.setStore(store, this.query, this.queryOptions);
			}else{
				this.resizeItems();
			}
			this.inherited(arguments);

			this.currentView = array.filter(this.getChildren(), function(view){
				return view.isVisible();
			})[0];
		},

		resizeItems: function(){
			// summary:
			//		Resizes the child items of the carousel.
			var idx = 0, i, len;
			var h = this.domNode.offsetHeight - (this.headerNode ? this.headerNode.offsetHeight : 0);
			var m = (has("ie") < 10) ? 5 / this.numVisible - 1 : 5 / this.numVisible;
			var node, item;
			array.forEach(this.getChildren(), function(view){
				if(!(view instanceof SwapView)){ return; }
				if(!(view.lazy)){
					view._instantiated = true;
				}
				var ch = view.containerNode.childNodes;
				for(i = 0, len = ch.length; i < len; i++){
					node = ch[i];
					if(node.nodeType !== 1){ continue; }
					item = this.items[idx] || {};
					domStyle.set(node, {
						width: item.width || (90 / this.numVisible + "%"),
						height: item.height || h + "px",
						margin: "0 " + (item.margin || m + "%")
					});
					domClass.add(node, "mblCarouselSlot");
					idx++;
				}
			}, this);

			if(this.piw){
				this.piw.refId = this.containerNode.firstChild;
				this.piw.reset();
			}
		},

		resize: function(){
			if(!this.itemWidth){ return; }
			var num = Math.floor(this.domNode.offsetWidth / this.itemWidth);
			if(num === this.numVisible){ return; }
			this.selectedItemIndex = this.getIndexByItemWidget(this.selectedItem);
			this.numVisible = num;
			if(this.items.length > 0){
				this.onComplete(this.items);
				this.select(this.selectedItemIndex);
			}
		},

		fillPages: function(){
			array.forEach(this.getChildren(), function(child, i){
				var s = "";
				var j;
				for(j = 0; j < this.numVisible; j++){
					var type, props = "", mixins;
					var idx = i * this.numVisible + j;
					var item = {};
					if(idx < this.items.length){
						item = this.items[idx];
						type = this.store.getValue(item, "type");
						if(type){
							props = this.store.getValue(item, "props");
							mixins = this.store.getValue(item, "mixins");
						}else{
							type = "dojox.mobile.CarouselItem";
							array.forEach(["alt", "src", "headerText", "footerText"], function(p){
								var v = this.store.getValue(item, p);
								if(v !== undefined){
									if(props){ props += ','; }
									props += p + ':"' + v + '"';
								}
							}, this);
						}
					}else{
						type = "dojox.mobile.CarouselItem";
						props = 'src:"' + require.toUrl("dojo/resources/blank.gif") + '"' +
							', className:"mblCarouselItemBlank"';
					}

					s += '<div data-dojo-type="' + type + '"';
					if(props){
						s += ' data-dojo-props=\'' + props + '\'';
					}
					if(mixins){
						s += ' data-dojo-mixins=\'' + mixins + '\'';
					}
					s += '></div>';
				}
				child.containerNode.innerHTML = s;
			}, this);
		},

		onComplete: function(/*Array*/items){
			// summary:
			//		A handler that is called after the fetch completes.
			array.forEach(this.getChildren(), function(child){
				if(child instanceof SwapView){
					child.destroyRecursive();
				}
			});
			this.selectedItem = null;
			this.items = items;
			var nPages = Math.ceil(items.length / this.numVisible),
				i, h = this.domNode.offsetHeight - this.headerNode.offsetHeight,
				idx = this.selectedItemIndex === -1 ? 0 : this.selectedItemIndex,
				pg = Math.floor(idx / this.numVisible); // current page
			for(i = 0; i < nPages; i++){
				var w = new SwapView({height: h + "px", lazy:true});
				this.addChild(w);
				if(i === pg){
					w.show();
					this.currentView = w;
				}else{
					w.hide();
				}
			}
			this.fillPages();
			this.resizeItems();
			var children = this.getChildren();
			var from = pg - 1 < 0 ? 0 : pg - 1;
			var to = pg + 1 > nPages - 1 ? nPages - 1 : pg + 1;
			for(i = from; i <= to; i++){
				this.instantiateView(children[i]);
			}
		},

		onError: function(/*String*/ /*===== errText =====*/){
			// summary:
			//		An error handler.
		},

		onUpdate: function(/*Object*/ /*===== item, =====*/ /*Number*/ /*===== insertedInto =====*/){
			// summary:
			//		Adds a new item or updates an existing item.
		},

		onDelete: function(/*Object*/ /*===== item, =====*/ /*Number*/ /*===== removedFrom =====*/){
			// summary:
			//		Deletes an existing item.
		},

		onSet: function(item, attribute, oldValue, newValue){
		},

		onNew: function(newItem, parentInfo){
		},

		onStoreClose: function(request){
			// summary:
			//		Called when the store is closed.
		},

		getParentView: function(/*DomNode*/node){
			// summary:
			//		Returns the parent view of the given DOM node.
			var w;
			for(w = registry.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.getParent() instanceof SwapView){ return w; }
			}
			return null;
		},

		getIndexByItemWidget: function(/*Widget*/w){
			// summary:
			//		Returns the index of a given item widget.
			if(!w){ return -1; }
			var view = w.getParent();
			return array.indexOf(this.getChildren(), view) * this.numVisible +
				array.indexOf(view.getChildren(), w);
		},

		getItemWidgetByIndex: function(/*Number*/index){
			// summary:
			//		Returns the index of an item widget at a given index.
			if(index === -1){ return null; }
			var view = this.getChildren()[Math.floor(index / this.numVisible)];
			return view.getChildren()[index % this.numVisible];
		},

		onPrevBtnClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Called when the "previous" button is clicked.
			if(this.currentView){
				this.currentView.goTo(-1);
			}
		},

		onNextBtnClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Called when the "next" button is clicked.
			if(this.currentView){
				this.currentView.goTo(1);
			}
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.onClick(e) === false){ return; } // user's click action
			if(e && e.type === "keydown"){ // keyboard navigation for accessibility
				if(e.keyCode === 39){ // right arrow
					this.onNextBtnClick();
				}else if(e.keyCode === 37){ // left arrow
					this.onPrevBtnClick();
				}else if(e.keyCode !== 13){ // !Enter
					return;
				}
			}

			var w;
			for(w = registry.getEnclosingWidget(e.target); ; w = w.getParent()){
				if(!w){ return; }
				if(w.getParent() instanceof SwapView){ break; }
			}
			this.select(w);
			var idx = this.getIndexByItemWidget(w);
			connect.publish("/dojox/mobile/carouselSelect", [this, w, this.items[idx], idx]);
		},

		select: function(/*Widget|Number*/itemWidget){
			// summary:
			//		Selects the given widget.
			if(typeof(itemWidget) === "number"){
				itemWidget = this.getItemWidgetByIndex(itemWidget);
			}
			if(this.selectable){
				if(this.selectedItem){
					this.selectedItem.set("selected", false);
					domClass.remove(this.selectedItem.domNode, "mblCarouselSlotSelected");
				}
				if(itemWidget){
					itemWidget.set("selected", true);
					domClass.add(itemWidget.domNode, "mblCarouselSlotSelected");
				}
				this.selectedItem = itemWidget;
			}
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		instantiateView: function(view){
			// summary:
			//		Instantiates the given view.
			if(view && !view._instantiated){
				var isHidden = (domStyle.get(view.domNode, "display") === "none");
				if(isHidden){
					domStyle.set(view.domNode, {visibility:"hidden", display:""});
				}
				lazyLoadUtils.instantiateLazyWidgets(view.containerNode, null, function(root){
					if(isHidden){
						domStyle.set(view.domNode, {visibility:"visible", display:"none"});
					}
				});
				view._instantiated = true;
			}
		},

		handleViewChanged: function(view){
			// summary:
			//		Listens to "/dojox/mobile/viewChanged" events.
			if(view.getParent() !== this){ return; }
			if(this.currentView.nextView(this.currentView.domNode) === view){
				this.instantiateView(view.nextView(view.domNode));
			}else{
				this.instantiateView(view.previousView(view.domNode));
			}
			this.currentView = view;
		},

		_setTitleAttr: function(/*String*/title){
			// tags:
			//		private
			this.titleNode.innerHTML = this._cv ? this._cv(title) : title;
			this._set("title", title);
		}
	});
	
	Carousel.ChildSwapViewProperties = {
		// summary:
		//		This property can be specified for the SwapView children of a dojox/mobile/Carousel.

		// lazy: Boolean
		//		Specifies that the Carousel child must be lazily loaded.
		lazy: false
	};

	// Since any widget can be specified as an Accordion child, mix ChildWidgetProperties
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser. Remove for 2.0.  Also, hide from doc viewer.
	lang.extend(SwapView, /*===== {} || =====*/ Carousel.ChildSwapViewProperties);
	
	return has("dojo-bidi") ? declare("dojox.mobile.Carousel", [Carousel, BidiCarousel]) : Carousel;
});

},
'dojox/mobile/EdgeToEdgeStoreList':function(){
define([
	"dojo/_base/declare",
	"./EdgeToEdgeList",
	"./_StoreListMixin"
], function(declare, EdgeToEdgeList, StoreListMixin){

	// module:
	//		dojox/mobile/EdgeToEdgeStoreList

	return declare("dojox.mobile.EdgeToEdgeStoreList", [EdgeToEdgeList, StoreListMixin],{
		// summary:
		//		A dojo/store-enabled version of EdgeToEdgeList.
		// description:
		//		EdgeToEdgeStoreList is a subclass of EdgeToEdgeList which
		//		can generate ListItems according to the given dojo/store store.
	});
});

},
'dojox/mobile/ContentPane':function(){
define([
	"dojo/_base/declare",
	"./Container",
	"./_ContentPaneMixin"
], function(declare, Container, ContentPaneMixin){

	// module:
	//		dojox/mobile/ContentPane

	return declare("dojox.mobile.ContentPane", [Container, ContentPaneMixin], {
		// summary:
		//		A very simple content pane to embed an HTML fragment.
		// description:
		//		This widget embeds an HTML fragment and runs the parser. It has
		//		the ability to load external content using dojo/_base/xhr. onLoad()
		//		is called when parsing is done and the content is
		//		ready. Compared with dijit/layout/ContentPane, this widget
		//		provides only basic functionality, but it is much lighter.

		baseClass: "mblContentPane"
	});
});

},
'dojox/mobile/ScreenSizeAware':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom",
	"dijit/registry"
], function(kernel, array, config, connect, declare, lang, win, dom, registry){

	// module:
	//		dojox/mobile/ScreenSizeAware

	kernel.experimental("dojox.mobile.ScreenSizeAware"); // should consider support for other UI layout patterns

	var cls = declare("dojox.mobile.ScreenSizeAware", null, {
		// summary:
		//		A module to make a screen size aware application.
		// description:
		//		This module helps for creating applications that transform their
		//		UI layout according to the screen size. It assumes that the
		//		application consists of two horizontally split panes, and the
		//		left pane has a list widget. If you require this module in such an
		//		application, in a tablet-sized screen, the application shows a horizontally 
		//		split view whose left pane is a list widget.
		//		In a phone-sized screen, the application shows a list widget that fills the screen.
		//
		// example:
		// |	<span data-dojo-type="dojox.mobile.ScreenSizeAware"></span>
		// |	<div data-dojo-type="dojox.mobile.FixedSplitter" data-dojo-props='orientation:"H"'>
		// |	  <div data-dojo-type="dojox.mobile.Container" style="width:300px;">
		// |	    <div id="leftView" data-dojo-type="dojox.mobile.ScrollableView">
		// |	      <h1 data-dojo-type="dojox.mobile.Heading" data-dojo-props='fixed:"top"'>Left Pane</h1>
		// |	      <ul data-dojo-type="dojox.mobile.EdgeToEdgeList" data-dojo-props='stateful:true'>
		// |	        <li data-dojo-type="dojox.mobile.ListItem" data-dojo-props='label:"View1", moveTo:"view1"'></li>
		// |	        ....
		// |	      </ul>
		// |	    </div>
		// |	  </div>
		// |	  <div data-dojo-type="dojox.mobile.Container">
		// |	    <div id="view1" data-dojo-type="dojox.mobile.ScrollableView">
		// |	      <h1 data-dojo-type="dojox.mobile.Heading" data-dojo-props='fixed:"top", back:"Home", moveTo:"leftView"'>Right Pane</h1>
		// |	      ....
		// |	    </div>
		// |	  </div>
		// |	</div>

		// splitterId: String
		//		The id of the FixedSplitter.
		splitterId: "",

		// leftPaneId: String
		//		The id of the left pane.
		leftPaneId: "",

		// rightPaneId: String
		//		The id of the right pane.
		rightPaneId: "",

		// leftViewId: String
		//		The id of the left View.
		leftViewId: "",

		// leftListId: String
		//		The id of the list widget in the left view.
		leftListId: "",

		constructor: function(/*Object?*/options){
			// summary:
			//		Creates a new instance of the class.
			// options:
			//		Contains properties to be set.
			if (options){
				lang.mixin(this, options);
			}
			connect.subscribe("/dojox/mobile/screenSize/tablet", this, function(dim){
				this.transformUI("tablet");
			});
			connect.subscribe("/dojox/mobile/screenSize/phone", this, function(dim){
				this.transformUI("phone");
			});
		},

		init: function(){
			// summary:
			//		Initializes the application.
			if(this._initialized){ return; }
			this._initialized = true;

			// analyze the page structure
			this.splitter = this.splitterId ? registry.byId(this.splitterId) :
				array.filter(registry.findWidgets(win.body()),
					function(c){ return c.declaredClass.indexOf("Splitter") !== -1; })[0];
			if(!this.splitter){
				console.error("Splitter not found.");
				return;
			}

			this.leftPane = this.leftPaneId ? registry.byId(this.leftPaneId) :
				this.splitter.getChildren()[0];
			if(!this.leftPane){
				console.error("Left pane not found.");
				return;
			}

			this.rightPane = this.rightPaneId ? registry.byId(this.rightPaneId) :
				this.splitter.getChildren()[1];
			if(!this.rightPane){
				console.error("Right pane not found.");
				return;
			}

			this.leftView = this.leftViewId ? registry.byId(this.leftViewId) :
				array.filter(registry.findWidgets(this.leftPane.containerNode),
					function(c){ return c.declaredClass.indexOf("View") !== -1; })[0];
			if(!this.leftView){
				console.error("Left view not found.");
				return;
			}

			this.leftList = this.leftListId ? registry.byId(this.leftListId) :
				array.filter(registry.findWidgets(this.leftView.containerNode),
					function(c){ return c.declaredClass.indexOf("List") !== -1 ||
								 c.declaredClass.indexOf("IconContainer") !== -1; })[0];
			if(!this.leftList){
				console.error("Left list not found.");
				return;
			}
		},

		isPhone: function(){
			// summary:
			//		Returns true if the current mode set by transformUI(mode) is "phone".
			return this._currentMode === "phone"; // Boolean
		},

		getShowingView: function(){
			// summary:
			//		Returns the view currently shown.
			var firstView =
				array.filter(this.rightPane.getChildren(), function(c){ return c.declaredClass.indexOf("View") !== -1; })[0];
			if(!firstView){ return null; }
			return firstView.getShowingView() ||
				array.filter(this.rightPane.getChildren(), function(c){ return c.selected; })[0] ||
				firstView;
		},

		updateStateful: function(){
			// summary:
			//		Updates the stateful property of the list widget in the left-side pane.
			this.leftList.set("stateful", !this.isPhone());
		},

		getDestinationId: function(item){
			// summary:
			//		Returns the id of the target view of the given item.
			return item.moveTo;
		},

		updateBackButton: function(){
			// summary:
			//		Updates the back button.
			array.forEach(this.leftList.getChildren(), function(item){
				var id = this.getDestinationId(item);
				var view = registry.byId(id);
				if(view){
					var heading = array.filter(view.getChildren(), function(c){ return c.declaredClass.indexOf("Heading") !== -1; })[0];
					if(heading.backButton){
						heading.backButton.domNode.style.display = this.isPhone() ? "" : "none";
					}
					if(heading.backBtnNode){ // TODO: remove this block later
						heading.backBtnNode.style.display = this.isPhone() ? "" : "none";
					}
				}
			}, this);
		},

		updateTransition: function(){
			// summary:
			//		Updates the transition property of the items in the left-side widget. 
			var transition = this.isPhone() ? "slide" : "none";
			array.forEach(this.leftList.getChildren(), function(item){
				item.set("transition", transition);
			});
		},

		moveList: function(){
			// summary:
			//		Places the list widget. If the current mode is "phone", it 
			//		places the list widget in the right pane, otherwise in the left pane. 
			var to = this.isPhone() ? this.rightPane: this.leftPane;
			to.containerNode.appendChild(this.leftView.domNode);
		},

		showLeftView: function(){
			// summary:
			//		Shows the left-side view.
			this.leftPane.domNode.style.display = this.isPhone() ? "none" : "";
			this.leftView.show();
		},

		showRightView: function(){
			// summary:
			//		Shows the right-side view.
			if(this.isPhone()){ return; }
			var view = this.getShowingView();
			if(view){
				view.show();
			}else{
				this.leftItemSelected();
			}
		},

		updateSelectedItem: function(){
			// summary:
			//		Updates the selected item.
			var id;
			var view = this.getShowingView();
			if(view && !this.isPhone()){
				id = view.id;
			}
			if(id){
				var items = array.filter(this.leftList.getChildren(),
					function(item){ return this.getDestinationId(item) === id; }, this);
				if(items && items.length > 0){
					items[0].set("selected", true);
				}
			}else{
				this.leftList.deselectAll && this.leftList.deselectAll();
			}
		},

		leftItemSelected: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		Function called when an item in the left-side list is selected.
		},

		transformUI: function(/*String*/mode){
			// summary:
			//		Applies an UI mode.
			// mode: 
			//		If this argument is "phone", sets the UI in phone mode, otherwise 
			//		in tablet mode.		 
			this.init();
			if(mode === this._currentMode){ return; }
			this._currentMode = mode;
			this.updateStateful();
			this.updateBackButton();
			this.updateTransition();
			this.moveList();
			this.showLeftView();
			this.showRightView();
			this.updateSelectedItem();
		}
	});

	cls._instance = null;
	cls.getInstance = function(){
		if(!cls._instance){
			cls._instance = new cls();
		}
		return cls._instance;
	};

	return cls;
});

},
'dojox/mobile/View':function(){
define([
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/sniff",
	"dojo/_base/window",
	"dojo/_base/Deferred",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dijit/registry",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./ViewController", // to load ViewController for you (no direct references)
	"./common",
	"./transition",
	"./viewRegistry",
	"./_css3"
], function(array, config, connect, declare, lang, has, win, Deferred, dom, domClass, domConstruct, domGeometry, domStyle, registry, Contained, Container, WidgetBase, ViewController, common, transitDeferred, viewRegistry, css3){

	// module:
	//		dojox/mobile/View

	var dm = lang.getObject("dojox.mobile", true);

	return declare("dojox.mobile.View", [WidgetBase, Container, Contained], {
		// summary:
		//		A container widget for any HTML element and/or Dojo widgets
		// description:
		//		View is a container widget for any HTML element and/or Dojo widgets.
		//		As a Dojo widget container it can itself contain View widgets
		//		forming a set of nested views. A Dojo Mobile application is usually
		//		made of multiple View widgets and the user can navigate through
		//		the views back and forth with animated transition effects.
		//		
		//		When using several sibling views (direct children of the same
		//		element), you can use the 'selected' attribute to define whether
		//		the view should be displayed when the application is launched.
		//		If no view has selected=true, the first sibling view is displayed
		//		at startup time.

		// selected: Boolean
		//		If true, the view is displayed at startup time.
		selected: false,

		// keepScrollPos: Boolean
		//		If true, the scroll position is kept when transition occurs between views.
		keepScrollPos: true,

		// tag: String
		//		The name of the HTML tag to create as domNode. The default value is "div".
		tag: "div",

		/* internal properties */
		baseClass: "mblView",

		constructor: function(/*Object*/params, /*DomNode?*/node){
			// summary:
			//		Creates a new instance of the class.
			// params:
			//		Contains the parameters.
			// node:
			//		The DOM node. If none is specified, it is automatically created. 
			if(node){
				dom.byId(node).style.visibility = "hidden";
			}
		},

		destroy: function(){
			viewRegistry.remove(this.id);
			this.inherited(arguments);
		},

		buildRendering: function(){
			if(!this.templateString){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			}

			this._animEndHandle = this.connect(this.domNode, css3.name("animationEnd"), "onAnimationEnd");
			this._animStartHandle = this.connect(this.domNode, css3.name("animationStart"), "onAnimationStart");
			if(!config.mblCSS3Transition){
				this._transEndHandle = this.connect(this.domNode, css3.name("transitionEnd"), "onAnimationEnd");
			}
			if(has('mblAndroid3Workaround')){
				// workaround for the screen flicker issue on Android 3.x/4.0
				// applying "-webkit-transform-style:preserve-3d" to domNode can avoid
				// transition animation flicker
				domStyle.set(this.domNode, css3.name("transformStyle"), "preserve-3d");
			}

			viewRegistry.add(this);
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }

			// Determine which view among the siblings should be visible.
			// Priority:
			//	 1. fragment id in the url (ex. #view1,view2)
			//	 2. this.selected
			//	 3. the first view
			if(this._visible === undefined){
				var views = this.getSiblingViews();
				var ids = location.hash && location.hash.substring(1).split(/,/);
				var fragView, selectedView, firstView;
				array.forEach(views, function(v, i){
					if(array.indexOf(ids, v.id) !== -1){ fragView = v; }
					if(i == 0){ firstView = v; }
					if(v.selected){ selectedView = v; }
					v._visible = false;
				}, this);
				(fragView || selectedView || firstView)._visible = true;
			}
			if(this._visible){
				// The 2nd arg is not to hide its sibling views so that they can be
				// correctly initialized.
				this.show(true, true);

				// Defer firing events to let user connect to events just after creation
				// TODO: revisit this for 2.0
				this.defer(function(){
					this.onStartView();
					connect.publish("/dojox/mobile/startView", [this]);
				});
			}

			if(this.domNode.style.visibility === "hidden"){ // this check is to avoid screen flickers
				this.domNode.style.visibility = "inherit";
			}

			// Need to call inherited first - so that child widgets get started
			// up correctly
			this.inherited(arguments);

			var parent = this.getParent();
			if(!parent || !parent.resize){ // top level widget
				this.resize();
			}

			if(!this._visible){
				// hide() should be called last so that child widgets can be
				// initialized while they are visible.
				this.hide();
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onStartView: function(){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called only when this view is shown at startup time.
		},

		onBeforeTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the arriving transition occurs.
		},

		onAfterTransitionIn: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the arriving transition occurs.
		},

		onBeforeTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called before the leaving transition occurs.
		},

		onAfterTransitionOut: function(moveTo, dir, transition, context, method){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called after the leaving transition occurs.
		},

		_clearClasses: function(/*DomNode*/node){
			// summary:
			//		Clean up the domNode classes that were added while making a transition.
			// description:
			//		Remove all the "mbl" prefixed classes except mbl*View.
			if(!node){ return; }
			var classes = [];
			array.forEach(lang.trim(node.className||"").split(/\s+/), function(c){
				if(c.match(/^mbl\w*View$/) || c.indexOf("mbl") === -1){
					classes.push(c);
				}
			}, this);
			node.className = classes.join(' ');
		},

		_fixViewState: function(/*DomNode*/toNode){
			// summary:
			//		Sanity check for view transition states.
			// description:
			//		Sometimes uninitialization of Views fails after making view transition,
			//		and that results in failure of subsequent view transitions.
			//		This function does the uninitialization for all the sibling views.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblView")){
					this._clearClasses(n);
				}
			}
			this._clearClasses(toNode); // just in case toNode is a sibling of an ancestor.
			
			// #16337
			// Uninitialization may fail to clear _inProgress when multiple
			// performTransition calls occur in a short duration of time.
			var toWidget = registry.byNode(toNode);
			if(toWidget){
				toWidget._inProgress = false;
			}
		},

		convertToId: function(moveTo){
			if(typeof(moveTo) == "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				return moveTo.replace(/^#?([^&?]+).*/, "$1");
			}
			return moveTo;
		},

		_isBookmarkable: function(detail){
			return detail.moveTo && (config.mblForceBookmarkable || detail.moveTo.charAt(0) === '#') && !detail.hashchange;
		},

		performTransition: function(/*String*/moveTo, /*Number*/transitionDir, /*String*/transition,
									/*Object|null*/context, /*String|Function*/method /*...*/){
			// summary:
			//		Function to perform the various types of view transitions, such as fade, slide, and flip.
			// moveTo: String
			//		The id of the transition destination view which resides in
			//		the current page.
			//		If the value has a hash sign ('#') before the id
			//		(e.g. #view1) and the dojo/hash module is loaded by the user
			//		application, the view transition updates the hash in the
			//		browser URL so that the user can bookmark the destination
			//		view. In this case, the user can also use the browser's
			//		back/forward button to navigate through the views in the
			//		browser history.
			//		If null, transitions to a blank view.
			//		If '#', returns immediately without transition.
			// transitionDir: Number
			//		The transition direction. If 1, transition forward. If -1, transition backward.
			//		For example, the slide transition slides the view from right to left when transitionDir == 1,
			//		and from left to right when transitionDir == -1.
			// transition: String
			//		A type of animated transition effect. You can choose from
			//		the standard transition types, "slide", "fade", "flip", or
			//		from the extended transition types, "cover", "coverv",
			//		"dissolve", "reveal", "revealv", "scaleIn", "scaleOut",
			//		"slidev", "swirl", "zoomIn", "zoomOut", "cube", and
			//		"swap". If "none" is specified, transition occurs
			//		immediately without animation.
			// context: Object
			//		The object that the callback function will receive as "this".
			// method: String|Function
			//		A callback function that is called when the transition has finished.
			//		A function reference, or name of a function in context.
			// tags:
			//		public
			//
			// example:
			//		Transition backward to a view whose id is "foo" with the slide animation.
			//	|	performTransition("foo", -1, "slide");
			//
			// example:
			//		Transition forward to a blank view, and then open another page.
			//	|	performTransition(null, 1, "slide", null, function(){location.href = href;});

			if(this._inProgress){ return; } // transition is in progress
			this._inProgress = true;
			
			// normalize the arg
			var detail, optArgs;
			if(moveTo && typeof(moveTo) === "object"){
				detail = moveTo;
				optArgs = transitionDir; // array
			}else{
				detail = {
					moveTo: moveTo,
					transitionDir: transitionDir,
					transition: transition,
					context: context,
					method: method
				};
				optArgs = [];
				for(var i = 5; i < arguments.length; i++){
					optArgs.push(arguments[i]);
				}
			}

			// save the parameters
			this._detail = detail;
			this._optArgs = optArgs;
			this._arguments = [
				detail.moveTo,
				detail.transitionDir,
				detail.transition,
				detail.context,
				detail.method
			];

			if(detail.moveTo === "#"){ return; }
			var toNode;
			if(detail.moveTo){
				toNode = this.convertToId(detail.moveTo);
			}else{
				if(!this._dummyNode){
					this._dummyNode = win.doc.createElement("div");
					win.body().appendChild(this._dummyNode);
				}
				toNode = this._dummyNode;
			}

			if(this.addTransitionInfo && typeof(detail.moveTo) == "string" && this._isBookmarkable(detail)){
				this.addTransitionInfo(this.id, detail.moveTo, {transitionDir:detail.transitionDir, transition:detail.transition});
			}

			var fromNode = this.domNode;
			var fromTop = fromNode.offsetTop;
			toNode = this.toNode = dom.byId(toNode);
			if(!toNode){ console.log("dojox/mobile/View.performTransition: destination view not found: "+detail.moveTo); return; }
			toNode.style.visibility = "hidden";
			toNode.style.display = "";
			this._fixViewState(toNode);
			var toWidget = registry.byNode(toNode);
			if(toWidget){
				// Now that the target view became visible, it's time to run resize()
				if(config.mblAlwaysResizeOnTransition || !toWidget._resized){
					common.resizeAll(null, toWidget);
					toWidget._resized = true;
				}

				if(detail.transition && detail.transition != "none"){
					// Temporarily add padding to align with the fromNode while transition
					toWidget._addTransitionPaddingTop(fromTop);
				}

				toWidget.load && toWidget.load(); // for ContentView

				toWidget.movedFrom = fromNode.id;
			}
			if(has('mblAndroidWorkaround') && !config.mblCSS3Transition
					&& detail.transition && detail.transition != "none"){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// apply "-webkit-transform-style:preserve-3d" to both toNode and fromNode
				// to make them 3d-transition-ready state just before transition animation
				domStyle.set(toNode, css3.name("transformStyle"), "preserve-3d");
				domStyle.set(fromNode, css3.name("transformStyle"), "preserve-3d");
				// show toNode offscreen to avoid flicker when switching "display" and "visibility" styles
				domClass.add(toNode, "mblAndroidWorkaround");
			}

			this.onBeforeTransitionOut.apply(this, this._arguments);
			connect.publish("/dojox/mobile/beforeTransitionOut", [this].concat(lang._toArray(this._arguments)));
			if(toWidget){
				// perform view transition keeping the scroll position
				if(this.keepScrollPos && !this.getParent()){
					var scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					fromNode._scrollTop = scrollTop;
					var toTop = (detail.transitionDir == 1) ? 0 : (toNode._scrollTop || 0);
					toNode.style.top = "0px";
					if(scrollTop > 1 || toTop !== 0){
						fromNode.style.top = toTop - scrollTop + "px";
						// address bar hiding does not work on iOS 7+.
						if(!(has("ios") >= 7) && config.mblHideAddressBar !== false){
							this.defer(function(){ // iPhone needs setTimeout (via defer)
								win.global.scrollTo(0, (toTop || 1));
							});
						}
					}
				}else{
					toNode.style.top = "0px";
				}
				toWidget.onBeforeTransitionIn.apply(toWidget, this._arguments);
				connect.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(lang._toArray(this._arguments)));
			}
			toNode.style.display = "none";
			toNode.style.visibility = "inherit";

			common.fromView = this;
			common.toView = toWidget;

			this._doTransition(fromNode, toNode, detail.transition, detail.transitionDir);
		},

		_addTransitionPaddingTop: function(/*String|Integer*/ value){
			// add padding top to the view in order to get alignment during the transition
			this.containerNode.style.paddingTop = value + "px";
		},

		_removeTransitionPaddingTop: function(){
			// remove padding top from the view after the transition
			this.containerNode.style.paddingTop = "";
		},

		_toCls: function(s){
			// convert from transition name to corresponding class name
			// ex. "slide" -> "mblSlide"
			return "mbl"+s.charAt(0).toUpperCase() + s.substring(1);
		},

		_doTransition: function(fromNode, toNode, transition, transitionDir){
			var rev = (transitionDir == -1) ? " mblReverse" : "";
			toNode.style.display = "";
			if(!transition || transition == "none"){
				this.domNode.style.display = "none";
				this.invokeCallback();
			}else if(config.mblCSS3Transition){
				//get dojox/css3/transit first
				Deferred.when(transitDeferred, lang.hitch(this, function(transit){
					//follow the style of .mblView.mblIn in View.css
					//need to set the toNode to absolute position
					var toPosition = domStyle.get(toNode, "position");
					domStyle.set(toNode, "position", "absolute");
					Deferred.when(transit(fromNode, toNode, {transition: transition, reverse: (transitionDir===-1)?true:false}),lang.hitch(this,function(){
						domStyle.set(toNode, "position", toPosition);
						// Reset the temporary padding on toNode
						toNode.style.paddingTop = "";
						this.invokeCallback();
					}));
				}));
			}else{
				if(transition.indexOf("cube") != -1){
					if(has('ipad')){
						domStyle.set(toNode.parentNode, {webkitPerspective:1600});
					}else if(has("ios")){
						domStyle.set(toNode.parentNode, {webkitPerspective:800});
					}
				}
				var s = this._toCls(transition);
				if(has('mblAndroidWorkaround')){
					// workaround for the screen flicker issue on Android 2.2
					// applying transition css classes just after setting toNode.style.display = ""
					// causes flicker, so wait for a while using setTimeout (via defer)
					var _this = this;
					_this.defer(function(){
						domClass.add(fromNode, s + " mblOut" + rev);
						domClass.add(toNode, s + " mblIn" + rev);
						domClass.remove(toNode, "mblAndroidWorkaround"); // remove offscreen style
						_this.defer(function(){
							domClass.add(fromNode, "mblTransition");
							domClass.add(toNode, "mblTransition");
						}, 30); // 30 = 100 - 70, to make total delay equal to 100ms
					}, 70); // 70ms is experiential value
				}else{
					domClass.add(fromNode, s + " mblOut" + rev);
					domClass.add(toNode, s + " mblIn" + rev);
					this.defer(function(){
						domClass.add(fromNode, "mblTransition");
						domClass.add(toNode, "mblTransition");
					}, 100);
				}
				// set transform origin
				var fromOrigin = "50% 50%";
				var toOrigin = "50% 50%";
				var scrollTop, posX, posY;
				if(transition.indexOf("swirl") != -1 || transition.indexOf("zoom") != -1){
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					}else{
						scrollTop = -domGeometry.position(fromNode, true).y;
					}
					posY = win.global.innerHeight / 2 + scrollTop;
					fromOrigin = "50% " + posY + "px";
					toOrigin = "50% " + posY + "px";
				}else if(transition.indexOf("scale") != -1){
					var viewPos = domGeometry.position(fromNode, true);
					posX = ((this.clickedPosX !== undefined) ? this.clickedPosX : win.global.innerWidth / 2) - viewPos.x;
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = win.body().scrollTop || win.doc.documentElement.scrollTop || win.global.pageYOffset || 0;
					}else{
						scrollTop = -viewPos.y;
					}
					posY = ((this.clickedPosY !== undefined) ? this.clickedPosY : win.global.innerHeight / 2) + scrollTop;
					fromOrigin = posX + "px " + posY + "px";
					toOrigin = posX + "px " + posY + "px";
				}
				domStyle.set(fromNode, css3.add({}, {transformOrigin:fromOrigin}));
				domStyle.set(toNode, css3.add({}, {transformOrigin:toOrigin}));
			}
		},

		onAnimationStart: function(e){
			// summary:
			//		A handler that is called when transition animation starts.
		},

		onAnimationEnd: function(e){
			// summary:
			//		A handler that is called after transition animation ends.
			var name = e.animationName || e.target.className;
			if(name.indexOf("Out") === -1 &&
				name.indexOf("In") === -1 &&
				name.indexOf("Shrink") === -1){ return; }
			var isOut = false;
			if(domClass.contains(this.domNode, "mblOut")){
				isOut = true;
				this.domNode.style.display = "none";
				domClass.remove(this.domNode, [this._toCls(this._detail.transition), "mblIn", "mblOut", "mblReverse"]);
			}else{
				// Reset the temporary padding
				this._removeTransitionPaddingTop();
			}
			domStyle.set(this.domNode, css3.add({}, {transformOrigin:""}));
			if(name.indexOf("Shrink") !== -1){
				var li = e.target;
				li.style.display = "none";
				domClass.remove(li, "mblCloseContent");

				// If target is placed inside scrollable, need to call onTouchEnd
				// to adjust scroll position
				var p = viewRegistry.getEnclosingScrollable(this.domNode);
				p && p.onTouchEnd();
			}
			if(isOut){
				this.invokeCallback();
			}
			this._clearClasses(this.domNode);

			// clear the clicked position
			this.clickedPosX = this.clickedPosY = undefined;

			if(name.indexOf("Cube") !== -1 &&
				name.indexOf("In") !== -1 && has("ios")){
				this.domNode.parentNode.style[css3.name("perspective")] = "";
			}
		},

		invokeCallback: function(){
			// summary:
			//		A function to be called after performing a transition to
			//		call a specified callback.
			this.onAfterTransitionOut.apply(this, this._arguments);
			connect.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
			var toWidget = registry.byNode(this.toNode);
			if(toWidget){
				toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
				connect.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
				toWidget.movedFrom = undefined;
				if(this.setFragIds && this._isBookmarkable(this._detail)){
					this.setFragIds(toWidget); // setFragIds is defined in bookmarkable.js
				}
			}
			if(has('mblAndroidWorkaround')){
				// workaround for the screen flicker issue on Android 2.2/2.3
				// remove "-webkit-transform-style" style after transition finished
				// to avoid side effects such as input field auto-scrolling issue
				// use setTimeout (via defer) to avoid flicker in case of ScrollableView
				this.defer(function(){
					if(toWidget){ domStyle.set(this.toNode, css3.name("transformStyle"), ""); }
					domStyle.set(this.domNode, css3.name("transformStyle"), "");
				});
			}

			var c = this._detail.context, m = this._detail.method;
			if(c || m){
				if(!m){
					m = c;
					c = null;
				}
				c = c || win.global;
				if(typeof(m) == "string"){
					c[m].apply(c, this._optArgs);
				}else if(typeof(m) == "function"){
					m.apply(c, this._optArgs);
				}
			}
			this._detail = this._optArgs = this._arguments = undefined;
			this._inProgress = false;
		},

		isVisible: function(/*Boolean?*/checkAncestors){
			// summary:
			//		Return true if this view is visible
			// checkAncestors:
			//		If true, in addition to its own visibility, also checks the
			//		ancestors visibility to see if the view is actually being
			//		shown or not.
			var visible = function(node){
				return domStyle.get(node, "display") !== "none";
			};
			if(checkAncestors){
				for(var n = this.domNode; n.tagName !== "BODY"; n = n.parentNode){
					if(!visible(n)){ return false; }
				}
				return true;
			}else{
				return visible(this.domNode);
			}
		},

		getShowingView: function(){
			// summary:
			//		Find the currently showing view from my sibling views.
			// description:
			//		Note that depending on the ancestor views' visibility,
			//		the found view may not be actually shown.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				var n = nodes[i];
				if(n.nodeType === 1 && domClass.contains(n, "mblView") && n.style.display !== "none"){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getSiblingViews: function(){
			// summary:
			//		Returns an array of the sibling views.
			if(!this.domNode.parentNode){ return [this]; }
			return array.map(array.filter(this.domNode.parentNode.childNodes,
				function(n){ return n.nodeType === 1 && domClass.contains(n, "mblView"); }),
				function(n){ return registry.byNode(n); });
		},

		show: function(/*Boolean?*/noEvent, /*Boolean?*/doNotHideOthers){
			// summary:
			//		Shows this view without a transition animation.
			var out = this.getShowingView();
			if(!noEvent){
				if(out){
					out.onBeforeTransitionOut(out.id);
					connect.publish("/dojox/mobile/beforeTransitionOut", [out, out.id]);
				}
				this.onBeforeTransitionIn(this.id);
				connect.publish("/dojox/mobile/beforeTransitionIn", [this, this.id]);
			}

			if(doNotHideOthers){
				this.domNode.style.display = "";
			}else{
				array.forEach(this.getSiblingViews(), function(v){
					v.domNode.style.display = (v === this) ? "" : "none";
				}, this);
			}
			this.load && this.load(); // for ContentView

			if(!noEvent){
				if(out){
					out.onAfterTransitionOut(out.id);
					connect.publish("/dojox/mobile/afterTransitionOut", [out, out.id]);
				}
				this.onAfterTransitionIn(this.id);
				connect.publish("/dojox/mobile/afterTransitionIn", [this, this.id]);
			}
		},

		hide: function(){
			// summary:
			//		Hides this view without a transition animation.
			this.domNode.style.display = "none";
		}
	});
});

},
'dojox/mobile/dh/ContentTypeMap':function(){
define([
	"dojo/_base/lang"
], function(lang){

	// module:
	//		dojox/mobile/dh/ContentTypeMap

	var o = {
		// summary:
		//		A component that provides a map for determining the content handler
		//		class from a content-type.
	};
	lang.setObject("dojox.mobile.dh.ContentTypeMap", o);

	o.map = {
		"html": "dojox/mobile/dh/HtmlContentHandler",
		"json": "dojox/mobile/dh/JsonContentHandler"
	};

	o.add = function(/*String*/ contentType, /*String*/ handlerClass){
		// summary:
		//		Adds a handler class for the given content type.
		this.map[contentType] = handlerClass;
	};

	o.getHandlerClass = function(/*String*/ contentType){
		// summary:
		//		Returns the handler class for the given content type.
		return this.map[contentType];
	};

	return o;
});

},
'dojox/mobile/Slider':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/sniff",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/keys",
	"dojo/touch",
	"dijit/_WidgetBase",
	"dijit/form/_FormValueMixin"
],
	function(array, connect, declare, lang, win, has, domClass, domConstruct, domGeometry, domStyle, keys, touch, WidgetBase, FormValueMixin){

	return declare("dojox.mobile.Slider", [WidgetBase, FormValueMixin], {
		// summary:
		//		A non-templated Slider widget similar to the HTML5 INPUT type=range.

		// value: [const] Number
		//		The current slider value.
		value: 0,

		// min: [const] Number
		//		The first value the slider can be set to.
		min: 0,

		// max: [const] Number
		//		The last value the slider can be set to.
		max: 100,

		// step: [const] Number
		//		The delta from 1 value to another.
		//		This causes the slider handle to snap/jump to the closest possible value.
		//		A value of 0 means continuous (as much as allowed by pixel resolution).
		step: 1,

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblSlider",

		// flip: [const] Boolean
		//		Specifies if the slider should change its default: ascending <--> descending.
		flip: false,

		// orientation: [const] String
		//		The slider direction.
		//
		//		- "H": horizontal
		//		- "V": vertical
		//		- "auto": use width/height comparison at instantiation time (default is "H" if width/height are 0)
		orientation: "auto",

		// halo: Number
		//		Size of the boundary that extends beyond the edges of the slider
		//		to make it easier to touch.
		halo: "8pt",

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				this.focusNode = this.domNode = domConstruct.create("div", {});
				this.valueNode = domConstruct.create("input", (this.srcNodeRef && this.srcNodeRef.name) ? { type: "hidden", name: this.srcNodeRef.name } : { type: "hidden" }, this.domNode, "last");
				var relativeParent = domConstruct.create("div", { style: { position:"relative", height:"100%", width:"100%" } }, this.domNode, "last");
				this.progressBar = domConstruct.create("div", { style:{ position:"absolute" }, "class":"mblSliderProgressBar" }, relativeParent, "last");
				this.touchBox = domConstruct.create("div", { style:{ position:"absolute" }, "class":"mblSliderTouchBox" }, relativeParent, "last");
				this.handle = domConstruct.create("div", { style:{ position:"absolute" }, "class":"mblSliderHandle" }, relativeParent, "last");
				this.handle.setAttribute("role", "slider");
				this.handle.setAttribute("tabindex", 0);
			}
			this.inherited(arguments);
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			if(typeof this.domNode.style.msTouchAction != "undefined"){
				this.domNode.style.msTouchAction = "none";
			}
		},

		_setMinAttr: function(/*Number*/ min){
			this.handle.setAttribute("aria-valuemin", min);
			this._set("min",min);
		},
		_setMaxAttr: function(/*Number*/ max){
			this.handle.setAttribute("aria-valuemax", max);
			this._set("max",max);
		},
		_setValueAttr: function(/*Number*/ value, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook such that set('value', value) works.
			// tags:
			//		private
			value = Math.max(Math.min(value, this.max), this.min);
			var fromPercent = (this.value - this.min) * 100 / (this.max - this.min);
			this.valueNode.value = value;
			this.inherited(arguments);
			if(!this._started){ return; } // don't move images until all the properties are set
			var toPercent = (value - this.min) * 100 / (this.max - this.min);
			// now perform visual slide
			var horizontal = this.orientation != "V";
			if(priorityChange === true){
				domClass.add(this.handle, "mblSliderTransition");
				domClass.add(this.progressBar, "mblSliderTransition");
			}else{
				domClass.remove(this.handle, "mblSliderTransition");
				domClass.remove(this.progressBar, "mblSliderTransition");
			}
			domStyle.set(this.handle, this._attrs.handleLeft, (this._reversed ? (100-toPercent) : toPercent) + "%");
			domStyle.set(this.progressBar, this._attrs.width, toPercent + "%");
			this.handle.setAttribute("aria-valuenow", value);
		},

		postCreate: function(){
			this.inherited(arguments);

			function beginDrag(e){
				e.target.focus();
				function getEventData(e){
					point = isMouse ? e[this._attrs.pageX] : (e.touches ? e.touches[0][this._attrs.pageX] : e[this._attrs.clientX]);
					pixelValue = point - startPixel;
					pixelValue = Math.min(Math.max(pixelValue, 0), maxPixels);
					var discreteValues = this.step ? ((this.max - this.min) / this.step) : maxPixels;
					if(discreteValues <= 1 || discreteValues == Infinity ){ discreteValues = maxPixels; }
					var wholeIncrements = Math.round(pixelValue * discreteValues / maxPixels);
					value = (this.max - this.min) * wholeIncrements / discreteValues;
					value = this._reversed ? (this.max - value) : (this.min + value);
				}
				function continueDrag(e){
					e.preventDefault();
					lang.hitch(this, getEventData)(e);
					this.set('value', value, false);
				}
		
				function endDrag(e){
					e.preventDefault();
					array.forEach(actionHandles, lang.hitch(this, "disconnect"));
					actionHandles = [];
					this.set('value', this.value, true);
				}

				e.preventDefault();
				var isMouse = e.type == "mousedown";
				var box = domGeometry.position(node, false); // can't use true since the added docScroll and the returned x are body-zoom incompatible
				var bodyZoom = (has("ie") || has("trident") > 6) ? 1 : (domStyle.get(win.body(), "zoom") || 1);
				if(isNaN(bodyZoom)){ bodyZoom = 1; }
				var nodeZoom = (has("ie") || has("trident") > 6) ? 1 : (domStyle.get(node, "zoom") || 1);
				if(isNaN(nodeZoom)){ nodeZoom = 1; }
				var startPixel = box[this._attrs.x] * nodeZoom * bodyZoom + domGeometry.docScroll()[this._attrs.x];
				var maxPixels = box[this._attrs.w] * nodeZoom * bodyZoom;
				lang.hitch(this, getEventData)(e);
				if(e.target == this.touchBox){
					this.set('value', value, true);
				}
				array.forEach(actionHandles, connect.disconnect);
				var root = win.doc.documentElement;
				var actionHandles = [
					this.connect(root, touch.move, continueDrag),
					this.connect(root, touch.release, endDrag)
				];
			}

			function keyPress(/*Event*/ e){
				if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){ return; }
				var	step = this.step,
					multiplier = 1,
					newValue;
				switch(e.keyCode){
					case keys.HOME:
						newValue = this.min;
						break;
					case keys.END:
						newValue = this.max;
						break;
					case keys.RIGHT_ARROW:
						multiplier = -1;
					case keys.LEFT_ARROW:
						newValue = this.value + multiplier * ((flip && horizontal) ? step : -step);
						break;
					case keys.DOWN_ARROW:
						multiplier = -1;
					case keys.UP_ARROW:
						newValue = this.value + multiplier * ((!flip || horizontal) ? step : -step);
						break;
					default:
						return;
				}
				e.preventDefault();
				this._setValueAttr(newValue, false);
			}

			function keyUp(/*Event*/ e){
				if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){ return; }
				this._setValueAttr(this.value, true);
			}

			var	point, pixelValue, value,
				node = this.domNode;
			if(this.orientation == "auto"){
				 this.orientation = node.offsetHeight <= node.offsetWidth ? "H" : "V";
			}
			// add V or H suffix to baseClass for styling purposes
			domClass.add(this.domNode, array.map(this.baseClass.split(" "), lang.hitch(this, function(c){ return c+this.orientation; })));
			var	horizontal = this.orientation != "V",
				ltr = horizontal ? this.isLeftToRight() : false,
				flip = !!this.flip;
			// _reversed is complicated since you can have flipped right-to-left and vertical is upside down by default
			this._reversed = !((horizontal && ((ltr && !flip) || (!ltr && flip))) || (!horizontal && flip));
			this._attrs = horizontal ? { x:'x', w:'w', l:'l', r:'r', pageX:'pageX', clientX:'clientX', handleLeft:"left", left:this._reversed ? "right" : "left", width:"width" } : { x:'y', w:'h', l:'t', r:'b', pageX:'pageY', clientX:'clientY', handleLeft:"top", left:this._reversed ? "bottom" : "top", width:"height" };
			this.progressBar.style[this._attrs.left] = "0px";
			this.connect(this.touchBox, touch.press, beginDrag);
			this.connect(this.handle, touch.press, beginDrag);
			this.connect(this.domNode, "onkeypress", keyPress); // for desktop a11y
			this.connect(this.domNode, "onkeyup", keyUp); // fire onChange on desktop
			this.startup();
			this.set('value', this.value);
		}
	});
});

},
'dojox/mobile/ScrollablePane':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/sniff",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-style",
	"./common",
	"./_ScrollableMixin",
	"./Pane",
	"./_maskUtils"
], function(array, declare, has, win, domConstruct, domStyle, common, ScrollableMixin, Pane, maskUtils){

	// module:
	//		dojox/mobile/ScrollablePane

	return declare("dojox.mobile.ScrollablePane", [Pane, ScrollableMixin], {
		// summary:
		//		A pane that has the touch-scrolling capability.

		// roundCornerMask: Boolean
		//		If true, creates a rounded corner mask to clip corners of a 
		//		child widget or DOM node. Works only on WebKit-based browsers.
		roundCornerMask: false,

		// radius: Number
		//		Radius of the rounded corner mask.
		radius: 0,

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblScrollablePane",

		buildRendering: function(){
			var c = this.containerNode = domConstruct.create("div", {
				className: "mblScrollableViewContainer",
				style: {
					width: this.scrollDir === "v" ? "100%" : ""
				}
			});
			this.inherited(arguments);

			if(this.srcNodeRef){
				// reparent
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.firstChild);
				}
			}

			if(this.roundCornerMask && (has("mask-image"))){
				var node = this.containerNode;
				var mask = this.maskNode = domConstruct.create("div", {
					className: "mblScrollablePaneMask"
				});
				mask.appendChild(node);
				c = mask;
			}

			this.domNode.appendChild(c);
			common.setSelectable(this.containerNode, false);
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			this.inherited(arguments); // scrollable#resize() will be called
			if(this.roundCornerMask){
				this.createRoundMask();
			}
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		isTopLevel: function(e){
			// summary:
			//		Returns true if this is a top-level widget.
			//		Overrides dojox/mobile/scrollable.
			var parent = this.getParent && this.getParent();
			return (!parent || !parent.resize); // top level widget
		},

		createRoundMask: function(){
			// summary:
			//		Creates a rounded corner rectangle mask.
			// description:
			//		Creates a rounded corner rectangle mask.
			//		This function works only on WebKit-based browsers.
			if(has("mask-image")){
				if(this.domNode.offsetHeight == 0){ return; } // in a hidden view
				this.maskNode.style.height = this.domNode.offsetHeight + "px";
				var child = this.getChildren()[0],
					c = this.containerNode,
					node = child ? child.domNode :
						(c.childNodes.length > 0 && (c.childNodes[0].nodeType === 1 ? c.childNodes[0] : c.childNodes[1]));

				var r = this.radius;
				if(!r){
					var getRadius = function(n){ return parseInt(domStyle.get(n, "borderTopLeftRadius")); };
					if(child){
						r = getRadius(child.domNode);
						if(!r){
							var item = child.getChildren()[0];
							r = item ? getRadius(item.domNode) : 0;
						}
					}else{
						r = getRadius(node);
					}
				}

				var pw = this.domNode.offsetWidth, // pane width
					w = node.offsetWidth,
					h = this.domNode.offsetHeight,
					t = domStyle.get(node, "marginTop"),
					b = domStyle.get(node, "marginBottom"),
					l = domStyle.get(node, "marginLeft");
				
				maskUtils.createRoundMask(this.maskNode, l, t, 0, b, w, h - b - t, r, r);
			}
		}
	});
});

},
'dojox/mobile/ComboBox':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/window",
	"dojo/touch",
	"dijit/form/_AutoCompleterMixin",
	"dijit/popup",
	"./_ComboBoxMenu",
	"./TextBox",
	"./sniff"
], function(kernel, declare, lang, win, domGeometry, domStyle, domAttr, windowUtils, touch, AutoCompleterMixin, popup, ComboBoxMenu, TextBox, has){
	kernel.experimental("dojox.mobile.ComboBox"); // should be using a more native search-type UI

	return declare("dojox.mobile.ComboBox", [TextBox, AutoCompleterMixin], {
		// summary:
		//		A non-templated auto-completing text box widget.

		// dropDownClass: [protected extension] String
		//		Name of the drop-down widget class used to select a date/time.
		//		Should be specified by subclasses.
		dropDownClass: "dojox.mobile._ComboBoxMenu",

		// initially disable selection since iphone displays selection handles
		// that makes it hard to pick from the list
		
		// selectOnClick: Boolean
		//		Flag which enables the selection on click.
		selectOnClick: false,
		
		// autoComplete: Boolean
		//		Flag which enables the auto-completion.
		autoComplete: false,

		// dropDown: [protected] Widget
		//		The widget to display as a popup. This widget *must* be
		//		defined before the startup function is called.
		dropDown: null,

		// maxHeight: [protected] int
		//		The maximum height for the drop-down.
		//		Any drop-down taller than this value will have scrollbars.
		//		Set to -1 to limit the height to the available space in the viewport.
		maxHeight: -1,

		// dropDownPosition: [const] String[]
		//		This variable controls the position of the drop-down.
		//		It is an array of strings with the following values:
		//
		//		- before: places drop down to the left of the target node/widget, or to the right in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- after: places drop down to the right of the target node/widget, or to the left in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- above: drop down goes above target node
		//		- below: drop down goes below target node
		//
		//		The list is positions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		dropDownPosition: ["below","above"],

		_throttleOpenClose: function(){
			// summary:
			//		Prevents the open/close in rapid succession.
			// tags:
			//		private
			if(this._throttleHandler){
				this._throttleHandler.remove();
			}
			this._throttleHandler = this.defer(function(){ this._throttleHandler = null; }, 500);
		},

		_onFocus: function(){
			// summary:
			//		Shows drop-down if the user is selecting Next/Previous from the virtual keyboard.
			// tags:
			//		private
			this.inherited(arguments);
			if(!this._opened && !this._throttleHandler){
				this._startSearchAll(); 
			}

			if(has("windows-theme")) {
				this.domNode.blur();
			}
		},

		onInput: function(e){
			if(!e || e.charCode !== 0){ // #18047
				this._onKey(e);
				this.inherited(arguments);
			}
		},

		_setListAttr: function(v){
			// tags:
			//		private
			this._set('list', v); // needed for Firefox 4+ to prevent HTML5 mode
		},

		closeDropDown: function(){
			// summary:
			//		Closes the drop down on this widget
			// tags:
			//		protected

			this._throttleOpenClose();
			if(this.endHandler){
				this.disconnect(this.startHandler);
				this.disconnect(this.endHandler);
				this.disconnect(this.moveHandler);
				clearInterval(this.repositionTimer);
				this.repositionTimer = this.endHandler = null;
			}
			this.inherited(arguments);
			domAttr.remove(this.domNode, "aria-owns");
			domAttr.set(this.domNode, "aria-expanded", "false");
			popup.close(this.dropDown);
			this._opened = false;

			// Remove disable attribute to make input element clickable after context menu closed
			if(has("windows-theme") && this.domNode.disabled){
				this.defer(function(){
					this.domNode.removeAttribute("disabled");
				}, 300);
			}

		},

		openDropDown: function(){
			// summary:
			//		Opens the dropdown for this widget. To be called only when this.dropDown
			//		has been created and is ready to display (that is, its data is loaded).
			// returns:
			//		Returns the value of popup.open().
			// tags:
			//		protected

			var wasClosed = !this._opened;
			var dropDown = this.dropDown,
				ddNode = dropDown.domNode,
				aroundNode = this.domNode,
				self = this;
				
			domAttr.set(dropDown.domNode, "role", "listbox");
			domAttr.set(this.domNode, "aria-expanded", "true");
			if(dropDown.id){
				domAttr.set(this.domNode, "aria-owns", dropDown.id);
			}

			if(has("touch") && (!has("ios") || has("ios") < 8)){
				win.global.scrollBy(0, domGeometry.position(aroundNode, false).y); // don't call scrollIntoView since it messes up ScrollableView
			}

			// TODO: isn't maxHeight dependent on the return value from popup.open(),
			// i.e., dependent on how much space is available (BK)

			if(!this._preparedNode){
				this._preparedNode = true;
				// Check if we have explicitly set width and height on the dropdown widget dom node
				if(ddNode.style.width){
					this._explicitDDWidth = true;
				}
				if(ddNode.style.height){
					this._explicitDDHeight = true;
				}
			}

			// Code for resizing dropdown (height limitation, or increasing width to match my width)
			var myStyle = {
				display: "",
				overflow: "hidden",
				visibility: "hidden"
			};
			if(!this._explicitDDWidth){
				myStyle.width = "";
			}
			if(!this._explicitDDHeight){
				myStyle.height = "";
			}
			domStyle.set(ddNode, myStyle);

			// Figure out maximum height allowed (if there is a height restriction)
			var maxHeight = this.maxHeight;
			if(maxHeight == -1){
				// limit height to space available in viewport either above or below my domNode
				// (whichever side has more room)
				var viewport = windowUtils.getBox(),
					position = domGeometry.position(aroundNode, false);
				maxHeight = Math.floor(Math.max(position.y, viewport.h - (position.y + position.h)));
			}

			// Attach dropDown to DOM and make make visibility:hidden rather than display:none
			// so we call startup() and also get the size
			popup.moveOffScreen(dropDown);

			if(dropDown.startup && !dropDown._started){
				dropDown.startup(); // this has to be done after being added to the DOM
			}
			// Get size of drop down, and determine if vertical scroll bar needed
			var mb = domGeometry.position(this.dropDown.containerNode, false);
			var overHeight = (maxHeight && mb.h > maxHeight);
			if(overHeight){
				mb.h = maxHeight;
			}

			// Adjust dropdown width to match or be larger than my width
			mb.w = Math.max(mb.w, aroundNode.offsetWidth);
			domGeometry.setMarginBox(ddNode, mb);

			var retVal = popup.open({
				parent: this,
				popup: dropDown,
				around: aroundNode,
				orient: has("windows-theme") ? ["above"] : this.dropDownPosition,
				onExecute: function(){
					self.closeDropDown();
				},
				onCancel: function(){
					self.closeDropDown();
				},
				onClose: function(){
					self._opened = false;
				}
			});
			this._opened=true;

			if(wasClosed){
				var	isGesture = false,
					skipReposition = false,
					active = false,
					wrapper = dropDown.domNode.parentNode,
					aroundNodePos = domGeometry.position(aroundNode, false),
					popupPos = domGeometry.position(wrapper, false),
					deltaX = popupPos.x - aroundNodePos.x,
					deltaY = popupPos.y - aroundNodePos.y,
					startX = -1, startY = -1;

				// touchstart isn't really needed since touchmove implies touchstart, but
				// mousedown is needed since mousemove doesn't know if the left button is down or not
				this.startHandler = this.connect(win.doc.documentElement, touch.press,
					function(e){
						skipReposition = true;
						active = true;
						isGesture = false;
						startX = e.clientX;
						startY = e.clientY;
					}
				);
				this.moveHandler = this.connect(win.doc.documentElement, touch.move,
					function(e){
						skipReposition = true;
						if(e.touches){
							active = isGesture = true; // touchmove implies touchstart
						}else if(active && (e.clientX != startX || e.clientY != startY)){
							isGesture = true;
						}
					}
				);
				this.clickHandler = this.connect(dropDown.domNode, "onclick",
					function(){
						skipReposition = true;
						active = isGesture = false; // click implies no gesture movement
					}
				);
				this.endHandler = this.connect(win.doc.documentElement, touch.release,
					function(){
						this.defer(function(){ // allow onclick to go first
							skipReposition = true;
							if(!isGesture && active){ // if click without move, then close dropdown
								this.closeDropDown();
							}
							active = false;
						});
					}
				);
				this.repositionTimer = setInterval(lang.hitch(this, function(){
					if(skipReposition){ // don't reposition if busy
						skipReposition = false;
						return;
					}
					var	currentAroundNodePos = domGeometry.position(aroundNode, false),
						currentPopupPos = domGeometry.position(wrapper, false),
						currentDeltaX = currentPopupPos.x - currentAroundNodePos.x,
						currentDeltaY = currentPopupPos.y - currentAroundNodePos.y;
					// if the popup is no longer placed correctly, relocate it
					if(Math.abs(currentDeltaX - deltaX) >= 1 || Math.abs(currentDeltaY - deltaY) >= 1){ // Firefox plays with partial pixels
						domStyle.set(wrapper, { left: parseInt(domStyle.get(wrapper, "left")) + deltaX - currentDeltaX + 'px', top: parseInt(domStyle.get(wrapper, "top")) + deltaY - currentDeltaY + 'px' });
					}
				}), 50); // yield a short time to allow for consolidation for better CPU throughput
			}

			// We need to disable input control in order to prevent opening the soft keyboard in IE
			if(has("windows-theme")){
				this.domNode.setAttribute("disabled", true);
			}

			return retVal;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.domNode, "onclick", "_onClick");
			domAttr.set(this.domNode, "role", "combobox");
			domAttr.set(this.domNode, "aria-expanded", "false");
		},

		destroy: function(){
			if(this.repositionTimer){
				clearInterval(this.repositionTimer);
			}
			this.inherited(arguments);
		},

		_onClick: function(/*Event*/ e){
			// tags:
			//		private
			
			// throttle clicks to prevent double click from doing double actions
			if(!this._throttleHandler){
				if(this.opened){
					this.closeDropDown();
				}else{
					this._startSearchAll();
				}
			}
		}
	});
});

},
'dijit/form/_AutoCompleterMixin':function(){
define([
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.get
	"dojo/keys",
	"dojo/_base/lang", // lang.clone lang.hitch
	"dojo/query", // query
	"dojo/regexp", // regexp.escapeString
	"dojo/sniff", // has("ie")
	"./DataList",
	"./_TextBoxMixin", // defines _TextBoxMixin.selectInputText
	"./_SearchMixin"
], function(aspect, declare, domAttr, keys, lang, query, regexp, has, DataList, _TextBoxMixin, SearchMixin){

	// module:
	//		dijit/form/_AutoCompleterMixin

	var AutoCompleterMixin = declare("dijit.form._AutoCompleterMixin", SearchMixin, {
		// summary:
		//		A mixin that implements the base functionality for `dijit/form/ComboBox`/`dijit/form/FilteringSelect`
		// description:
		//		All widgets that mix in dijit/form/_AutoCompleterMixin must extend `dijit/form/_FormValueWidget`.
		// tags:
		//		protected

		// item: Object
		//		This is the item returned by the dojo/store/api/Store implementation that
		//		provides the data for this ComboBox, it's the currently selected item.
		item: null,

		// autoComplete: Boolean
		//		If user types in a partial string, and then tab out of the `<input>` box,
		//		automatically copy the first entry displayed in the drop down list to
		//		the `<input>` field
		autoComplete: true,

		// highlightMatch: String
		//		One of: "first", "all" or "none".
		//
		//		If the ComboBox/FilteringSelect opens with the search results and the searched
		//		string can be found, it will be highlighted.  If set to "all"
		//		then will probably want to change `queryExpr` parameter to '*${0}*'
		//
		//		Highlighting is only performed when `labelType` is "text", so as to not
		//		interfere with any HTML markup an HTML label might contain.
		highlightMatch: "first",

		// labelAttr: String?
		//		The entries in the drop down list come from this attribute in the
		//		dojo.data items.
		//		If not specified, the searchAttr attribute is used instead.
		labelAttr: "",

		// labelType: String
		//		Specifies how to interpret the labelAttr in the data store items.
		//		Can be "html" or "text".
		labelType: "text",

		// Flags to _HasDropDown to limit height of drop down to make it fit in viewport
		maxHeight: -1,

		// For backwards compatibility let onClick events propagate, even clicks on the down arrow button
		_stopClickEvents: false,

		_getCaretPos: function(/*DomNode*/ element){
			// khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
			var pos = 0;
			if(typeof(element.selectionStart) == "number"){
				// FIXME: this is totally borked on Moz < 1.3. Any recourse?
				pos = element.selectionStart;
			}else if(has("ie")){
				// in the case of a mouse click in a popup being handled,
				// then the document.selection is not the textarea, but the popup
				// var r = document.selection.createRange();
				// hack to get IE 6 to play nice. What a POS browser.
				var tr = element.ownerDocument.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character", 0);
				ntr.move("character", 0);
				try{
					// If control doesn't have focus, you get an exception.
					// Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
					// There appears to be no workaround for this - googled for quite a while.
					ntr.setEndPoint("EndToEnd", tr);
					pos = String(ntr.text).replace(/\r/g, "").length;
				}catch(e){
					// If focus has shifted, 0 is fine for caret pos.
				}
			}
			return pos;
		},

		_setCaretPos: function(/*DomNode*/ element, /*Number*/ location){
			location = parseInt(location);
			_TextBoxMixin.selectInputText(element, location, location);
		},

		_setDisabledAttr: function(/*Boolean*/ value){
			// Additional code to set disabled state of ComboBox node.
			// Overrides _FormValueWidget._setDisabledAttr() or ValidationTextBox._setDisabledAttr().
			this.inherited(arguments);
			this.domNode.setAttribute("aria-disabled", value ? "true" : "false");
		},

		_onKey: function(/*Event*/ evt){
			// summary:
			//		Handles keyboard events

			if(evt.charCode >= 32){
				return;
			} // alphanumeric reserved for searching

			var key = evt.charCode || evt.keyCode;

			// except for cutting/pasting case - ctrl + x/v
			if(key == keys.ALT || key == keys.CTRL || key == keys.META || key == keys.SHIFT){
				return; // throw out spurious events
			}

			var pw = this.dropDown;
			var highlighted = null;
			this._abortQuery();

			// _HasDropDown will do some of the work:
			//
			//	1. when drop down is not yet shown:
			//		- if user presses the down arrow key, call loadDropDown()
			//	2. when drop down is already displayed:
			//		- on ESC key, call closeDropDown()
			//		- otherwise, call dropDown.handleKey() to process the keystroke
			this.inherited(arguments);

			if(evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			} // don't process keys with modifiers  - but we want shift+TAB

			if(this._opened){
				highlighted = pw.getHighlightedOption();
			}
			switch(key){
				case keys.PAGE_DOWN:
				case keys.DOWN_ARROW:
				case keys.PAGE_UP:
				case keys.UP_ARROW:
					// Keystroke caused ComboBox_menu to move to a different item.
					// Copy new item to <input> box.
					if(this._opened){
						this._announceOption(highlighted);
					}
					evt.stopPropagation();
					evt.preventDefault();
					break;

				case keys.ENTER:
					// prevent submitting form if user presses enter. Also
					// prevent accepting the value if either Next or Previous
					// are selected
					if(highlighted){
						// only stop event on prev/next
						if(highlighted == pw.nextButton){
							this._nextSearch(1);
							// prevent submit
							evt.stopPropagation();
							evt.preventDefault();
							break;
						}else if(highlighted == pw.previousButton){
							this._nextSearch(-1);
							// prevent submit
							evt.stopPropagation();
							evt.preventDefault();
							break;
						}
						// prevent submit if ENTER was to choose an item
						evt.stopPropagation();
						evt.preventDefault();
					}else{
						// Update 'value' (ex: KY) according to currently displayed text
						this._setBlurValue(); // set value if needed
						this._setCaretPos(this.focusNode, this.focusNode.value.length); // move cursor to end and cancel highlighting
					}
				// fall through

				case keys.TAB:
					var newvalue = this.get('displayedValue');
					//	if the user had More Choices selected fall into the
					//	_onBlur handler
					if(pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])){
						break;
					}
					if(highlighted){
						this._selectOption(highlighted);
					}
				// fall through

				case keys.ESCAPE:
					if(this._opened){
						this._lastQuery = null; // in case results come back later
						this.closeDropDown();
					}
					break;
			}
		},

		_autoCompleteText: function(/*String*/ text){
			// summary:
			//		Fill in the textbox with the first item from the drop down
			//		list, and highlight the characters that were
			//		auto-completed. For example, if user typed "CA" and the
			//		drop down list appeared, the textbox would be changed to
			//		"California" and "ifornia" would be highlighted.

			var fn = this.focusNode;

			// IE7: clear selection so next highlight works all the time
			_TextBoxMixin.selectInputText(fn, fn.value.length);
			// does text autoComplete the value in the textbox?
			var caseFilter = this.ignoreCase ? 'toLowerCase' : 'substr';
			if(text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0){
				var cpos = this.autoComplete ? this._getCaretPos(fn) : fn.value.length;
				// only try to extend if we added the last character at the end of the input
				if((cpos + 1) > fn.value.length){
					// only add to input node as we would overwrite Capitalisation of chars
					// actually, that is ok
					fn.value = text;//.substr(cpos);
					// visually highlight the autocompleted characters
					_TextBoxMixin.selectInputText(fn, cpos);
				}
			}else{
				// text does not autoComplete; replace the whole value and highlight
				fn.value = text;
				_TextBoxMixin.selectInputText(fn);
			}
		},

		_openResultList: function(/*Object*/ results, /*Object*/ query, /*Object*/ options){
			// summary:
			//		Callback when a search completes.
			// description:
			//		1. generates drop-down list and calls _showResultList() to display it
			//		2. if this result list is from user pressing "more choices"/"previous choices"
			//			then tell screen reader to announce new option
			var wasSelected = this.dropDown.getHighlightedOption();
			this.dropDown.clearResultList();
			if(!results.length && options.start == 0){ // if no results and not just the previous choices button
				this.closeDropDown();
				return;
			}
			this._nextSearch = this.dropDown.onPage = lang.hitch(this, function(direction){
				results.nextPage(direction !== -1);
				this.focus();
			});

			// Fill in the textbox with the first item from the drop down list,
			// and highlight the characters that were auto-completed. For
			// example, if user typed "CA" and the drop down list appeared, the
			// textbox would be changed to "California" and "ifornia" would be
			// highlighted.

			this.dropDown.createOptions(
				results,
				options,
				lang.hitch(this, "_getMenuLabelFromItem")
			);

			// show our list (only if we have content, else nothing)
			this._showResultList();

			// #4091:
			//		tell the screen reader that the paging callback finished by
			//		shouting the next choice
			if("direction" in options){
				if(options.direction){
					this.dropDown.highlightFirstOption();
				}else if(!options.direction){
					this.dropDown.highlightLastOption();
				}
				if(wasSelected){
					this._announceOption(this.dropDown.getHighlightedOption());
				}
			}else if(this.autoComplete && !this._prev_key_backspace
				// when the user clicks the arrow button to show the full list,
				// startSearch looks for "*".
				// it does not make sense to autocomplete
				// if they are just previewing the options available.
				&& !/^[*]+$/.test(query[this.searchAttr].toString())){
				this._announceOption(this.dropDown.containerNode.firstChild.nextSibling); // 1st real item
			}
		},

		_showResultList: function(){
			// summary:
			//		Display the drop down if not already displayed, or if it is displayed, then
			//		reposition it if necessary (reposition may be necessary if drop down's height changed).
			this.closeDropDown(true);
			this.openDropDown();
			this.domNode.setAttribute("aria-expanded", "true");
		},

		loadDropDown: function(/*Function*/ /*===== callback =====*/){
			// Overrides _HasDropDown.loadDropDown().
			// This is called when user has pressed button icon or pressed the down arrow key
			// to open the drop down.
			this._startSearchAll();
		},

		isLoaded: function(){
			// signal to _HasDropDown that it needs to call loadDropDown() to load the
			// drop down asynchronously before displaying it
			return false;
		},

		closeDropDown: function(){
			// Overrides _HasDropDown.closeDropDown().  Closes the drop down (assuming that it's open).
			// This method is the callback when the user types ESC or clicking
			// the button icon while the drop down is open.  It's also called by other code.
			this._abortQuery();
			if(this._opened){
				this.inherited(arguments);
				this.domNode.setAttribute("aria-expanded", "false");
			}
		},

		_setBlurValue: function(){
			// if the user clicks away from the textbox OR tabs away, set the
			// value to the textbox value
			// #4617:
			//		if value is now more choices or previous choices, revert
			//		the value
			var newvalue = this.get('displayedValue');
			var pw = this.dropDown;
			if(pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])){
				this._setValueAttr(this._lastValueReported, true);
			}else if(typeof this.item == "undefined"){
				// Update 'value' (ex: KY) according to currently displayed text
				this.item = null;
				this.set('displayedValue', newvalue);
			}else{
				if(this.value != this._lastValueReported){
					this._handleOnChange(this.value, true);
				}
				this._refreshState();
			}
			// Remove aria-activedescendant since it may not be removed if they select with arrows then blur with mouse
			this.focusNode.removeAttribute("aria-activedescendant");
		},

		_setItemAttr: function(/*item*/ item, /*Boolean?*/ priorityChange, /*String?*/ displayedValue){
			// summary:
			//		Set the displayed valued in the input box, and the hidden value
			//		that gets submitted, based on a dojo.data store item.
			// description:
			//		Users shouldn't call this function; they should be calling
			//		set('item', value)
			// tags:
			//		private
			var value = '';
			if(item){
				if(!displayedValue){
					displayedValue = this.store._oldAPI ? // remove getValue() for 2.0 (old dojo.data API)
						this.store.getValue(item, this.searchAttr) : item[this.searchAttr];
				}
				value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
			}
			this.set('value', value, priorityChange, displayedValue, item);
		},

		_announceOption: function(/*Node*/ node){
			// summary:
			//		a11y code that puts the highlighted option in the textbox.
			//		This way screen readers will know what is happening in the
			//		menu.

			if(!node){
				return;
			}
			// pull the text value from the item attached to the DOM node
			var newValue;
			if(node == this.dropDown.nextButton ||
				node == this.dropDown.previousButton){
				newValue = node.innerHTML;
				this.item = undefined;
				this.value = '';
			}else{
				var item = this.dropDown.items[node.getAttribute("item")];
				newValue = (this.store._oldAPI ? // remove getValue() for 2.0 (old dojo.data API)
					this.store.getValue(item, this.searchAttr) : item[this.searchAttr]).toString();
				this.set('item', item, false, newValue);
			}
			// get the text that the user manually entered (cut off autocompleted text)
			this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
			// set up ARIA activedescendant
			this.focusNode.setAttribute("aria-activedescendant", domAttr.get(node, "id"));
			// autocomplete the rest of the option to announce change
			this._autoCompleteText(newValue);
		},

		_selectOption: function(/*DomNode*/ target){
			// summary:
			//		Menu callback function, called when an item in the menu is selected.
			this.closeDropDown();
			if(target){
				this._announceOption(target);
			}
			this._setCaretPos(this.focusNode, this.focusNode.value.length);
			this._handleOnChange(this.value, true);
			// Remove aria-activedescendant since the drop down is no loner visible
			// after closeDropDown() but _announceOption() adds it back in
			this.focusNode.removeAttribute("aria-activedescendant");
		},

		_startSearchAll: function(){
			this._startSearch('');
		},

		_startSearchFromInput: function(){
			this.item = undefined; // undefined means item needs to be set
			this.inherited(arguments);
		},

		_startSearch: function(/*String*/ key){
			// summary:
			//		Starts a search for elements matching key (key=="" means to return all items),
			//		and calls _openResultList() when the search completes, to display the results.
			if(!this.dropDown){
				var popupId = this.id + "_popup",
					dropDownConstructor = lang.isString(this.dropDownClass) ?
						lang.getObject(this.dropDownClass, false) : this.dropDownClass;
				this.dropDown = new dropDownConstructor({
					onChange: lang.hitch(this, this._selectOption),
					id: popupId,
					dir: this.dir,
					textDir: this.textDir
				});
			}
			this._lastInput = key; // Store exactly what was entered by the user.
			this.inherited(arguments);
		},

		_getValueField: function(){
			// summary:
			//		Helper for postMixInProperties() to set this.value based on data inlined into the markup.
			//		Returns the attribute name in the item (in dijit/form/_ComboBoxDataStore) to use as the value.
			return this.searchAttr;
		},

		//////////// INITIALIZATION METHODS ///////////////////////////////////////

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!this.store && this.srcNodeRef){
				var srcNodeRef = this.srcNodeRef;
				// if user didn't specify store, then assume there are option tags
				this.store = new DataList({}, srcNodeRef);

				// if there is no value set and there is an option list, set
				// the value to the first value to be consistent with native Select
				// Firefox and Safari set value
				// IE6 and Opera set selectedIndex, which is automatically set
				// by the selected attribute of an option tag
				// IE6 does not set value, Opera sets value = selectedIndex
				if(!("value" in this.params)){
					var item = (this.item = this.store.fetchSelectedItem());
					if(item){
						var valueField = this._getValueField();
						// remove getValue() for 2.0 (old dojo.data API)
						this.value = this.store._oldAPI ? this.store.getValue(item, valueField) : item[valueField];
					}
				}
			}
		},

		postCreate: function(){
			// summary:
			//		Subclasses must call this method from their postCreate() methods
			// tags:
			//		protected

			// find any associated label element and add to ComboBox node.
			var label = query('label[for="' + this.id + '"]');
			if(label.length){
				if(!label[0].id){
					label[0].id = this.id + "_label";
				}
				this.domNode.setAttribute("aria-labelledby", label[0].id);

			}
			this.inherited(arguments);
			aspect.after(this, "onSearch", lang.hitch(this, "_openResultList"), true);
		},

		_getMenuLabelFromItem: function(/*Item*/ item){
			var label = this.labelFunc(item, this.store),
				labelType = this.labelType;
			// If labelType is not "text" we don't want to screw any markup ot whatever.
			if(this.highlightMatch != "none" && this.labelType == "text" && this._lastInput){
				label = this.doHighlight(label, this._lastInput);
				labelType = "html";
			}
			return {html: labelType == "html", label: label};
		},

		doHighlight: function(/*String*/ label, /*String*/ find){
			// summary:
			//		Highlights the string entered by the user in the menu.  By default this
			//		highlights the first occurrence found. Override this method
			//		to implement your custom highlighting.
			// tags:
			//		protected

			var
			// Add (g)lobal modifier when this.highlightMatch == "all" and (i)gnorecase when this.ignoreCase == true
				modifiers = (this.ignoreCase ? "i" : "") + (this.highlightMatch == "all" ? "g" : ""),
				i = this.queryExpr.indexOf("${0}");
			find = regexp.escapeString(find); // escape regexp special chars
			//If < appears in label, and user presses t, we don't want to highlight the t in the escaped "&lt;"
			//first find out every occurrences of "find", wrap each occurrence in a pair of "\uFFFF" characters (which
			//should not appear in any string). then html escape the whole string, and replace '\uFFFF" with the
			//HTML highlight markup.
			return this._escapeHtml(label.replace(
				new RegExp((i == 0 ? "^" : "") + "(" + find + ")" + (i == (this.queryExpr.length - 4) ? "$" : ""), modifiers),
				'\uFFFF$1\uFFFF')).replace(
				/\uFFFF([^\uFFFF]+)\uFFFF/g, '<span class="dijitComboBoxHighlightMatch">$1</span>'
			); // returns String, (almost) valid HTML (entities encoded)
		},

		_escapeHtml: function(/*String*/ str){
			// TODO Should become dojo.html.entities(), when exists use instead
			// summary:
			//		Adds escape sequences for special characters in XML: `&<>"'`
			str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
				.replace(/>/gm, "&gt;").replace(/"/gm, "&quot;"); //balance"
			return str; // string
		},

		reset: function(){
			// Overrides the _FormWidget.reset().
			// Additionally reset the .item (to clean up).
			this.item = null;
			this.inherited(arguments);
		},

		labelFunc: function(item, store){
			// summary:
			//		Computes the label to display based on the dojo.data store item.
			// item: Object
			//		The item from the store
			// store: dojo/store/api/Store
			//		The store.
			// returns:
			//		The label that the ComboBox should display
			// tags:
			//		private

			// Use toString() because XMLStore returns an XMLItem whereas this
			// method is expected to return a String (#9354).
			// Remove getValue() for 2.0 (old dojo.data API)
			return (store._oldAPI ? store.getValue(item, this.labelAttr || this.searchAttr) :
				item[this.labelAttr || this.searchAttr]).toString(); // String
		},

		_setValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item){
			// summary:
			//		Hook so set('value', value) works.
			// description:
			//		Sets the value of the select.
			this._set("item", item || null); // value not looked up in store
			if(value == null /* or undefined */){
				value = '';
			} // null translates to blank
			this.inherited(arguments);
		}
	});

	if(has("dojo-bidi")){
		AutoCompleterMixin.extend({
			_setTextDirAttr: function(/*String*/ textDir){
				// summary:
				//		Setter for textDir, needed for the dropDown's textDir update.
				// description:
				//		Users shouldn't call this function; they should be calling
				//		set('textDir', value)
				// tags:
				//		private
				this.inherited(arguments);
				// update the drop down also (_ComboBoxMenuMixin)
				if(this.dropDown){
					this.dropDown._set("textDir", textDir);
				}
			}
		});
	}

	return AutoCompleterMixin;
});

},
'dojox/mobile/CarouselItem':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/CarouselItem"
], function(declare, domConstruct, domGeometry, domStyle, Contained, WidgetBase, has, BidiCarouselItem){

	// module:
	//		dojox/mobile/CarouselItem

	var CarouselItem = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiCarouselItem" : "dojox.mobile.CarouselItem", [WidgetBase, Contained], {
		// summary:
		//		An item of dojox/mobile/Carousel.
		// description:
		//		CarouselItem represents an item of dojox/mobile/Carousel. In
		//		typical use cases, users do not use this widget alone. Instead,
		//		it is used in conjunction with the Carousel widget.

		// alt: String
		//		An alt text for the carousel item image.
		alt: "",

		// src: String
		//		A path for an image to be displayed as a carousel item.
		src: "",

		// headerText: String
		//		A text that is displayed above the carousel item image.
		headerText: "",

		// footerText: String
		//		A text that is displayed below the carousel item image.
		footerText: "",

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblCarouselItem",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.tabIndex = "0";
			this.headerTextNode = domConstruct.create("div", { className: "mblCarouselItemHeaderText" }, this.domNode);
			this.imageNode = domConstruct.create("img", { className: "mblCarouselItemImage" }, this.domNode);
			this.footerTextNode = domConstruct.create("div", { className: "mblCarouselItemFooterText" }, this.domNode);
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			this.resize();
		},

		resize: function(size){
			var box = domGeometry.getMarginBox(this.domNode);
			if(box.h === 0){ return; }
			var h1 = domGeometry.getMarginBox(this.headerTextNode).h;
			var h2 = domGeometry.getMarginBox(this.footerTextNode).h;
			domGeometry.setMarginBox(this.imageNode, {h:box.h - h1 - h2});
		},

		select: function(){
			// summary:
			//		Highlights the item.
			var img = this.imageNode;
			domStyle.set(img, "opacity", 0.4);
			this.defer(function(){
				domStyle.set(img, "opacity", 1);
			}, 1000);
		},

		_setAltAttr: function(/*String*/alt){
			// tags:
			//		private
			this._set("alt", alt);
			this.imageNode.alt = alt;
		},

		_setSrcAttr: function(/*String*/src){
			// tags:
			//		private
			this._set("src", src);
			this.imageNode.src = src;
		},

		_setHeaderTextAttr: function(/*String*/text){
			this._set("headerText", text);
			this.headerTextNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setFooterTextAttr: function(/*String*/text){
			// tags:
			//		private
			this._set("footerText", text);
			this.footerTextNode.innerHTML = this._cv ? this._cv(text) : text;
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.CarouselItem", [CarouselItem, BidiCarouselItem]) : CarouselItem;
});

},
'dojox/mobile/_ExecScriptMixin':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-construct"
], function(kernel, declare, win, domConstruct){
	// module:
	//		dojox/mobile/_ExecScriptMixin

	return declare("dojox.mobile._ExecScriptMixin", null, {
		// summary:
		//		Mixin for providing script execution capability to content handlers.
		// description:
		//		This module defines the execScript method, which is called
		//		from an HTML content handler.

		execScript: function(/*String*/ html){
			// summary:
			//		Finds script tags and executes the script.
			// html: String
			//		The HTML input.
			// returns: String
			//		The given HTML text from which &lt;script&gt; blocks are removed.
			var s = html.replace(/\f/g, " ").replace(/<\/script>/g, "\f");
			s = s.replace(/<script [^>]*src=['"]([^'"]+)['"][^>]*>([^\f]*)\f/ig, function(ignore, path){
				domConstruct.create("script", {
					type: "text/javascript",
					src: path}, win.doc.getElementsByTagName("head")[0]);
				return "";
			});

			s = s.replace(/<script>([^\f]*)\f/ig, function(ignore, code){
				kernel.eval(code);
				return "";
			});

			return s;
		}
	});
});

},
'dojox/mobile/_PickerChooser':function(){
define([
	"dojo/_base/lang",
	"dojo/_base/window"
], function(lang, win){

	// module:
	//		dojox/mobile/_PickerChooser

	return{
		// summary:
		//		This widget chooses a picker class according to the current theme.
		//		Imports ValuePicker-based date/time picker when the current theme is "android".
		//		Imports SpinWheel-based date/time picker otherwise.

		load: function (id, parentRequire, loaded){
			// summary:
			//		Imports a picker class according to the current theme.
			var dm = win.global._no_dojo_dm || lang.getObject("dojox.mobile", true);
			parentRequire([(dm.currentTheme === "android" || dm.currentTheme === "holodark" ? "./ValuePicker" : "./SpinWheel") + id], loaded);
		}
	};
});

},
'dojox/mobile/RoundRectStoreList':function(){
define([
	"dojo/_base/declare",
	"./RoundRectList",
	"./_StoreListMixin"
], function(declare, RoundRectList, StoreListMixin){

	// module:
	//		dojox/mobile/RoundRectStoreList

	return declare("dojox.mobile.RoundRectStoreList", [RoundRectList, StoreListMixin], {
		// summary:
		//		A dojo/store-enabled version of RoundRectList.
		// description:
		//		RoundRectStoreList is a subclass of RoundRectList which
		//		can generate ListItems according to the given dojo/store store.
	});
});

},
'dojox/mobile/ListItem':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/registry",
	"dijit/_WidgetBase",
	"./iconUtils",
	"./_ItemBase",
	"./ProgressIndicator",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ListItem"
], function(array, declare, lang, domClass, domConstruct, domStyle, domAttr, registry, WidgetBase, iconUtils, ItemBase, ProgressIndicator, has,  BidiListItem){

	// module:
	//		dojox/mobile/ListItem

	var ListItem = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiListItem" : "dojox.mobile.ListItem", ItemBase, {
		// summary:
		//		An item of either RoundRectList or EdgeToEdgeList.
		// description:
		//		ListItem represents an item of either RoundRectList or
		//		EdgeToEdgeList. There are three ways to move to a different view:
		//		moveTo, href, and url. You can choose only one of them.
		//
		//		A child DOM node (or widget) can have the layout attribute,
		//		whose value is "left", "right", or "center". Such nodes will be
		//		aligned as specified.
		// example:
		// |	<li data-dojo-type="dojox.mobile.ListItem">
		// |		<div layout="left">Left Node</div>
		// |		<div layout="right">Right Node</div>
		// |		<div layout="center">Center Node</div>
		// |	</li>
		//
		//		Similarly, a child widget can have the preventTouch
		//		attribute, whose value is a boolean (or data-mobile-prevent-touch
		//		for children which are not widgets), such that touching such
		//		child doesn't trigger the item action.
		//
		//		Note that even if you specify variableHeight="true" for the list
		//		and place a tall object inside the layout node as in the example
		//		below, the layout node does not expand as you may expect,
		//		because layout node is aligned using float:left, float:right, or
		//		position:absolute.
		// example:
		// |	<li data-dojo-type="dojox.mobile.ListItem" variableHeight="true">
		// |		<div layout="left"><img src="large-picture.jpg"></div>
		// |	</li>

		// rightText: String
		//		A right-aligned text to display on the item.
		rightText: "",

		// rightIcon: String
		//		An icon to display at the right hand side of the item. The value
		//		can be either a path for an image file or a class name of a DOM
		//		button.
		rightIcon: "",

		// rightIcon2: String
		//		An icon to display at the left of the rightIcon. The value can
		//		be either a path for an image file or a class name of a DOM
		//		button.
		rightIcon2: "",

		// deleteIcon: String
		//		A delete icon to display at the left of the item. The value can
		//		be either a path for an image file or a class name of a DOM
		//		button.
		deleteIcon: "",

		// anchorLabel: Boolean
		//		If true, the label text becomes a clickable anchor text. When
		//		the user clicks on the text, the onAnchorLabelClicked handler is
		//		called. You can override or connect to the handler and implement
		//		any action. The handler has no default action.
		anchorLabel: false,

		// noArrow: Boolean
		//		If true, the right hand side arrow is not displayed.
		noArrow: false,

		// checked: Boolean
		//		If true, a check mark is displayed at the right of the item.
		checked: false,

		// arrowClass: String
		//		An icon to display as an arrow. The value can be either a path
		//		for an image file or a class name of a DOM button.
		arrowClass: "",

		// checkClass: String
		//		An icon to display as a check mark. The value can be either a
		//		path for an image file or a class name of a DOM button.
		checkClass: "",

		// uncheckClass: String
		//		An icon to display as an uncheck mark. The value can be either a
		//		path for an image file or a class name of a DOM button.
		uncheckClass: "",

		// variableHeight: Boolean
		//		If true, the height of the item varies according to its content.
		variableHeight: false,

		// rightIconTitle: String
		//		An alt text for the right icon.
		rightIconTitle: "",

		// rightIcon2Title: String
		//		An alt text for the right icon2.
		rightIcon2Title: "",

		// header: Boolean
		//		If true, this item is rendered as a category header.
		header: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "li",

		// busy: Boolean
		//		If true, a progress indicator spins.
		busy: false,

		// progStyle: String
		//		A css class name to add to the progress indicator.
		progStyle: "",

		// layoutOnResize: Boolean
		//		If true, a call to resize() will force computation of variable height items layout. You should not need this as in most
		//		cases ListItem height doesn't change on container resize. Depending on number and complexity
		//		of items in a view, setting to true may have a high impact on performance.
		layoutOnResize: false,

		/* internal properties */	
		// The following properties are overrides of those in _ItemBase.
		paramsToInherit: "variableHeight,transition,deleteIcon,icon,rightIcon,rightIcon2,uncheckIcon,arrowClass,checkClass,uncheckClass,deleteIconTitle,deleteIconRole",
		baseClass: "mblListItem",

		_selStartMethod: "touch",
		_selEndMethod: "timer",
		_delayedSelection: true,

		_selClass: "mblListItemSelected",

		buildRendering: function(){
			this._templated = !!this.templateString; // true if this widget is templated
			if(!this._templated){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			}
			this.inherited(arguments);

			if(this.selected){
				domClass.add(this.domNode, this._selClass);
			}
			if(this.header){
				domClass.replace(this.domNode, "mblEdgeToEdgeCategory", this.baseClass);
			}

			if(!this._templated){
				this.labelNode =
					domConstruct.create("div", {className:"mblListItemLabel"});
				var ref = this.srcNodeRef;
				if(ref && ref.childNodes.length === 1 && ref.firstChild.nodeType === 3){
					// if ref has only one text node, regard it as a label
					this.labelNode.appendChild(ref.firstChild);
				}
				this.domNode.appendChild(this.labelNode);
			}
			this._layoutChildren = [];
		},

		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent();
			var opts = this.getTransOpts();
			// When using a template, labelNode may be created via an attach point.
			// The attach points are not yet set when ListItem.buildRendering() 
			// executes, hence the need to use them in startup().
			if((!this._templated || this.labelNode) && this.anchorLabel){
				this.labelNode.style.display = "inline"; // to narrow the text region
				this.labelNode.style.cursor = "pointer";
				this.connect(this.labelNode, "onclick", "_onClick");
				this.onTouchStart = function(e){
					return (e.target !== this.labelNode);
				};
			}

			this.inherited(arguments);
			
			if(domClass.contains(this.domNode, "mblVariableHeight")){
				this.variableHeight = true;
			}
			if(this.variableHeight){
				domClass.add(this.domNode, "mblVariableHeight");
				this.defer("layoutVariableHeight");
			}

			if(!this._isOnLine){
				this._isOnLine = true;
				this.set({ 
					// retry applying the attributes for which the custom setter delays the actual 
					// work until _isOnLine is true
					icon: this._pending_icon !== undefined ? this._pending_icon : this.icon,
					deleteIcon: this._pending_deleteIcon !== undefined ? this._pending_deleteIcon : this.deleteIcon,
					rightIcon: this._pending_rightIcon !== undefined ? this._pending_rightIcon : this.rightIcon,
					rightIcon2: this._pending_rightIcon2 !== undefined ? this._pending_rightIcon2 : this.rightIcon2,
					uncheckIcon: this._pending_uncheckIcon !== undefined ? this._pending_uncheckIcon : this.uncheckIcon 
				});
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pending_icon;
				delete this._pending_deleteIcon;
				delete this._pending_rightIcon;
				delete this._pending_rightIcon2;
				delete this._pending_uncheckIcon;
			}
			if(parent && parent.select){
				// retry applying the attributes for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("checked", this._pendingChecked !== undefined ? this._pendingChecked : this.checked);
				domAttr.set(this.domNode, "role", "option");
				if(this._pendingChecked || this.checked){
					domAttr.set(this.domNode, "aria-selected", "true");
				}
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingChecked; 
			}
			this.setArrow();
			this.layoutChildren();
		},

		_updateHandles: function(){
			// tags:
			//		private
			var parent = this.getParent();
			var opts = this.getTransOpts();
			if(opts.moveTo || opts.href || opts.url || this.clickable || (parent && parent.select)){
				if(!this._keydownHandle){
					this._keydownHandle = this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers
				}
				this._handleClick = true;
			}else{
				if(this._keydownHandle){
					this.disconnect(this._keydownHandle);
					this._keydownHandle = null;
				}
				this._handleClick = false;
			}
			this.inherited(arguments);
		},

		layoutChildren: function(){
			var centerNode;
			array.forEach(this.domNode.childNodes, function(n){
				if(n.nodeType !== 1){ return; }
				var layout = n.getAttribute("layout") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
					n.getAttribute("data-mobile-layout") || 
					(registry.byNode(n) || {}).layout;
				if(layout){ 
					domClass.add(n, "mblListItemLayout" +
						layout.charAt(0).toUpperCase() + layout.substring(1));
					this._layoutChildren.push(n);
					if(layout === "center"){ centerNode = n; }
				}
			}, this);
			if(centerNode){
				this.domNode.insertBefore(centerNode, this.domNode.firstChild);
			}
		},

		resize: function(){
			if(this.layoutOnResize && this.variableHeight){
				this.layoutVariableHeight();
			}
			// labelNode may not exist only when using a template (if not created by an attach point)
			if(!this._templated || this.labelNode){
				// If labelNode is empty, shrink it so as not to prevent user clicks.
				this.labelNode.style.display = this.labelNode.firstChild ? "block" : "inline";
			}
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(e.target.getAttribute("preventTouch") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
				e.target.getAttribute("data-mobile-prevent-touch") ||
				(registry.getEnclosingWidget(e.target) || {}).preventTouch){
				return;
			}
			this.inherited(arguments);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(this.getParent().isEditing || e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			var n = this.labelNode;
			// labelNode may not exist only when using a template 
			if((this._templated || n) && this.anchorLabel && e.currentTarget === n){
				domClass.add(n, "mblListItemLabelSelected");
				this.defer(function(){
					domClass.remove(n, "mblListItemLabelSelected");
				}, this._duration);
				this.onAnchorLabelClicked(e);
				return;
			}
			var parent = this.getParent();
			if(parent.select){
				if(parent.select === "single"){
					if(!this.checked){
						this.set("checked", true);
					}
				}else if(parent.select === "multiple"){
					this.set("checked", !this.checked);
				}
			}
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		onAnchorLabelClicked: function(e){
			// summary:
			//		Stub function to connect to from your application.
		},

		layoutVariableHeight: function(){
			// summary:
			//		Lays out the current item with variable height.
			var h = this.domNode.offsetHeight;
			if(h === this.domNodeHeight){ return; }
			this.domNodeHeight = h;
			array.forEach(this._layoutChildren.concat([
				this.rightTextNode,
				this.rightIcon2Node,
				this.rightIconNode,
				this.uncheckIconNode,
				this.iconNode,
				this.deleteIconNode,
				this.knobIconNode
			]), function(n){
				if(n){
					var domNode = this.domNode;
					var f = function(){
						var t = Math.round((domNode.offsetHeight - n.offsetHeight) / 2) -
							domStyle.get(domNode, "paddingTop");
						n.style.marginTop = t + "px";
					};
					if(n.offsetHeight === 0 && n.tagName === "IMG"){
						n.onload = f;
					}else{
						f();
					}
				}
			}, this);
		},

		setArrow: function(){
			// summary:
			//		Sets the arrow icon if necessary.
			if(this.checked){ return; }
			var c = "";
			var parent = this.getParent();
			var opts = this.getTransOpts();
			if(opts.moveTo || opts.href || opts.url || this.clickable){
				if(!this.noArrow && !(parent && parent.selectOne)){
					c = this.arrowClass || "mblDomButtonArrow";
					domAttr.set(this.domNode, "role", "button");
				}
			}
			if(c){
				this._setRightIconAttr(c);
			}
		},

		_findRef: function(/*String*/type){
			// summary:
			//		Find an appropriate position to insert a new child node.
			// tags:
			//		private
			var i, node, list = ["deleteIcon", "icon", "rightIcon", "uncheckIcon", "rightIcon2", "rightText"];
			for(i = array.indexOf(list, type) + 1; i < list.length; i++){
				node = this[list[i] + "Node"];
				if(node){ return node; }
			}
			for(i = list.length - 1; i >= 0; i--){
				node = this[list[i] + "Node"];
				if(node){ return node.nextSibling; }
			}
			return this.domNode.firstChild;
		},
		
		_setIcon: function(/*String*/icon, /*String*/type){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this["_pending_" + type] = icon;
				return; 
			} // icon may be invalid because inheritParams is not called yet
			this._set(type, icon);
			this[type + "Node"] = iconUtils.setIcon(icon, this[type + "Pos"],
				this[type + "Node"], this[type + "Title"] || this.alt, this.domNode, this._findRef(type), "before");
			if(this[type + "Node"]){
				var cap = type.charAt(0).toUpperCase() + type.substring(1);
				domClass.add(this[type + "Node"], "mblListItem" + cap);
			}
			var role = this[type + "Role"];
			if(role){
				this[type + "Node"].setAttribute("role", role);
			}
		},

		_setDeleteIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "deleteIcon");
		},

		_setIconAttr: function(icon){
			// tags:
			//		private
			this._setIcon(icon, "icon");
		},

		_setRightTextAttr: function(/*String*/text){
			// tags:
			//		private
			if(!this._templated && !this.rightTextNode){
				// When using a template, let the template create the element.
				this.rightTextNode = domConstruct.create("div", {className:"mblListItemRightText"}, this.labelNode, "before");
			}
			this.rightText = text;
			this.rightTextNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setRightIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "rightIcon");
		},

		_setUncheckIconAttr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "uncheckIcon");
		},

		_setRightIcon2Attr: function(/*String*/icon){
			// tags:
			//		private
			this._setIcon(icon, "rightIcon2");
		},

		_setCheckedAttr: function(/*Boolean*/checked){
			// tags:
			//		private
			if(!this._isOnLine){
				// record the value to be able to reapply it (see the code in the startup method)
				this._pendingChecked = checked; 
				return; 
			} // icon may be invalid because inheritParams is not called yet
			var parent = this.getParent();
			if(parent && parent.select === "single" && checked){
				array.forEach(parent.getChildren(), function(child){
					child !== this && child.checked && child.set("checked", false) && domAttr.set(child.domNode, "aria-selected", "false");
				}, this);
			}
			this._setRightIconAttr(this.checkClass || "mblDomButtonCheck");
			this._setUncheckIconAttr(this.uncheckClass);

			domClass.toggle(this.domNode, "mblListItemChecked", checked);
			domClass.toggle(this.domNode, "mblListItemUnchecked", !checked);
			domClass.toggle(this.domNode, "mblListItemHasUncheck", !!this.uncheckIconNode);
			this.rightIconNode.style.position = (this.uncheckIconNode && !checked) ? "absolute" : "";

			if(parent && this.checked !== checked){
				parent.onCheckStateChanged(this, checked);
			}
			this._set("checked", checked);
			domAttr.set(this.domNode, "aria-selected", checked ? "true" : "false");
		},

		_setBusyAttr: function(/*Boolean*/busy){
			// tags:
			//		private
			var prog = this._prog;
			if(busy){
				if(!this._progNode){
					this._progNode = domConstruct.create("div", {className:"mblListItemIcon"});
					prog = this._prog = new ProgressIndicator({size:25, center:false, removeOnStop:false});
					domClass.add(prog.domNode, this.progStyle);
					this._progNode.appendChild(prog.domNode);
				}
				if(this.iconNode){
					this.domNode.replaceChild(this._progNode, this.iconNode);
				}else{
					domConstruct.place(this._progNode, this._findRef("icon"), "before");
				}
				prog.start();
			}else if(this._progNode){
				if(this.iconNode){
					this.domNode.replaceChild(this.iconNode, this._progNode);
				}else{
					this.domNode.removeChild(this._progNode);
				}
				prog.stop();
			}
			this._set("busy", busy);
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// tags:
			//		private
			this.inherited(arguments);
			domClass.toggle(this.domNode, this._selClass, selected);
		},
		
		_setClickableAttr: function(/*Boolean*/clickable){
			// tags:
			//		private
			this._set("clickable", clickable);
			this._updateHandles();
		},
		
		_setMoveToAttr: function(/*String*/moveTo){
			// tags:
			//		private
			this._set("moveTo", moveTo);
			this._updateHandles();
		},
		
		_setHrefAttr: function(/*String*/href){
			// tags:
			//		private
			this._set("href", href);
			this._updateHandles();
		},
		
		_setUrlAttr: function(/*String*/url){
			// tags:
			//		private
			this._set("url", url);
			this._updateHandles();
		}
	});
	
	ListItem.ChildWidgetProperties = {
		// summary:
		//		These properties can be specified for the children of a dojox/mobile/ListItem.

		// layout: String
		//		Specifies the position of the ListItem child ("left", "center" or "right").
		layout: "",

		// preventTouch: Boolean
		//		Disables touch events on the ListItem child.
		preventTouch: false
	};
	
	// Since any widget can be specified as a ListItem child, mix ChildWidgetProperties
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	lang.extend(WidgetBase, /*===== {} || =====*/ ListItem.ChildWidgetProperties);

	return has("dojo-bidi") ? declare("dojox.mobile.ListItem", [ListItem, BidiListItem]) : ListItem;	
});

},
'dojox/mobile/_StoreListMixin':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"./_StoreMixin",
	"./ListItem",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/_StoreListMixin"
], function(array, declare, StoreMixin, ListItem, has, BidiStoreListMixin){

	// module:
	//		dojox/mobile/_StoreListMixin

	var _StoreListMixin = declare(has("dojo-bidi") ? "dojox.mobile._NonBidiStoreListMixin" : "dojox.mobile._StoreListMixin", StoreMixin, {
		// summary:
		//		Mixin for widgets to generate the list items corresponding to
		//		the dojo/store data provider object.
		// description:
		//		Mixin for widgets to generate the list items corresponding to
		//		the dojo/store data provider object.
		//		By mixing this class into the widgets, the list item nodes are
		//		generated as the child nodes of the widget and automatically
		//		regenerated whenever the corresponding data items are modified.

		// append: Boolean
		//		If true, refresh() does not clear the existing items.
		append: false,

		// itemMap: Object
		//		An optional parameter mapping field names from the store to ItemList names.
		//		Example: itemMap:{text:'label', profile_image_url:'icon'}
		itemMap: null,

		// itemRenderer: ListItem class or subclass
		//		The class used to create list items. Default is dojox/mobile/ListItem.
		itemRenderer: ListItem,

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.store){ return; }
			var store = this.store;
			this.store = null;
			this.setStore(store, this.query, this.queryOptions);
		},

		createListItem: function(/*Object*/item){
			// summary:
			//		Creates a list item widget.
			return new this.itemRenderer(this._createItemProperties(item));
		},
		
		_createItemProperties: function(/*Object*/item){
			// summary:
			//		Creates list item properties.
			var props = {};
			if(!item["label"]){
				props["label"] = item[this.labelProperty];
			}
			// TODO this code should be like for textDir in the bidi mixin createListItem method
			// however for that dynamic set/get of the dir property must be supported first
			// that is why for now as a workaround we keep the code here
			if(has("dojo-bidi") && typeof props["dir"] == "undefined"){
				props["dir"] = this.isLeftToRight() ? "ltr" : "rtl";
			}
			for(var name in item){
				props[(this.itemMap && this.itemMap[name]) || name] = item[name];
			}
			return props;
		},
		
		_setDirAttr: function(props){
			// summary:
			//		Set the 'dir' attribute to support Mirroring.
			//		To be implemented by the bidi/_StoreLisMixin.js
			return props;
		},
		generateList: function(/*Array*/items){
			// summary:
			//		Given the data, generates a list of items.
			if(!this.append){
				array.forEach(this.getChildren(), function(child){
					child.destroyRecursive();
				});
			}
			array.forEach(items, function(item, index){
				this.addChild(this.createListItem(item));
				if(item[this.childrenProperty]){
					array.forEach(item[this.childrenProperty], function(child, index){
						this.addChild(this.createListItem(child));
					}, this);
				}
			}, this);
		},

		onComplete: function(/*Array*/items){
			// summary:
			//		A handler that is called after the fetch completes.
			this.generateList(items);
		},

		onError: function(/*Object*/ /*===== errorData =====*/){
			// summary:
			//		An error handler.
		},

		onAdd: function(/*Object*/item, /*Number*/insertedInto){
			// summary:
			//		Calls createListItem and adds the new list item when a new data item has been added to the store.
			this.addChild(this.createListItem(item), insertedInto);
		},

		onUpdate: function(/*Object*/item, /*Number*/insertedInto){
			// summary:
			//		Updates an existing list item when a data item has been modified.
			this.getChildren()[insertedInto].set(this._createItemProperties(item));
		},

		onDelete: function(/*Object*/item, /*Number*/removedFrom){
			// summary:
			//		Deletes an existing item.
			this.getChildren()[removedFrom].destroyRecursive();
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile._StoreListMixin", [_StoreListMixin, BidiStoreListMixin]) : _StoreListMixin;	
});

},
'dojox/mobile/_ContentPaneMixin':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/_base/xhr",
	"./_ExecScriptMixin",
	"./ProgressIndicator",
	"./lazyLoadUtils"
], function(declare, Deferred, lang, win, xhr, ExecScriptMixin, ProgressIndicator, lazyLoadUtils){

	// module:
	//		dojox/mobile/_ContentPaneMixin

	return declare("dojox.mobile._ContentPaneMixin", ExecScriptMixin, {
		// summary:
		//		Mixin for a very simple content pane to embed an HTML fragment.
		// description:
		//		By mixing this class into a widget, the widget can have the ability
		//		to embed an external HTML fragment and to run the parser.

		// href: String
		//		URL of the content to embed.
		href: "",

		// lazy: String
		//		If true, external content specified with the href property is
		//		not loaded at startup time. It can be loaded by calling load().
		lazy: false,

		// content: String
		//		An HTML fragment to embed.
		content: "",

		// parseOnLoad: Boolean
		//		If true, runs the parser when the load completes.
		parseOnLoad: true,

		// prog: Boolean
		//		If true, shows progress indicator while loading an HTML fragment
		//		specified by href.
		prog: true,

		// executeScripts: Boolean
		//		If true, executes scripts that is found in the content.
		executeScripts: true,

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			// tags:
			//		private
			if(this.prog){
				this._p = ProgressIndicator.getInstance();
			}
		},

		loadHandler: function(/*String*/response){
			// summary:
			//		A handler called when load completes.
			this.set("content", response);
		},

		errorHandler: function(err){
			// summary:
			//		An error handler called when load fails.
			if(this._p){ this._p.stop(); }
		},

		load: function(){
			// summary:
			//		Loads external content specified with href.
			this.lazy = false;
			this.set("href", this.href);
		},

		onLoad: function(){
			// summary:
			//		Stub method to allow the application to connect to the
			//		loading of external content (see load()).
			//		Called when parsing is done and the content is ready.
			return true;
		},

		_setHrefAttr: function(/*String*/href){
			// tags:
			//		private
			if(this.lazy || !href || href === this._loaded){
				this.lazy = false;
				return null;
			}
			var p = this._p;
			if(p){
				win.body().appendChild(p.domNode);
				p.start();
			}
			this._set("href", href);
			this._loaded = href;
			return xhr.get({
				url: href,
				handleAs: "text",
				load: lang.hitch(this, "loadHandler"),
				error: lang.hitch(this, "errorHandler")
			});
		},

		_setContentAttr: function(/*String|DomNode*/data){
			// tags:
			//		private			
			this.destroyDescendants();
			if(typeof data === "object"){
				this.containerNode.appendChild(data);
			}else{
				if(this.executeScripts){
					data = this.execScript(data);
				}
				this.containerNode.innerHTML = data;
			}
			if(this.parseOnLoad){
				var _this = this;
				return Deferred.when(lazyLoadUtils.instantiateLazyWidgets(_this.containerNode), function(){
					if(_this._p){ _this._p.stop(); }
					return _this.onLoad();
				});
			}
			if(this._p){ this._p.stop(); }
			return this.onLoad();
		}
	});
});

},
'dojox/mobile/dh/StringDataSource':function(){
define([
	"dojo/_base/declare"
], function(declare){

	// module:
	//		dojox/mobile/dh/StringDataSource

	return declare("dojox.mobile.dh.StringDataSource", null, {
		// summary:
		//		A component that simply returns the given text.

		text: "",

		constructor: function(/*String*/ text){
			// summary:
			//		Creates a new instance of the class.
			this.text = text;
		},

		getData: function(){
			// summary:
			//		Returns the given text.			
			return this.text;
		}
	});
});

},
'dojox/mobile/ExpandingTextArea':function(){
define([
	"dojo/_base/declare",
	"dijit/form/_ExpandingTextAreaMixin",
	"./TextArea"
], function(declare, ExpandingTextAreaMixin, TextArea){

	return declare("dojox.mobile.ExpandingTextArea", [TextArea, ExpandingTextAreaMixin], {
		// summary:
		//		Non-templated TEXTAREA widget with the capability to adjust its 
		//		height according to the amount of data.
		// description:
		//		A textarea that dynamically expands/contracts (changing its height) as
		//		the user types, to display all the text without requiring a vertical scroll bar.
		//
		//		Takes all the parameters (name, value, etc.) that a vanilla textarea takes.
		//		Rows are not supported since this widget adjusts its height.
		// example:
		//	|	<textarea dojoType="dojox.mobile.ExpandingTextArea">...</textarea>

		baseClass: "mblTextArea mblExpandingTextArea"
	});
});

},
'dojox/mobile/Video':function(){
define([
	"dojo/_base/declare",
	"dojo/sniff",
	"./Audio"
], function(declare, has, Audio){
	// module:
	//		dojox/mobile/Video

	return declare("dojox.mobile.Video", Audio, {
		// summary:
		//		A thin wrapper around the HTML5 `<video>` element.
		// description:
		//		dojox/mobile/Video is a widget which plays video. If all sources cannot 
		//		be played (typically, in desktop browsers that do not support `<video>`), 
		//		dojox/mobile/Video automatically replaces `<video>` with `<embed>`, such 
		//		that the browser tries to play it with a suitable plug-in.
		
		// width: [const] String
		//		The width of the embed element.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		width: "200px",

		// height: [const] String
		//		The height of the embed element.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		height: "150px",

		// _tag: [private] String
		//		The name of the tag ("video").
		_tag: "video",

		_getEmbedRegExp: function(){
			return has("ff") ? /video\/mp4/i :
				   has("ie") >= 9 ? /video\/webm/i :
				   //has("safari") ? /video\/webm/i : //Google is gooing to provide webm plugin for safari
				   null;
		}
	});
});

},
'dojox/mobile/_base':function(){
define([
	"./common",
	"./View",
	"./Heading",
	"./RoundRect",
	"./RoundRectCategory",
	"./EdgeToEdgeCategory",
	"./RoundRectList",
	"./EdgeToEdgeList",
	"./ListItem",
	"./Container",
	"./Pane",
	"./Switch",
	"./ToolBarButton",
	"./ProgressIndicator"
], function(common, View, Heading, RoundRect, RoundRectCategory, EdgeToEdgeCategory, RoundRectList, EdgeToEdgeList, ListItem, Switch, ToolBarButton, ProgressIndicator){
	// module:
	//		dojox/mobile/_base

	/*=====
	return {
		// summary:
		//		Includes the basic dojox/mobile modules: common, View, Heading, 
		//		RoundRect, RoundRectCategory, EdgeToEdgeCategory, RoundRectList,
		//		EdgeToEdgeList, ListItem, Container, Pane, Switch, ToolBarButton, 
		//		and ProgressIndicator.
	};
	=====*/
	return common;
});

},
'dojox/mobile/Button':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/touch",
	"dojo/on",
	"./common",
	"dijit/_WidgetBase",
	"dijit/form/_ButtonMixin",
	"dijit/form/_FormWidgetMixin",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Button"
	],
	function(array, declare, win, dom, domClass, domConstruct, touch, on, common, WidgetBase, ButtonMixin, FormWidgetMixin, has, BidiButton){

	var Button = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiButton" : "dojox.mobile.Button", [WidgetBase, FormWidgetMixin, ButtonMixin], {
		// summary:
		//		Non-templated BUTTON widget with a thin API wrapper for click 
		//		events and for setting the label.
		//
		//		Buttons can display a label, an icon, or both.
		//		A label should always be specified (through innerHTML) or the label
		//		attribute.  It can be hidden via showLabel=false.
		// example:
		//	|	<button data-dojo-type="dojox/mobile/Button" onClick="...">Hello world</button>

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblButton",

		// _setTypeAttr: [private] Function 
		//		Overrides the automatic assignment of type to nodes, because it causes
		//		exception on IE. Instead, the type must be specified as this.type
		//		when the node is created, as part of the original DOM.
		_setTypeAttr: null,

		/*=====
		// label: String
		//		The label of the button.
		label: "",
		=====*/
		

		isFocusable: function(){ 
			// Override of the method of dijit/_WidgetBase.
			return false; 
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = domConstruct.create("button", {"type": this.type});
			}else if(this._cv){
				var n = this.srcNodeRef.firstChild;
				if(n && n.nodeType === 3){
					n.nodeValue = this._cv(n.nodeValue);
				}
			}
			this.inherited(arguments);
			this.focusNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);

			// we need to ensure the synthetic click is emitted by 
			// touch.doClicks even if we moved (inside or outside) before we 
			// released in the button area.
			this.domNode.dojoClick = "useTarget";
			// handle touch.press event
			var _this = this;
			this.on(touch.press, function(e){
				e.preventDefault();

				if(_this.domNode.disabled){return;}
				_this._press(true);

				// change button state depending on where we are
				var isFirstMoveDone = false;
				_this._moveh = on(win.doc, touch.move, function(e){
					if(!isFirstMoveDone){
						// #17220: preventDefault may not have any effect.
						// causing minor impact on some android 
						// (Galaxy Tab 2 with stock browser 4.1.1) where button
						// display does not reflect the actual button state 
						// when user moves back and forth from the button area.
						e.preventDefault();
						isFirstMoveDone = true;
					}
					_this._press(dom.isDescendant(e.target, _this.domNode));
				});

				// handle touch.release 
				_this._endh = on(win.doc, touch.release, function(e){
					_this._press(false);
					_this._moveh.remove();
					_this._endh.remove();
				});
			});

			common.setSelectable(this.focusNode, false);
			this.connect(this.domNode, "onclick", "_onClick");
		},

		_press: function(pressed){
			// tags:
			//		private
			if(pressed != this._pressed){
				this._pressed = pressed;
				var button = this.focusNode || this.domNode;
				var newStateClasses = (this.baseClass + ' ' + this["class"]).split(" ");
				newStateClasses = array.map(newStateClasses, function(c){
					return c + "Selected";
				});
				domClass.toggle(button, newStateClasses, pressed);
			}
		},

		_setLabelAttr: function(/*String*/ content){
			// tags:
			//		private
			this.inherited(arguments, [this._cv ? this._cv(content) : content]);
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Button", [Button, BidiButton]) : Button;
});

},
'dojox/mobile/_ScrollableMixin':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/config",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",	// registry.byNode
	"./scrollable"
], function(dojo, config, declare, lang, win, dom, domClass, registry, Scrollable){
	// module:
	//		dojox/mobile/_ScrollableMixin

	var cls = declare("dojox.mobile._ScrollableMixin", Scrollable, {
		// summary:
		//		Mixin for widgets to have a touch scrolling capability.
	
		// fixedHeader: String
		//		Id of the fixed header.
		fixedHeader: "",

		// fixedFooter: String
		//		Id of the fixed footer.
		fixedFooter: "",

		_fixedAppFooter: "",

		// scrollableParams: Object
		//		Parameters for dojox/mobile/scrollable.init().
		scrollableParams: null,

		// allowNestedScrolls: Boolean
		//		Flag to allow scrolling in nested containers, e.g. to allow ScrollableView in a SwapView.
		allowNestedScrolls: true,

		// appBars: Boolean
		//		Enables the search for application-specific bars (header or footer).
		appBars: true, 

		constructor: function(){
			// summary:
			//		Creates a new instance of the class.
			// tags:
			//		private
			this.scrollableParams = {};
		},

		destroy: function(){
			this.cleanup();
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }
			if(this._fixedAppFooter){
				this._fixedAppFooter = dom.byId(this._fixedAppFooter);
			}
			this.findAppBars();
			var node, params = this.scrollableParams;
			if(this.fixedHeader){
				node = dom.byId(this.fixedHeader);
				if(node.parentNode == this.domNode){ // local footer
					this.isLocalHeader = true;
				}
				params.fixedHeaderHeight = node.offsetHeight;
			}
			if(this.fixedFooter){
				node = dom.byId(this.fixedFooter);
				if(node.parentNode == this.domNode){ // local footer
					this.isLocalFooter = true;
					node.style.bottom = "0px";
				}
				params.fixedFooterHeight = node.offsetHeight;
			}
			this.scrollType = this.scrollType || config.mblScrollableScrollType || 0;
			this.init(params);
			if(this.allowNestedScrolls){
				for(var p = this.getParent(); p; p = p.getParent()){
					if(p && p.scrollableParams){
						this.dirLock = true;
						p.dirLock = true;
						break;
					}
				}
			}
			// subscribe to afterResizeAll to scroll the focused input field into view
			// so as not to break layout on orientation changes while keyboard is shown (#14991)
			this._resizeHandle = this.subscribe("/dojox/mobile/afterResizeAll", function(){
				if(this.domNode.style.display === 'none'){ return; }
				var elem = win.doc.activeElement;
				if(this.isFormElement(elem) && dom.isDescendant(elem, this.containerNode)){
					this.scrollIntoView(elem);
				}
			});
			this.inherited(arguments);
		},

		findAppBars: function(){
			// summary:
			//		Search for application-specific header or footer.
			if(!this.appBars){ return; }
			var i, len, c;
			for(i = 0, len = win.body().childNodes.length; i < len; i++){
				c = win.body().childNodes[i];
				this.checkFixedBar(c, false);
			}
			if(this.domNode.parentNode){
				for(i = 0, len = this.domNode.parentNode.childNodes.length; i < len; i++){
					c = this.domNode.parentNode.childNodes[i];
					this.checkFixedBar(c, false);
				}
			}
			this.fixedFooterHeight = this.fixedFooter ? this.fixedFooter.offsetHeight : 0;
		},

		checkFixedBar: function(/*DomNode*/node, /*Boolean*/local){
			// summary:
			//		Checks if the given node is a fixed bar or not.
			if(node.nodeType === 1){
				var fixed = node.getAttribute("fixed") // TODO: Remove the non-HTML5-compliant attribute in 2.0
					|| node.getAttribute("data-mobile-fixed")
					|| (registry.byNode(node) && registry.byNode(node).fixed);
				if(fixed === "top"){
					domClass.add(node, "mblFixedHeaderBar");
					if(local){
						node.style.top = "0px";
						this.fixedHeader = node;
					}
					return fixed;
				}else if(fixed === "bottom"){
					domClass.add(node, "mblFixedBottomBar");
					if(local){
						this.fixedFooter = node;
					}else{
						this._fixedAppFooter = node;
					}
					return fixed;
				}
			}
			return null;
		}
	});
	return cls;
});

},
'dojox/mobile/Switch':function(){
define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/touch",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"./sniff",
	"./_maskUtils",
	"./common",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Switch"
], function(array, connect, declare, event, win, domClass, domConstruct, domStyle, domAttr, touch, Contained, WidgetBase, has, maskUtils, dm, BidiSwitch){

	// module:
	//		dojox/mobile/Switch

	var Switch = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiSwitch" : "dojox.mobile.Switch", [WidgetBase, Contained],{
		// summary:
		//		A toggle switch with a sliding knob.
		// description:
		//		Switch is a toggle switch with a sliding knob. You can either
		//		tap or slide the knob to toggle the switch. The onStateChanged
		//		handler is called when the switch is manipulated.

		// value: String
		//		The initial state of the switch: "on" or "off". The default
		//		value is "on".
		value: "on",

		// name: String
		//		A name for a hidden input field, which holds the current value.
		name: "",

		// leftLabel: String
		//		The left-side label of the switch.
		leftLabel: "ON",

		// rightLabel: String
		//		The right-side label of the switch.
		rightLabel: "OFF",

		// shape: String
		//		The shape of the switch.
		//		"mblSwDefaultShape", "mblSwSquareShape", "mblSwRoundShape1",
		//		"mblSwRoundShape2", "mblSwArcShape1" or "mblSwArcShape2".
		//		The default value is "mblSwDefaultShape".
		shape: "mblSwDefaultShape",

		// tabIndex: String
		//		Tabindex setting for this widget so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		_setTabIndexAttr: "", // sets tabIndex to domNode

		/* internal properties */
		baseClass: "mblSwitch",
		// role: [private] String
		//		The accessibility role.
		role: "", // a11y

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ?
					this.srcNodeRef : domConstruct.create("span");
			}
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			if(typeof this.domNode.style.msTouchAction != "undefined"){
				this.domNode.style.msTouchAction = "none";
			}
			this.inherited(arguments);
			if(!this.templateString){ // true if this widget is not templated
				var c = (this.srcNodeRef && this.srcNodeRef.className) || this.className || this["class"];
				if((c = c.match(/mblSw.*Shape\d*/))){ this.shape = c; }
				domClass.add(this.domNode, this.shape);
				var nameAttr = this.name ? " name=\"" + this.name + "\"" : "";
				this.domNode.innerHTML =
					  '<div class="mblSwitchInner">'
					+	'<div class="mblSwitchBg mblSwitchBgLeft">'
					+		'<div class="mblSwitchText mblSwitchTextLeft"></div>'
					+	'</div>'
					+	'<div class="mblSwitchBg mblSwitchBgRight">'
					+		'<div class="mblSwitchText mblSwitchTextRight"></div>'
					+	'</div>'
					+	'<div class="mblSwitchKnob"></div>'
					+	'<input type="hidden"'+nameAttr+'></div>'
					+ '</div>';
				var n = this.inner = this.domNode.firstChild;
				this.left = n.childNodes[0];
				this.right = n.childNodes[1];
				this.knob = n.childNodes[2];
				this.input = n.childNodes[3];
			}
			domAttr.set(this.domNode, "role", "checkbox"); //a11y
			domAttr.set(this.domNode, "aria-checked", (this.value === "on") ? "true" : "false"); //a11y

			this.switchNode = this.domNode;

			if(has("windows-theme")) {
				var rootNode = domConstruct.create("div", {className: "mblSwitchContainer"});
				this.labelNode = domConstruct.create("label", {"class": "mblSwitchLabel", "for": this.id}, rootNode);
				rootNode.appendChild(this.domNode.cloneNode(true));
				this.domNode = rootNode;
				this.focusNode = rootNode.childNodes[1];
				this.labelNode.innerHTML = (this.value=="off") ? this.rightLabel : this.leftLabel;
				this.switchNode = this.domNode.childNodes[1];
				var inner = this.inner = this.domNode.childNodes[1].firstChild;
				this.left = inner.childNodes[0];
				this.right = inner.childNodes[1];
				this.knob = inner.childNodes[2];
				this.input = inner.childNodes[3];
			}
		},

		postCreate: function(){
			this.connect(this.switchNode, "onclick", "_onClick");
			this.connect(this.switchNode, "onkeydown", "_onClick"); // for desktop browsers
			this._startHandle = this.connect(this.switchNode, touch.press, "onTouchStart");
			this._initialValue = this.value; // for reset()
		},

		startup: function(){
			if(!this._started){
				this.resize();
			}
		},

		resize: function(){
			if(has("windows-theme")){
				// Override the custom CSS width (if any) to avoid misplacement.
				// Per design, the windows theme does not allow resizing the controls.
				// The label of the switch is placed next to the switch, and a custom
				// width would only have the effect to increase the distance between the
				// label and the switch, which is undesired. Hence, on windows theme,
				// ensure the width of root DOM node is 100%.
				domStyle.set(this.domNode, "width", "100%");
			}else{
				var value = domStyle.get(this.domNode,"width");
				var outWidth = value + "px";
				var innWidth = (value - domStyle.get(this.knob,"width")) + "px";
				domStyle.set(this.left, "width", outWidth);
				domStyle.set(this.right,this.isLeftToRight()?{width: outWidth, left: innWidth}:{width: outWidth});
				domStyle.set(this.left.firstChild, "width", innWidth);
				domStyle.set(this.right.firstChild, "width", innWidth);
				domStyle.set(this.knob, "left", innWidth);
				if(this.value == "off"){
					domStyle.set(this.inner, "left", this.isLeftToRight()?("-" + innWidth):0);
				}
				this._hasMaskImage = false;
				this._createMaskImage();
			}
		},

		_changeState: function(/*String*/state, /*Boolean*/anim){
			var on = (state === "on");
			this.left.style.display = "";
			this.right.style.display = "";
			this.inner.style.left = "";
			if(anim){
				domClass.add(this.switchNode, "mblSwitchAnimation");
			}
			domClass.remove(this.switchNode, on ? "mblSwitchOff" : "mblSwitchOn");
			domClass.add(this.switchNode, on ? "mblSwitchOn" : "mblSwitchOff");
			domAttr.set(this.switchNode, "aria-checked", on ? "true" : "false"); //a11y

			if(!on && !has("windows-theme")){
				this.inner.style.left  = (this.isLeftToRight()?(-(domStyle.get(this.domNode,"width") - domStyle.get(this.knob,"width"))):0) + "px";
			}

			var _this = this;
			_this.defer(function(){
				_this.left.style.display = on ? "" : "none";
				_this.right.style.display = !on ? "" : "none";
				domClass.remove(_this.switchNode, "mblSwitchAnimation");
			}, anim ? 300 : 0);
		},

		_createMaskImage: function(){
			if(this._timer){
				 this._timer.remove();
				 delete this._timer;
			}
			if(this._hasMaskImage){ return; }
			var w = domStyle.get(this.domNode,"width"), h = domStyle.get(this.domNode,"height");
			this._width = (w - domStyle.get(this.knob,"width"));
			this._hasMaskImage = true;
			if(!(has("mask-image"))){ return; }
			var rDef = domStyle.get(this.left, "borderTopLeftRadius");
			if(rDef == "0px"){ return; }
			var rDefs = rDef.split(" ");
			var rx = parseFloat(rDefs[0]), ry = (rDefs.length == 1) ? rx : parseFloat(rDefs[1]);
			var id = (this.shape+"Mask"+w+h+rx+ry).replace(/\./,"_");

			maskUtils.createRoundMask(this.switchNode, 0, 0, 0, 0, w, h, rx, ry, 1);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			if(this._moved){ return; }
			this._set("value", this.input.value = (this.value == "on") ? "off" : "on");
			this._changeState(this.value, true);
			this.onStateChanged(this.value);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		onTouchStart: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchStart events.
			this._moved = false;
			this.innerStartX = this.inner.offsetLeft;
			if(!this._conn){
				this._conn = [
					this.connect(this.inner, touch.move, "onTouchMove"),
					this.connect(win.doc, touch.release, "onTouchEnd")
				];

				/* While moving the slider knob sometimes IE fires MSPointerCancel event. That prevents firing
				MSPointerUp event (http://msdn.microsoft.com/ru-ru/library/ie/hh846776%28v=vs.85%29.aspx) so the
				knob can be stuck in the middle of the switch. As a fix we handle MSPointerCancel event with the
				same lintener as for MSPointerUp event.
				*/
				if(has("windows-theme")){
					this._conn.push(this.connect(win.doc, "MSPointerCancel", "onTouchEnd"));
				}
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.left.style.display = "";
			this.right.style.display = "";
			event.stop(e);
			this._createMaskImage();
		},

		onTouchMove: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchMove events.
			e.preventDefault();
			var dx;
			if(e.targetTouches){
				if(e.targetTouches.length != 1){ return; }
				dx = e.targetTouches[0].clientX - this.touchStartX;
			}else{
				dx = e.clientX - this.touchStartX;
			}
			var pos = this.innerStartX + dx;
			var d = 10;
			if(pos <= -(this._width-d)){ pos = -this._width; }
			if(pos >= -d){ pos = 0; }
			this.inner.style.left = pos + "px";
			if(Math.abs(dx) > d){
				this._moved = true;
			}
		},

		onTouchEnd: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchEnd events.
			array.forEach(this._conn, connect.disconnect);
			this._conn = null;
			if(this.innerStartX == this.inner.offsetLeft){
				// need to send a synthetic click?
				if(has("touch") && has("clicks-prevented")){
					dm._sendClick(this.inner, e);
				}
				return;
			}
			var newState = (this.inner.offsetLeft < -(this._width/2)) ? "off" : "on";
			newState = this._newState(newState);
			this._changeState(newState, true);
			if(newState != this.value){
				this._set("value", this.input.value = newState);
				this.onStateChanged(newState);
			}
		},
		_newState: function(newState){
			return newState;
		},
		onStateChanged: function(/*String*/newState){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		Called when the state has been changed.
			if (this.labelNode) {
				this.labelNode.innerHTML = newState=='off' ? this.rightLabel : this.leftLabel;
			}
		},

		_setValueAttr: function(/*String*/value){
			this._changeState(value, false);
			if(this.value != value){
				this._set("value", this.input.value = value);
				this.onStateChanged(value);
			}
		},

		_setLeftLabelAttr: function(/*String*/label){
			this.leftLabel = label;
			this.left.firstChild.innerHTML = this._cv ? this._cv(label) : label;
		},

		_setRightLabelAttr: function(/*String*/label){
			this.rightLabel = label;
			this.right.firstChild.innerHTML = this._cv ? this._cv(label) : label;
		},

		reset: function(){
			// summary:
			//		Reset the widget's value to what it was at initialization time
			this.set("value", this._initialValue);
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.Switch", [Switch, BidiSwitch]) : Switch;
});

},
'dojox/mobile/nls/messages':function(){
define({ root:
//begin v1.x content
({
	// Title of the previous button in Carousel
	"CarouselPrevious": "Previous",
	// Title of the next button in Carousel
	"CarouselNext": "Next",
	// PageIndicatorLabel: accessibility label for PageIndicator
	// $0 replaced by the index of the current page
	// $1 replaced by the total number of pages
	"PageIndicatorLabel": "page $0 of $1"
})
//end v1.x content
,
"zh": true,
"zh-tw": true,
"uk": true,
"tr": true,
"th": true,
"sv": true,
"sl": true,
"sk": true,
"ru": true,
"ro": true,
"pt": true,
"pt-pt": true,
"pl": true,
"nl": true,
"nb": true,
"ko": true,
"kk": true,
"ja": true,
"it": true,
"id": true,
"hu": true,
"hr": true,
"he": true,
"fr": true,
"fi": true,
"es": true,
"el": true,
"de": true,
"da": true,
"cs": true,
"ca": true,
"bg": true,
"ar": true
});

},
'dojox/mobile/SpinWheelSlot':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/has", 
	"dojo/has!dojo-bidi?dojox/mobile/bidi/SpinWheelSlot",
	"dojo/touch",
	"dojo/on",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"./scrollable",
	"./common"
], function(dojo, array, declare, win, domClass, domConstruct, has, BidiSpinWheelSlot, 
	touch, on, Contained, WidgetBase, Scrollable){

	// module:
	//		dojox/mobile/SpinWheelSlot

	var SpinWheelSlot = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiSpinWheelSlot" : "dojox.mobile.SpinWheelSlot", [WidgetBase, Contained, Scrollable], {
		// summary:
		//		A slot of a SpinWheel.
		// description:
		//		SpinWheelSlot is a slot that is placed in the SpinWheel widget.

		// items: Array
		//		An array of array of key-label pairs
		//		(e.g. [[0, "Jan"], [1, "Feb"], ...]). If key values for each label
		//		are not necessary, labels can be used instead.
		items: [],

		// labels: Array
		//		An array of labels to be displayed on the slot
		//		(e.g. ["Jan", "Feb", ...]). This is a simplified version of the
		//		items property.
		labels: [],

		// labelFrom: Number
		//		The start value of display values of the slot. This parameter is
		//		especially useful when the slot has serial values.
		labelFrom: 0,

		// labelTo: Number
		//		The end value of display values of the slot.
		labelTo: 0,

		// zeroPad: Number
		//		Length of zero padding numbers.
		//		Ex. zeroPad=2 -> "00", "01", ...
		//		Ex. zeroPad=3 -> "000", "001", ...
		zeroPad: 0,

		// value: String
		//		The initial value of the slot.
		value: "",

		// step: Number
		//		The steps between labelFrom and labelTo.
		step: 1,

		// pageStep: Number
		//		The number of items in a page when using pageup/pagedown keys to navigate with the keyboard.
		pageSteps: 1,

		/* internal properties */	
		baseClass: "mblSpinWheelSlot",
		// maxSpeed: [private] Number
		//		Maximum speed.
		maxSpeed: 500,
		// minItems: [private] int
		//		Minimum number of items.
		minItems: 15,
		// centerPos: [private] Number
		//		Inherited from parent.
		centerPos: 0,
		// scrollbar: [private] Boolean
		//		False: no scrollbars must be shown.
		scrollBar: false,
		// constraint: [private] Boolean
		//		False: no scroll constraint.
		constraint: false,
		// propagatable: [private] Boolean
		//		False: stop touchstart event propagation.
		propagatable: false, // stop touchstart event propagation to make spin wheel work inside scrollable
		// androidWorkaroud: [private] Boolean
		//		False.
		androidWorkaroud: false, // disable workaround in SpinWheel TODO:remove this line later

		buildRendering: function(){
			this.inherited(arguments);

			this.initLabels();
			var i, j;
			if(this.labels.length > 0){
				this.items = [];
				for(i = 0; i < this.labels.length; i++){
					this.items.push([i, this.labels[i]]);
				}
			}

			this.containerNode = domConstruct.create("div", {className:"mblSpinWheelSlotContainer"});
			this.containerNode.style.height
				= (win.global.innerHeight||win.doc.documentElement.clientHeight) * 2 + "px"; // must bigger than the screen
			this.panelNodes = [];
			for(var k = 0; k < 3; k++){
				this.panelNodes[k] = domConstruct.create("div", {className:"mblSpinWheelSlotPanel"});
				this.panelNodes[k].setAttribute("aria-hidden", "true");
				var len = this.items.length;
				if(len > 0){ // if the slot is not empty
					var n = Math.ceil(this.minItems / len);
					for(j = 0; j < n; j++){
						for(i = 0; i < len; i++){
							domConstruct.create("div", {
								className: "mblSpinWheelSlotLabel",
								name: this.items[i][0],
								"data-mobile-val": this.items[i][1],
								innerHTML: this._cv ? this._cv(this.items[i][1]) : this.items[i][1]
							}, this.panelNodes[k]);
						}
					}
				}
				this.containerNode.appendChild(this.panelNodes[k]);
			}
			this.domNode.appendChild(this.containerNode);
			this.touchNode = domConstruct.create("div", {className:"mblSpinWheelSlotTouch"}, this.domNode);
			this.setSelectable(this.domNode, false);

			this.touchNode.setAttribute("tabindex", 0);
			this.touchNode.setAttribute("role", "slider");

			if(this.value === "" && this.items.length > 0){
				this.value = this.items[0][1];
			}
			this._initialValue = this.value;

			if(has("windows-theme")){
				var self = this,
					containerNode = this.containerNode,
					threshold = 5;

				this.own(on(self.touchNode, touch.press, function(e){
					var posY = e.pageY,
						slots = self.getParent().getChildren();

					for(var i = 0, ln = slots.length; i < ln; i++){
						var container = slots[i].containerNode;

						if(containerNode !== container){
							domClass.remove(container, "mblSelectedSlot");
							container.selected = false;
						}else{
							domClass.add(containerNode, "mblSelectedSlot");
						}
					}

					var moveHandler = on(self.touchNode, touch.move, function(e){
						if(Math.abs(e.pageY - posY) < threshold){
							return;
						}

						moveHandler.remove();
						releaseHandler.remove();
						containerNode.selected = true;

						var item = self.getCenterItem();

						if(item){
							domClass.remove(item, "mblSelectedSlotItem");
						}
					});

					var releaseHandler = on(self.touchNode, touch.release, function(){
						releaseHandler.remove();
						moveHandler.remove();
						containerNode.selected ?
							domClass.remove(containerNode, "mblSelectedSlot") :
							domClass.add(containerNode, "mblSelectedSlot");

						containerNode.selected = !containerNode.selected;
					});
				}));

				this.on("flickAnimationEnd", function(){
						var item = self.getCenterItem();

						if(self.previousCenterItem) {
							domClass.remove(self.previousCenterItem, "mblSelectedSlotItem");
						}

						domClass.add(item, "mblSelectedSlotItem");
						self.previousCenterItem = item;
				});
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			this.noResize = true;
			if(this.items.length > 0){ // if the slot is not empty
				this.init();
				this.centerPos = this.getParent().centerPos;
				var items = this.panelNodes[1].childNodes;
				this._itemHeight = items[0].offsetHeight;
				this.adjust();
				this.connect(this.touchNode, "onkeydown", "_onKeyDown"); // for desktop browsers
			}
			if(has("windows-theme")){
				this.previousCenterItem = this.getCenterItem();
				if(this.previousCenterItem){
					domClass.add(this.previousCenterItem, "mblSelectedSlotItem");
				}
			}
		},

		initLabels: function(){
			// summary:
			//		Initializes the slot labels according to the labelFrom/labelTo properties.
			// tags:
			//		private
			if(this.labelFrom !== this.labelTo){
				var a = this.labels = [],
					zeros = this.zeroPad && Array(this.zeroPad).join("0");
				for(var i = this.labelFrom; i <= this.labelTo; i += this.step){
					a.push(this.zeroPad ? (zeros + i).slice(-this.zeroPad) : i + "");
				}
			}
		},

		onTouchStart: function(e) {
			this.touchNode.focus(); // give focus to enable key navigation
			this.inherited(arguments);
		},

		adjust: function(){
			// summary:
			//		Adjusts the position of slot panels.
			var items = this.panelNodes[1].childNodes;
			var adjustY;
			for(var i = 0, len = items.length; i < len; i++){
				var item = items[i];
				if(item.offsetTop <= this.centerPos && this.centerPos < item.offsetTop + item.offsetHeight){
					adjustY = this.centerPos - (item.offsetTop + Math.round(item.offsetHeight/2));
					break;
				}
			}
			var h = this.panelNodes[0].offsetHeight;
			this.panelNodes[0].style.top = -h + adjustY + "px";
			this.panelNodes[1].style.top = adjustY + "px";
			this.panelNodes[2].style.top = h + adjustY + "px";
		},

		setInitialValue: function(){
			// summary:
			//		Sets the initial value using this.value or the first item.
			this.set("value", this._initialValue);
			this.touchNode.setAttribute("aria-valuetext", this._initialValue);
		},

		_onKeyDown: function(e){
			if(!e || e.type !== "keydown" || e.altKey || e.ctrlKey || e.shiftKey){
				return true;
			}
			switch(e.keyCode){
				case 38: // up arrow key (fallthrough)
				case 39: // right arrow key
					this.spin(1);
					e.stopPropagation();
					return false;
				case 40: // down arrow key (fallthrough)
				case 37: // left arrow key
					this.spin(-1);
					e.stopPropagation();
					return false;
				case 33: // pageup
					this.spin(this.pageSteps);
					e.stopPropagation();
					return false;
				case 34: // pagedown
					this.spin(-1 * this.pageSteps);
					e.stopPropagation();
					return false;
			}
			return true;
		},

		_getCenterPanel: function(){
			// summary:
			//		Gets a panel that contains the currently selected item.
			var pos = this.getPos();
			for(var i = 0, len = this.panelNodes.length; i < len; i++){
				var top = pos.y + this.panelNodes[i].offsetTop;
				if(top <= this.centerPos && this.centerPos < top + this.panelNodes[i].offsetHeight){
					return this.panelNodes[i];
				}
			}
			return null;
		},

		setColor: function(/*String*/value, /*String?*/color){
			// summary:
			//		Sets the color of the specified item as blue.
			array.forEach(this.panelNodes, function(panel){
				array.forEach(panel.childNodes, function(node, i){
					domClass.toggle(node, color || "mblSpinWheelSlotLabelBlue", node.innerHTML === value);
				}, this);
			}, this);
		},

		disableValues: function(/*Number*/n){
			// summary:
			//		Grays out the items with an index higher or equal to the specified number.
			array.forEach(this.panelNodes, function(panel){
				for(var i = 0; i < panel.childNodes.length; i++){
					domClass.toggle(panel.childNodes[i], "mblSpinWheelSlotLabelGray", i >= n);
				}
			});
		},

		getCenterItem: function(){
			// summary:
			//		Gets the currently selected item.
			var pos = this.getPos();
			var centerPanel = this._getCenterPanel();
			if(centerPanel){
				var top = pos.y + centerPanel.offsetTop;
				var items = centerPanel.childNodes;
				for(var i = 0, len = items.length; i < len; i++){
					if(top + items[i].offsetTop <= this.centerPos && this.centerPos < top + items[i].offsetTop + items[i].offsetHeight){
						return items[i];
					}
				}
			}
			return null;

		},

		_getKeyAttr: function(){
			// summary:
			//		Gets the key for the currently selected value.
			if(!this._started){
				if(this.items){
					var v = this.value;
					for(var i = 0; i < this.items.length; i++){
						if(this.items[i][1] == this.value){
							return this.items[i][0];
						}
					}
				}
				return null;
			}
			var item = this.getCenterItem();
			return (item && item.getAttribute("name"));
		},

		_getValueAttr: function(){
			// summary:
			//		Gets the currently selected value.
			if(!this._started){
				return this.value;
			}
			if(this.items.length > 0){ // if the slot is not empty
				var item = this.getCenterItem();
				return (item && item.getAttribute("data-mobile-val"));
			}else{
				return this._initialValue;
			}
		},

		_setValueAttr: function(value){
			// summary:
			//		Sets the value to this slot.
			if(this.items.length > 0){ // no-op for empty slots
				this._spinToValue(value, true);
			}
		},
		
		_spinToValue: function(value, applyValue){
			// summary:
			//		Spins the slot to the specified value.
			// tags:
			//		private
			var idx0, idx1;
			var curValue = this.get("value");
			if(!curValue){
				this._pendingValue = value;
				return;
			}
			if(curValue == value){
				return; // no change; avoid notification
			}
			this._pendingValue = undefined;
			// to avoid unnecessary notifications, applyValue is false when 
			// _spinToValue is called by _DatePickerMixin.
			if(applyValue){
				this._set("value", value);
			}
			var n = this.items.length;
			for(var i = 0; i < n; i++){
				if(this.items[i][1] === String(curValue)){
					idx0 = i;
				}
				if(this.items[i][1] === String(value)){
					idx1 = i;
				}
				if(idx0 !== undefined && idx1 !== undefined){
					break;
				}
			}
			var d = idx1 - (idx0 || 0);
			var m;
			if(d > 0){
				m = (d < n - d) ? -d : n - d;
			}else{
				m = (-d < n + d) ? -d : -(n + d);
			}
			this.spin(m);
		},
		
		onFlickAnimationStart: function(e){
			// summary:
			//		Overrides dojox/mobile/scrollable.onFlickAnimationStart().
			this._onFlickAnimationStartCalled = true;
			this.inherited(arguments);
		},

		onFlickAnimationEnd: function(e){
			// summary:
			//		Overrides dojox/mobile/scrollable.onFlickAnimationEnd().
			this._duringSlideTo = false;
			this._onFlickAnimationStartCalled = false;
			this.inherited(arguments);
			this.touchNode.setAttribute("aria-valuetext", this.get("value"));
		},
		
		spin: function(/*Number*/steps){
			// summary:
			//		Spins the slot as specified by steps.
			
			// do nothing before startup and during slide
			if(!this._started || this._duringSlideTo){
				return; 
			}
			var to = this.getPos();
			to.y += steps * this._itemHeight;
			this.slideTo(to, 1);
		},

		getSpeed: function(){
			// summary:
			//		Overrides dojox/mobile/scrollable.getSpeed().
			var y = 0, n = this._time.length;
			var delta = (new Date()).getTime() - this.startTime - this._time[n - 1];
			if(n >= 2 && delta < 200){
				var dy = this._posY[n - 1] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
				var dt = this._time[n - 1] - this._time[(n - 6) >= 0 ? n - 6 : 0];
				y = this.calcSpeed(dy, dt);
			}
			return {x:0, y:y};
		},

		calcSpeed: function(/*Number*/d, /*Number*/t){
			// summary:
			//		Overrides dojox/mobile/scrollable.calcSpeed().
			var speed = this.inherited(arguments);
			if(!speed){ return 0; }
			var v = Math.abs(speed);
			var ret = speed;
			if(v > this.maxSpeed){
				ret = this.maxSpeed*(speed/v);
			}
			return ret;
		},

		adjustDestination: function(to, pos, dim){
			// summary:
			//		Overrides dojox/mobile/scrollable.adjustDestination().
			var h = this._itemHeight;
			var j = to.y + Math.round(h/2);
			var r = j >= 0 ? j % h : j % h + h;
			to.y = j - r;
			return true;
		},

		resize: function(e){
			// Correct internal variables & adjust slot panels
			if(this.panelNodes && this.panelNodes.length > 0){
				var items = this.panelNodes[1].childNodes;
				// TODO investigate - the position is calculated incorrectly for
				// windows theme, disable this logic for now.
				if(items.length > 0 && !has("windows-theme")){ // empty slot?
					var parent = this.getParent();
					if(parent){ // #18012: null in same cases on IE8/9 
						this._itemHeight = items[0].offsetHeight;
						this.centerPos = parent.centerPos;
						if(!this.panelNodes[0].style.top){
							// (#17339) to avoid messing up the layout of the panels, call adjust()
							// only if it didn't manage yet to set the style.top (this happens
							// typically because the slot was initially	 hidden).
							this.adjust();
						}
					}
				}
			}
			if(this._pendingValue){
				this.set("value", this._pendingValue);
			}
		},

		slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing){
			// summary:
			//		Overrides dojox/mobile/scrollable.slideTo().
			this._duringSlideTo = true; 
			var pos = this.getPos();
			var top = pos.y + this.panelNodes[1].offsetTop;
			var bottom = top + this.panelNodes[1].offsetHeight;
			var vh = this.domNode.parentNode.offsetHeight;
			var t;
			if(pos.y < to.y){ // going down
				if(bottom > vh){
					// move up the bottom panel
					t = this.panelNodes[2];
					t.style.top = this.panelNodes[0].offsetTop - this.panelNodes[0].offsetHeight + "px";
					this.panelNodes[2] = this.panelNodes[1];
					this.panelNodes[1] = this.panelNodes[0];
					this.panelNodes[0] = t;
				}
			}else if(pos.y > to.y){ // going up
				if(top < 0){
					// move down the top panel
					t = this.panelNodes[0];
					t.style.top = this.panelNodes[2].offsetTop + this.panelNodes[2].offsetHeight + "px";
					this.panelNodes[0] = this.panelNodes[1];
					this.panelNodes[1] = this.panelNodes[2];
					this.panelNodes[2] = t;
				}
			}
			if(this.getParent()._duringStartup){
				duration = 0; // to reduce flickers at start-up especially on android
				// No scroll animation at startup. This avoids flickering especially on Android,
				// and avoids the issue in #17775.
			}else if(Math.abs(this._speed.y) < 40){
				duration = 0.2;
			}
			if(duration && duration > 0){
				this.inherited(arguments, [to, duration, easing]); // 2nd arg is to avoid excessive optimization by closure compiler
				if(!this._onFlickAnimationStartCalled){
					// if slideTo() didn't call itself (synchronously) onFlickAnimationEnd():
					this._duringSlideTo = false;
					// (otherwise, wait for onFlickAnimationEnd which deletes the flag)
				}
			}else{
				// #17775: at startup, no scroll animation, because it is not needed ergonomically,
				// and because the animation would imply an asynchrouns notification of 
				// onFlickAnimationEnd() which would forbid resetting the value right after startup.
				// this.onFlickAnimationStart(); // not called by scrollTo()
				this.onFlickAnimationStart(); // not called by scrollTo()
				this.scrollTo(to, true);
				this.onFlickAnimationEnd(); // not called by scrollTo()
			}
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.SpinWheelSlot", [SpinWheelSlot, BidiSpinWheelSlot]) : SpinWheelSlot;	
});

},
'dojox/mobile/dh/HtmlScriptContentHandler':function(){
define([
	"dojo/_base/declare",
	"./HtmlContentHandler",
	"../_ExecScriptMixin"
], function(declare, HtmlContentHandler, _ExecScriptMixin){

	// module:
	//		dojox/mobile/dh/HtmlScriptContentHandler

	return declare("dojox.mobile.dh.HtmlScriptContentHandler", [HtmlContentHandler, _ExecScriptMixin], {
		// summary:
		//		An HTML content handler that has script execution capability.
	});
});

},
'dojox/mobile/TabBar':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./TabBarButton",// to load TabBarButton for you (no direct references)
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/TabBar"	
], function(array, declare, win, domClass, domConstruct, domGeometry, domStyle, domAttr, Contained, Container, WidgetBase, TabBarButton, has, BidiTabBar){

	// module:
	//		dojox/mobile/TabBar

	var TabBar =  declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTabBar" : "dojox.mobile.TabBar", [WidgetBase, Container, Contained],{
		// summary:
		//		A bar widget that has buttons to control visibility of views.
		// description:
		//		TabBar is a container widget that has typically multiple
		//		TabBarButtons which controls visibility of views. It can be used
		//		as a tab container.

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",

		// barType: String
		//		"tabBar", "segmentedControl", "standardTab", "slimTab", "flatTab",
		//		or "tallTab"
		barType: "tabBar",

		// closable: Boolean
		//		If true, user can close (destroy) a child tab by clicking the X on the tab.
		//		This property is NOT effective for "tabBar" and "tallBar".
		closable: false,

		// center: Boolean
		//		If true, place the tabs in the center of the bar.
		//		This property is NOT effective for "tabBar".
		center: true,

		// syncWithViews: Boolean
		//		If true, this widget listens to view transition events to be
		//		synchronized with view's visibility.
		syncWithViews: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "ul",

		// fill: String
		//		Define if the TabBar should resize its children so that they evenly fill all the available space in the bar.
		//
		//		Allowed values:
		//
		//		1. "auto" is the default behavior from version 1.8: bar buttons are resized to evenly fill the entire bar only on small devices (width < 500px) and when barType is "tabBar"
		//		2. "always": bar buttons are always resized to evenly fill the entire bar
		//		3. "never": bar buttons are never resized to evenly fill the entire bar
		fill: "auto",

		/* internal properties */
		// selectOne: [private] Boolean
		//		Specifies that only one item can be selected.
		selectOne: true,
		baseClass: "mblTabBar",
		_fixedButtonWidth: 76,
		_fixedButtonMargin: 17,
		_largeScreenWidth: 500,

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			domAttr.set(this.domNode, "role", "tablist");
			this.reset();
			this.inherited(arguments);
		},

		postCreate: function(){
			if(this.syncWithViews){ // see also RoundRect#postCreate
				var f = function(view, moveTo, dir, transition, context, method){
					var child = array.filter(this.getChildren(), function(w){
						return w.moveTo === "#" + view.id || w.moveTo === view.id; })[0];
					if(child){ child.set("selected", true); }
				};
				this.subscribe("/dojox/mobile/afterTransitionIn", f);
				this.subscribe("/dojox/mobile/startView", f);
			}
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			this.resize();
		},

		reset: function(){
			// summary:
			//		Resets the widget to its initial state.
			var prev = this._barType;
			if(typeof this.barType === "object"){
				this._barType = this.barType["*"];
				for(var c in this.barType){
					if(domClass.contains(win.doc.documentElement, c)){
						this._barType = this.barType[c];
						break;
					}
				}
			}else{
				this._barType = this.barType;
			}
			var cap = function(s){
				return s.charAt(0).toUpperCase() + s.substring(1);
			};
			if(prev){
				domClass.remove(this.domNode, this.baseClass + cap(prev));
			}
			domClass.add(this.domNode, this.baseClass + cap(this._barType));
		},

		resize: function(size){
			var i, w;
			if(size && size.w){
				w = size.w;
			}else{
				w = domGeometry.getMarginBox(this.domNode).w;
			}
			var bw = this._fixedButtonWidth;
			var bm = this._fixedButtonMargin;
			var arr = array.map(this.getChildren(), function(w){ return w.domNode; });

			domClass.toggle(this.domNode, "mblTabBarNoIcons",
							!array.some(this.getChildren(), function(w){ return w.iconNode1; }));
			domClass.toggle(this.domNode, "mblTabBarNoText",
							!array.some(this.getChildren(), function(w){ return w.label; }));

			var margin = 0;
			if(this._barType == "tabBar"){
				this.containerNode.style.paddingLeft = "";
				margin = Math.floor((w - (bw + bm * 2) * arr.length) / 2);
				if(this.fill == "always" || (this.fill == "auto" && (w < this._largeScreenWidth || margin < 0))){
					domClass.add(this.domNode, "mblTabBarFill");
					for(i = 0; i < arr.length; i++){
						arr[i].style.width = (100/arr.length) + "%";
						arr[i].style.margin = "0";
					}
				}else{
					// Fixed width buttons. Mainly for larger screen such as iPad.
					for(i = 0; i < arr.length; i++){
						arr[i].style.width = bw + "px";
						arr[i].style.margin = "0 " + bm + "px";
					}
					if(arr.length > 0){
						if(has("dojo-bidi") && !this.isLeftToRight()){
							arr[0].style.marginLeft = "0px";
							arr[0].style.marginRight = margin + bm + "px";
						}else{
							arr[0].style.marginLeft = margin + bm + "px";
						}
					}
					this.containerNode.style.padding = "0px";
				}
			}else{
				for(i = 0; i < arr.length; i++){
					arr[i].style.width = arr[i].style.margin = "";
				}
				var parent = this.getParent();
				if(this.fill == "always"){
					domClass.add(this.domNode, "mblTabBarFill");
					for(i = 0; i < arr.length; i++){
						arr[i].style.width = (100/arr.length) + "%";
						if(this._barType != "segmentedControl" && this._barType != "standardTab") {
							arr[i].style.margin = "0";
						}
					}
				}else{
					if(this.center && (!parent || !domClass.contains(parent.domNode, "mblHeading"))){
						margin = w;
						for(i = 0; i < arr.length; i++){
							margin -= domGeometry.getMarginBox(arr[i]).w;
						}
						margin = Math.floor(margin/2);
					}
					if(has("dojo-bidi") && !this.isLeftToRight()){
						this.containerNode.style.paddingLeft = "0px";
						this.containerNode.style.paddingRight = margin ? margin + "px" : "";
					}else{
						this.containerNode.style.paddingLeft = margin ? margin + "px" : "";
					}
				}
			}
			if(size && size.w){
				domGeometry.setMarginBox(this.domNode, size);
			}
		},
		getSelectedTab: function(){
			// summary:
			//		Returns the first selected child.
			return array.filter(this.getChildren(), function(w){ return w.selected; })[0];
		},

		onCloseButtonClick: function(/*TabBarButton*/tab){
			// summary:
			//		Called whenever the close button [X] of a child tab is clicked.
			return true;
		}
	});
	
	return has("dojo-bidi")?declare("dojox.mobile.TabBar", [TabBar, BidiTabBar]):TabBar;	
});

},
'dojox/mobile/dh/DataHandler':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"./ContentTypeMap"
], function(declare, lang, Deferred, ContentTypeMap){

	// module:
	//		dojox/mobile/dh/DataHandler

	return declare("dojox.mobile.dh.DataHandler", null, {
		// summary:
		//		A component that provides an interface between data and handlers.
		// description:
		//		This module fetches data through DataSource and calls a
		//		ContentHandler to parse the content data and create a new view.

		// ds: Object
		//		A DataSource instance.
		ds: null,

		// target: DomNode
		//		A DOM node under which a new view is created.
		target: null,

		// refNode: DomNode
		//		An optional reference DOM node before which a new view is created.
		refNode: null,

		constructor: function(/*DataSource*/ ds, /*DomNode*/ target, /*DomNode?*/ refNode){
			// summary:
			//		Creates a new instance of the class.
			this.ds = ds;
			this.target = target;
			this.refNode = refNode;
		},

		processData: function(/*String*/ contentType, /*Function*/ callback){
			// summary:
			//		Fetches data through DataSource and passes it to a content
			//		handler.
			// contentType:
			//		The type of the content. (ex. "html")
			//		It is used to determine what content handler to use.
			// callback:
			//		A function to be called after creating a new view.
			var ch = ContentTypeMap.getHandlerClass(contentType);
			require([ch], lang.hitch(this, function(ContentHandler){
				Deferred.when(this.ds.getData(), lang.hitch(this, function(){
					Deferred.when(new ContentHandler().parse(this.ds.text, this.target, this.refNode), function(id){
						callback(id);
					});
				}))
			}));
		}
	});
});

},
'dojox/mobile/IconContainer':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dijit/_Contained",
	"dijit/_Container",
	"dijit/_WidgetBase",
	"./IconItem", // to load IconItem for you (no direct references)
	"./Heading",
	"./View"
], function(array, declare, lang, win, domConstruct, Contained, Container, WidgetBase, IconItem, Heading, View){

	// module:
	//		dojox/mobile/IconContainer

	return declare("dojox.mobile.IconContainer", [WidgetBase, Container, Contained],{
		// summary:
		//		A container widget which can hold multiple icons.
		// description:
		//		IconContainer is a container widget which can hold multiple
		//		icons. Each icon must be a subclass of dojox/mobile/IconItem
		//		and can be associated with a panel which opens when touching
		//		the icon.

		// defaultIcon: String
		//		The default fallback icon, which is displayed only when the
		//		specified icon has failed to load.
		defaultIcon: "",

		// transition: [const] String
		//		A type of animated transition effect. You can choose from the
		//		standard transition types: "slide", "fade", "flip", or from the
		//		extended transition types: "cover", "coverv", "dissolve",
		//		"reveal", "revealv", "scaleIn", "scaleOut", "slidev",
		//		"swirl", "zoomIn", "zoomOut", "cube", and "swap". If "none" is
		//		specified, the transition occurs immediately without animation. If
		//		"below" is specified, the application contents are displayed
		//		below the icons. The default value is "below". Note that changing 
		//		the value of the property after the widget creation has no effect.
		transition: "below",

		// pressedIconOpacity: Number
		//		The opacity of the pressed icon image. The default value is 0.4.
		pressedIconOpacity: 0.4,

		// iconBase: String
		//		The default icon path for child items.
		iconBase: "",

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",

		// back: String
		//		A label for the navigational control.
		back: "Home",

		// label: String
		//		A title text of the heading.
		label: "My Application",

		// single: Boolean
		//		If true, only one icon content can be opened at a time.
		single: false,

		// editable: [const] Boolean
		//		If true, the icons can be removed or reordered. You can enter
		//		into edit mode by pressing on a child IconItem until it starts shaking.
		//		The default value is false. Note that changing the value of the property after
		//		the widget creation has no effect.
		editable: false,

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "ul",

		/* internal properties */	
		baseClass: "mblIconContainer",
		editableMixinClass: "dojox/mobile/_EditableIconMixin",
		iconItemPaneContainerClass: "dojox/mobile/Container",
		iconItemPaneContainerProps: null,
		iconItemPaneClass: "dojox/mobile/_IconItemPane",
		iconItemPaneProps: null,

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			// _terminator is used to apply the clear:both style to terminate floating icons.
			this._terminator = domConstruct.create(this.tag === "ul" ? "li" : "div",
				{className:"mblIconItemTerminator"}, this.domNode);
			this.inherited(arguments);
		},

		postCreate: function(){
			if(this.editable && !this.startEdit){ // if editable is true but editableMixinClass is not inherited
				require([this.editableMixinClass], lang.hitch(this, function(module){
					declare.safeMixin(this, new module());
					this.set("editable", this.editable);
				}));
			}
		},

		startup: function(){
			if(this._started){ return; }

			require([this.iconItemPaneContainerClass], lang.hitch(this, function(module){
				this.paneContainerWidget = new module(this.iconItemPaneContainerProps);
				if(this.transition === "below"){
					domConstruct.place(this.paneContainerWidget.domNode, this.domNode, "after");
				}else{
					var view = this.appView = new View({id:this.id+"_mblApplView"});
					var _this = this;
					view.onAfterTransitionIn = function(moveTo, dir, transition, context, method){
						_this._opening._open_1();
					};
					view.domNode.style.visibility = "hidden";
					var heading = view._heading
						= new Heading({back: this._cv ? this._cv(this.back) : this.back,
										label: this._cv ? this._cv(this.label) : this.label,
										moveTo: this.domNode.parentNode.id,
										transition: this.transition == "zoomIn" ? "zoomOut" : this.transition});
					view.addChild(heading);
					view.addChild(this.paneContainerWidget);

					var target;
					for(var w = this.getParent(); w; w = w.getParent()){
						if(w instanceof View){
							target = w.domNode.parentNode;
							break;
						}
					}
					if(!target){ target = win.body(); }
					target.appendChild(view.domNode);

					view.startup();
				}
			}));

			this.inherited(arguments);
		},

		closeAll: function(){
			// summary:
			//		Closes all the icon items.
			array.forEach(this.getChildren(), function(w){
				w.close(true); // disables closing animation
			}, this);
		},

		addChild: function(widget, /*Number?*/insertIndex){
			this.inherited(arguments);
			// #16597: if removeChild(item) was called to remove the item, it also removes the paneWidget from its container,
			// But then calling addChild(item) again does not re-add it as it should: it was added the first time through startup
			// called by addChild, but startup is not called any more the subsequent times.
			// So we add the pane explicitly if it is orphan.
			if(this._started && widget.paneWidget && !widget.paneWidget.getParent()){
				this.paneContainerWidget.addChild(widget.paneWidget, insertIndex);
			}
			this.domNode.appendChild(this._terminator); // to ensure that _terminator is always the last node
		},

		removeChild: function(/*Widget|Number*/widget){
			var index = (typeof widget == "number") ? widget : widget.getIndexInParent();
			this.paneContainerWidget.removeChild(index);
			this.inherited(arguments);
		},	

		_setLabelAttr: function(/*String*/text){
			// tags:
			//		private
			if(!this.appView){ return; }
			this.label = text;
			var s = this._cv ? this._cv(text) : text;
			this.appView._heading.set("label", s);
		}
	});
});

},
'dojox/mobile/_EditableListMixin':function(){
// TODO: auto scroll?

define([
	"dojo/_base/array",
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/touch",
	"dojo/dom-attr",
	"dijit/registry",
	"./ListItem"
], function(array, connect, declare, event, win, domClass, domGeometry, domStyle, touch, domAttr, registry, ListItem){

	// module:
	//		dojox/mobile/EditableRoundRectList

	return declare("dojox.mobile._EditableListMixin", null, {
		// summary:
		//		A rounded rectangle list.
		// description:
		//		EditableRoundRectList is a rounded rectangle list, which can be used to
		//		display a group of items. Each item must be	a dojox/mobile/ListItem.

		rightIconForEdit: "mblDomButtonGrayKnob",
		deleteIconForEdit: "mblDomButtonRedCircleMinus",

		// isEditing: Boolean
		//		A read-only flag that indicates whether the widget is in the editing mode.
		isEditing: false,

		destroy: function(){
			// summary:
			//		Destroys the widget.
			if(this._blankItem){
				this._blankItem.destroy();
			}
			this.inherited(arguments);
		},

		_setupMoveItem: function(/*DomNode*/node){
			// tags:
			//		private
			domStyle.set(node, {
				width: domGeometry.getContentBox(node).w + "px",
				top: node.offsetTop + "px"
			});
			domClass.add(node, "mblListItemFloat");
		},

		_resetMoveItem: function(/*DomNode*/node){
			// tags:
			//		private
			this.defer(function(){ // iPhone needs setTimeout (via defer)
				domClass.remove(node, "mblListItemFloat");
				domStyle.set(node, {
					width: "",
					top: ""
				});
			});
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			var item = registry.getEnclosingWidget(e.target);
			for(var n = e.target; n !== item.domNode; n = n.parentNode){
				if(n === item.deleteIconNode){
					connect.publish("/dojox/mobile/deleteListItem", [item]);
					this.onDeleteItem(item); //callback
					break;
				}
			}
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		_onTouchStart: function(e){
			// tags:
			//		private
			if(this.getChildren().length <= 1){ return; }
			if(!this._blankItem){
				this._blankItem = new ListItem();
			}
			var item = this._movingItem = registry.getEnclosingWidget(e.target);
			this._startIndex = this.getIndexOfChild(item);
			var rightIconPressed = false;
			for(var n = e.target; n !== item.domNode; n = n.parentNode){
				if(n === item.rightIconNode){
					rightIconPressed = true;
					domAttr.set(item.rightIconNode, "aria-grabbed", "true");
					domAttr.set(this.domNode, "aria-dropeffect", "move");
					break;
				}
			}
			if(!rightIconPressed){ return; }
			var ref = item.getNextSibling();
			ref = ref ? ref.domNode : null;
			this.containerNode.insertBefore(this._blankItem.domNode, ref);
			this._setupMoveItem(item.domNode);
			this.containerNode.appendChild(item.domNode);

			if(!this._conn){
				this._conn = [
					this.connect(this.domNode, touch.move, "_onTouchMove"),
					this.connect(win.doc, touch.release, "_onTouchEnd")
				];
			}
			this._pos = [];
			array.forEach(this.getChildren(), function(c, index){
				this._pos.push(domGeometry.position(c.domNode, true).y);
			}, this);
			this.touchStartY = e.touches ? e.touches[0].pageY : e.pageY;
			this._startTop = domGeometry.getMarginBox(item.domNode).t;
			event.stop(e);
		},

		_onTouchMove: function(e){
			// tags:
			//		private
			var y = e.touches ? e.touches[0].pageY : e.pageY;
			var index = this._pos.length - 1;
			for(var i = 1; i < this._pos.length; i++){
				if(y < this._pos[i]){
					index = i - 1;
					break;
				}
			}
			var item = this.getChildren()[index];
			var blank = this._blankItem;
			if(item !== blank){
				var p = item.domNode.parentNode;
				if(item.getIndexInParent() < blank.getIndexInParent()){
					p.insertBefore(blank.domNode, item.domNode);
				}else{
					p.insertBefore(item.domNode, blank.domNode);
				}
			}
			this._movingItem.domNode.style.top = this._startTop + (y - this.touchStartY) + "px";
		},

		_onTouchEnd: function(e){
			// tags:
			//		private
			var startIndex = this._startIndex;
			var endIndex = this.getIndexOfChild(this._blankItem);
						
			var ref = this._blankItem.getNextSibling();
			ref = ref ? ref.domNode : null;
			if(ref === null){ 
				//If the item is droped at the end of the list the endIndex is wrong
				endIndex--; 
			} 
			this.containerNode.insertBefore(this._movingItem.domNode, ref);
			this.containerNode.removeChild(this._blankItem.domNode);
			this._resetMoveItem(this._movingItem.domNode);

			array.forEach(this._conn, connect.disconnect);
			this._conn = null;
			
			this.onMoveItem(this._movingItem, startIndex, endIndex); //callback
			
			domAttr.set(this._movingItem.rightIconNode, "aria-grabbed", "false");
			domAttr.remove(this.domNode, "aria-dropeffect");
		},

		startEdit: function(){
			// summary:
			//		Starts the editing.
			this.isEditing = true;
			domClass.add(this.domNode, "mblEditableRoundRectList");
			array.forEach(this.getChildren(), function(child){
				if(!child.deleteIconNode){
					child.set("rightIcon", this.rightIconForEdit);
					if(child.rightIconNode){
						domAttr.set(child.rightIconNode, "role", "button");
						domAttr.set(child.rightIconNode, "aria-grabbed", "false");
					}
					child.set("deleteIcon", this.deleteIconForEdit);
					child.deleteIconNode.tabIndex = child.tabIndex;
					if(child.deleteIconNode){
						domAttr.set(child.deleteIconNode, "role", "button");
					}
				}
				child.rightIconNode.style.display = "";
				child.deleteIconNode.style.display = "";
				if(typeof child.rightIconNode.style.msTouchAction != "undefined"){
					child.rightIconNode.style.msTouchAction = "none";
				}
			}, this);
			if(!this._handles){
				this._handles = [
					this.connect(this.domNode, touch.press, "_onTouchStart"),
					this.connect(this.domNode, "onclick", "_onClick"),
					this.connect(this.domNode, "onkeydown", "_onClick") // for desktop browsers
				];
			}
			
			this.onStartEdit(); // callback
		},

		endEdit: function(){
			// summary:
			//		Ends the editing.
			domClass.remove(this.domNode, "mblEditableRoundRectList");
			array.forEach(this.getChildren(), function(child){
				child.rightIconNode.style.display = "none";
				child.deleteIconNode.style.display = "none";
				if(typeof child.rightIconNode.style.msTouchAction != "undefined"){
					child.rightIconNode.style.msTouchAction = "auto";
				}
			});
			if(this._handles){
				array.forEach(this._handles, this.disconnect, this);
				this._handles = null;
			}
			this.isEditing = false;
			
			this.onEndEdit(); // callback
		},
		
		
		onDeleteItem: function(/*Widget*/item){
			// summary:
			//		Stub function to connect to from your application.
			// description:
			//		This function is called when a user clicks the delete
			//		button.
			//		You have to provide that function or subscribe to /dojox/mobile/deleteListItem, 
			//		otherwise the delete button will have no-effect.
			
		},
		
		onMoveItem: function(/*Widget*/item, /*int*/from, /*int*/to){
			// summary:
			//		Stub function to connect to from your application.
		},

		onStartEdit: function(){
			// summary:
			//		Stub function to connect to from your application.
		},

		onEndEdit: function(){
			// summary:
			//		Stub function to connect to from your application.
		}


	});
});

},
'dojox/mobile/EdgeToEdgeDataList':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"./EdgeToEdgeList",
	"./_DataListMixin"
], function(kernel, declare, EdgeToEdgeList, DataListMixin){

	// module:
	//		dojox/mobile/EdgeToEdgeDataList

	kernel.deprecated("dojox/mobile/EdgeToEdgeDataList", 
		"Use dojox/mobile/EdgeToEdgeStoreList instead", "2.0");
	
	return declare("dojox.mobile.EdgeToEdgeDataList", [EdgeToEdgeList, DataListMixin],{
		// summary:
		//		A dojo/data-enabled version of EdgeToEdgeList.
		// description:
		//		EdgeToEdgeDataList is a subclass of EdgeToEdgeList which
		//		can generate ListItems according to the given dojo/data store.
	});
});

},
'dojox/mobile/Pane':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dijit/_Contained",
	"dijit/_WidgetBase"
], function(array, declare, Contained, WidgetBase){

	// module:
	//		dojox/mobile/Pane

	return declare("dojox.mobile.Pane", [WidgetBase, Contained], {
		// summary:
		//		A simple pane widget.
		// description:
		//		Pane is a simple general-purpose pane widget.
		//		It is a widget, but can be regarded as a simple `<div>` element.

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblPane",

		buildRendering: function(){
			this.inherited(arguments);
			if(!this.containerNode){
				// set containerNode so that getChildren() works
				this.containerNode = this.domNode;
			}
		},

		resize: function(){
			// summary:
			//		Calls resize() of each child widget.
			array.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		}
	});
});

},
'dojox/mobile/SimpleDialog':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/touch",
	"dijit/registry",
	"./Pane",
	"./iconUtils",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/SimpleDialog"
], function(declare, win, domClass, domAttr, domConstruct, on, touch, registry, Pane, iconUtils, has, BidiSimpleDialog){
	// module:
	//		dojox/mobile/SimpleDialog

	var SimpleDialog = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiSimpleDialog" : "dojox.mobile.SimpleDialog", Pane, {
		// summary:
		//		A dialog box for mobile.
		// description:
		//		SimpleDialog is a dialog box for mobile.
		//		When a SimpleDialog is created, it is initially hidden 
		//		(display="none"). To show the dialog box, you need to
		//		get a reference to the widget and to call its show() method.
		//
		//		The contents can be arbitrary HTML, text, or widgets. Note,
		//		however, that the widget is initially hidden. You need to be
		//		careful when you place in a SimpleDialog elements that cannot 
		//		be initialized in hidden state.
		//
		//		This widget has much less functionalities than dijit/Dialog, 
		//		but it has the advantage of a much smaller code size.

		// top: String
		//		The top edge position of the widget. If "auto", the widget is
		//		placed at the middle of the screen. Otherwise, the value
		//		(ex. "20px") is used as the top style of widget's domNode.
		top: "auto",

		// left: String
		//		The left edge position of the widget. If "auto", the widget is
		//		placed at the center of the screen. Otherwise, the value
		//		(ex. "20px") is used as the left style of widget's domNode.
		left: "auto",

		// modal: Boolean
		//		If true, a translucent cover is added over the entire page to
		//		prevent the user from interacting with elements on the page.
		modal: true,

		// closeButton: [const] Boolean
		//		If true, a button to close the dialog box is displayed at the
		//		top-right corner.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		closeButton: false,

		// closeButtonClass: String
		//		A class name of a DOM button to be used as a close button.
		closeButtonClass: "mblDomButtonSilverCircleRedCross",

		// tabIndex: String
		//		Tabindex setting for the item so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		
		// _setTabIndexAttr: [private] String
		//		Sets tabIndex to domNode.
		_setTabIndexAttr: "",

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblSimpleDialog",
		
		// _cover: [private] Array
		//		Array for sharing the cover instances.
		_cover: [],

		buildRendering: function(){
			this.containerNode = domConstruct.create("div", {className:"mblSimpleDialogContainer"});
			if(this.srcNodeRef){
				// reparent
				for(var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++){
					this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
				}
			}
			this.inherited(arguments);
			domAttr.set(this.domNode, "role", "dialog");
			
			if(this.containerNode.getElementsByClassName){ //TODO: Do we need to support IE8 a11y?
	            var titleNode = this.containerNode.getElementsByClassName("mblSimpleDialogTitle")[0];
	            if (titleNode){
	            	titleNode.id = titleNode.id || registry.getUniqueId("dojo_mobile_mblSimpleDialogTitle");
	            	domAttr.set(this.domNode, "aria-labelledby", titleNode.id);
	            }
	            var textNode = this.containerNode.getElementsByClassName("mblSimpleDialogText")[0];
	            if (textNode){
	                textNode.id = textNode.id || registry.getUniqueId("dojo_mobile_mblSimpleDialogText");
	                domAttr.set(this.domNode, "aria-describedby", textNode.id);
	            }
			}
			domClass.add(this.domNode, "mblSimpleDialogDecoration");
			this.domNode.style.display = "none";
			this.domNode.appendChild(this.containerNode);
			if(this.closeButton){
				this.closeButtonNode = domConstruct.create("div", {
					className: "mblSimpleDialogCloseBtn "+this.closeButtonClass
				}, this.domNode);
				iconUtils.createDomButton(this.closeButtonNode);
				this.connect(this.closeButtonNode, "onclick", "_onCloseButtonClick");
			}
			this.connect(this.domNode, "onkeydown", "_onKeyDown"); // for desktop browsers
		},

		startup: function(){
			if(this._started){ return; }
			this.inherited(arguments);
			win.body().appendChild(this.domNode);
		},

		addCover: function(){
			// summary:
			//		Adds the transparent DIV cover.
			if(!this._cover[0]){
				this._cover[0] = domConstruct.create("div", {
					className: "mblSimpleDialogCover"
				}, win.body());
			}else{
				this._cover[0].style.display = "";
			}

			if(has("windows-theme")) {
				// Hack to prevent interaction with elements placed under cover div.
				this.own(on(this._cover[0], touch.press, function() {}));
			}
		},

		removeCover: function(){
			// summary:
			//		Removes the transparent DIV cover.
			this._cover[0].style.display = "none";
		},

		_onCloseButtonClick: function(e){
			// tags:
			//		private
			if(this.onCloseButtonClick(e) === false){ return; } // user's click action
			this.hide();
		},

		onCloseButtonClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		_onKeyDown: function(e){
			// tags:
			//		private
			if(e.keyCode == 27){ // ESC
				this.hide();
			}
		},

		refresh: function(){ // TODO: should we call refresh on resize?
			// summary:
			//		Refreshes the layout of the dialog.
			var n = this.domNode;
			var h;
			if(this.closeButton){
				var b = this.closeButtonNode;
				var s = Math.round(b.offsetHeight / 2);
				b.style.top = -s + "px";
				b.style.left = n.offsetWidth - s + "px";
			}
			if(this.top === "auto"){
				h = win.global.innerHeight || win.doc.documentElement.clientHeight;
				n.style.top = Math.round((h - n.offsetHeight) / 2) + "px";
			}else{
				n.style.top = this.top;
			}
			if(this.left === "auto"){
				h = win.global.innerWidth || win.doc.documentElement.clientWidth;
				n.style.left = Math.round((h - n.offsetWidth) / 2) + "px";
			}else{
				n.style.left = this.left;
			}
		},

		show: function(){
			// summary:
			//		Shows the dialog.
			if(this.domNode.style.display === ""){ return; }
			if(this.modal){
				this.addCover();
			}
			this.domNode.style.display = "";
			this.resize(); // #15628
			this.refresh();
			var diaglogButton;
			if(this.domNode.getElementsByClassName){
				diaglogButton = this.domNode.getElementsByClassName("mblSimpleDialogButton")[0];
			}
			var focusNode = diaglogButton || this.closeButtonNode || this.domNode; // Focus preference is: user supplied button, close button, entire dialog
			/// on Safari iOS the focus is not taken without a timeout
			this.defer(function(){ focusNode.focus();}, 1000);
		},

		hide: function(){
			// summary:
			//		Hides the dialog.
			if(this.domNode.style.display === "none"){ return; }
			this.domNode.style.display = "none";
			if(this.modal){
				this.removeCover();
			}
		}
	});
	return has("dojo-bidi") ? declare("dojox.mobile.SimpleDialog", [SimpleDialog, BidiSimpleDialog]) : SimpleDialog;
});

},
'dojox/mobile/RoundRect':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"./Container"
], function(declare, domClass, Container){

	// module:
	//		dojox/mobile/RoundRect

	return declare("dojox.mobile.RoundRect", Container, {
		// summary:
		//		A simple round rectangle container.
		// description:
		//		RoundRect is a simple round rectangle container for any HTML
		//		and/or widgets. You can achieve the same appearance by just
		//		applying the -webkit-border-radius style to a div tag. However,
		//		if you use RoundRect, you can get a round rectangle even on
		//		non-CSS3 browsers such as (older) IE.

		// shadow: [const] Boolean
		//		If true, adds a shadow effect to the container element by adding
		//		the CSS class "mblShadow" to widget's domNode. The default value
		//		is false. Note that changing the value of the property after
		//		the widget creation has no effect.
		shadow: false,

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRect",

		buildRendering: function(){
			this.inherited(arguments);
			if(this.shadow){
				domClass.add(this.domNode, "mblShadow");
			}
		}
	});
});

},
'dojox/mobile/TabBarButton':function(){
define([
	"dojo/_base/connect",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"./common",
	"./View",
	"./iconUtils",
	"./_ItemBase",
	"./Badge",
	"./sniff",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/TabBarButton"
], function(connect, declare, event, lang, dom, domClass, domConstruct, domStyle, domAttr, common, View, iconUtils, ItemBase, Badge, has, BidiTabBarButton){

	// module:
	//		dojox/mobile/TabBarButton

	var TabBarButton = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTabBarButton" : "dojox.mobile.TabBarButton", ItemBase,{
		// summary:
		//		A button widget that is placed in the TabBar widget.
		// description:
		//		TabBarButton is a button that is placed in the TabBar widget. It
		//		is a subclass of dojox/mobile/_ItemBase just like ListItem or
		//		IconItem. So, unlike Button, it has similar capability as
		//		ListItem or IconItem, such as icon support, transition, etc.

		// icon1: String
		//		A path for the unselected (typically dark) icon. If icon is not
		//		specified, the iconBase parameter of the parent widget is used.
		icon1: "",

		// icon2: String
		//		A path for the selected (typically highlight) icon. If icon is
		//		not specified, the iconBase parameter of the parent widget or
		//		icon1 is used.
		icon2: "",

		// iconPos1: String
		//		The position of an aggregated unselected (typically dark)
		//		icon. IconPos1 is a comma-separated list of values like
		//		top,left,width,height (ex. "0,0,29,29"). If iconPos1 is not
		//		specified, the iconPos parameter of the parent widget is used.
		iconPos1: "",

		// iconPos2: String
		//		The position of an aggregated selected (typically highlight)
		//		icon. IconPos2 is a comma-separated list of values like
		//		top,left,width,height (ex. "0,0,29,29"). If iconPos2 is not
		//		specified, the iconPos parameter of the parent widget or
		//		iconPos1 is used.
		iconPos2: "",

		// selected: Boolean
		//		If true, the button is in the selected state.
		selected: false,

		// transition: String
		//		A type of animated transition effect.
		transition: "none",

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "li",

		// badge: String
		//		A string to show on a badge. (ex. "12")
		badge: "",
		
		// badgeClass: [const] String
		//		A CSS class name of a badge DOM node.
		badgeClass: "mblDomButtonRedBadge",

		/* internal properties */	
		baseClass: "mblTabBarButton",
		// closeIcon: [private] String
		//		CSS class for the close icon.
		closeIcon: "mblDomButtonWhiteCross",

		_selStartMethod: "touch",
		_selEndMethod: "touch",
		
		// _moveTo: String
		//		id of destination view
		_moveTo: "",

		destroy: function(){
			if(this.badgeObj){
				delete this.badgeObj;
			}
			this.inherited(arguments);
		},

		inheritParams: function(){
			// summary:
			//		Overrides dojox/mobile/_ItemBase.inheritParams().
			if(this.icon && !this.icon1){ this.icon1 = this.icon; }
			var parent = this.getParent();
			if(parent){
				if(!this.transition){ this.transition = parent.transition; }
				if(this.icon1 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon1 = parent.iconBase + this.icon1;
				}
				if(!this.icon1){ this.icon1 = parent.iconBase; }
				if(!this.iconPos1){ this.iconPos1 = parent.iconPos; }
				if(this.icon2 && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon2 = parent.iconBase + this.icon2;
				}
				if(!this.icon2){ this.icon2 = parent.iconBase || this.icon1; }
				if(!this.iconPos2){ this.iconPos2 = parent.iconPos || this.iconPos1; }

				if(parent.closable){
					if(!this.icon1){
						this.icon1 = this.closeIcon;
					}
					if(!this.icon2){
						this.icon2 = this.closeIcon;
					}
					domClass.add(this.domNode, "mblTabBarButtonClosable");
				}
			}
		},

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			if(this.srcNodeRef){
				if(!this.label){
					this.label = lang.trim(this.srcNodeRef.innerHTML);
				}
				this.srcNodeRef.innerHTML = "";
			}

			this.labelNode = this.box = domConstruct.create("div", {className:"mblTabBarButtonLabel"}, this.domNode);
			
			domAttr.set(this.domNode, "role", "tab");
			domAttr.set(this.domNode, "aria-selected", "false");
			this._moveTo = this._getMoveToId();
			if(this._moveTo){
				var tabPanelNode = dom.byId(this._moveTo);
				if(tabPanelNode){
					domAttr.set(this.domNode, "aria-controls", this._moveTo);
					domAttr.set(tabPanelNode, "role", "tabpanel");
					domAttr.set(tabPanelNode, "aria-labelledby", this.id);
				}
			}
			
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }

			this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
			this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers
			var parent = this.getParent();
			if(parent && parent.closable){
				this._clickCloseHandler = this.connect(this.iconDivNode, "onclick", "_onCloseButtonClick");
				this._keydownCloseHandler = this.connect(this.iconDivNode, "onkeydown", "_onCloseButtonClick"); // for desktop browsers
				this.iconDivNode.tabIndex = "0";
			}

			this.inherited(arguments);
			if(!this._isOnLine){
				this._isOnLine = true;
				// retry applying the attribute for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set({
					icon: this._pendingIcon !== undefined ? this._pendingIcon : this.icon,
					icon1:this.icon1,
					icon2:this.icon2});
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingIcon; 
			}
			common.setSelectable(this.domNode, false);
		},

		onClose: function(e){
			// summary:
			//		Called when the parent is a dojox/mobile/TabBar whose closable property is true, and the user clicked the close button.
			connect.publish("/dojox/mobile/tabClose", [this]);
			return this.getParent().onCloseButtonClick(this);
		},

		_onCloseButtonClick: function(e){
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onCloseButtonClick(e) === false){ return; } // user's click action
			if(this.onClose()){
				this.destroy();
			}
		},

		onCloseButtonClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			//		when the parent is a dojox/mobile/TabBar whose closable property is true.
			// tags:
			//		callback
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		_setIcon: function(icon, n){
			if(!this.getParent()){ return; } // icon may be invalid because inheritParams is not called yet
			this._set("icon" + n, icon);
			if(!this.iconDivNode){
				this.iconDivNode = domConstruct.create("div", {className:"mblTabBarButtonIconArea"}, this.domNode, "first");
				// mblTabBarButtonDiv -> mblTabBarButtonIconArea
			}
			if(!this["iconParentNode" + n]){
				this["iconParentNode" + n] = domConstruct.create("div", {className:"mblTabBarButtonIconParent mblTabBarButtonIconParent" + n}, this.iconDivNode);
				// mblTabBarButtonIcon -> mblTabBarButtonIconParent
			}
			this["iconNode" + n] = iconUtils.setIcon(icon, this["iconPos" + n],
				this["iconNode" + n], this.alt, this["iconParentNode" + n]);
			this["icon" + n] = icon;
			domClass.toggle(this.domNode, "mblTabBarButtonHasIcon", icon && icon !== "none");
		},
		
		_getMoveToId: function(){
			// summary:
			//		Return the id of the destination view.
			//		If there is no id, return an empty string.
			if(this.moveTo){
				if(this.moveTo === "#"){ return ""; }
				var toId = "";
				if(typeof(this.moveTo) === "object" && this.moveTo.moveTo){
					toId = this.moveTo.moveTo;
				}else{
					toId = this.moveTo;
				}
				if(toId){
					toId = View.prototype.convertToId(toId);
				}
				return toId;
			}
		},

		_setIcon1Attr: function(icon){
			this._setIcon(icon, 1);
		},

		_setIcon2Attr: function(icon){
			this._setIcon(icon, 2);
		},

		_getBadgeAttr: function(){
			return this.badgeObj && this.badgeObj.domNode.parentNode &&
				this.badgeObj.domNode.parentNode.nodeType == 1 ? this.badgeObj.getValue() : null;
		},

		_setBadgeAttr: function(/*String*/value){
			if(!this.badgeObj){
				this.badgeObj = new Badge({
					fontSize: 11,
					className: this.badgeClass
				});
				domStyle.set(this.badgeObj.domNode, {
					position: "absolute",
					top: "0px",
					right: "0px"
				});
			}
			this.badgeObj.setValue(value);
			if(value){
				this.domNode.appendChild(this.badgeObj.domNode);
			}else{
				if(this.domNode === this.badgeObj.domNode.parentNode){
					this.domNode.removeChild(this.badgeObj.domNode);
				}
			}
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			this.inherited(arguments);
			domClass.toggle(this.domNode, "mblTabBarButtonSelected", selected);
			domAttr.set(this.domNode, "aria-selected", selected ? "true" : "false");
			if(this._moveTo){
				var tabPanelNode = dom.byId(this._moveTo);
				if(tabPanelNode){
					domAttr.set(tabPanelNode, "aria-hidden", selected ? "false" : "true");
				}
			}
		}
	});

	return has("dojo-bidi")?declare("dojox.mobile.TabBarButton", [TabBarButton, BidiTabBarButton]):TabBarButton;
});

},
'dojox/mobile/CheckBox':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dijit/form/_CheckBoxMixin",
	"./ToggleButton",
	"./sniff"
],
	function(declare, domConstruct, CheckBoxMixin, ToggleButton, has){

	return declare("dojox.mobile.CheckBox", [ToggleButton, CheckBoxMixin], {
		// summary:
		//		A non-templated checkbox widget that can be in two states 
		//		(checked or not checked).

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblCheckBox",

		// _setTypeAttr: [private] Function 
		//		Overrides the automatic assignement of type to nodes.
		_setTypeAttr: function(){}, // cannot be changed: IE complains w/o this

		buildRendering: function(){
			if(!this.templateString && !this.srcNodeRef){
				// The following doesn't work on IE < 8 if the default state is checked.
				// You have to use "<input checked>" instead but it's not worth the bytes here.
				this.srcNodeRef = domConstruct.create("input", {type: this.type});
			}
			this.inherited(arguments);
			if(!this.templateString){
				// if this widget is templated, let the template set the focusNode via an attach point
				this.focusNode = this.domNode;
			}

			if(has("windows-theme")){
				var rootNode = domConstruct.create("span", {className: "mblCheckableInputContainer"});
				rootNode.appendChild(this.domNode.cloneNode());
				this.labelNode = domConstruct.create("span", {className: "mblCheckableInputDecorator"}, rootNode);
				this.domNode = rootNode;
				this.focusNode = rootNode.firstChild;
			}
		},
		
		_getValueAttr: function(){
			// tags:
			//		private
			return (this.checked ? this.value : false);
		}
	});
});

},
'dojox/mobile/ValuePicker':function(){
define([
	"dojo/_base/declare",
	"./_PickerBase",
	"./ValuePickerSlot" // to load ValuePickerSlot for you (no direct references)
], function(declare, PickerBase){

	// module:
	//		dojox/mobile/ValuePicker

	return declare("dojox.mobile.ValuePicker", PickerBase, {
		// summary:
		//		A value picker that has a stepper.
		// description:
		//		ValuePicker is a widget for selecting values. The values
		//		can be selected by using the Plus or Minus buttons, or by
		//		entering the value directly into the input field.
		//		This type of value picker is typically seen on Android devices.

		/* internal properties */	
		baseClass: "mblValuePicker",

		onValueChanged: function(/*dojox/mobile/ValuePickerSlot*/slot){
			// summary:
			//		Callback when the slot value is changed.
			// slot:
			//		The slot widget whose value has been changed.
			// tags:
			//		callback
		}
	});
});

},
'dijit/form/DataList':function(){
define([
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.byId
	"dojo/_base/lang", // lang.trim
	"dojo/query", // query
	"dojo/store/Memory",
	"../registry"	// registry.add registry.remove
], function(declare, dom, lang, query, MemoryStore, registry){

	// module:
	//		dijit/form/DataList

	function toItem(/*DOMNode*/ option){
		// summary:
		//		Convert `<option>` node to hash
		return {
			id: option.value,
			value: option.value,
			name: lang.trim(option.innerText || option.textContent || '')
		};
	}

	return declare("dijit.form.DataList", MemoryStore, {
		// summary:
		//		Inefficient but small data store specialized for inlined data via OPTION tags
		//
		// description:
		//		Provides a store for inlined data like:
		//
		//	|	<datalist>
		//	|		<option value="AL">Alabama</option>
		//	|		...

		constructor: function(params, srcNodeRef){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String
			//		Attach widget to this DOM node.

			// store pointer to original DOM tree
			this.domNode = dom.byId(srcNodeRef);

			lang.mixin(this, params);
			if(this.id){
				registry.add(this); // add to registry so it can be easily found by id
			}
			this.domNode.style.display = "none";

			this.inherited(arguments, [{
				data: query("option", this.domNode).map(toItem)
			}]);
		},

		destroy: function(){
			registry.remove(this.id);
		},

		fetchSelectedItem: function(){
			// summary:
			//		Get the option marked as selected, like `<option selected>`.
			//		Not part of dojo.data API.
			var option = query("> option[selected]", this.domNode)[0] || query("> option", this.domNode)[0];
			return option && toItem(option);
		}
	});
});

},
'dojox/mobile/GridLayout':function(){
define([
	"dojo/_base/declare",
	"./IconMenu"
], function(declare, IconMenu){
	// module:
	//		dojox/mobile/GridLayout

	return declare("dojox.mobile.GridLayout", IconMenu, {
		// summary:
		//		A container widget that places its children in a grid layout.

		// cols: Number
		//		The number of child items in a row.
		cols: 0,

		/* internal properties */
		
		// childItemClass: String
		//		The name of the CSS class of grid items.
		childItemClass: "mblGridItem",
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblGridLayout",
		
		// _tags: [private] String
		_tags: "div",
		
		// _createTerminator: [private] Boolean
		_createTerminator: true
	});
});

},
'dojox/mobile/dh/PatternFileTypeMap':function(){
define([
	"dojo/_base/lang"
], function(lang){

	// module:
	//		dojox/mobile/dh/PatternFileTypeMap

	var o = {
		// summary:
		//		A component that provides a map for determining content-type from
		//		the pattern of the URL.
	};
	lang.setObject("dojox.mobile.dh.PatternFileTypeMap", o);

	o.map = {
		".*\.html": "html",
		".*\.json": "json"
	};

	o.add = function(/*String*/ key, /*String*/ contentType){
		// summary:
		//		Adds a handler class for the given content type.		
		this.map[key] = contentType;
	};

	o.getContentType = function(/*String*/ fileName){
		// summary:
		//		Returns the handler class for the given content type.		
		for(var key in this.map){
			if((new RegExp(key)).test(fileName)){
				return this.map[key];
			}
		}
		return null;
	};

	return o;
});

},
'dojox/mobile/RoundRectCategory':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dijit/_Contained",
	"dijit/_WidgetBase",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/RoundRectCategory"
], function(declare, win, domConstruct, Contained, WidgetBase, has, BidiRoundRectCategory){

	// module:
	//		dojox/mobile/RoundRectCategory

	var RoundRectCategory = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiRoundRectCategory" : "dojox.mobile.RoundRectCategory", [WidgetBase, Contained], {
		// summary:
		//		A category header for a rounded rectangle list.

		// label: String
		//		A label of the category. If the label is not specified,
		//		innerHTML is used as a label.
		label: "",

		// tag: String
		//		A name of html tag to create as domNode.
		tag: "h2",

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRoundRectCategory",

		buildRendering: function(){
			var domNode = this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
			this.inherited(arguments);
			if(!this.label && domNode.childNodes.length === 1 && domNode.firstChild.nodeType === 3){
				// if it has only one text node, regard it as a label
				this.label = domNode.firstChild.nodeValue;
			}
		},

		_setLabelAttr: function(/*String*/label){
			// summary:
			//		Sets the category header text.
			// tags:
			//		private
			this.label = label;
			this.domNode.innerHTML = this._cv ? this._cv(label) : label;
		}
	});

	return has("dojo-bidi") ? declare("dojox.mobile.RoundRectCategory", [RoundRectCategory, BidiRoundRectCategory]) : RoundRectCategory;	
});

},
'dojox/mobile/_DatePickerMixin':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/date",
	"dojo/date/locale",
	"dojo/date/stamp"
], function(array, declare, lang, ddate, datelocale, datestamp){

	// module:
	//		dojox/mobile/_DatePickerMixin

	var slotMixin = {
		format: function(/*Date*/d){
			return datelocale.format(d, {datePattern:this.pattern, selector:"date"});
		}
	};

	var yearSlotMixin = lang.mixin({
		initLabels: function(){
			this.labels = [];
			if(this.labelFrom !== this.labelTo){
				var d = new Date(this.labelFrom, 0, 1);
				var i, idx;
				for(i = this.labelFrom, idx = 0; i <= this.labelTo; i++, idx++){
					d.setFullYear(i);
					this.labels.push(this.format(d));
				}
			}
		}
	}, slotMixin);

	var monthSlotMixin = lang.mixin({
		initLabels: function(){
			this.labels = [];
			// On certain BlackBerry devices, we need to init to 16 not 1 to avoid some devices bugs (see #15677)
			var d = new Date(2000, 0, 16);
			for(var i = 0; i < 12; i++){
				d.setMonth(i);
				this.labels.push(this.format(d));
			}
		}
	}, slotMixin);

	var daySlotMixin = lang.mixin({
		initLabels: function(){
			this.labels = [];
			var d = new Date(2000, 0, 1);
			for(var i = 1; i <= 31; i++){
				d.setDate(i);
				this.labels.push(this.format(d));
			}
		}
	}, slotMixin);

	return declare("dojox.mobile._DatePickerMixin", null, {
		// summary:
		//		A mixin for date picker widget.

		// yearPattern: String
		//		A pattern to be used to format year.
		yearPattern: "yyyy",

		// monthPattern: String
		//		A pattern to be used to format month.
		monthPattern: "MMM",

		// dayPattern: String
		//		A pattern to be used to format day.
		dayPattern: "d",
		
		/*=====
		// value: String
		//		A string representing the date value.
		//		The setter of this property first converts the value argument by calling 
		//		the fromISOString method of the dojo/date/stamp module, then sets the 
		//		values of the picker according to the resulting	Date object. 
		//		If the string cannot be parsed by fromISOString, the method does nothing.
		//		Example: set("value", "2012-1-20"); // January 20, 2012
		//		The getter returns the string formatted as described in the dojo/date/stamp 
		//		module.
		value: "",
		=====*/
		
		initSlots: function(){
			// summary:
			//		Initializes the slots.
			var c = this.slotClasses, p = this.slotProps;
			c[0] = declare(c[0], yearSlotMixin);
			c[1] = declare(c[1], monthSlotMixin);
			c[2] = declare(c[2], daySlotMixin);
			p[0].pattern = this.yearPattern;
			p[1].pattern = this.monthPattern;
			p[2].pattern = this.dayPattern;
			this.reorderSlots();
		},

		reorderSlots: function(){
			// summary:
			//		Reorders the slots.			
			if(this.slotOrder.length){ return; }
			var a = datelocale._parseInfo().bundle["dateFormat-short"].toLowerCase().split(/[^ymd]+/, 3);
			this.slotOrder = array.map(a, function(pat){
				return {y:0, m:1, d:2}[pat.charAt(0)];
			});
		},

		reset: function(){
			// summary:
			//		Goes to today.
			var now = new Date();
			var v = array.map(this.slots, function(w){ return w.format(now); });
			this.set("colors", v);
			this._disableEndDaysOfMonth();
			if(this.value){
				this.set("value", this.value);
				this.value = null;
			}else if(this.values){
				this.set("values", this.values);
				this.values = null;
			}else{
				this.set("values", v);
			}
		},

		_onYearSet: function(){
			// summary:
			//		An internal handler called when the year value is changed.
			// tags:
			//		private
			var slot = this.slots[0];
			var newValue = slot.get("value");
			if(!(slot._previousValue && newValue == slot._previousValue)){ // do nothing if the value is unchanged
				this._disableEndDaysOfMonth();
				slot._previousValue = newValue;
				slot._set("value", newValue);
				this.onYearSet();
			}
		},
		
		onYearSet: function(){
			// summary:
			//		A handler called when the year value is changed.
		},

		_onMonthSet: function(){
			// summary:
			//		An internal handler called when the month value is changed.
			// tags:
			//		private
			var slot = this.slots[1];
			var newValue = slot.get("value");
			if(!(slot._previousValue && newValue == slot._previousValue)){ // do nothing if the value is unchanged
				this._disableEndDaysOfMonth();
				slot._previousValue = newValue;
				slot._set("value", newValue); // notify watches
				this.onMonthSet();
			}
		},

		onMonthSet: function(){
			// summary:
			//		A handler called when the month value is changed.
		},

		_onDaySet: function(){
			// summary:
			//		An internal handler called when the day value is changed.
			// tags:
			//		private
			var slot = this.slots[2];
			var newValue = slot.get("value");
			if(!(slot._previousValue && newValue == slot._previousValue)){ // do nothing if the value is unchanged
				if(!this._disableEndDaysOfMonth()){
					// If _disableEndDaysOfMonth has changed the day value,
					// skip notifications till next call of _onDaySet, to
					// avoid the extra notification for the (invalid)
					// intermediate value of the day.
					slot._previousValue = newValue;
					slot._set("value", newValue); // notify watches
					this.onDaySet();
				}
			}
		},

		onDaySet: function(){
			// summary:
			//		A handler called when the day value is changed.
		},

		_disableEndDaysOfMonth: function(){
			// summary:
			//		Disables the end days of the month to match the specified
			//		number of days of the month. Returns true if the day value is changed.
			// tags:
			//		private
			var pat = this.slots[0].pattern + "/" + this.slots[1].pattern,
				v = this.get("values"),
				date = datelocale.parse(v[0] + "/" + v[1], {datePattern:pat, selector:"date"}),
				daysInMonth = ddate.getDaysInMonth(date);
			var changedDay = false;
			if(daysInMonth < v[2]){
				// day value is invalid for this month, change it
				changedDay = true;
				this.slots[2]._spinToValue(daysInMonth, false/*applyValue*/);
			}
			this.disableValues(daysInMonth);
			return changedDay;
		},

		_getDateAttr: function(){
			// summary:
			//		Returns a Date object for the current values.
			// tags:
			//		private
			var v = this.get("values"), // [year, month, day]
				s = this.slots,
				pat = s[0].pattern + "/" + s[1].pattern + "/" + s[2].pattern;
				return datelocale.parse(v[0] + "/" + v[1] + "/" + v[2], {datePattern:pat, selector:"date"});
		},

		_setValuesAttr: function(/*Array*/values){
			// summary:
			//		Sets the current date as an array of values.
			// description:
			//		This method takes an array that consists of three values,
			//		year, month, and day. If the values are integer, they are
			//		formatted to locale-specific strings before setting them to
			//		the slots. Month starts from 1 to 12 (Ex. 1 - Jan, 2 - Feb, etc.)
			//		If the values are NOT integer, they are directly
			//		passed to the setter of the slots without formatting.
			//
			// example:
			//	|	set("values", [2012, 1, 20]); // January 20, 2012
			// tags:
			//		private
			array.forEach(this.getSlots(), function(w, i){
				var v = values[i];
				if(typeof v == "number"){
					var arr = [1970, 1, 1];
					arr.splice(i, 1, v - 0);
					v = w.format(new Date(arr[0], arr[1] - 1, arr[2]));
				}
				w.set("value", v);
			});
		},
		
		_setValueAttr: function(/*String*/value){
			// summary:
			//		Sets the current date as an String formatted according to a subset of the ISO-8601 standard.
			// description:
			//		This method first converts the value argument by calling the fromISOString method of
			//		the dojo/date/stamp module, then sets the values of the picker according to the resulting
			//		Date object. If the string cannot be parsed by fromISOString, the method does nothing.
			// value:
			//		A string formatted as described in the dojo/date/stamp module.
			// example:
			//	|	set("value", "2012-1-20"); // January 20, 2012
			// tags:
			//		private			
			var date = datestamp.fromISOString(value);
			this.set("values", array.map(this.slots, function(w){ return w.format(date); }));
		},
		
		_getValueAttr: function(){
			// summary:
			//		Gets the current date as a String formatted according to a subset of the ISO-8601 standard.
			// returns: String
			//		A string formatted as described in the dojo/date/stamp module.
			// tags:
			//		private			
			return datestamp.toISOString(this.get("date"), { selector: "date" });
		}		
	});
});

},
'dojox/mobile/ValuePickerDatePicker':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-attr",
	"./_DatePickerMixin",
	"./ValuePicker",
	"./ValuePickerSlot"
], function(declare, domClass, domAttr, DatePickerMixin, ValuePicker, ValuePickerSlot){

	// module:
	//		dojox/mobile/ValuePickerDatePicker

	return declare("dojox.mobile.ValuePickerDatePicker", [ValuePicker, DatePickerMixin], {
		// summary:
		//		A ValuePicker-based date picker widget.
		// description:
		//		ValuePickerDatePicker is a date picker widget. It is a subclass of
		//		dojox/mobile/ValuePicker. It has 3 slots: day, month and year.
		
		// readOnly: [const] Boolean
		//		If true, slot input fields are read-only. Only the plus and
		//		minus buttons can be used to change the values.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		readOnly: false,
		
		// yearPlusBtnLabel: String
		//		(Accessibility) Label for year plus button
		yearPlusBtnLabel: "",
		
		// yearPlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the year plus button
		yearPlusBtnLabelRef: "",
		
		// yearPlusBtnLabel: String
		//		(Accessibility) Label for year minus button
		yearMinusBtnLabel: "",
		
		// yearPlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the year minus button
		yearMinusBtnLabelRef: "",

		// monthPlusBtnLabel: String
		//		(Accessibility) Label for month plus button
		monthPlusBtnLabel: "",
		
		// monthPlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the month plus button
		monthPlusBtnLabelRef: "",
		
		// monthMinusBtnLabel: String
		//		(Accessibility) Label for month minus button
		monthMinusBtnLabel: "",
		
		// monthMinusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the month minus button
		monthMinusBtnLabelRef: "",

		// dayPlusBtnLabel: String
		//		(Accessibility) Label for day plus button
		dayPlusBtnLabel: "",
		
		// dayPlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the day plus button
		dayPlusBtnLabelRef: "",
		
		// dayMinusBtnLabel: String
		//		(Accessibility) Label for day minus button
		dayMinusBtnLabel: "",
		
		// dayMinusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the day minus button
		dayMinusBtnLabelRef: "",

		slotClasses: [
			ValuePickerSlot,
			ValuePickerSlot,
			ValuePickerSlot
		],

		slotProps: [
			{labelFrom:1970, labelTo:2038, style:{width:"87px"}},
			{style:{width:"72px"}},
			{style:{width:"72px"}}
		],

		buildRendering: function(){
			var p = this.slotProps;
			p[0].readOnly = p[1].readOnly = p[2].readOnly = this.readOnly;
			this._setBtnLabels(p);
			this.initSlots();
			this.inherited(arguments);
			domClass.add(this.domNode, "mblValuePickerDatePicker");
			this._conn = [
				this.connect(this.slots[0], "_spinToValue", "_onYearSet"),
				this.connect(this.slots[1], "_spinToValue", "_onMonthSet"),
				this.connect(this.slots[2], "_spinToValue", "_onDaySet")
			];
		},

		disableValues: function(/*Number*/daysInMonth){
			// summary:
			//		Disables the end days of the month to match the specified
			//		number of days of the month.
			var items = this.slots[2].items;
			if(this._tail){
				this.slots[2].items = items = items.concat(this._tail);
			}
			this._tail = items.slice(daysInMonth);
			items.splice(daysInMonth);
		},
		
		_setBtnLabels: function(slotProps){
		    //summary:
		    // Set a11y labels on the plus/minus buttons
			slotProps[0].plusBtnLabel = this.yearPlusBtnLabel;
			slotProps[0].plusBtnLabelRef = this.yearPlusBtnLabelRef;
			slotProps[0].minusBtnLabel = this.yearMinusBtnLabel;
			slotProps[0].minusBtnLabelRef = this.yearMinusBtnLabelRef;
			slotProps[1].plusBtnLabel = this.monthPlusBtnLabel; 
			slotProps[1].plusBtnLabelRef = this.monthPlusBtnLabelRef;
			slotProps[1].minusBtnLabel = this.monthMinusBtnLabel;
			slotProps[1].minusBtnLabelRef = this.monthMinusBtnLabelRef;
			slotProps[2].plusBtnLabel = this.dayPlusBtnLabel;
			slotProps[2].plusBtnLabelRef = this.dayPlusBtnLabelRef;
			slotProps[2].minusBtnLabel = this.dayMinusBtnLabel;
			slotProps[2].minusBtnLabelRef = this.dayMinusBtnLabelRef;
		}
	});
});

},
'dojox/mobile/Rating':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dijit/_WidgetBase",
	"./iconUtils",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Rating"
], function(declare, lang, domConstruct, WidgetBase, iconUtils, has, BidiRating){

	// module:
	//		dojox/mobile/Rating

	
	var Rating = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiRating" : "dojox.mobile.Rating", [WidgetBase], {
		// summary:
		//		A widget that displays a rating, usually with stars.
		// description:
		//		This widget simply shows the specified number of stars. It is a
		//		read-only widget, and has no editing capability.

		// image: String
		//		Path to a star image, which includes three stars, full star,
		//		empty star, and half star, from left to right.
		image: "",

		// numStars: Number
		//		The number of stars to show.
		numStars: 5,

		// value: Number
		//		The current value of the Rating.
		value: 0,

		// alt: String
		//		An alternate text for the icon image.
		alt: "",

		/* internal properties */
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblRating",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.style.display = "inline-block";
			var img = this.imgNode = domConstruct.create("img");
			this.connect(img, "onload",
				lang.hitch(this, function(){ this.set("value", this.value); }));
			iconUtils.createIcon(this.image, null, img);
		},

		_setValueAttr: function(/*Number*/value){
			// summary:
			//		Sets the value of the Rating.
			// tags:
			//		private
			this._set("value", value);
			var h = this.imgNode.height;
			if(h == 0){ return; } // loading of image has not been completed yet
			domConstruct.empty(this.domNode);
			var i, left, w = this.imgNode.width / 3;
			for(i = 0; i < this.numStars; i++){
				if(i <= value - 1){
					left = 0; // full
				}else if(i >= value){
					left = w; // empty
				}else{
					left = w * 2; // half
				}
				var parent = domConstruct.create("div", {
					style: {"float": "left"}
				}, this.domNode);
				if(!this.isLeftToRight()){
					parent = this._setCustomTransform(parent);
				}
				iconUtils.createIcon(this.image,
					"0," + left + "," + w + "," + h, null, this.alt, parent);
			}
		},
		
		_setCustomTransform: function(/*Object*/parent){
			// summary:
			//		To be implemented in bidi/Rating.js.
			return parent;
		}
	});
	
	return has("dojo-bidi") ? declare("dojox.mobile.Rating", [Rating, BidiRating]) : Rating;

});

},
'dojox/mobile/IconMenuItem':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"./iconUtils",
	"./_ItemBase"
], function(declare, lang, domClass, domConstruct, domAttr, iconUtils, ItemBase){
	// module:
	//		dojox/mobile/IconMenuItem

	return declare("dojox.mobile.IconMenuItem", ItemBase, { 
		// summary:
		//		An item of IconMenu.
		// description:
		//		IconMenuItem represents a menu item of dojox/mobile/MenuItem. 
		//		This widget inherits from dojox/mobile/_ItemBase. Its basic usage is 
		//		similar to other subclasses such as dojox/mobile/ListItem.

		// closeOnAction: Boolean
		//		If true, the internal handler of click events calls the hide() method 
		//		of the parent widget, which is typically a dojox/mobile/SimpleDialog.
		//		The default value is false.
		closeOnAction: false,

		// tag: String
		//		The name of the HTML tag to create as domNode.
		tag: "li",

		/* internal properties */
		// Note these are overrides for similar properties defined in _ItemBase.
		baseClass: "mblIconMenuItem",
		selColor: "mblIconMenuItemSel",
		_selStartMethod: "touch",
		_selEndMethod: "touch",

		buildRendering: function(){
			this.domNode = this.srcNodeRef || domConstruct.create(this.tag);
			domAttr.set(this.domNode, "role", "menuitemcheckbox");
			domAttr.set(this.domNode, "aria-checked", "false");
			this.inherited(arguments);
			if(this.selected){
				domClass.add(this.domNode, this.selColor);
			}

			if(this.srcNodeRef){
				if(!this.label){
					this.label = lang.trim(this.srcNodeRef.innerHTML);
				}
				this.srcNodeRef.innerHTML = "";
			}

			var a = this.anchorNode = this.containerNode = domConstruct.create("a", {
				className: "mblIconMenuItemAnchor",
				role: "presentation"
			});
			var tbl = domConstruct.create("table", {
				className: "mblIconMenuItemTable",
				role: "presentation"
			}, a);
			var cell = this.iconParentNode = tbl.insertRow(-1).insertCell(-1);
			this.iconNode = domConstruct.create("div", {
				className: "mblIconMenuItemIcon"
			}, cell);
			this.labelNode = this.refNode = domConstruct.create("div", {
				className: "mblIconMenuItemLabel"
			}, cell);
			this.position = "before";
			this.domNode.appendChild(a);
		},

		startup: function(){
			if(this._started){ return; }

			this.connect(this.domNode, "onkeydown", "_onClick"); // for desktop browsers

			this.inherited(arguments);
			if(!this._isOnLine){
				this._isOnLine = true;
				// retry applying the attribute for which the custom setter delays the actual 
				// work until _isOnLine is true. 
				this.set("icon", this._pendingIcon !== undefined ? this._pendingIcon : this.icon);
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingIcon; 
			}
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			if(this.closeOnAction){
				var p = this.getParent(); // maybe SimpleDialog
				if(p && p.hide){
					p.hide();
				}
			}
			this.defaultClickAction(e);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User-defined function to handle clicks.
			// tags:
			//		callback
		},

		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			// tags:
			//		private
			this.inherited(arguments);
			domClass.toggle(this.domNode, this.selColor, selected);
			domAttr.set(this.domNode, "aria-checked", selected ? "true" : "false");
		}
	});
});

},
'dojox/mobile/ProgressBar':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/_WidgetBase"
], function(declare, domClass, domConstruct, WidgetBase){

	// module:
	//		dojox/mobile/ProgressBar

	return declare("dojox.mobile.ProgressBar", WidgetBase, {
		// summary:
		//		A widget that shows the progress of a task.
		// description:
		//		The current progress can be specified either using a number (0 to maximum) 
		//		or percentage (0% to 100%). The setter of the 'value' property can be used to
		//		update the degree of completion of the task.
		
		// value: String
		//		Number ("0" to maximum) or percentage ("0%" to "100%")
		//		indicating the degree of completion of the task.
		value: "0",

		// maximum: Number
		//		Maximum value.
		maximum: 100,

		// label: String
		//		A text to be shown at the center of the progress bar.
		label: "",

		/* internal properties */	
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblProgressBar",

		buildRendering: function(){
			this.inherited(arguments);
			this.progressNode = domConstruct.create("div", {
				className: "mblProgressBarProgress"
			}, this.domNode);
			this.msgNode = domConstruct.create("div", {
				className: "mblProgressBarMsg"
			}, this.domNode);
		},

		_setValueAttr: function(/*String*/value){
			// summary:
			//		Sets the new value to the progress bar.
			// tags:
			//		private
			value += "";
			this._set("value", value);

			var percent = Math.min(100, (value.indexOf("%") != -1 ?
				parseFloat(value) : this.maximum ? 100 * value / this.maximum : 0));
			this.progressNode.style.width = percent + "%";
			domClass.toggle(this.progressNode, "mblProgressBarNotStarted", !percent);
			domClass.toggle(this.progressNode, "mblProgressBarComplete", percent == 100);
			this.onChange(value, this.maximum, percent);
		},

		_setLabelAttr: function(label){
			// summary:
			//		Sets a label text to be shown at the center of the progress bar.
			// tags:
			//		private
			this.msgNode.innerHTML = label;
		},

		onChange: function(/*Number*/ /*===== percent =====*/){
			// summary:
			//		User-defined function called when progress updates.
			// tags:
			//		callback
		}
	});
});

},
'dojox/mobile/i18n':function(){
define([
	"dojo/_base/lang",
	"dojo/i18n",
	"dijit/_WidgetBase"
], function(lang, di18n, WidgetBase){

	// module:
	//		dojox/mobile/i18n

	var i18n = {
		// summary:
		//		An internationalization utility for applications based on dojox/mobile.
	};
	lang.setObject("dojox.mobile.i18n", i18n);

	i18n.load = function(/*String*/packageName, /*String*/bundleName, /*String?*/locale){
		// summary:
		//		Loads an nls resource bundle and returns an array of localized
		//		resources.
		return i18n.registerBundle(di18n.getLocalization(packageName, bundleName, locale));
	};

	i18n.registerBundle = function(/*Array*/bundle){
		// summary:
		//		Accumulates the given localized resources in an array and returns
		//		it.
		if(!i18n.bundle){ i18n.bundle = []; }
		return lang.mixin(i18n.bundle, bundle);
	};

	i18n.I18NProperties = {
		// summary:
		//		These properties can be specified for any widget once the dojox/mobile/i18n module is loaded.

		// mblNoConv: Boolean
		//		Disables localization by dojox/mobile/i18n for the widget on which the property is set.
		mblNoConv: false
	};

	// Since any widget can have properties localized by dojox/mobile/i18n, mix I18NProperties
	// into the base widget class.  (This is a hack, but it's effective.)
	// This is for the benefit of the parser.   Remove for 2.0.  Also, hide from doc viewer.
	lang.extend(WidgetBase, /*===== {} || =====*/ i18n.I18NProperties);

	// Mixin the _cv method which is called by property setters.
	lang.extend(WidgetBase, {
		_cv: function(s){
			if(this.mblNoConv || !i18n.bundle){ return s; }
			return i18n.bundle[lang.trim(s)] || s;
		}
	});

	return i18n;
});

},
'dojox/mobile/ValuePickerTimePicker':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"./_TimePickerMixin",
	"./ToolBarButton",
	"./ValuePicker",
	"./ValuePickerSlot"
], function(declare, domClass, TimePickerMixin, ToolBarButton, ValuePicker, ValuePickerSlot){

	// module:
	//		dojox/mobile/ValuePickerTimePicker

	return declare("dojox.mobile.ValuePickerTimePicker", [ValuePicker, TimePickerMixin], {
		// summary:
		//		A ValuePicker-based time picker widget.
		// description:
		//		ValuePickerTimePicker is a time picker widget. It is a subclass of
		//		dojox.mobile.ValuePicker. It has two slots: hour and minute.

		// readOnly: [const] Boolean
		//		If true, slot input fields are read-only. Only the plus and
		//		minus buttons can be used to change the values.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		readOnly: false,

		// is24h: Boolean
		//		If true, the time is displayed in 24h format.
		//		Otherwise, displayed in AM/PM mode.
		is24h: false,

		/*=====
		// values: Array
		//		The time value, as an array in 24h format: [hour24, minute] (ex. ["22","06"]).
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		values: null,

		// values12: Array
		//		The time value, as an array in 12h format: [hour12, minute, ampm] (ex. ["10","06","PM"]).
		//		Warning: Do not use this property directly, make sure to call set() or get() methods.
		values12: null,
		=====*/
		
		// hourPlusBtnLabel: String
		//		(Accessibility) Label for hour plus button
		hourPlusBtnLabel: "",
		
		// hourPlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the hour plus button
		hourPlusBtnLabelRef: "",
		
		// minutePlusBtnLabel: String
		//		(Accessibility) Label for minute plus button
		minutePlusBtnLabel: "",
		
		// minutePlusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the minute plus button
		minutePlusBtnLabelRef: "",
		
		// hourMinusBtnLabel: String
		//		(Accessibility) Label for hour minus button
		hourMinusBtnLabel: "",
		
		// hourMinusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the hour minus button
		hourMinusBtnLabelRef: "",
		
		// minuteMinusBtnLabel: String
		//		(Accessibility) Label for minute minus button
		minuteMinusBtnLabel: "",
		
		// minuteMinusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for the minute minus button
		minuteMinusBtnLabelRef: "",

		slotClasses: [
			ValuePickerSlot,
			ValuePickerSlot
		],

		slotProps: [
			{labelFrom:0, labelTo:23, style:{width:"72px"}},
			{labelFrom:0, labelTo:59, zeroPad:2, style:{width:"72px"}}
		],

		buildRendering: function(){
			var p = this.slotProps;
			p[0].readOnly = p[1].readOnly = this.readOnly;
			this._setBtnLabels(p);
			this.inherited(arguments);
			var items = this.slots[0].items;
			this._zero = items.slice(0, 1);
			this._pm = items.slice(13);

			domClass.add(this.domNode, "mblValuePickerTimePicker");
			domClass.add(this.slots[0].domNode, "mblValuePickerTimePickerHourSlot");
			domClass.add(this.slots[1].domNode, "mblValuePickerTimePickerMinuteSlot");

			this.ampmButton = new ToolBarButton();
			this.addChild(this.ampmButton);
			this._conn = [
				this.connect(this.ampmButton, "onClick", "onBtnClick")
			];
			this.set("is24h", this.is24h);
		},

		to12h: function(a){
			// summary:
			//		Converts a 24h time to a 12h time.
			// a: Array
			//		[hour24, minute] (ex. ["22","06"])
			// returns: Array
			//		[hour12, minute, ampm] (ex. ["10","06","PM"])
			// tags:
			//		private
			var h = a[0] - 0;
			var ampm = h < 12 ? "AM" : "PM";
			if(h == 0){
				h = 12;
			}else if(h > 12){
				h = h - 12;
			}
			return [h + "", a[1], ampm]; // [hour12, minute, ampm]
		},

		to24h: function(a){
			// summary:
			//		Converts a 12h time to a 24h time.
			// a: Array
			//		[hour12, minute, ampm] (ex. ["10","06","PM"])
			// returns: Array
			//		[hour24, minute] (ex. ["22","06"])
			// tags:
			//		private
			var h = a[0] - 0;
			if(a[2] == "AM"){
				h = h == 12 ? 0 : h; // 12AM is 0h
			}else{
				h = h == 12 ? h : h + 12; // 12PM is 12h
			}
			return [h + "", a[1]]; // [hour24, minute]
		},

		onBtnClick: function(){
			// summary:
			//		The handler for the AM/PM button.
			var ampm = this.ampmButton.get("label") == "AM" ? "PM" : "AM";
			var v = this.get("values12");
			v[2] = ampm;
			this.set("values12", v);
			if(this.onValueChanged){
				this.onValueChanged(this.slots[0]);
			}
		},

		_setIs24hAttr: function(/*Boolean*/is24h){
			// summary:
			//		Changes the time display mode, 24h or 12h.
			var items = this.slots[0].items;
			if(is24h && items.length != 24){ // 24h: 0 - 23
				this.slots[0].items = this._zero.concat(items).concat(this._pm);
			}else if(!is24h && items.length != 12){ // 12h: 1 - 12
				items.splice(0, 1);
				items.splice(12);
			}
			var v = this.get("values");
			this._set("is24h", is24h);
			this.ampmButton.domNode.style.display = is24h ? "none" : "";
			this.set("values", v);
		},

		_getValuesAttr: function(){
			// summary:
			//		Returns an array of hour and minute in 24h format.
			var v = this.inherited(arguments); // [hour, minute]
			return this.is24h ? v : this.to24h([v[0], v[1], this.ampmButton.get("label")]);
		},

		_setValuesAttr: function(/*Array*/values){
			// summary:
			//		Sets an array of hour and minute in 24h format.
			// values:
			//		[hour24, minute] (ex. ["22","06"])
			if(this.is24h){
				this.inherited(arguments);
			}else{
				values = this.to12h(values);
				this.ampmButton.set("label", values[2]);
				this.inherited(arguments);
			}
		},

		_getValues12Attr: function(){
			// summary:
			//		Returns an array of hour and minute in 12h format.
			return this.to12h(this._getValuesAttr());
		},

		_setValues12Attr: function(/*Array*/values){
			// summary:
			//		Sets an array of hour and minute in 12h format.
			// values:
			//		[hour12, minute, ampm] (ex. ["10","06","PM"])
			this.set("values", this.to24h(values));
		},
		
		_setBtnLabels: function(slotProps){
		    slotProps[0].plusBtnLabel = this.hourPlusBtnLabel; 
			slotProps[0].plusBtnLabelRef = this.hourPlusBtnLabelRef;
			slotProps[0].minusBtnLabel = this.hourMinusBtnLabel;
			slotProps[0].minusBtnLabelRef = this.hourMinusBtnLabelRef;
			slotProps[1].plusBtnLabel = this.minutePlusBtnLabel;
			slotProps[1].plusBtnLabelRef = this.minutePlusBtnLabelRef;
			slotProps[1].minusBtnLabel = this.minuteMinusBtnLabel;
			slotProps[1].minusBtnLabelRef = this.minuteMinusBtnLabelRef;
		}
	});
});

},
'dojox/mobile/transition':function(){
define([
	"dojo/_base/Deferred",
	"dojo/_base/config"
], function(Deferred, config){
	/*=====
	return {
		// summary:
		//		This is the wrapper module which loads
		//		dojox/css3/transit conditionally. If mblCSS3Transition
		//		is set to 'dojox/css3/transit', it will be loaded as
		//		the module to conduct view transitions, otherwise this module returns null.
	};
	=====*/
	if(config.mblCSS3Transition){
		//require dojox/css3/transit and resolve it as the result of transitDeferred.
		var transitDeferred = new Deferred();
		require([config.mblCSS3Transition], function(transit){
			transitDeferred.resolve(transit);
		});
		return transitDeferred;
	}
	return null;
});

},
'dojox/mobile/ToggleButton':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dijit/form/_ToggleButtonMixin",
	"./Button"
], function(declare, domClass, ToggleButtonMixin, Button){

	return declare("dojox.mobile.ToggleButton", [Button, ToggleButtonMixin], {
		// summary:
		//		A non-templated button widget that can be in two states (checked or not).
		//		Can be base class for things like tabs or checkbox or radio buttons

		baseClass: "mblToggleButton",

		_setCheckedAttr: function(){
			this.inherited(arguments);
			var newStateClasses = (this.baseClass+' '+this["class"]).replace(/(\S+)\s*/g, "$1Checked ").split(" ");
			domClass[this.checked ? "add" : "remove"](this.focusNode || this.domNode, newStateClasses);
		}
	});
});

},
'dojox/mobile/SearchBox':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dijit/form/_SearchMixin",
	"dojox/mobile/TextBox",
	"dojo/dom-class",
	"dojo/keys",
	"dojo/touch",
	"dojo/on",
	"./sniff"
], function(declare, lang, win, SearchMixin, TextBox, domClass, keys, touch, on, has){

	return declare("dojox.mobile.SearchBox", [TextBox, SearchMixin], {
		// summary:
		//		A non-templated base class for INPUT type="search".

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblTextBox mblSearchBox",

		// type: String
		//		Corresponds to the type attribute of the HTML `<input>` element.
		//		The value is "search".
		type: "search",

		placeHolder: "",

		// incremental: Boolean
		//		Set true to search on every key or false to only search after 
		//		pressing ENTER or cancel.
		incremental: true,

		_setIncrementalAttr: function(val){
			// summary:
			//		Custom setter so the INPUT doesn't get the incremental attribute set.
			// tags:
			//		private
			this.incremental = val;
		},

		_onInput: function(e){
			// tags:
			//		private
			if(e.charOrCode == keys.ENTER){
				e.charOrCode = 229;
			}else if(!this.incremental){
				e.charOrCode = 0; // call _onInput to make sure a pending query is aborted
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);
			this.textbox.removeAttribute('incremental'); // only want onsearch to fire for ENTER and cancel
			if(!this.textbox.hasAttribute('results')){
				this.textbox.setAttribute('results', '0'); // enables webkit search decoration
			}
			if(has("ios") < 5){
				domClass.add(this.domNode, 'iphone4'); // cannot click cancel button after focus so just remove it
				this.connect(this.textbox, "onfocus", // if value changes between start of onfocus to end, then it was a cancel
					function(){
						if(this.textbox.value !== ''){
							this.defer(
								function(){
									if(this.textbox.value === ''){
										this._onInput({ charOrCode: keys.ENTER }); // emulate onsearch
									}
								}
							);
						}
					}
				);
			}
			this.connect(this.textbox, "onsearch",
				function(){
					this._onInput({ charOrCode: keys.ENTER });
				}
			);
			
			// Clear action for the close button (iOS specific)
			var _this = this;
			var touchStartX, touchStartY;
			var handleRelease;
			if(has("ios")){
				this.on(touch.press, function(evt){
					var rect;
					touchStartX = evt.touches ? evt.touches[0].pageX : evt.pageX;
					touchStartY = evt.touches ? evt.touches[0].pageY : evt.pageY;
					// As the native searchbox on iOS, clear on release, not on start.
					handleRelease = on(win.doc, touch.release,
						function(evt){
							var rect, dx, dy;
							if(_this.get("value") != ""){
								dx = evt.pageX - touchStartX;
								dy = evt.pageY - touchStartY;
								// Mimic the behavior of native iOS searchbox: 
								// if location of release event close to the location of start event:
								if(Math.abs(dx) <= 4 && Math.abs(dy) <= 4){
									evt.preventDefault();
									_this.set("value", "");
									_this._onInput({ charOrCode: keys.ENTER });
								}
							}
							if(handleRelease){ // possibly already cancelled/cleared on touch.press
								handleRelease.remove();
								handleRelease = null;
							}
						}
					);
					rect = _this.domNode.getBoundingClientRect();
					// if touched in the right-most 20 pixels of the search box 
					if(rect.right - (evt.touches ? evt.touches[0].pageX : evt.pageX) >= 20){
						// cancel
						if(handleRelease){
							handleRelease.remove();
							handleRelease = null;
						} 
					}
				});
			}
		}
	});
});

},
'dojox/mobile/_IconItemPane':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"./Pane",
	"./iconUtils",
	"./sniff"
], function(declare, domConstruct, Pane, iconUtils, has){

	// module:
	//		dojox/mobile/_IconItemPane

	return declare("dojox.mobile._IconItemPane", Pane, {
		// summary:
		//		An internal widget used for IconContainer.

		// iconPos: String
		//		The default icon position for child items.
		iconPos: "",
		
		// closeIconRole: String
		//		The HTML role of the close icon. Example: "button".
		closeIconRole: "",
		
		// closeIconTitle: String
		//		The title of the close icon.
		closeIconTitle: "",
		
		// label: String
		//		The label of the item.
		label: "",
		
		// closeIcon: String
		//		CSS class for the close icon.
		closeIcon: "mblDomButtonBlueMinus",
		
		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblIconItemPane",

		// tabIndex: String
		//		Tab index for the close button, such that users can hit the tab
		//		key to focus on it.
		tabIndex: "0",
		
		// _setTabIndexAttr: [private] String
		//		Sets tabIndex to closeIconNode.
		_setTabIndexAttr: "closeIconNode", 

		buildRendering: function(){
			this.inherited(arguments);
			this.hide();
			this.closeHeaderNode = domConstruct.create("h2", {className:"mblIconItemPaneHeading"}, this.domNode);
			this.closeIconNode = domConstruct.create("div", {
				className: "mblIconItemPaneIcon",
				role: this.closeIconRole,
				title: this.closeIconTitle
			}, this.closeHeaderNode);
			this.labelNode = domConstruct.create("span", {className:"mblIconItemPaneTitle"}, this.closeHeaderNode);
			this.containerNode = domConstruct.create("div", {className:"mblContent"}, this.domNode);
		},

		show: function(){
			// summary:
			//		Shows the widget.
			this.domNode.style.display = "";
		},

		hide: function(){
			// summary:
			//		Hides the widget.
			this.domNode.style.display = "none";
		},

		isOpen: function(e){
			// summary:
			//		Tests whether the widget is open.
			return this.domNode.style.display !== "none";
		},

		_setLabelAttr: function(/*String*/text){
			// tags:
			//		private
			this._set("label", text);
			this.labelNode.innerHTML = this._cv ? this._cv(text) : text;
		},

		_setCloseIconAttr: function(icon){
			// tags:
			//		private
			this._set("closeIcon", icon);
			this.closeIconNode = iconUtils.setIcon(icon, this.iconPos, this.closeIconNode, null, this.closeHeaderNode);

			if(has("windows-theme") && this.closeIconTitle !== ""){
				this.closeButtonNode = domConstruct.create("span", {className:"mblButton mblCloseButton", innerHTML:this.closeIconTitle,
					style: {display: "none"}}, this.closeIconNode);
			}
		}
	});
});

},
'dojox/mobile/lazyLoadUtils':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/window",
	"dojo/_base/Deferred",
	"dojo/ready"
], function(dojo, array, config, win, Deferred, ready){

	// module:
	//		dojox/mobile/lazyLoadUtils

	var LazyLoadUtils = function(){
		// summary:
		//		Utilities to lazy-loading of Dojo widgets.

		this._lazyNodes = [];
		var _this = this;
		if(config.parseOnLoad){
			ready(90, function(){
				var lazyNodes = array.filter(win.body().getElementsByTagName("*"), // avoid use of dojo.query
					function(n){ return n.getAttribute("lazy") === "true" || (n.getAttribute("data-dojo-props")||"").match(/lazy\s*:\s*true/); });
				var i, j, nodes, s, n;
				for(i = 0; i < lazyNodes.length; i++){
					array.forEach(["dojoType", "data-dojo-type"], function(a){
						nodes = array.filter(lazyNodes[i].getElementsByTagName("*"),
											function(n){ return n.getAttribute(a); });
						for(j = 0; j < nodes.length; j++){
							n = nodes[j];
							n.setAttribute("__" + a, n.getAttribute(a));
							n.removeAttribute(a);
							_this._lazyNodes.push(n);
						}
					});
				}
			});
		}

		ready(function(){
			for(var i = 0; i < _this._lazyNodes.length; i++){ /* 1.8 */
				var n = _this._lazyNodes[i];
				array.forEach(["dojoType", "data-dojo-type"], function(a){
					if(n.getAttribute("__" + a)){
						n.setAttribute(a, n.getAttribute("__" + a));
						n.removeAttribute("__" + a);
					}
				});
			}
			delete _this._lazyNodes;

		});

		this.instantiateLazyWidgets = function(root, requires, callback){
			// summary:
			//		Instantiates dojo widgets under the root node.
			// description:
			//		Finds DOM nodes that have the dojoType or data-dojo-type attributes,
			//		requires the found Dojo modules, and runs the parser.
			var d = new Deferred();
			var req = requires ? requires.split(/,/) : [];
			var nodes = root.getElementsByTagName("*"); // avoid use of dojo.query
			var len = nodes.length;
			for(var i = 0; i < len; i++){
				var s = nodes[i].getAttribute("dojoType") || nodes[i].getAttribute("data-dojo-type");
				if(s){
					req.push(s);
					var m = nodes[i].getAttribute("data-dojo-mixins"),
						mixins = m ? m.split(/, */) : [];
					req = req.concat(mixins);
				}
			}
			if(req.length === 0){ return true; }

			if(dojo.require){
				array.forEach(req, function(c){
					dojo["require"](c);
				});
				dojo.parser.parse(root);
				if(callback){ callback(root); }
				return true;
			}else{
				req = array.map(req, function(s){ return s.replace(/\./g, "/"); });
				require(req, function(){
					dojo.parser.parse(root);
					if(callback){ callback(root); }
					d.resolve(true);
				});
			}
			return d;
		}	
	};

	// Return singleton.  (TODO: can we replace LazyLoadUtils class and singleton w/a simple hash of functions?)
	return new LazyLoadUtils();
});


},
'dojox/mobile/Tooltip':function(){
define([
	"dojo/_base/array", // array.forEach
	"dijit/registry",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dijit/place",
	"dijit/_WidgetBase",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/Tooltip"
], function(array, registry, declare, lang, domClass, domConstruct, domGeometry, domStyle, place, WidgetBase, has, BidiTooltip){

	var Tooltip = declare(has("dojo-bidi") ? "dojox.mobile.NonBidiTooltip" : "dojox.mobile.Tooltip", WidgetBase, {
		// summary:
		//		A non-templated popup bubble widget

		baseClass: "mblTooltip mblTooltipHidden",

		buildRendering: function(){
			// create the helper nodes here in case the user overwrote domNode.innerHTML
			this.inherited(arguments);
			this.anchor = domConstruct.create("div", {"class":"mblTooltipAnchor"}, this.domNode, "first");
			this.arrow = domConstruct.create("div", {"class":"mblTooltipArrow"}, this.anchor);
			this.innerArrow = domConstruct.create("div", {"class":"mblTooltipInnerArrow"}, this.anchor);
			if(!this.containerNode){
				// set containerNode so that getChildren() works
				this.containerNode = this.domNode;
			}
		},

		show: function(/*DomNode*/ aroundNode, /*Array*/positions){
			// summary:
			//		Pop up the tooltip and point to aroundNode using the best position
			// positions:
			//		Ordered list of positions to try matching up.
			//
			//		- before-centered: places drop down before the aroundNode
			//		- after-centered: places drop down after the aroundNode
			//		- above-centered: drop down goes above aroundNode
			//		- below-centered: drop down goes below aroundNode

			var domNode = this.domNode;
			var connectorClasses = {
				"MRM": "mblTooltipAfter",
				"MLM": "mblTooltipBefore",
				"BMT": "mblTooltipBelow",
				"TMB": "mblTooltipAbove",
				"BLT": "mblTooltipBelow",
				"TLB": "mblTooltipAbove",
				"BRT": "mblTooltipBelow",
				"TRB": "mblTooltipAbove",
				"TLT": "mblTooltipBefore",
				"TRT": "mblTooltipAfter",
				"BRB": "mblTooltipAfter",
				"BLB": "mblTooltipBefore"
			};
			domClass.remove(domNode, ["mblTooltipAfter","mblTooltipBefore","mblTooltipBelow","mblTooltipAbove"]);
			array.forEach(registry.findWidgets(domNode), function(widget){
				if(widget.height == "auto" && typeof widget.resize == "function"){
					if(!widget._parentPadBorderExtentsBottom){
						widget._parentPadBorderExtentsBottom = domGeometry.getPadBorderExtents(domNode).b;
					}
					widget.resize();
				}
			});
			// Convert before/after to before-centered/after-centered for compatibility
			// TODO remove this 1.7->1.8 compatibility code in 2.0
			if(positions){
				positions = array.map(positions, function(pos){
					return {after: "after-centered", before: "before-centered"}[pos] || pos;
				});
			}
			var best = place.around(domNode, aroundNode, positions || ["below-centered", "above-centered", "after-centered", "before-centered"], this.isLeftToRight());
			var connectorClass = connectorClasses[best.corner + best.aroundCorner.charAt(0)] || "";
			domClass.add(domNode, connectorClass);
			var pos = domGeometry.position(aroundNode, true);
			domStyle.set(this.anchor, (connectorClass == "mblTooltipAbove" || connectorClass == "mblTooltipBelow")
				? { top: "", left: Math.max(0, pos.x - best.x + (pos.w >> 1) - (this.arrow.offsetWidth >> 1)) + "px" }
				: { left: "", top: Math.max(0, pos.y - best.y + (pos.h >> 1) - (this.arrow.offsetHeight >> 1)) + "px" }
			);
			domClass.replace(domNode, "mblTooltipVisible", "mblTooltipHidden");
			this.resize = lang.hitch(this, "show", aroundNode, positions); // orientation changes
			return best;
		},

		hide: function(){
			// summary:
			//		Pop down the tooltip
			this.resize = undefined;
			domClass.replace(this.domNode, "mblTooltipHidden", "mblTooltipVisible");
		},

		onBlur: function(/*Event*/e){
			return true; // touching outside the overlay area does call hide() by default
		},

		destroy: function(){
			if(this.anchor){
				this.anchor.removeChild(this.innerArrow);
				this.anchor.removeChild(this.arrow);
				this.domNode.removeChild(this.anchor);
				this.anchor = this.arrow = this.innerArrow = undefined;
			}
			this.inherited(arguments);
		}
	});
	
	return has("dojo-bidi") ? declare("dojox.mobile.Tooltip", [Tooltip, BidiTooltip]) : Tooltip;		
});

},
'dijit/form/_ComboBoxMenuMixin':function(){
define([
	"dojo/_base/array", // array.forEach
	"dojo/_base/declare", // declare
	"dojo/dom-attr", // domAttr.set
	"dojo/has",
	"dojo/i18n", // i18n.getLocalization
	"dojo/i18n!./nls/ComboBox"
], function(array, declare, domAttr, has, i18n){

	// module:
	//		dijit/form/_ComboBoxMenuMixin

	var ComboBoxMenuMixin = declare("dijit.form._ComboBoxMenuMixin" + (has("dojo-bidi") ? "_NoBidi" : ""), null, {
		// summary:
		//		Focus-less menu for internal use in `dijit/form/ComboBox`
		// tags:
		//		private

		// _messages: Object
		//		Holds "next" and "previous" text for paging buttons on drop down
		_messages: null,

		postMixInProperties: function(){
			this.inherited(arguments);
			this._messages = i18n.getLocalization("dijit.form", "ComboBox", this.lang);
		},

		buildRendering: function(){
			this.inherited(arguments);

			// fill in template with i18n messages
			this.previousButton.innerHTML = this._messages["previousMessage"];
			this.nextButton.innerHTML = this._messages["nextMessage"];
		},

		_setValueAttr: function(/*Object*/ value){
			this._set("value", value);
			this.onChange(value);
		},

		onClick: function(/*DomNode*/ node){
			if(node == this.previousButton){
				this._setSelectedAttr(null);
				this.onPage(-1);
			}else if(node == this.nextButton){
				this._setSelectedAttr(null);
				this.onPage(1);
			}else{
				this.onChange(node);
			}
		},

		// stubs
		onChange: function(/*Number*/ /*===== direction =====*/){
			// summary:
			//		Notifies ComboBox/FilteringSelect that user selected an option.
			// tags:
			//		callback
		},

		onPage: function(/*Number*/ /*===== direction =====*/){
			// summary:
			//		Notifies ComboBox/FilteringSelect that user clicked to advance to next/previous page.
			// tags:
			//		callback
		},

		onClose: function(){
			// summary:
			//		Callback from dijit.popup code to this widget, notifying it that it closed
			// tags:
			//		private
			this._setSelectedAttr(null);
		},

		_createOption: function(/*Object*/ item, labelFunc){
			// summary:
			//		Creates an option to appear on the popup menu subclassed by
			//		`dijit/form/FilteringSelect`.

			var menuitem = this._createMenuItem();
			var labelObject = labelFunc(item);
			if(labelObject.html){
				menuitem.innerHTML = labelObject.label;
			}else{
				menuitem.appendChild(
					menuitem.ownerDocument.createTextNode(labelObject.label)
				);
			}
			// #3250: in blank options, assign a normal height
			if(menuitem.innerHTML == ""){
				menuitem.innerHTML = "&#160;";	// &nbsp;
			}

			return menuitem;
		},

		createOptions: function(results, options, labelFunc){
			// summary:
			//		Fills in the items in the drop down list
			// results:
			//		Array of items
			// options:
			//		The options to the query function of the store
			//
			// labelFunc:
			//		Function to produce a label in the drop down list from a dojo.data item

			this.items = results;

			// display "Previous . . ." button
			this.previousButton.style.display = (options.start == 0) ? "none" : "";
			domAttr.set(this.previousButton, "id", this.id + "_prev");
			// create options using _createOption function defined by parent
			// ComboBox (or FilteringSelect) class
			// #2309:
			//		iterate over cache nondestructively
			array.forEach(results, function(item, i){
				var menuitem = this._createOption(item, labelFunc);
				menuitem.setAttribute("item", i);	// index to this.items; use indirection to avoid mem leak
				domAttr.set(menuitem, "id", this.id + i);
				this.nextButton.parentNode.insertBefore(menuitem, this.nextButton);
			}, this);
			// display "Next . . ." button
			var displayMore = false;
			// Try to determine if we should show 'more'...
			if(results.total && !results.total.then && results.total != -1){
				if((options.start + options.count) < results.total){
					displayMore = true;
				}else if((options.start + options.count) > results.total && options.count == results.length){
					// Weird return from a data store, where a start + count > maxOptions
					// implies maxOptions isn't really valid and we have to go into faking it.
					// And more or less assume more if count == results.length
					displayMore = true;
				}
			}else if(options.count == results.length){
				//Don't know the size, so we do the best we can based off count alone.
				//So, if we have an exact match to count, assume more.
				displayMore = true;
			}

			this.nextButton.style.display = displayMore ? "" : "none";
			domAttr.set(this.nextButton, "id", this.id + "_next");
		},

		clearResultList: function(){
			// summary:
			//		Clears the entries in the drop down list, but of course keeps the previous and next buttons.
			var container = this.containerNode;
			while(container.childNodes.length > 2){
				container.removeChild(container.childNodes[container.childNodes.length - 2]);
			}
			this._setSelectedAttr(null);
		},

		highlightFirstOption: function(){
			// summary:
			//		Highlight the first real item in the list (not Previous Choices).
			this.selectFirstNode();
		},

		highlightLastOption: function(){
			// summary:
			//		Highlight the last real item in the list (not More Choices).
			this.selectLastNode();
		},

		selectFirstNode: function(){
			this.inherited(arguments);
			if(this.getHighlightedOption() == this.previousButton){
				this.selectNextNode();
			}
		},

		selectLastNode: function(){
			this.inherited(arguments);
			if(this.getHighlightedOption() == this.nextButton){
				this.selectPreviousNode();
			}
		},

		getHighlightedOption: function(){
			return this.selected;
		}
	});

	if(has("dojo-bidi")){
		ComboBoxMenuMixin = declare("dijit.form._ComboBoxMenuMixin", ComboBoxMenuMixin, {
			_createOption: function(){
				var menuitem = this.inherited(arguments);

				// update menuitem.dir if BidiSupport was required
				this.applyTextDir(menuitem);

				return menuitem;
			}
		});
	}

	return ComboBoxMenuMixin;
});

},
'dojox/mobile/_TimePickerMixin':function(){
define([
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/date/locale"
], function(declare, domClass, datelocale){

	// module:
	//		dojox/mobile/_TimePickerMixin

	return declare("dojox.mobile._TimePickerMixin", null, {
		// summary:
		//		A mixin for time picker widget.

		/*=====
		// date: Date
		//		A Date object corresponding to the current values of the picker.
		date: null,
		=====*/
		
		reset: function(){
			// summary:
			//		Goes to now. Resets the hour and minutes to the current time.
			var now = new Date(),
				h = now.getHours() + "",
				m = now.getMinutes();
			m = (m < 10 ? "0" : "") + m;
			this.set("colors", [h, m]);
			if(this.values){
				this.set("values", this.values);
				this.values = null;
			}else if(this.values12){
				this.set("values12", this.values12);
				this.values12 = null;
			}else{
				this.set("values", [h, m]);
			}
		},

		_getDateAttr: function(){
			// summary:
			//		Returns a Date object for the current values.
			// tags:
			//		private
			var v = this.get("values"); // [hour24, minute]
			return datelocale.parse(v[0] + ":" + v[1], {timePattern:"H:m", selector:"time"});
		}
	});
});

},
'dojox/mobile/dh/JsonContentHandler':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred",
	"dojo/json",
	"dojo/dom-construct"
], function(dojo, array, declare, lang, Deferred, json, domConstruct){

	// module:
	//		dojox/mobile/dh/JsonContentHandler

	return declare("dojox.mobile.dh.JsonContentHandler", null, {
		// summary:
		//		A JSON content handler.
		// description:
		//		This module is a content handler that creates a view from JSON
		//		data. If widgets used in the JSON data are not available, they
		//		are loaded automatically before instantiation.
		//
		//		There are two formats as shown in the examples below. You can
		//		choose either of them. The v1.7 format can be more compact, but
		//		if you want multiple widgets at the same level, they must be in
		//		an array. So, you can have, for example, two consecutive
		//		RoundRectLists, but you cannot have, for example,
		//		RoundRectCategory, RoundRectList, RoundRectCategory, and
		//		RoundRectList, because they are keys in one JS object, which
		//		causes conflict. The v1.8 format has no such limitation.
		//
		// example:
		// 	|	// v1.7 format
		//	|	{
		//	|	  "dojox.mobile.View": {
		//	|	    "@id": "view1",
		//	|	    "dojox.mobile.Heading": {
		//	|	      "@back": "Home",
		//	|	      "@moveTo": "home",
		//	|	      "@label": "view1.json"
		//	|	    },
		//	|	    "dojox.mobile.EdgeToEdgeList": {
		//	|	      "dojox.mobile.ListItem": [{
		//	|	        "@label": "Jack Coleman"
		//	|	      }, {
		//	|	        "@label": "James Evans"
		//	|	      }, {
		//	|	        "@label": "Jason Griffin"
		//	|	      }]
		//	|	    }
		//	|	  }
		//	|	}
		//	|	
		// example:
		//	|	// v1.8 format
		//	|	{
		//	|	  "class": "dojox.mobile.View",
		//	|	  "@id": "view1",
		//	|	  "children": [
		//	|	
		//	|	    {
		//	|	      "class": "dojox.mobile.Heading",
		//	|	      "@back": "Home",
		//	|	      "@moveTo": "home",
		//	|	      "@label": "view1.json"
		//	|	    },
		//	|	
		//	|	    {
		//	|	      "class": "dojox.mobile.EdgeToEdgeList",
		//	|	      "children": [
		//	|	        {
		//	|	          "class": "dojox.mobile.ListItem",
		//	|	          "@label": "Jack Coleman"
		//	|	        },
		//	|	        {
		//	|	          "class": "dojox.mobile.ListItem",
		//	|	          "@label": "James Evans"
		//	|	        },
		//	|	        {
		//	|	          "class": "dojox.mobile.ListItem",
		//	|	          "@label": "Jason Griffin"
		//	|	        }
		//	|	      ]
		//	|	    }
		//	|	
		//	|	  ]
		//	|	}
		//	|	
		// example:
		//	|	// SpinWheel in v1.8 format
		//	|	{
		//	|	  "class": "dojox.mobile.View",
		//	|	  "@id": "view1",
		//	|	  "children": [
		//	|	    {
		//	|	      "class": "dojox.mobile.SpinWheel",
		//	|	      "@id": "spin1",
		//	|	      "@style": {"margin":"10px auto","width":"304px"},
		//	|	      "children": [
		//	|	        {
		//	|	          "class": "dojox.mobile.SpinWheelSlot",
		//	|	          "@labels": "A,B,C,D,E",
		//	|	          "@style": {"textAlign":"center","width":"300px"}
		//	|	        }
		//	|	      ]
		//	|	    }
		//	|	  ]
		//	|	}

		parse: function(/*Object*/ content, /*DomNode*/ target, /*DomNode?*/ refNode){
			// summary:
			//		Parses the given data and creates a new view at the given position.
			// content:
			//		Content data for a new view.
			// target:
			//		A DOM node under which a new view is created.
			// refNode:
			//		An optional reference DOM node before which a new view is created.
			var view, container = domConstruct.create("DIV");
			target.insertBefore(container, refNode);
			this._ws = [];
			this._req = [];
			var root = json.parse(content);
			return Deferred.when(this._loadPrereqs(root), lang.hitch(this, function(){
				view = this._instantiate(root, container);
				view.style.visibility = "hidden";
				array.forEach(this._ws, function(w){
					if(!w._started && w.startup){
						w.startup();
					}
				});
				this._ws = null;
				return view.id;
			}));
		},

		_loadPrereqs: function(root){
			// tags:
			//		private
			var d = new Deferred();
			var req = this._collectRequires(root);
			if(req.length === 0){ return true; }

			if(dojo.require){
				array.forEach(req, function(c){
					dojo["require"](c);
				});
				return true;
			}else{
				req = array.map(req, function(s){ return s.replace(/\./g, "/"); });
				require(req, function(){
					d.resolve(true);
				});
			}
			return d;
		},

		_collectRequires: function(obj){
			// tags:
			//		private
			var className = obj["class"];
			for(var key in obj){
				if(key.charAt(0) == "@" || key === "children"){ continue; }
				var cls = className || key.replace(/:.*/, "");
				this._req.push(cls);
				if(!cls){ continue; }
				var objs = className ? [obj] :
						(lang.isArray(obj[key]) ? obj[key] : [obj[key]]);
				for(var i = 0; i < objs.length; i++){
					// process child widgets
					if(!className){
						this._collectRequires(objs[i]);
					}else if(objs[i].children){
						for(var j = 0; j < objs[i].children.length; j++){
							this._collectRequires(objs[i].children[j]);
						}
					}
				}
			}
			return this._req;
		},

		_instantiate: function(/*Object*/obj, /*DomNode*/node, /*Widget*/parent){
			// summary:
			//		Given the evaluated json data, does the same thing as what
			//		the parser does.
			// tags:
			//		private
			var widget;
			var className = obj["class"];
			for(var key in obj){
				if(key.charAt(0) == "@" || key === "children"){ continue; }
				var cls = lang.getObject(className || key.replace(/:.*/, ""));
				if(!cls){ continue; }
				var proto = cls.prototype,
					objs = className ? [obj] :
						(lang.isArray(obj[key]) ? obj[key] : [obj[key]]);
				for(var i = 0; i < objs.length; i++){
					var params = {};
					for(var prop in objs[i]){
						if(prop.charAt(0) == "@"){
							var v = objs[i][prop];
							prop = prop.substring(1);
							var t = typeof proto[prop];
							if(lang.isArray(proto[prop])){
								params[prop] = v.split(/\s*,\s*/);
							}else if(t === "string"){
								params[prop] = v;
							}else if(t === "number"){
								params[prop] = v - 0;
							}else if(t === "boolean"){
								params[prop] = (v !== "false");
							}else if(t === "object"){
								params[prop] = json.parse(v);
							}else if(t === "function"){
								params[prop] = lang.getObject(v, false) || new Function(v);
							}
						}
					}
					widget = new cls(params, node);
					if(node){ // to call View's startup()
						this._ws.push(widget);
					}
					if(parent){
						widget.placeAt(parent.containerNode || parent.domNode);
					}
					// process child widgets
					if(!className){
						this._instantiate(objs[i], null, widget);
					}else if(objs[i].children){
						for(var j = 0; j < objs[i].children.length; j++){
							this._instantiate(objs[i].children[j], null, widget);
						}
					}
				}
			}
			return widget && widget.domNode;
		}
	});
});

},
'dojox/mobile/SpinWheel':function(){
define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/dom-construct",
	"./_PickerBase",
	"./SpinWheelSlot" // to load SpinWheelSlot for you (no direct references)
], function(declare, array, domConstruct, PickerBase){

	// module:
	//		dojox/mobile/SpinWheel

	return declare("dojox.mobile.SpinWheel", PickerBase, {
		// summary:
		//		A value picker widget that has spin wheels.
		// description:
		//		SpinWheel is a value picker component. It is a sectioned wheel
		//		that can be used to pick up some values from the wheel slots by
		//		spinning them.

		/* internal properties */	
		baseClass: "mblSpinWheel",

		buildRendering: function(){
			this.inherited(arguments);
			domConstruct.create("div", {className: "mblSpinWheelBar"}, this.domNode);
		},

		startup: function(){
			if(this._started){ return; }
			this.centerPos = Math.round(this.domNode.offsetHeight / 2);
			this.inherited(arguments);
		},

		resize: function() {
			this.centerPos = Math.round(this.domNode.offsetHeight / 2);
			array.forEach(this.getChildren(), function(child){
				child.resize && child.resize();
			});
		},

		addChild: function(/*Widget*/ widget, /*int?*/ insertIndex){
			this.inherited(arguments);
			if(this._started){
				widget.setInitialValue();
			}
		}
	});
});

},
'dojox/mobile/_css3':function(){
define([
	"dojo/_base/window",
	"dojo/_base/array",
	"dojo/has"
], function(win, arr, has){

	// caches for capitalized names and hypen names
	var cnames = [], hnames = [];

	// element style used for feature testing
	var style = win.doc.createElement("div").style;

	// We just test webkit prefix for now since our themes only have standard and webkit
	// (see dojox/mobile/themes/common/css3.less)
	// More prefixes can be added if/when we add them to css3.less.
	var prefixes = ["webkit"];

	// Does the browser support CSS3 animations?
	has.add("css3-animations", function(global, document, element){
		var style = element.style;
		return (style["animation"] !== undefined && style["transition"] !== undefined) ||
			arr.some(prefixes, function(p){
				return style[p+"Animation"] !== undefined && style[p+"Transition"] !== undefined;
			});
	});

	// Indicates whether style 'transition' returns empty string instead of
	// undefined, although TransitionEvent is not supported.
	// Reported on Android 4.1.x on some devices: https://bugs.dojotoolkit.org/ticket/17164
	has.add("t17164", function(global, document, element){
		return (element.style["transition"] !== undefined) && !('TransitionEvent' in window);
	});

	var css3 = {
		// summary:
		//		This module provide some cross-browser support for CSS3 properties.

		name: function(/*String*/p, /*Boolean?*/hyphen){
			// summary:
			//		Returns the name of a CSS3 property with the correct prefix depending on the browser.
			// p:
			//		The (non-prefixed) property name. The property name is assumed to be consistent with
			//		the hyphen argument, for example "transition-property" if hyphen is true, or "transitionProperty"
			//		if hyphen is false. If the browser supports the non-prefixed property, the property name will be
			//		returned unchanged.
			// hyphen:
			//		Optional, true if hyphen notation should be used (for example "transition-property" or "-webkit-transition-property"),
			//		false for camel-case notation (for example "transitionProperty" or "webkitTransitionProperty").

			var n = (hyphen?hnames:cnames)[p];
			if(!n){

				if(/End|Start/.test(p)){
					// event names: no good way to feature-detect, so we
					// assume they have the same prefix as the corresponding style property
					var idx = p.length - (p.match(/End/) ? 3 : 5);
					var s = p.substr(0, idx);
					var pp = this.name(s);
					if(pp == s){
						// no prefix, standard event names are all lowercase
						n = p.toLowerCase();
					}else{
						// prefix, e.g. webkitTransitionEnd (camel case)
						n = pp + p.substr(idx);
					}
				}else if(p == "keyframes"){
					// special case for keyframes, we also rely on consistency between 'animation' and 'keyframes'
					var pk = this.name("animation", hyphen);
					if(pk == "animation"){
						n = p;
					}else if(hyphen){
						n = pk.replace(/animation/, "keyframes");
					}else{
						n = pk.replace(/Animation/, "Keyframes");
					}
				}else{
					// convert name to camel-case for feature test
					var cn = hyphen ? p.replace(/-(.)/g, function(match, p1){
    					return p1.toUpperCase();
					}) : p;
					if(style[cn] !== undefined && !has('t17164')){
						// standard non-prefixed property is supported
						n = p;
					}else{
						// try prefixed versions
						cn = cn.charAt(0).toUpperCase() + cn.slice(1);
						arr.some(prefixes, function(prefix){
							if(style[prefix+cn] !== undefined){
								if(hyphen){
									n = "-" + prefix + "-" + p;
								}else{
									n = prefix + cn;
								}
							}
						});
					}
				}

				if(!n){
					// The property is not supported, just return it unchanged, it will be ignored.
					n = p;
				}

				(hyphen?hnames:cnames)[p] = n;
			}
			return n;
		},

		add: function(/*Object*/styles, /*Object*/css3Styles){
			// summary:
			//		Prefixes all property names in "css3Styles" and adds the prefixed properties in "styles".
			//		Used as a convenience when an object is passed to domStyle.set to set multiple styles.
			// example:
			//		domStyle.set(bar, css3.add({
			//			opacity: 0.6,
			//			position: "absolute",
			//			backgroundColor: "#606060"
			//		}, {
			//			borderRadius: "2px",
			//			transformOrigin: "0 0"
			//		}));
			// returns:
			//		The "styles" argument where the CSS3 styles have been added.

			for(var p in css3Styles){
				if(css3Styles.hasOwnProperty(p)){
					styles[css3.name(p)] = css3Styles[p];
				}
			}
			return styles;
		}
	};

	return css3;
});

},
'dojox/mobile/_DataMixin':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/Deferred"
], function(kernel, array, declare, lang, Deferred){

	// module:
	//		dojox/mobile/_DataMixin

	kernel.deprecated("dojox/mobile/_DataMixin", "Use dojox/mobile/_StoreMixin instead", "2.0");

	return declare("dojox.mobile._DataMixin", null, {
		// summary:
		//		Mixin for widgets to enable dojo/data data store.
		// description:
		//		By mixing this class into a widget, it can get data through a
		//		dojo/data data store. The widget must implement
		//		onComplete(/*Array*/items) to handle the retrieved data.

		// store: Object
		//		Reference to data provider object used by this widget.
		store: null,

		// query: Object
		//		A query that can be passed to 'store' to initially filter the items.
		query: null,

		// queryOptions: Object
		//		An optional parameter for the query.
		queryOptions: null,

		setStore: function(/*dojo/data/store*/store, /*dojo/data/api/Request|Object*/query, /*Object?*/queryOptions){
			// summary:
			//		Sets the store to use with this widget.
			if(store === this.store){ return null; }
			this.store = store;
			this._setQuery(query, queryOptions);
			if(store && store.getFeatures()["dojo.data.api.Notification"]){
				array.forEach(this._conn || [], this.disconnect, this);
				this._conn = [
					this.connect(store, "onSet", "onSet"),
					this.connect(store, "onNew", "onNew"),
					this.connect(store, "onDelete", "onDelete"),
					this.connect(store, "close", "onStoreClose")
				];
			}
			return this.refresh();
		},

		setQuery: function(/*dojo/data/api/Request|Object*/query, /*Object?*/queryOptions){
			// summary:
			//		Sets a query.
			this._setQuery(query, queryOptions);
			return this.refresh();
		},

		_setQuery: function(query, queryOptions){
			// tags:
			//		private
			this.query = query;
			this.queryOptions = queryOptions || this.queryOptions;
		},

		refresh: function(){
			// summary:
			//		Fetches the data and generates the list items.
			if(!this.store){ return null; }
			var d = new Deferred();
			var onComplete = lang.hitch(this, function(items, request){
				this.onComplete(items, request);
				d.resolve();
			});
			var onError = lang.hitch(this, function(errorData, request){
				this.onError(errorData, request);
				d.resolve();
			});
			var q = this.query;
			this.store.fetch({
				query: q,
				queryOptions: this.queryOptions,
				onComplete: onComplete,
				onError: onError,
				start: q && q.start,
				count: q && q.count
			});
			return d;
		}

/*
		// Subclass MUST implement the following methods.

		onComplete: function(items, request){
			// summary:
			//		An handler that is called after the fetch completes.
		},

		onError: function(errorData, request){
			// summary:
			//		An error handler.
		},

		onSet: function(item, attribute, oldValue, newValue){
			// summary:
			//		See dojo/data/api/Notification.onSet()
		},

		onNew: function(newItem, parentInfo){
			// summary:
			//		See dojo/data/api/Notification.onNew()
		},

		onDelete: function(deletedItem){
			// summary:
			//		See dojo/data/api/Notification.onDelete()
		},

		onStoreClose: function(request){
			// summary:
			//		Refresh list on close.
		}
*/
	});
});

},
'dojox/mobile/EdgeToEdgeList':function(){
define([
	"dojo/_base/declare",
	"./RoundRectList"
], function(declare, RoundRectList){

	// module:
	//		dojox/mobile/EdgeToEdgeCategory

	return declare("dojox.mobile.EdgeToEdgeList", RoundRectList, {
		// summary:
		//		An edge-to-edge layout list.
		// description:
		//		EdgeToEdgeList is an edge-to-edge layout list, which displays
		//		all items in equally-sized rows. Each item must be a
		//		dojox/mobile/ListItem.
		
		// filterBoxClass: String
		//		The name of the CSS class added to the DOM node inside which is placed the 
		//		dojox/mobile/SearchBox created when mixing dojox/mobile/FilteredListMixin.
		//		The default value is "mblFilteredEdgeToEdgeListSearchBox". 
		filterBoxClass: "mblFilteredEdgeToEdgeListSearchBox",

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblEdgeToEdgeList";
		}
	});
});

},
'dojox/mobile/ValuePickerSlot':function(){
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/touch",
	"dijit/_WidgetBase",
	"./iconUtils",
	"dojo/has",
	"dojo/has!dojo-bidi?dojox/mobile/bidi/ValuePickerSlot"
], function(array, declare, event, lang, win, domClass, domConstruct, domAttr, touch, WidgetBase, iconUtils, has, BidiValuePickerSlot){

	// module:
	//		dojox/mobile/ValuePickerSlot

	var ValuePickerSlot = declare(has("dojo-bidi") ?  "dojox.mobile.NonBidiValuePickerSlot" : "dojox.mobile.ValuePickerSlot", WidgetBase, {
		// summary:
		//		A widget representing one slot of a ValuePicker widget.
		
		// items: Array
		//		An array of array of key-label pairs
		//		(e.g. [[0, "Jan"], [1,"Feb"], ...]). If key values for each label
		//		are not necessary, labels can be used instead.
		items: [],

		// labels: String[]
		//		An array of labels to be displayed on the value picker
		//		(e.g. ["Jan","Feb",...]). This is a simplified version of the
		//		items property.
		labels: [],

		// labelFrom: Number
		//		The start value of display values of the value picker. This
		//		parameter is especially useful when value picker has serial
		//		values.
		labelFrom: 0,

		// labelTo: Number
		//		The end value of display values of the value picker.
		labelTo: 0,

		// zeroPad: Number
		//		Length of zero padding numbers.
		//		Ex. zeroPad=2 -> "00", "01", ...
		//		Ex. zeroPad=3 -> "000", "001", ...
		zeroPad: 0,

		// value: String
		//		The initial value of the value picker.
		value: "",

		// step: Number
		//		The steps between labelFrom and labelTo.
		step: 1,

		// readOnly: [const] Boolean
		//		A flag used to indicate if the input field is readonly or not.
		//		Note that changing the value of the property after the widget 
		//		creation has no effect.
		readOnly: false,

		// tabIndex: String
		//		Tabindex setting for this widget so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",

		// key: Object
		//		The key of the currently selected value in the items array. This is a read-only property.
		//		Warning: Do not use this property directly, make sure to call the get() method.
		/*=====
		key: null,
		=====*/
		
		// plusBtnLabel: String
		//		(Accessibility) Text label for plus button
		plusBtnLabel: "",
		
		// plusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for plus button
		plusBtnLabelRef: "",
		
		// minusBtnLabel: String
		//		(Accessibility) Text label for minus button
		minusBtnLabel: "",
		
		// minusBtnLabelRef: String
		//		(Accessibility) Reference to a node id containing text label for minus button
		minusBtnLabelRef: "",

		/* internal properties */	
		baseClass: "mblValuePickerSlot",

		buildRendering: function(){
			this.inherited(arguments);

			this.initLabels();
			if(this.labels.length > 0){
				this.items = [];
				for(var i = 0; i < this.labels.length; i++){
					this.items.push([i, this.labels[i]]);
				}
			}

			this.plusBtnNode = domConstruct.create("div", {
				className: "mblValuePickerSlotPlusButton mblValuePickerSlotButton",
				title: "+"
			}, this.domNode);
			
			this.plusIconNode = domConstruct.create("div", {
				className: "mblValuePickerSlotIcon"
			}, this.plusBtnNode);
			iconUtils.createIcon("mblDomButtonGrayPlus", null, this.plusIconNode);

			this.inputAreaNode = domConstruct.create("div", {
				className: "mblValuePickerSlotInputArea"
			}, this.domNode);
			this.inputNode = domConstruct.create("input", {
				className: "mblValuePickerSlotInput",
				readonly: this.readOnly
			}, this.inputAreaNode);
			
			this.minusBtnNode = domConstruct.create("div", {
				className: "mblValuePickerSlotMinusButton mblValuePickerSlotButton",
				title: "-"
			}, this.domNode);
			this.minusIconNode = domConstruct.create("div", {
				className: "mblValuePickerSlotIcon"
			}, this.minusBtnNode);
			iconUtils.createIcon("mblDomButtonGrayMinus", null, this.minusIconNode);
			
			domAttr.set(this.plusBtnNode, "role", "button"); //a11y
			this._setPlusBtnLabelAttr(this.plusBtnLabel);
			this._setPlusBtnLabelRefAttr(this.plusBtnLabelRef);
			
			domAttr.set(this.inputNode, "role", "textbox");
			var registry = require("dijit/registry");
			var inputAreaNodeId =  registry.getUniqueId("dojo_mobile__mblValuePickerSlotInput");
			domAttr.set(this.inputNode, "id", inputAreaNodeId);
			domAttr.set(this.plusBtnNode, "aria-controls", inputAreaNodeId);
			
			domAttr.set(this.minusBtnNode, "role", "button");
			domAttr.set(this.minusBtnNode, "aria-controls", inputAreaNodeId);
			this._setMinusBtnLabelAttr(this.minusBtnLabel);
			this._setMinusBtnLabelRefAttr(this.minusBtnLabelRef);

			if(this.value === "" && this.items.length > 0){
				this.value = this.items[0][1];
			}
			this._initialValue = this.value;
		},

		startup: function(){
			if(this._started){ return; }
			this._handlers = [
				this.connect(this.plusBtnNode, touch.press, "_onTouchStart"),
				this.connect(this.minusBtnNode, touch.press, "_onTouchStart"),
				this.connect(this.plusBtnNode, "onkeydown", "_onClick"), // for desktop browsers
				this.connect(this.minusBtnNode, "onkeydown", "_onClick"), // for desktop browsers
				this.connect(this.inputNode, "onchange", lang.hitch(this, function(e){
					this._onChange(e);
				}))
			];
			this.inherited(arguments);
			this._set(this.plusBtnLabel);
		},

		initLabels: function(){
			// summary:
			//		Initializes the labels of this slot according to the labelFrom and labelTo properties.
			// tags:
			//		private
			if(this.labelFrom !== this.labelTo){
				var a = this.labels = [],
					zeros = this.zeroPad && Array(this.zeroPad).join("0");
				for(var i = this.labelFrom; i <= this.labelTo; i += this.step){
					a.push(this.zeroPad ? (zeros + i).slice(-this.zeroPad) : i + "");
				}
			}
		},

		spin: function(/*Number*/steps){
			// summary:
			//		Spins the slot as specified by steps.

			// find the position of the current value
			var pos = -1,
				v = this.get("value"),
				len = this.items.length;
			for(var i = 0; i < len; i++){
				if(this.items[i][1] === v){
					pos = i;
					break;
				}
			}
			if(v == -1){ return; }
			pos += steps;
			if(pos < 0){ // shift to positive
				pos += (Math.abs(Math.ceil(pos / len)) + 1) * len;
			}
			var newItem = this.items[pos % len];
			this.set("value", newItem[1]);
		},

		setInitialValue: function(){
			// summary:
			//		Sets the initial value using this.value or the first item.
			this.set("value", this._initialValue);
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			if(this.onClick(e) === false){ return; } // user's click action
			var node = e.currentTarget;
			if(node === this.plusBtnNode || node === this.minusBtnNode){
				this._btn = node;
			}
			this.spin(this._btn === this.plusBtnNode ? 1 : -1);
		},

		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},

		_onChange: function(e){
			// summary:
			//		Internal handler for the input field's value change events
			// tags:
			//		callback
			if(this.onChange(e) === false){ return; } // user's click action
			var v = this.get("value"), // text in the input field
				a = this.validate(v);
			this.set("value", a.length ? a[0][1] : this.value);
		},

		onChange: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle value changes
			// tags:
			//		callback
		},

		validate: function(value){
			return array.filter(this.items, function(a){
				return (a[1] + "").toLowerCase() == (value + "").toLowerCase();
			});
		},

		_onTouchStart: function(e){
			this._conn = [
				this.connect(win.body(), touch.move, "_onTouchMove"),
				this.connect(win.body(), touch.release, "_onTouchEnd")
			];
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
			domClass.add(e.currentTarget, "mblValuePickerSlotButtonSelected");
			this._btn = e.currentTarget;
			if(this._timer){
				this._timer.remove(); // fail safe
				this._timer = null;
			}
			if(this._interval){
				clearInterval(this._interval); // fail safe
				this._interval = null;
			}
			this._timer = this.defer(function(){
				this._interval = setInterval(lang.hitch(this, function(){
					this.spin(this._btn === this.plusBtnNode ? 1 : -1);
				}), 60);
				this._timer = null;
			}, 1000);
			event.stop(e);
		},

		_onTouchMove: function(e){
			var x = e.touches ? e.touches[0].pageX : e.clientX;
			var y = e.touches ? e.touches[0].pageY : e.clientY;
			if(Math.abs(x - this.touchStartX) >= 4 ||
			   Math.abs(y - this.touchStartY) >= 4){ // dojox/mobile/scrollable.threshold
			   	if(this._timer){
					this._timer.remove(); // fail safe
					this._timer = null;
				}
				if(this._interval){
					clearInterval(this._interval); // fail safe
					this._interval = null;
				}
				array.forEach(this._conn, this.disconnect, this);
				domClass.remove(this._btn, "mblValuePickerSlotButtonSelected");
			}
		},

		_onTouchEnd: function(e){
			if(this._timer){
				this._timer.remove();
				this._timer = null;
			}
			array.forEach(this._conn, this.disconnect, this);
			domClass.remove(this._btn, "mblValuePickerSlotButtonSelected");
			if(this._interval){
				clearInterval(this._interval);
				this._interval = null;
			}else{
				this._onClick(e);
			}
		},

		_getKeyAttr: function(){
			var val = this.get("value");
			var item = array.filter(this.items, function(item){
				return item[1] === val;
			})[0];
			return item ? item[0] : null;
		},

		_getValueAttr: function(){
			// summary:
			//		Gets the currently selected value.
			return this.inputNode.value;
		},

		_setValueAttr: function(value){
			// summary:
			//		Sets a new value to this slot.
			this._spinToValue(value, true);
		},
		
		_spinToValue: function(value, applyValue){
			// summary:
			//		Sets a new value to this slot.
			// tags:
			//		private
			if(this.get("value") == value){
				return; // no change; avoid notification
			}
			this.inputNode.value = value;
			// to avoid unnecessary notifications, applyValue is undefined when 
			// _spinToValue is called by _DatePickerMixin.
			if(applyValue){
				this._set("value", value);
			}
			var parent = this.getParent();
			if(parent && parent.onValueChanged){
				parent.onValueChanged(this);
			}
		},

		_setTabIndexAttr: function(/*String*/ tabIndex){
			this.plusBtnNode.setAttribute("tabIndex", tabIndex);
			this.minusBtnNode.setAttribute("tabIndex", tabIndex);
		},
		
		_setAria: function(node, attr, value){
			if(value){
				domAttr.set(node, attr, value);
			}else{
				domAttr.remove(node, attr);
			}
		},
		
		_setPlusBtnLabelAttr: function(/*String*/ plusBtnLabel){
			this._setAria(this.plusBtnNode, "aria-label", plusBtnLabel);
		},
		
		_setPlusBtnLabelRefAttr: function(/*String*/ plusBtnLabelRef){
			this._setAria(this.plusBtnNode, "aria-labelledby", plusBtnLabelRef);
		},
		
		_setMinusBtnLabelAttr: function(/*String*/ minusBtnLabel){
			this._setAria(this.minusBtnNode, "aria-label", minusBtnLabel);
		},
		
		_setMinusBtnLabelRefAttr: function(/*String*/ minusBtnLabelRef){
			this._setAria(this.minusBtnNode, "aria-labelledby", minusBtnLabelRef);
		}
	});
	
	return has("dojo-bidi") ? declare("dojox.mobile.ValuePickerSlot", [ValuePickerSlot, BidiValuePickerSlot]) : ValuePickerSlot;
});

},
'dijit/popup':function(){
define([
	"dojo/_base/array", // array.forEach array.some
	"dojo/aspect",
	"dojo/_base/declare", // declare
	"dojo/dom", // dom.isDescendant
	"dojo/dom-attr", // domAttr.set
	"dojo/dom-construct", // domConstruct.create domConstruct.destroy
	"dojo/dom-geometry", // domGeometry.isBodyLtr
	"dojo/dom-style", // domStyle.set
	"dojo/has", // has("config-bgIframe")
	"dojo/keys",
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"./place",
	"./BackgroundIframe",
	"./Viewport",
	"./main"    // dijit (defining dijit.popup to match API doc)
], function(array, aspect, declare, dom, domAttr, domConstruct, domGeometry, domStyle, has, keys, lang, on,
			place, BackgroundIframe, Viewport, dijit){

	// module:
	//		dijit/popup

	/*=====
	 var __OpenArgs = {
		 // popup: Widget
		 //		widget to display
		 // parent: Widget
		 //		the button etc. that is displaying this popup
		 // around: DomNode
		 //		DOM node (typically a button); place popup relative to this node.  (Specify this *or* "x" and "y" parameters.)
		 // x: Integer
		 //		Absolute horizontal position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
		 // y: Integer
		 //		Absolute vertical position (in pixels) to place node at.  (Specify this *or* "around" parameter.)
		 // orient: Object|String
		 //		When the around parameter is specified, orient should be a list of positions to try, ex:
		 //	|	[ "below", "above" ]
		 //		For backwards compatibility it can also be an (ordered) hash of tuples of the form
		 //		(around-node-corner, popup-node-corner), ex:
		 //	|	{ "BL": "TL", "TL": "BL" }
		 //		where BL means "bottom left" and "TL" means "top left", etc.
		 //
		 //		dijit/popup.open() tries to position the popup according to each specified position, in order,
		 //		until the popup appears fully within the viewport.
		 //
		 //		The default value is ["below", "above"]
		 //
		 //		When an (x,y) position is specified rather than an around node, orient is either
		 //		"R" or "L".  R (for right) means that it tries to put the popup to the right of the mouse,
		 //		specifically positioning the popup's top-right corner at the mouse position, and if that doesn't
		 //		fit in the viewport, then it tries, in order, the bottom-right corner, the top left corner,
		 //		and the top-right corner.
		 // onCancel: Function
		 //		callback when user has canceled the popup by:
		 //
		 //		1. hitting ESC or
		 //		2. by using the popup widget's proprietary cancel mechanism (like a cancel button in a dialog);
		 //		   i.e. whenever popupWidget.onCancel() is called, args.onCancel is called
		 // onClose: Function
		 //		callback whenever this popup is closed
		 // onExecute: Function
		 //		callback when user "executed" on the popup/sub-popup by selecting a menu choice, etc. (top menu only)
		 // padding: place.__Position
		 //		adding a buffer around the opening position. This is only useful when around is not set.
		 // maxHeight: Integer
		 //		The max height for the popup.  Any popup taller than this will have scrollbars.
		 //		Set to Infinity for no max height.  Default is to limit height to available space in viewport,
		 //		above or below the aroundNode or specified x/y position.
	 };
	 =====*/

	function destroyWrapper(){
		// summary:
		//		Function to destroy wrapper when popup widget is destroyed.
		//		Left in this scope to avoid memory leak on IE8 on refresh page, see #15206.
		if(this._popupWrapper){
			domConstruct.destroy(this._popupWrapper);
			delete this._popupWrapper;
		}
	}

	var PopupManager = declare(null, {
		// summary:
		//		Used to show drop downs (ex: the select list of a ComboBox)
		//		or popups (ex: right-click context menus).

		// _stack: dijit/_WidgetBase[]
		//		Stack of currently popped up widgets.
		//		(someone opened _stack[0], and then it opened _stack[1], etc.)
		_stack: [],

		// _beginZIndex: Number
		//		Z-index of the first popup.   (If first popup opens other
		//		popups they get a higher z-index.)
		_beginZIndex: 1000,

		_idGen: 1,

		_repositionAll: function(){
			// summary:
			//		If screen has been scrolled, reposition all the popups in the stack.
			//		Then set timer to check again later.

			if(this._firstAroundNode){	// guard for when clearTimeout() on IE doesn't work
				var oldPos = this._firstAroundPosition,
					newPos = domGeometry.position(this._firstAroundNode, true),
					dx = newPos.x - oldPos.x,
					dy = newPos.y - oldPos.y;

				if(dx || dy){
					this._firstAroundPosition = newPos;
					for(var i = 0; i < this._stack.length; i++){
						var style = this._stack[i].wrapper.style;
						style.top = (parseFloat(style.top) + dy) + "px";
						if(style.right == "auto"){
							style.left = (parseFloat(style.left) + dx) + "px";
						}else{
							style.right = (parseFloat(style.right) - dx) + "px";
						}
					}
				}

				this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), dx || dy ? 10 : 50);
			}
		},

		_createWrapper: function(/*Widget*/ widget){
			// summary:
			//		Initialization for widgets that will be used as popups.
			//		Puts widget inside a wrapper DIV (if not already in one),
			//		and returns pointer to that wrapper DIV.

			var wrapper = widget._popupWrapper,
				node = widget.domNode;

			if(!wrapper){
				// Create wrapper <div> for when this widget [in the future] will be used as a popup.
				// This is done early because of IE bugs where creating/moving DOM nodes causes focus
				// to go wonky, see tests/robot/Toolbar.html to reproduce
				wrapper = domConstruct.create("div", {
					"class": "dijitPopup",
					style: { display: "none"},
					role: "region",
					"aria-label": widget["aria-label"] || widget.label || widget.name || widget.id
				}, widget.ownerDocumentBody);
				wrapper.appendChild(node);

				var s = node.style;
				s.display = "";
				s.visibility = "";
				s.position = "";
				s.top = "0px";

				widget._popupWrapper = wrapper;
				aspect.after(widget, "destroy", destroyWrapper, true);

				// Workaround iOS problem where clicking a Menu can focus an <input> (or click a button) behind it.
				// Need to be careful though that you can still focus <input>'s and click <button>'s in a TooltipDialog.
				// Also, be careful not to break (native) scrolling of dropdown like ComboBox's options list.
				if("ontouchend" in document) {
					on(wrapper, "touchend", function (evt){
						if(!/^(input|button|textarea)$/i.test(evt.target.tagName)) {
							evt.preventDefault();
						}
					});
				}
			}

			return wrapper;
		},

		moveOffScreen: function(/*Widget*/ widget){
			// summary:
			//		Moves the popup widget off-screen.
			//		Do not use this method to hide popups when not in use, because
			//		that will create an accessibility issue: the offscreen popup is
			//		still in the tabbing order.

			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			// Besides setting visibility:hidden, move it out of the viewport, see #5776, #10111, #13604
			var ltr = domGeometry.isBodyLtr(widget.ownerDocument),
				style = {
					visibility: "hidden",
					top: "-9999px",
					display: ""
				};
			style[ltr ? "left" : "right"] = "-9999px";
			style[ltr ? "right" : "left"] = "auto";
			domStyle.set(wrapper, style);

			return wrapper;
		},

		hide: function(/*Widget*/ widget){
			// summary:
			//		Hide this popup widget (until it is ready to be shown).
			//		Initialization for widgets that will be used as popups
			//
			//		Also puts widget inside a wrapper DIV (if not already in one)
			//
			//		If popup widget needs to layout it should
			//		do so when it is made visible, and popup._onShow() is called.

			// Create wrapper if not already there
			var wrapper = this._createWrapper(widget);

			domStyle.set(wrapper, {
				display: "none",
				height: "auto",		// Open may have limited the height to fit in the viewport
				overflow: "visible",
				border: ""			// Open() may have moved border from popup to wrapper.
			});

			// Open() may have moved border from popup to wrapper.  Move it back.
			var node = widget.domNode;
			if("_originalStyle" in node){
				node.style.cssText = node._originalStyle;
			}
		},

		getTopPopup: function(){
			// summary:
			//		Compute the closest ancestor popup that's *not* a child of another popup.
			//		Ex: For a TooltipDialog with a button that spawns a tree of menus, find the popup of the button.
			var stack = this._stack;
			for(var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--){
				/* do nothing, just trying to get right value for pi */
			}
			return stack[pi];
		},

		open: function(/*__OpenArgs*/ args){
			// summary:
			//		Popup the widget at the specified position
			//
			// example:
			//		opening at the mouse position
			//		|		popup.open({popup: menuWidget, x: evt.pageX, y: evt.pageY});
			//
			// example:
			//		opening the widget as a dropdown
			//		|		popup.open({parent: this, popup: menuWidget, around: this.domNode, onClose: function(){...}});
			//
			//		Note that whatever widget called dijit/popup.open() should also listen to its own _onBlur callback
			//		(fired from _base/focus.js) to know that focus has moved somewhere else and thus the popup should be closed.

			var stack = this._stack,
				widget = args.popup,
				node = widget.domNode,
				orient = args.orient || ["below", "below-alt", "above", "above-alt"],
				ltr = args.parent ? args.parent.isLeftToRight() : domGeometry.isBodyLtr(widget.ownerDocument),
				around = args.around,
				id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + this._idGen++);

			// If we are opening a new popup that isn't a child of a currently opened popup, then
			// close currently opened popup(s).   This should happen automatically when the old popups
			// gets the _onBlur() event, except that the _onBlur() event isn't reliable on IE, see [22198].
			while(stack.length && (!args.parent || !dom.isDescendant(args.parent.domNode, stack[stack.length - 1].widget.domNode))){
				this.close(stack[stack.length - 1].widget);
			}

			// Get pointer to popup wrapper, and create wrapper if it doesn't exist.  Remove display:none (but keep
			// off screen) so we can do sizing calculations.
			var wrapper = this.moveOffScreen(widget);

			if(widget.startup && !widget._started){
				widget.startup(); // this has to be done after being added to the DOM
			}

			// Limit height to space available in viewport either above or below aroundNode (whichever side has more
			// room), adding scrollbar if necessary. Can't add scrollbar to widget because it may be a <table> (ex:
			// dijit/Menu), so add to wrapper, and then move popup's border to wrapper so scroll bar inside border.
			var maxHeight, popupSize = domGeometry.position(node);
			if("maxHeight" in args && args.maxHeight != -1){
				maxHeight = args.maxHeight || Infinity;	// map 0 --> infinity for back-compat of _HasDropDown.maxHeight
			}else{
				var viewport = Viewport.getEffectiveBox(this.ownerDocument),
					aroundPos = around ? domGeometry.position(around, false) : {y: args.y - (args.padding||0), h: (args.padding||0) * 2};
				maxHeight = Math.floor(Math.max(aroundPos.y, viewport.h - (aroundPos.y + aroundPos.h)));
			}
			if(popupSize.h > maxHeight){
				// Get style of popup's border.  Unfortunately domStyle.get(node, "border") doesn't work on FF or IE,
				// and domStyle.get(node, "borderColor") etc. doesn't work on FF, so need to use fully qualified names.
				var cs = domStyle.getComputedStyle(node),
					borderStyle = cs.borderLeftWidth + " " + cs.borderLeftStyle + " " + cs.borderLeftColor;
				domStyle.set(wrapper, {
					overflowY: "scroll",
					height: maxHeight + "px",
					border: borderStyle	// so scrollbar is inside border
				});
				node._originalStyle = node.style.cssText;
				node.style.border = "none";
			}

			domAttr.set(wrapper, {
				id: id,
				style: {
					zIndex: this._beginZIndex + stack.length
				},
				"class": "dijitPopup " + (widget.baseClass || widget["class"] || "").split(" ")[0] + "Popup",
				dijitPopupParent: args.parent ? args.parent.id : ""
			});

			if(stack.length == 0 && around){
				// First element on stack. Save position of aroundNode and setup listener for changes to that position.
				this._firstAroundNode = around;
				this._firstAroundPosition = domGeometry.position(around, true);
				this._aroundMoveListener = setTimeout(lang.hitch(this, "_repositionAll"), 50);
			}

			if(has("config-bgIframe") && !widget.bgIframe){
				// setting widget.bgIframe triggers cleanup in _WidgetBase.destroyRendering()
				widget.bgIframe = new BackgroundIframe(wrapper);
			}

			// position the wrapper node and make it visible
			var layoutFunc = widget.orient ? lang.hitch(widget, "orient") : null,
				best = around ?
					place.around(wrapper, around, orient, ltr, layoutFunc) :
					place.at(wrapper, args, orient == 'R' ? ['TR', 'BR', 'TL', 'BL'] : ['TL', 'BL', 'TR', 'BR'], args.padding,
						layoutFunc);

			wrapper.style.visibility = "visible";
			node.style.visibility = "visible";	// counteract effects from _HasDropDown

			var handlers = [];

			// provide default escape and tab key handling
			// (this will work for any widget, not just menu)
			handlers.push(on(wrapper, "keydown", lang.hitch(this, function(evt){
				if(evt.keyCode == keys.ESCAPE && args.onCancel){
					evt.stopPropagation();
					evt.preventDefault();
					args.onCancel();
				}else if(evt.keyCode == keys.TAB){
					evt.stopPropagation();
					evt.preventDefault();
					var topPopup = this.getTopPopup();
					if(topPopup && topPopup.onCancel){
						topPopup.onCancel();
					}
				}
			})));

			// watch for cancel/execute events on the popup and notify the caller
			// (for a menu, "execute" means clicking an item)
			if(widget.onCancel && args.onCancel){
				handlers.push(widget.on("cancel", args.onCancel));
			}

			handlers.push(widget.on(widget.onExecute ? "execute" : "change", lang.hitch(this, function(){
				var topPopup = this.getTopPopup();
				if(topPopup && topPopup.onExecute){
					topPopup.onExecute();
				}
			})));

			stack.push({
				widget: widget,
				wrapper: wrapper,
				parent: args.parent,
				onExecute: args.onExecute,
				onCancel: args.onCancel,
				onClose: args.onClose,
				handlers: handlers
			});

			if(widget.onOpen){
				// TODO: in 2.0 standardize onShow() (used by StackContainer) and onOpen() (used here)
				widget.onOpen(best);
			}

			return best;
		},

		close: function(/*Widget?*/ popup){
			// summary:
			//		Close specified popup and any popups that it parented.
			//		If no popup is specified, closes all popups.

			var stack = this._stack;

			// Basically work backwards from the top of the stack closing popups
			// until we hit the specified popup, but IIRC there was some issue where closing
			// a popup would cause others to close too.  Thus if we are trying to close B in [A,B,C]
			// closing C might close B indirectly and then the while() condition will run where stack==[A]...
			// so the while condition is constructed defensively.
			while((popup && array.some(stack, function(elem){
				return elem.widget == popup;
			})) ||
				(!popup && stack.length)){
				var top = stack.pop(),
					widget = top.widget,
					onClose = top.onClose;

				if (widget.bgIframe) {
					// push the iframe back onto the stack.
					widget.bgIframe.destroy();
					delete widget.bgIframe;
				}

				if(widget.onClose){
					// TODO: in 2.0 standardize onHide() (used by StackContainer) and onClose() (used here).
					// Actually, StackContainer also calls onClose(), but to mean that the pane is being deleted
					// (i.e. that the TabContainer's tab's [x] icon was clicked)
					widget.onClose();
				}

				var h;
				while(h = top.handlers.pop()){
					h.remove();
				}

				// Hide the widget and it's wrapper unless it has already been destroyed in above onClose() etc.
				if(widget && widget.domNode){
					this.hide(widget);
				}

				if(onClose){
					onClose();
				}
			}

			if(stack.length == 0 && this._aroundMoveListener){
				clearTimeout(this._aroundMoveListener);
				this._firstAroundNode = this._firstAroundPosition = this._aroundMoveListener = null;
			}
		}
	});

	return (dijit.popup = new PopupManager());
});

},
'dojox/mobile/uacss':function(){
define([
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/window",
	"./sniff"
], function(dojo, lang, win, has){
	var html = win.doc.documentElement;
	html.className = lang.trim(html.className + " " + [
		has('bb') ? "dj_bb" : "",
		has('android') ? "dj_android" : "",
		has("ios") ? "dj_ios" : "",
		has("ios") >= 6 ? "dj_ios6" : "",
		has("ios") ? "dj_iphone" : "",	// TODO: remove for 2.0
		has('ipod') ? "dj_ipod" : "",
		has('ipad') ? "dj_ipad" : "",
		has('ie') ? "dj_ie": ""
	].join(" ").replace(/ +/g," "));
	
	/*=====
	return {
		// summary:
		//		Requiring this module adds CSS classes to your document's `<html`> tag:
		//
		//		- "dj_android" when running on Android;
		//		- "dj_bb" when running on BlackBerry;
		//		- "dj_ios" when running on iOS (iPhone, iPad or iPod);
		//		- "dj_ios6" when running on iOS6+; this class is intended for the iphone theme to detect if it must use the iOS 6 variant of the theme. Currently applies on iOS 6 or later.
		//		- "dj_iphone" when running on iPhone, iPad or iPod (Note: will be changed in future versions to be set only on iPhone);
		//		- "dj_ipod" when running on iPod;
		//		- "dj_ipad" when running on iPad.
	};
	=====*/
	return dojo;
});

}}});
define("dojo/mobile-ui-layer", [], 1);
