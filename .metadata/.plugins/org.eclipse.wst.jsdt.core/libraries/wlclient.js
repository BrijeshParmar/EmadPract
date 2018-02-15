/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/**
 *  WLClient uses Douglas Crockford's Module (Singleton) Pattern.
 * 
 * @requires prototype.js 
 * @requires gadgetCommunicationAPI.js  
 * @requires wlcommon.js
 * @requires messages.js
 * @requires worklight.js
 */

__WLClient = function() {

    //.................. Private Constants .................. 

    // GadgetAPIServlet paths. 
    // Must always be in synch with the corresponding GadgetRequestInfo.GADGETS_HANDLER_... Java constants.
    var REQ_PATH_INIT             = "init";
    var REQ_PATH_LOGIN            = "login";
    var REQ_PATH_LOGOUT           = "logout";
    var REQ_PATH_GET_USER_INFO    = "getuserinfo";    
    var REQ_PATH_SET_USER_PREFS   = "setup";
    //var REQ_PATH_GET_USER_PREFS   = "getup";
    var REQ_PATH_DELETE_USER_PREF = "deleteup";
    var REQ_PATH_PROXY            = "proxy";
    var REQ_PATH_BACKEND_QUERY    = "query";
    var REQ_PATH_HEART_BEAT       = "heartbeat";
    var REQ_PATH_LOG_ACTIVITY     = "logactivity";
    var REQ_PATH_AUTHENTICATE     = "authentication";
    var REQ_PATH_GET_APP_UPDATES  = "updates";
    //var REQ_PATH_GET_GADGET_PROPS = "getgadgetprops";

    var REQ_PARAM_JSESSION_ID = "jsessionid";
    var REQ_PARAM_LOGIN_REALM = "realm";

    var LOGIN_POPUP_CHECK_INTERVAL_IN_SEC = 1;
    var LOGIN_AUTH_CHECK_POLLING_INTERVAL_IN_SEC = 5;
    var LOGIN_AUTH_CHECK_POLLING_DURATION_IN_SEC = 60;

    // The div id under which application content should reside. 
    var DIV_ID_CONTENT = 'content';
    
    // time in milliseconds before the getLocation function is considered to to fail.
    //var GET_LOCATION_TIMEOUT = 3000;
    
    var MESSEGE_TYPE_BLOCK = "BLOCK";
    var MESSEGE_TYPE_NOTIFY = "NOTIFY";
    
    //.................. Private Members ..........................

    var userInfo    = {};
    var gadgetProps = {};
    var userPrefs   = {};

    var blockingDiv = null;    
  
    var busyIndicator = null;

    var initOptions = {        
        onSuccess      : function(){},
        onFailure      : onDefaultInitFailure,
        onConnectionFailure	: onRequestTimeout,
        timeout        : 0,
        showLogger     : null,        
        minAppWidth    : 170,
        heartBeatIntervalInSecs : 20 * 60,
        onUnsupportedVersion : onUnsupportedVersion,
        onUnsupportedBrowser : onUnsupportedBrowser,
        onDisabledCookies    : onDisabledCookies,
        onUserInstanceAccessViolation : onUserInstanceAccessViolation,
        validateArguments	: true
        // authenticator  : ...
        // messages	   : ...
        // busyOptions  : ... 
    };
    
	var contentPort = null;
	var authPort = null;
    var isDefaultDockActivated = false;
    var isLoginActive = false;    
    //var isInitialized = false;
    var isConnecting = false;
    var _isConnected = null;
    
    var vistaBodyStyleInContent = null;
    var vistaBodyStyleInAuth    = null;
    var vistaBodyStyleInDock    = null;
    
    var loginCheckPeriodicalExecuter = null;
    var loginCheckStartTime = null;
    var heartBeatPeriodicalExecuter = null;
	
	// Used by Air only.
	var isMinimized = false;
    
    // Used for extending async-methods options object to add default implementations.
    var defaultOptions = {
        onSuccess : function(response){WL.Logger.debug("defaultOptions:onSuccess");},
        onFailure : function(response){WL.Logger.error("defaultOptions:onFailure " + response.errorMsg);},
        invocationContext : null
    };
	
	var errorCodeCallbacks = {};
	errorCodeCallbacks[WL.ErrorCode.UNSUPPORTED_BROWSER] = 'onUnsupportedBrowser';
	errorCodeCallbacks[WL.ErrorCode.REQUEST_TIMEOUT]     = 'onConnectionFailure';
	errorCodeCallbacks[WL.ErrorCode.UNRESPONSIVE_HOST]   = 'onConnectionFailure';
	errorCodeCallbacks[WL.ErrorCode.UNSUPPORTED_VERSION] = 'onUnsupportedVersion';
	errorCodeCallbacks[WL.ErrorCode.DISABLED_COOKIES]    = 'onDisabledCookies';
	errorCodeCallbacks[WL.ErrorCode.USER_INSTANCE_ACCESS_VIOLATION] = 'onUserInstanceAccessViolation';

    //.................. Private Methods .......................... 
    //     

    // Default implementation for the WL.Client.init onFailure (Application may override).
    // If a specific failure handler exist - it is called, otherwise a default error dialog 
    // is displayed (with reload app link).
    // Application may choose to override specific exceptions or to override the general
    // onFailure, in this case it has to handle all exceptions.
    function onDefaultInitFailure(response){
    	WL.Logger.error("Client init failed. " + response.errorMsg);
    	showWidgetContent();
        var callbackName = errorCodeCallbacks[response.errorCode];         
        if (callbackName && initOptions[callbackName]){
			initOptions[callbackName](response);
        } else {
            showDialog(WL.ClientMessages.wlclientInitFailure, response.userMsg ? response.userMsg : WL.ClientMessages.unexpectedError, response.recoverable);
        }
    }
    
    function onUnsupportedVersion(response){
        // Patch - downloadNewVersion element is added in the msg string. 
    	WL.SimpleDialog.show(WL.ClientMessages.gadgetUpdateAvailable,response.errorMsg,
    			[{text:WL.ClientMessages.ok, handler:function() {
    		        // Note you must add the null options to openURL otherwise the event is assumed the 3rd argument.                 
    	            WL.App.openURL(getAppProp(WL.AppProp.DOWNLOAD_APP_LINK), "_new", null);
    	        	if (getEnv() === WL.Env.ADOBE_AIR) {
    	        		window.setTimeout(WL.Client.close, 100);
    	        	}
    	        }}]);
    }
    
    function onRequestTimeout(response){
    	showDialog(WL.ClientMessages.wlclientInitFailure, WL.ClientMessages.requestTimeout, true);	
    }
    
    function onUnsupportedBrowser(response){
    	WL.SimpleDialog.show(WL.ClientMessages.wlclientInitFailure,
    			WL.Utils.formatString(WL.ClientMessages.browserIsNotSupported,
    			WL.BrowserDetect.browser + ' ' + WL.BrowserDetect.version));
    }
    
    function onDisabledCookies(response){    	
    	showDialog(WL.ClientMessages.wlclientInitFailure, WL.ClientMessages.cookiesAreDisabled, true);
    }
    
    function onUserInstanceAccessViolation(response){
    	showDialog(WL.ClientMessages.wlclientInitFailure, WL.ClientMessages.userInstanceAccessViolationException);
    }
    
    function isLoginOnStartup () {
    	return getAppProp(WL.AppProp.APP_LOGIN_TYPE) === WL.AppLoginType.LOGIN_ON_STARTUP;
    }
    
    function onInitSuccess(transport) {
        userInfo    = transport.responseJSON.userInfo;
        gadgetProps = transport.responseJSON.gadgetProps;
        userPrefs   = transport.responseJSON.userPrefs;

        showWidgetContent();
        hideBusy();

        switch (getEnv()) {
            case WL.Env.IGOOGLE:
                GadgetCAPI.init(getAppProp(WL.AppProp.IID));
                break;
        }

        if (WL.EnvProfile.isEnabled(WL.EPField.WEB)) {
            initResizeHandler();
        }

        WL.Logger.debug('before: app init onSuccess');
        initOptions.onSuccess(new WL.Response({}, initOptions.invocationContext));
        WL.Logger.debug('after: app init onSuccess');
        
        if (getEnv() === WL.Env.VISTA_SIDEBAR) {
            // In vista - check initial dock state
            if (System.Gadget.docked) {
                onWLDock();
            } 
            else {
                onWLUndock();
            }
        }
        
        isInitialized = true;
        WL.Logger.debug('wlclient init success');
    }

    function onInitFailure(transport) {
        showWidgetContent();
        hideBusy();
        initOptions.onFailure(new WL.FailResponse(transport, initOptions.invocationContext));
    }
    
    function onMobileConnectivityCheckFailure() {
         var res = new WL.Response({}, initOptions.invocationContext);
         res.errorCode = WL.ErrorCode.UNRESPONSIVE_HOST;
         res.errorMsg = WL.ClientMessages.noInternet;
         res.userMsg = res.errorMsg;
         res.recoverable = true;
         showWidgetContent();
         hideBusy();
		 setConnected(false);

         initOptions.onFailure(res);
    }
	
    function setConnected(isConnected) {
    	if (_isConnected !== isConnected) {
    		_isConnected = isConnected;
            WL.Utils.dispatchWLEvent(_isConnected ?  WL.Events.WORKLIGHT_IS_CONNECTED : WL.Events.WORKLIGHT_IS_DISCONNECTED);
    	}
    }
    
	var AdobeAir = {
		minimizeCommand : null,
		restoreCommand : null
	};
	
    function initAdobeAir(){
    	Event.observe(document.body, "mousedown", onAIRNativeMove.bindAsEventListener(this));
    	
        // Add Tray Icon and Menu
        var iconLoadComplete = function(event) {
            air.NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
        };
        var iconLoad = new air.Loader();
        var iconMenu = new air.NativeMenu();                                                               
        
        // Minimize Command
        AdobeAir.minimizeCommand = iconMenu.addItem(new air.NativeMenuItem(WL.ClientMessages.minimize));
        AdobeAir.minimizeCommand.addEventListener(air.Event.SELECT, function(event) {                    
            WL.Client.minimize();                    
        });

        // Restore Command
        AdobeAir.restoreCommand = iconMenu.addItem(new air.NativeMenuItem(WL.ClientMessages.restore));
        AdobeAir.restoreCommand.addEventListener(air.Event.SELECT, function(event) {
        	WL.Client.restore();         	                   
        });                

        // Exit Command                                
        var exitCommand = iconMenu.addItem(new air.NativeMenuItem(WL.ClientMessages.exit));
        exitCommand.addEventListener(air.Event.SELECT, function(event) {
        	if (WL.Client.onBeforeClose){
        		WL.Client.onBeforeClose();	
        	}
        	WL.Client.close();
        });                              

		// Restore the app if the desktop icon was clicked.
        air.NativeApplication.nativeApplication.addEventListener(air.InvokeEvent.INVOKE, function(event){       
            WL.Client.restore();
        });
		
		window.nativeWindow.addEventListener(air.NativeWindowDisplayStateEvent.DISPLAY_STATE_CHANGING, function(event) {                                 
            setMinimized(! isMinimized);            
		});				                                
        
        if (air.NativeApplication.supportsSystemTrayIcon) {
            iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
            iconLoad.load(new air.URLRequest(getAppProp(WL.AppProp.AIR_ICON_16x16_PATH)));
            air.NativeApplication.nativeApplication.icon.tooltip = getAppProp(WL.AppProp.APP_DISPLAY_NAME);
            air.NativeApplication.nativeApplication.icon.menu = iconMenu;
            air.NativeApplication.nativeApplication.icon.addEventListener(window.runtime.flash.events.MouseEvent.CLICK, function(event) {                                                                               	                         
                if(isMinimized) {                                     	  
            	    WL.Client.restore();
                } else {
                    WL.Client.minimize();
                }                
            });                             
        }
        if (air.NativeApplication.supportsDockIcon) {
            iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, iconLoadComplete);
            iconLoad.load(new air.URLRequest(getAppProp(WL.AppProp.AIR_ICON_128x128_PATH)));
            air.NativeApplication.nativeApplication.icon.menu = iconMenu;
        }  
        
        setMinimized(true);                 	
    }
    
    function setMinimized(isMini){
    	isMinimized = isMini;
		AdobeAir.minimizeCommand.enabled = !isMinimized;
		AdobeAir.restoreCommand.enabled = isMinimized;
	}
    
    // TODO check if this function is needed 
    function initDesktopAuth() {
        function onAuthenticationFailure(transport) {
        	// TODO - why?
            hideBusy();
            initOptions.onFailure(new WL.FailResponse(transport, initOptions.invocationContext));
        }
        
        function sendInitRequest() {
            new Ajax.WLRequest(REQ_PATH_INIT, {
                onSuccess : onInitSuccess,
                onFailure : onInitFailure,
                timeout : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
            });
        }

        // Sending a dummy request for a path that isn't double-cookie protected to
        // receive the cookies.
        new Ajax.WLRequest(REQ_PATH_AUTHENTICATE, {
            method: 'get',
            parameters: {action : 'test'},
            onSuccess: sendInitRequest,
            onFailure: onAuthenticationFailure,
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });
    }
    
    function onAuthStart(){
        isLoginActive = true;
        hideWidgetContent();        
        if (getEnv() === WL.Env.VISTA_SIDEBAR){
            if (!System.Gadget.docked){
                setAuthStyleOnBody();
                authPort.show();
            }
        }
        else {
             authPort.show();   
        }          
        
        hideBusy();
    }

    function onAuthEnd(){ 
    	if (! authPort){
    		return;
    	}       
        if (getEnv() !== WL.Env.VISTA_SIDEBAR || !System.Gadget.docked){
            showWidgetContent();
        }
        authPort.hide();
        isLoginActive = false;
    }
    
    /**
     * Activates a login on demand to the server or facebook.  
     * @param realm, type string or null. If null is passed the deployment 
     *        configured realm is used.            
     * @param options, type Options.
     */
    function login(realm, options) {
                                
        var loginDisplayType = getAppProp(WL.AppProp.LOGIN_DISPLAY_TYPE);            
        
        if (realm.startsWith('facebook')) {
            if (getEnv() === WL.Env.FACEBOOK) {
                loginDisplayType = WL.LoginDisplayType.FULLSCREEN;
            } 
            else {
                loginDisplayType = WL.LoginDisplayType.POPUP;                    
            }
        }

        switch (loginDisplayType) {
            case WL.LoginDisplayType.POPUP:
                handlePopupLogin();
                break;
            case WL.LoginDisplayType.EMBEDDED:
                handleEmbeddedLogin();
                break;
            case WL.LoginDisplayType.FULLSCREEN:
                handleFullscreenLogin();
                break;
        }
        
        // .................................... Handle Embedded Login .......................................
        function handleEmbeddedLogin() {

            function onEmbeddedLoginSuccess(transport) {            	
                // Login returns userInfo.
                Object.extend(userInfo, transport.responseJSON);                                
                options.onSuccess(new WL.Response(transport, options.invocationContext));                
            }

            function onEmbeddedLoginFailure(transport) {
                options.onFailure(new WL.FailResponse(transport, options.invocationContext));                
            }
                                    
            new Ajax.WLRequest(REQ_PATH_LOGIN, {
                method    : 'get',
                parameters: {realm: realm},
                onSuccess : onEmbeddedLoginSuccess,
                onFailure : onEmbeddedLoginFailure
            });
        }
        
        // .................................... Handle Popup Login .......................................
        function handlePopupLogin() {
            function isPollingDurationOver(){
                var currentTime = new Date();
                var ellapsedSecs = (currentTime.getTime() - loginCheckStartTime.getTime()) / 1000;
                 
                return ellapsedSecs > LOGIN_AUTH_CHECK_POLLING_DURATION_IN_SEC;
            }
            
            function onGetUserInfoSuccess(transport){
                Object.extend(userInfo, transport.responseJSON);
                if (WL.Client.isUserAuthenticated(realm)) {
                    loginCheckPeriodicalExecuter.stop();
                    loginCheckPeriodicalExecuter = null;
                    options.onSuccess(new WL.Response(transport, options.invocationContext));                    
                }
                else if (!(isDesktopEnvironment() && !isPollingDurationOver())){
                    loginCheckPeriodicalExecuter.stop();
                    loginCheckPeriodicalExecuter = null;                    
                    options.onFailure(new WL.FailResponse(transport, options.invocationContext));                    
                }
            }
                
            function onGetUserInfoFailure(transport){
                loginCheckPeriodicalExecuter.stop();    
                loginCheckPeriodicalExecuter = null;
                options.onFailure(new WL.FailResponse(transport, options.invocationContext));                
            }


            
            // In desktop cases we cannot poll on the window - we poll for 1 minute and check if 
            // the authentication status changed. If after 1 minute the user is still not 
            // authenticated, onFailure is called.
            function checkAuthStatus(){
                WL.Logger.debug("handlePopupLogin polling wlserver authStatus");                                        
                new Ajax.WLRequest(REQ_PATH_GET_USER_INFO, {                            
                    onSuccess : onGetUserInfoSuccess,
                    onFailure : onGetUserInfoFailure,
                    timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)                    
                });
            }
            
            loginCheckStartTime = new Date();
            
            var popupOptions = {
                width : getAppProp(WL.AppProp.LOGIN_POPUP_WIDTH), 
                height: getAppProp(WL.AppProp.LOGIN_POPUP_HEIGHT)
            };
            if (realm.startsWith('facebook')) {
                Object.extend(popupOptions, WL.FBRealmPopupOptions);
            }                             
            
            // If login is called while polling by previous login -
            // make sure we stop polling.
            if (loginCheckPeriodicalExecuter !== null){
                loginCheckPeriodicalExecuter.stop();
            }        
            var loginURL = WL.Utils.createAPIRequestURL(REQ_PATH_LOGIN) + "?" + 
                    REQ_PARAM_LOGIN_REALM + "=" + realm + "&" + 
                    REQ_PARAM_JSESSION_ID + "=" + WL.CookieManager.getJSessionID();
                    
            var loginPopupWindow = WL.App.openURL(
                loginURL, 
                "loginPopupWindow",
                "height=" + popupOptions.height + "," + 
                "width=" +  popupOptions.width + "," +
                "location=1,status=0,toolbar=0,resizable=0,scrollbars=0,menubar=0,screenX=100,screenY=100");
             
            // In web cases - we poll on the popup window to check if its closed.
            // When its closed we check if the authentication status for the realm 
            // changed. 
            function checkPopup() {                    
                if (loginPopupWindow !== null && loginPopupWindow.closed) {
                    new Ajax.WLRequest(REQ_PATH_GET_USER_INFO, {                            
                        onSuccess : onGetUserInfoSuccess,
                        onFailure : onGetUserInfoFailure,
                        timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
                    });                        
                }
            }
            
            if (isDesktopEnvironment()){
                loginCheckPeriodicalExecuter = new PeriodicalExecuter(
                    checkAuthStatus, 
                    LOGIN_AUTH_CHECK_POLLING_INTERVAL_IN_SEC);
            }
            else {
                loginCheckPeriodicalExecuter = new PeriodicalExecuter(
                    checkPopup, 
                    LOGIN_POPUP_CHECK_INTERVAL_IN_SEC);
            }
        }
        
        // .................................... Handle Fullscreen Login .......................................
        function handleFullscreenLogin() {
            window.top.location = REQ_PATH_LOGIN + "?" + REQ_PARAM_LOGIN_REALM + "=" + realm;
        }
    }

    function logout(realm) { 
    	realm = realm || getAppProp(WL.AppProp.LOGIN_REALM);       
        if (getAppProp(WL.AppProp.LOGIN_REALM) === realm && isLoginOnStartup()) {                
                
            if (WL.EnvProfile.isEnabled(WL.EPField.USES_AUTHENTICATOR)) {
                // Initiate Login
            	// TODO check if there's a need to call this obsolete function. Instead, call INIT directly here
                initDesktopAuth();
            }
            else {
                if (WL.Client.hasAppProperty(WL.AppProp.WELCOME_PAGE_URL)){
                    document.location.href = getAppProp(WL.AppProp.WELCOME_PAGE_URL);                
                } 
                else {
                    document.location.reload();
                }
            }
            gadgetProps = {};
            userInfo    = {};
            userPrefs   = {};            
        }
    }

    function sendHeartBeat() {

        new Ajax.WLRequest(REQ_PATH_HEART_BEAT, {
            onSuccess : function () {},
            onFailure : function () {},            
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });
    }

    function onWLShow() {
        if (Object.isFunction(WL.Client.onShow)) {
            WL.Client.onShow();
        }
    }

    function onWLHide() {
        if (Object.isFunction(WL.Client.onHide)) {
            WL.Client.onHide();
        }
    }

    function onWLDock() {
        if (authPort){    	
    	   authPort.hide();
        }    	        
        contentPort.hide();    	
        if (Object.isFunction(WL.Client.onDock)) {
            isDefaultDockActivated = false;
            WL.Client.onDock();
        } 
        else if (! isDefaultDockActivated){            
            defaultDockHandler();
            isDefaultDockActivated = true;
        }
    }

    function onWLUndock() {         
        if (isLoginActive) {
            setAuthStyleOnBody();            
        } 
        else {
            setContentStyleOnBody();
            contentPort.show();
        }

        if (! isDefaultDockActivated && Object.isFunction(WL.Client.onUndock)) {
        	// App is responsible only for cleanup
            WL.Client.onUndock();
        }
        else {
            isDefaultDockActivated = false; 
    	}

        // If the busy indicator is shown - hide and show it again, so that it will get the correct position
        if (busyIndicator && busyIndicator.isVisible()) {
            busyIndicator.hide();
            busyIndicator.show();
        }
        if (authPort){
            authPort.show();
        }                       
    }

    function defaultDockHandler() {        
        setDockStyleOnBody();        
    }
        
    function setStylePropertyOnElement(elm, style, property){
        if (!Object.isUndefined(style[property])) {
            elm.style[property] = style[property];
        }                
    }   
     
    function setVistaBodyStyle(style){
        // IMPORTANT: Width & Height must be set before background otherwise alfa-channel is broken.        
    	setStylePropertyOnElement(document.body, style, 'width');
        setStylePropertyOnElement(document.body, style, 'height');
        setStylePropertyOnElement(document.body, style, 'margin');
        setStylePropertyOnElement(document.body, style, 'padding');	
        // Support for background transparency in IE9
 		var isDocImage = style.backgroundImage.indexOf(getAppProp(WL.AppProp.VISTA_DOCK_IMAGE_PATH)) > 0;
 		var bgPathIndex =  isDocImage ? 4 : style.backgroundImage.lastIndexOf("///") + 3;
 		var bgPathSuffixIndex = isDocImage ? style.backgroundImage.indexOf(')') : style.backgroundImage.indexOf('")');
 		System.Gadget.background = (isDocImage ? "" : "../") + style.backgroundImage.substring (bgPathIndex,bgPathSuffixIndex);
    } 
    
    function clearBackgroundStyle(element){
        element.style.backgroundImage  = 'none';
        element.style.backgroundColor  = 'transparent';
        element.style.backgroundRepeat = 'no-repeat';        
    }    
    
    function setContentStyleOnBody(){
        if (vistaBodyStyleInContent === null){
	        vistaBodyStyleInContent = {};	        
	        vistaBodyStyleInContent.width            = getAppProp(WL.AppProp.WIDTH);
	        vistaBodyStyleInContent.height           = getAppProp(WL.AppProp.HEIGHT);
	        vistaBodyStyleInContent.backgroundImage  = contentPort.currentStyle.backgroundImage;
	        vistaBodyStyleInContent.backgroundColor  = contentPort.currentStyle.backgroundColor;
	        vistaBodyStyleInContent.backgroundRepeat = contentPort.currentStyle.backgroundRepeat;
	        vistaBodyStyleInContent.padding          = document.body.currentStyle.padding;
	        vistaBodyStyleInContent.margin           = document.body.currentStyle.margin;            	        
	        if (! Object.isUndefined(contentPort.currentStyle.backgroundAttachment)) {
	            vistaBodyStyleInContent.backgroundAttachment = contentPort.currentStyle.backgroundAttachment;
	        }
	        if (! Object.isUndefined(contentPort.currentStyle.backgroundPositionX)) {
	            vistaBodyStyleInContent.backgroundPositionX = contentPort.currentStyle.backgroundPositionX;
	        }
	        if (! Object.isUndefined(contentPort.currentStyle.backgroundPositionY)) {
	            vistaBodyStyleInContent.backgroundPositionY = contentPort.currentStyle.backgroundPositionY;
	        }
            
            // Must remove these properties from the content element.  
	        contentPort.style.backgroundImage  = 'none';
	        contentPort.style.backgroundColor  = 'transparent';
	        contentPort.style.backgroundRepeat = 'no-repeat';
        }
        setVistaBodyStyle(vistaBodyStyleInContent);
    } 
    
    function setAuthStyleOnBody(){
        if (vistaBodyStyleInAuth === null){
	        vistaBodyStyleInAuth = {};
	        vistaBodyStyleInAuth.width            = authPort.currentStyle.width;
	        vistaBodyStyleInAuth.height           = authPort.currentStyle.height;  
	        vistaBodyStyleInAuth.backgroundImage  = authPort.currentStyle.backgroundImage;
	        vistaBodyStyleInAuth.backgroundColor  = authPort.currentStyle.backgroundColor;
	        vistaBodyStyleInAuth.backgroundRepeat = authPort.currentStyle.backgroundRepeat;
	        vistaBodyStyleInAuth.padding          = document.body.currentStyle.padding;
	        vistaBodyStyleInAuth.margin           = document.body.currentStyle.margin;            	        
	        if (! Object.isUndefined(authPort.currentStyle.backgroundAttachment)) {
	            vistaBodyStyleInAuth.backgroundAttachment = authPort.currentStyle.backgroundAttachment;
	        }
	        if (! Object.isUndefined(authPort.currentStyle.backgroundPositionX)) {
	            vistaBodyStyleInAuth.backgroundPositionX = authPort.currentStyle.backgroundPositionX;
	        }
	        if (! Object.isUndefined(authPort.currentStyle.backgroundPositionY)) {
	            vistaBodyStyleInAuth.backgroundPositionY = authPort.currentStyle.backgroundPositionY;
	        }
            
            // Must remove these properties from the auth element.  
	        authPort.style.backgroundImage  = 'none';
	        authPort.style.backgroundColor  = 'transparent';
	        authPort.style.backgroundRepeat = 'no-repeat';
        }
        setVistaBodyStyle(vistaBodyStyleInAuth);            
    }    
    
    function setDockStyleOnBody(){
        if (vistaBodyStyleInDock === null){
	        vistaBodyStyleInDock = {
	            width   : getAppProp(WL.AppProp.VISTA_DOCK_IMAGE_WIDTH) + 'px',
	            height  : getAppProp(WL.AppProp.VISTA_DOCK_IMAGE_HEIGHT) + 'px',
	            margin  : '0',
	            padding : '0',        
	            backgroundImage      : 'url(' + getAppProp(WL.AppProp.VISTA_DOCK_IMAGE_PATH) + ')',
	            backgroundColor      : 'transparent',
	            backgroundRepeat     : 'no-repeat',
	            backgroundPositionX  : 'center',
	            backgroundPositionY  : 'center'
	        };                            
        }
        setVistaBodyStyle(vistaBodyStyleInDock);
    }              
	
    function hideWidgetContent() {
    	contentPort.hide();
        hideBusy();
        // Android native elements              
    	if (WL.OptionsMenu){
            WL.OptionsMenu.setVisible(false);
    	}
        if (WL.TabBar){
            WL.TabBar.setVisible(false);
        }
    }

    function showWidgetContent() {
	  
		// Android native elements
		// TODO we currently display the native elements ignoring their previous states.              
        if (WL.optionsMenu){
            WL.optionsMenu.setVisible(true);  
        }
        if (WL.TabBar){
      		WL.TabBar.setVisible(true);
        }
        
        if (getEnv() === WL.Env.VISTA_SIDEBAR && 
            !System.Gadget.docked) {
            // In Vista undocked - when the authentication has finished - restore the body style properties
            setContentStyleOnBody();
            contentPort.show();            
        }
        else {
            contentPort.show();
        }                
    }

    function hideBusy() {
        if (busyIndicator && busyIndicator.isVisible() || WL.EnvProfile.isEnabled(WL.EPField.USES_PHONEGAP)) {
            busyIndicator.hide();
        }
    }

    function showBusy() {
        if (busyIndicator && !busyIndicator.isVisible()) {
            busyIndicator.show();
        }
    }
                
    function initResizeHandler() {
        Event.observe(document.onresize ? document : window, "resize", onResizeGadget);
        onResizeGadget();
    }
         
    function getBlockingDiv() {
        if (blockingDiv === null) {
            blockingDiv = new Element('div', {'id' : 'blockOuter', 'class' : 'hide'});
            var blockingDivContent = new Element('div', {'id' : 'blockInner'});
            blockingDiv.appendChild(blockingDivContent);
            document.body.appendChild(blockingDiv);
        }
        return blockingDiv;
    }

    function showBlockingDiv(isShow, zIndex) {
        var div = getBlockingDiv();
        if (isShow) {
            div.className = 'show';
            if (zIndex) {
                div.style.zIndex = zIndex;
            }
        } 
        else {
            div.className = 'hide';
            div.style.zIndex = '';
            setBlockingDivContent(null);
        }
    }

    function setBlockingDivContent(content) {
        var div = getBlockingDiv();
        if (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        if (content !== null) {
            div.appendChild(content);
        }
    }

    function onResizeGadget() {
    	if (document.viewport.getWidth() == undefined || // In mobile web viewport width is undefined. 
    		document.viewport.getWidth() >= initOptions.minAppWidth) {
            showBlockingDiv(false);
        } 
        else {
            var divContent = document.createTextNode(WL.ClientMessages.expandWindow);
            setBlockingDivContent(divContent);
            showBlockingDiv(true);
        }
    }

    function onAIRNativeMove(e) {
        var scrollableTags = ['DIV','UL'];
        var element = e.element();
        
        // Currently, scrollers only appear in DIVs        
        if (scrollableTags.indexOf(element.tagName) > -1) {
            var css = document.defaultView.getComputedStyle(element, null);
            var styleOverflow  = css === null ? '' : css.overflow;
            var styleOverflowY = css === null ? '' : css.overflowY;
            var styleOverflowX = css === null ? '' : css.overflowX;
            
            // When clicking on the scrollbar the overflow is always 'auto' and not 'visible'
            if (styleOverflow === 'auto' || styleOverflowY === 'auto' || styleOverflowX === 'auto' ||
                styleOverflow === 'scroll' || styleOverflowY === 'scroll' || styleOverflowX === 'scroll') {
                return;
            }        
        } // Allow selecting content of text box 
        else if (element.tagName === 'INPUT' && element.type === 'text') {
            return;
        }
        window.nativeWindow.startMove();
    }

    function getUserInfoValue(key, realm) {
        var value = null;
        if (!realm) {
            realm = getAppProp(WL.AppProp.LOGIN_REALM);
        }
        if (typeof userInfo[realm] !== 'undefined') {
            value = (userInfo[realm])[key];
        }
        else {
            WL.Logger.error("Unknown realm [" + realm + "]. null returned for key: " + key);
        }
        return value;
    }
    
    function showDialog(title, messageText, allowReload) {
    	var buttons = [];
    	if (allowReload) {
    		buttons.push({text:WL.ClientMessages.reload, handler:function(){
    				WL.Client.reloadApp();
    			}});
    	}
    	if (WL.App.close) {
    		buttons.push({text:WL.ClientMessages.exit, handler:function(){
    				WL.App.close();
            	}});
    	}
    	
        WL.SimpleDialog.show(title, messageText, buttons);
    }
    
    /*
     * Extends the async method options with default options.
     * Default options are added if missing but do not override existing options.
     */
    function extendWithDefaultOptions(options){
        return WL.Utils.extend(options || {}, defaultOptions);        
    }
    
    function replaceGadgetMessages() {
    	if (initOptions.messages){
    		WL_I18N_MESSAGES = initOptions.messages;
    	} else if (typeof Messages != 'undefined'){
    		WL_I18N_MESSAGES = Messages;
    	}
    	
        if (! WL_I18N_MESSAGES) {
        	WL.Logger.debug("Application doesnt define a i18n messages object, skipping translation.");
            return;
        }
        // Replace all the text in the gadget with the appropriate i18n text
        WL.Utils.replaceElementsText();
    }
    
    function isDesktopEnvironment() {
        return WL.EnvProfile.isEnabled(WL.EPField.DESKTOP);
    }
    
    function getEnv(){
    	return WL.StaticAppProps.ENVIRONMENT;
    }
    
    function isIOSEnv(){
    	return WL.EnvProfile.isEnabled(WL.EPField.ISIOS);
    }
    
    function getAppProp(key){
        return gadgetProps[key] || WL.StaticAppProps[key];
    }
    
    function onEnvInit(options) {
        if (contentPort === null || typeof contentPort == "undefined") {
            throw new Error("Missing element with 'content' id in the html.");
        }  
        // Must override the prototype hide/show to override the css' display:none.
        contentPort.show = function () {
        	
        	// Fix for Webkit bug: form controls are not reacting after content .hide() .show().
        	// The workaround is to add some whitespace to the div.
        	if (WL.Client.getEnvironment() === WL.Env.ANDROID){
        		contentPort.insert("<!-- -->");
        	}
        	
            contentPort.style.display = 'block';
        };
        contentPort.hide = function(){
            contentPort.style.display = '';
        };            
        
        replaceGadgetMessages();          
        
        if (WL.BrowserDetect.isExplorer && WL.BrowserDetect.version == '6'){                        
            var unsupportedBrowserResponse = new WL.Response({}, options.invocationContext);
            unsupportedBrowserResponse.errorCode = WL.ErrorCode.UNSUPPORTED_BROWSER;                                        
            unsupportedBrowserResponse.errorMsg  = WL.Utils.formatString(WL.ClientMessages.browserIsNotSupported, WL.BrowserDetect.browser + ' ' + WL.BrowserDetect.version);
            unsupportedBrowserResponse.userMsg = unsupportedBrowserResponse.errorMsg;
            showWidgetContent();
            initOptions.onFailure(unsupportedBrowserResponse);
            return;
        }
        
        if (initOptions.showLogger) {
            WL.Logger.__init(DIV_ID_CONTENT);                
        }
        
        WL.Logger.debug('wlclient init started');

    	// if container was not defined in the busyOptions - send null (so that the whole viewport/body will be used)
       	busyIndicator = new WL.BusyIndicator(initOptions.busyOptions ? initOptions.busyOptions.container : null, initOptions.busyOptions);
        showBusy();

        Ajax.WLRequest.options.timeout = initOptions.timeout;
        Ajax.WLRequest.setConnected = setConnected.bind(this);

        if (getAppProp(WL.AppProp.APP_LOGIN_TYPE) !== WL.AppLoginType.NO_LOGIN) {
        	var authenticator = null;
        	if (initOptions.authenticator){
        		authenticator = initOptions.authenticator;
        	} 
        	else if (typeof Authenticator !== 'undefined'){
        		authenticator = Authenticator;
        	}            	
        	if (authenticator === null){
        		WL.Logger.error('Authenticator is undefined.');            		
        		throw new Error('Authenticator is undefined.');
        	}
            Ajax.WLRequest.options.onAuthentication = WL.AuthHandler.handleAuth;
            Ajax.WLRequest.options.isAuthResponse   = WL.AuthHandler.isAuthResponse;
            WL.AuthHandler.initialize(
            	authenticator,	
                showBusy, 
                hideBusy, 
                onAuthStart,
                onAuthEnd);            
                
        	authPort = $('auth');
        	if (!authPort){
        		throw new Error("Missing element with 'auth' id in the HTML.");
        	}
            // Must override the prototype hide/show to override the css' display:none.
            authPort.show = function () {
                authPort.style.display = 'block';
            };
            authPort.hide = function(){
                authPort.style.display = '';
            };            
        	
            authenticator.init();
        }
        WL.CookieManager.init(
            getAppProp(WL.AppProp.APP_DISPLAY_NAME), 
            getAppProp(WL.AppProp.ENVIRONMENT), 
            getAppProp(WL.AppProp.IID),
            getAppProp(WL.AppProp.COOKIE_ENCRYPT_KEY));
            
		if (!WL.CookieManager.areCookiesEnabled()){
			var disabledCookiesResponse = new WL.Response({}, options.invocationContext);
            disabledCookiesResponse.errorCode = WL.ErrorCode.DISABLED_COOKIES;                                        
            disabledCookiesResponse.errorMsg  = WL.Utils.formatString(WL.ClientMessages.cookiesAreDisabled);
            disabledCookiesResponse.userMsg   = disabledCookiesResponse.errorMsg;
            showWidgetContent();
            initOptions.onFailure(disabledCookiesResponse);
            return;				
		}
        switch (getEnv()) {
            case WL.Env.OSX_DASHBOARD:
                widget.onshow = onWLShow;
                widget.onhide = onWLHide;
                break;
            case WL.Env.VISTA_SIDEBAR:
                System.Gadget.onUndock = onWLUndock;
                System.Gadget.onDock   = onWLDock;
                if (System.Gadget.docked) {
                	isDefaultDockActivated = false;
                    onWLDock();
                }
                else {
                	isDefaultDockActivated = true;
                    onWLUndock();
                }
                break;
            case WL.Env.ADOBE_AIR:                                    
                initAdobeAir();
                break;
            default:
                break;
        }
    };
    
    // ................ Public API methods .....................

    // ...... API variables ......
    
    /**
	 * Note: This method is only applicable to widgets running on Apple OS X
	 * Dashboard.
	 * 
	 * Widgets running on Apple OS X Dashboard can be shown or hidden by
	 * pressing F12 on the Apple computer keyboard. Developers of OS X Dashboard
	 * widgets are instructed to stop any background processing while the
	 * widgets are hidden.
	 * 
	 * To specify the app's behavior on showing and hiding it, provide an
	 * implementation for the WL.Client.onShow and WL.Client.onHide methods.
	 * Neither of these methods should receive any parameters.
	 */
    this.onShow  = null;

    /**
	 * Note: This method is only applicable to widgets running on Apple OS X
	 * Dashboard.
	 * 
	 * Widgets running on Apple OS X Dashboard can be shown or hidden by
	 * pressing F12 on the Apple computer keyboard. Developers of OS X Dashboard
	 * widgets are instructed to stop any background processing while the
	 * widgets are hidden.
	 * 
	 * To specify the app's behavior on showing and hiding it, provide an
	 * implementation for the WL.Client.onShow and WL.Client.onHide methods.
	 * Neither of these methods should receive any parameters.
	 */
    this.onHide  = null;

    /**
	 * Note: This method is only applicable to widgets running in Vista Sidebar.
	 * 
	 * To specify the app's behavior on docking and undocking, provide an
	 * implementation for the WL.Client.onDock and WL.Client.onUndock callback
	 * functions. Neither of these methods should receive any parameters.
	 */
    this.onDock  = null;

    /**
	 * Note: This method is only applicable to widgets running in Vista Sidebar.
	 * 
	 * To specify the app's behavior on docking and undocking, provide an
	 * implementation for the WL.Client.onDock and WL.Client.onUndock callback
	 * functions. Neither of these methods should receive any parameters.
	 */
    this.onUndock= null;
    
    /**
	 * Note: This method is only applicable to widgets running in Adobe Air.
	 * 
	 * To specify the app's behavior on before close, provide an
	 * implementation for the WL.Client.onBeforeClose callback functions
	 * Neither of these methods should receive any parameters.
	 */
    this.onBeforeClose = null;

    /**
     * Initializes the Application. The method must before the WL.Client can be activated.
     * The call must be placed at the HTML body onload event.
     * @param options, hash; possible attributes:
     *                 onSuccess, function : The gadget implementation initializing function.
     *                 onFailure, function :        
     *                 timeout, int        : The default server callback timeout.  
     *                 showLogger, boolean : Enables the logger dialog when TRUE or DISABLES when FALSE                    
     *                 minAppWidth, int    : The minimum application width. If the gadget is minimized 
     *                                       below this width, a "please expand" message is displayed.
     *                 busyOptions         : WL.BusyIndicator options object (see WL.BusyIndicator for details).  
     */
    this.init = function (options) {	
    	WL.Validators.enableValidation();
    	WL.Validators.validateOptions({
            onSuccess : 'function', 
            onFailure : 'function',
            onConnectionFailure : 'function',
            showLogger: 'boolean',
            timeout   : 'number',
            minAppWidth: 'number',
            heartBeatIntervalInSecs : 'number',
            onUnsupportedVersion : 'function',
    		onRequestTimeout     : 'function',
    		onUnsupportedBrowser : 'function',
    		onDisabledCookies    : 'function',
    		onUserInstanceAccessViolation : 'function',
    		onErrorAppVersionAccessDenial : 'function',
            authenticator : 'object',
            messages : 'object',
            busyOptions: 'object',
            validateArguments: 'boolean'}, options, "WL.Client.init");
            
        initOptions.timeout = getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS);
        
        Object.extend(initOptions, options);
        initOptions.validateArguments ? WL.Validators.enableValidation(): WL.Validators.disableValidation();
        WL.EnvProfile.initialize(getEnv());
       
    	contentPort = $(DIV_ID_CONTENT);         
    	
    	var connectOptions = {
    			onSuccess : onInitSuccess.bind(this),
    			onFailure : function(){
					hideBusy(); 
					initOptions.onFailure.apply(this, arguments);
					}.bind(this),
    			timeout : initOptions.timeout
    	};
    	

    	
        // iOS + android devices have to wait for:
        // 1) Phonegap to initialize and fire the 'deviceready' event
        // 2) The webkit database storage to load the stored cookies and username
        // 3) internet reachability
    	if (WL.EnvProfile.isEnabled(WL.EPField.USES_PHONEGAP)) {
    		// Windows Phone 7.5 does not support custom events
    		if (WL.Client.getEnvironment() === WL.Env.WINDOWS_PHONE){
				Event.observe (document, __WL.InternalEvents.REACHABILITY_TEST_FAILURE, onMobileConnectivityCheckFailure.bind(this));
				// Once the connectivity test succeeds continue with eviroment init
				Event.observe (document, __WL.InternalEvents.REACHABILITY_TEST_SUCCESS, this.connect.bind(this, connectOptions));
    		} else {
		       	 document.addEventListener(__WL.InternalEvents.REACHABILITY_TEST_FAILURE, onMobileConnectivityCheckFailure.bind(this), false);
		         // Once the connectivity test succeeds continue with eviroment init
		         document.addEventListener(__WL.InternalEvents.REACHABILITY_TEST_SUCCESS, this.connect.bind(this, connectOptions), false);
    		}
			
             var phonegapInit = function(event) {
             	onEnvInit(options);
                WL.Utils.wlCheckReachability();
             }; 
             // TODO make more robust - attach the event listener first, and then check the Phongap.ready
             // in some conditions PhoneGap can initialize itself and fire the "Deviceready" event before 
             // the code below has a chance to execute.
             if (PhoneGap.available) {
            	 phonegapInit();
             } else {
         		// Windows Phone 7.5 does not support custom events
         		if (WL.Client.getEnvironment() === WL.Env.WINDOWS_PHONE){
         			Event.observe (document, "deviceready", phonegapInit.bind(this));
         		} else {
         			document.addEventListener("deviceready", phonegapInit.bind(this), false);
         		}
             }
             
        } else if (getEnv() == WL.Env.BLACKBERRY) {
        		//TODO: Add check to playbook
        		if (typeof worklight != "undefined" && !worklight.utils.hasInternetConncetion()) {
                    onMobileConnectivityCheckFailure();
            	} else {
            		onEnvInit(options);
            		this.connect(connectOptions);
            	}
        } else {
        		onEnvInit(options);
        		this.connect(connectOptions);
        }
    };

    this.connect = function (options) {
        WL.Validators.validateOptions({
            onSuccess: 'function', 
            onFailure: 'function',
            timeout  : 'number'}, options, 'WL.Client.connect');                
        
        if (isConnecting) {
        	WL.Logger.error("Cannot invoke WL.Client.connect while it is already executing.");
        	if (options && options.onFailure) {
        		options.onFailure();
        	}
        	
        	return;
        }
        
        options = extendWithDefaultOptions(options);
        
        var timeout = getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS);
        if (!Object.isUndefined(options.timeout)) {
            timeout = options.timeout;
        }

        function onConnectSuccess(transport) {
            userInfo    = transport.responseJSON.userInfo;
            gadgetProps = transport.responseJSON.gadgetProps;
            userPrefs   = transport.responseJSON.userPrefs;

            // save the login name in the local storage
            switch (getEnv()) {
                case WL.Env.BLACKBERRY:                 
                    if (isLoginOnStartup()) {
                    	if (typeof localStorage != "undefined") {
                    		__WL.LocalStorage.setValue(WL.UserInfo.USER_NAME, WL.Client.getLoginName());
                    	} else {
                    		__WL.blackBerryPersister.store(WL.UserInfo.USER_NAME, WL.Client.getLoginName());
                    	}
                    }
                    break;
                case WL.Env.IPHONE:                 
                case WL.Env.IPAD:                 
                case WL.Env.ANDROID: 
                	if (isLoginOnStartup()) {
                		__WL.LocalStorage.setValue(WL.UserInfo.USER_NAME, WL.Client.getLoginName());
                	}
                    break;
            }

            // for desktop environments, display the update version dialog.
            if (WL.EnvProfile.isEnabled(WL.EPField.DESKTOP) && 
                getAppProp(WL.AppProp.LATEST_VERSION) > getAppProp(WL.AppProp.APP_VERSION)) {

                var response = new WL.Response({}, initOptions.invocationContext);
                response.errorCode     = WL.ErrorCode.UNSUPPORTED_VERSION;
                response.appVersion    = getAppProp(WL.AppProp.APP_VERSION);
                response.latestVersion = getAppProp(WL.AppProp.LATEST_VERSION);
                response.downloadAppURL= WL.AppProp.DOWNLOAD_APP_LINK;            
                response.errorMsg      = WL.Utils.formatString(
                    WL.ClientMessages.upgradeGadget, 
                    response.appVersion, 
                    response.latestVersion);
                response.userMsg = response.errorMsg;
                if (initOptions.onUnsupportedVersion) {
                	initOptions.onUnsupportedVersion(response);
                } else {
                	options.onFailure(response);
                }
                return;
            }

            if (initOptions.heartBeatIntervalInSecs && initOptions.heartBeatIntervalInSecs > 0 && !heartBeatPeriodicalExecuter){
    	        // Start heartbeat polling.
    	        heartBeatPeriodicalExecuter = new PeriodicalExecuter(sendHeartBeat, initOptions.heartBeatIntervalInSecs);
    		}
            
            WL.Logger.debug('wlclient connect success');
            isConnecting = false;
            
            // if a new inner application version is ready on server - upgrade inner app
			if (WL.EnvProfile.isEnabled(WL.EPField.SUPPORT_DIRECT_UPDATE_FROM_SERVER)) {
				if (isUpdateRequired(gadgetProps.CHECKSUM)){					
					hideBusy();					
					showUpdateConfirmDialog();		            	            	
           	 	} else {
	            	document.observe('foreground', updateOnForegroundIfRequired);
            		options.onSuccess(transport);            	
            	}
			} else {
            	options.onSuccess(transport);            	
			}
        }
        
        function showUpdateConfirmDialog(){        	
			WL.SimpleDialog.show(WL.ClientMessages.directUpdateNotificationTitle, WL.ClientMessages.directUpdateNotificationMessage, [
          	    {text:WL.ClientMessages.update, handler:WL.App.update},
          		{text:WL.ClientMessages.exit, handler:WL.App.close}
          	]);
        }

        function isUpdateRequired(checksum){
        	return checksum != WL_CHECKSUM.checksum; 
        }
        
        function updateOnForegroundIfRequired(){
        	if (WL.Client.isConnected()){
	        	new Ajax.WLRequest(REQ_PATH_GET_APP_UPDATES, {
	        		method: 'get',
	                parameters: {action : 'getchecksum'},
	                onSuccess : updateOnForeground,
	                timeout : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
	            });
        	}
        }
        
        function updateOnForeground(transport){
        	if (isUpdateRequired(transport.responseJSON.checksum)){
        		showUpdateConfirmDialog();
        	}
        }

        function onInitFailure(transport) {
            showWidgetContent();
            isConnecting = false;  
            options.onFailure(new WL.FailResponse(transport));
        }
        
        function onAuthenticationFailure(transport) {                        
            onAuthEnd();            
            isConnecting = false; 
			options.onFailure(new WL.FailResponse(transport));
        }

        function processRuleMessage(transport){
        	if (typeof transport != "undefined" && typeof transport.responseJSON.message != "undefined") {
        		var message = transport.responseJSON.message;
        		var messageType = transport.responseJSON.messageType;
        		if (messageType == MESSEGE_TYPE_NOTIFY) {
        			if (getEnv() == WL.Env.BLACKBERRY){
            			alert (WL.ClientMessages.notificationTitle + ": " + message);
            			sendInitRequest();
            		} else {
            			// the sendInitRequest is in the callback because the dialog is async
            			WL.SimpleDialog.show(WL.ClientMessages.notificationTitle, message, [{text: WL.ClientMessages.close, handler:sendInitRequest}]);
            		}
        		} else if (messageType == MESSEGE_TYPE_BLOCK) {
        			if (__WL.TerminatorDialog) {
            			__WL.TerminatorDialog.show(WL.ClientMessages.applicationDenied, message, WL.ClientMessages.exitApplication);	
            			hideBusy();
        			}
        		}
        	} else {
        		sendInitRequest();
        	}
        }
        
        function sendInitRequest() {
			showBusy();
            new Ajax.WLRequest(REQ_PATH_INIT, {
                onSuccess : onConnectSuccess.bind(this),
                onFailure : onInitFailure.bind(this),
                timeout : timeout
            });
        }
        
        isConnecting = true;
        
    	if (!WL.EnvProfile.isEnabled(WL.EPField.WEB)){
            // Sending a dummy request for a path that isnt double-cookie protected to
            // receive the cookies.
            new Ajax.WLRequest(REQ_PATH_AUTHENTICATE, {
                method: 'get',
                parameters: {action : 'test'},
                onSuccess: processRuleMessage.bind(this),
                onFailure: onAuthenticationFailure.bind(this),
                timeout  : timeout
            });
        } else {
            sendInitRequest();
        }
    	
    };    
 

    /**
     * An asynchronous function. Logs in to a specific realm.
     * 
     * @param 	realm Optional. A realm that defines how the login process is performed.
     * 			Specify NULL to log in to the resource realm assigned to the app when it was deployed.
     * 			Note: To log in to Facebook, the realm must be a realm which uses a Facebook authenticator, and therefore its name must start with "facebook.".
     * @param options Optional. A standard options object.
     */
    this.login = function (realm, options){
        WL.Validators.validateArguments([
            WL.Validators.validateStringOrNull,                 
            WL.Validators.validateOptions.curry({
                onSuccess : 'function', 
                onFailure : 'function',
                timeout   : 'number'})], arguments, "WL.Client.login");
            
        options = extendWithDefaultOptions(options);
        var isFacebookRealm = realm ? realm.startsWith('facebook.') : false;
        var isNoLogin = WL.AppLoginType.NO_LOGIN === getAppProp(WL.AppProp.APP_LOGIN_TYPE); 
        if (isNoLogin && ! isFacebookRealm){
            throw new Error("Realm argument can only be a facebook realm ('facebook.*') for application that does not require login.");
        }
        if (realm === null) {            
            realm = getAppProp(WL.AppProp.LOGIN_REALM);
        }
        else if (!isFacebookRealm && realm !== getAppProp(WL.AppProp.LOGIN_REALM)){
            throw new Error("Realm argument can only be a facebook realm ('facebook.*') or the application's authentication realm '" + getAppProp(WL.AppProp.LOGIN_REALM) + "'.");                
        }
        
        login(realm, options);  
    };
                    
    /**         
     * Invalidates the current session (via the server).
     * 
     * @param options, type: Options
     */
    this.logout = function (realm, options) {
        WL.Validators.validateArguments([
            WL.Validators.validateStringOrNull,                 
            WL.Validators.validateOptions.curry({
                onSuccess : 'function', 
                onFailure : 'function',
                timeout   : 'number'})], arguments, 'WL.Client.logout');
                    
        options = extendWithDefaultOptions(options);

        function onLogoutSuccess(transport) {
            (userInfo[realm])[WL.UserInfo.IS_USER_AUTHENTICATED] = false;  
            if (getAppProp(WL.AppProp.LOGIN_REALM) === realm && heartBeatPeriodicalExecuter) {
	        	// stop sending heart beats
	            heartBeatPeriodicalExecuter.stop();
	            heartBeatPeriodicalExecuter = null;					
			}                              
            var logoutResponse = new WL.Response(transport, options.invocationContext);
            logoutResponse.response = transport;
        	options.onSuccess(logoutResponse);
        	logout(realm);
        }

        function onLogoutFail(transport) {                
            options.onFailure(new WL.FailResponse(transport, options.invocationContext));                
        }
		
		realm = realm || getAppProp(WL.AppProp.LOGIN_REALM);
        if (!realm){
            throw new Error("Invalid call for WL.Client.logout. Realm must be specified for unsecured applications.");
        }
        
        new Ajax.WLRequest(REQ_PATH_LOGOUT, {
            parameters: {realm : realm},
            onSuccess : onLogoutSuccess,
            onFailure : onLogoutFail
        });
    };

    /**
     * Returns a user pref value by its key or null if one is not 
     * defined.  
     * @param prefKey, type string
     *          
     * @return user preference value, type: string or null 
     */
    this.getUserPref = function (key) {            
        WL.Validators.validateArguments(['string'], arguments, 'WL.Client.getUserPref');                    
        return userPrefs[key] || null;
    };
    
    /**
	 * An asynchronous function. Creates a new user preference, or updates the
	 * value of an existing user preference, as follows:
	 * <ul>
	 * <li>If a user preference with the specified user key is already defined,
	 * the user preference value is updated.
	 * <li>If there is no user preference defined with the specified key, a new
	 * user preference is created with the specified key and value. However, if
	 * there are already 100 preferences, preference will be created, and the
	 * method's failure handler will be called.
     * </ul>
	 * 
	 * @param key Mandatory. The user preference key.
	 * @param value Mandatory. The value of the user preference.
	 * @param options Optional. A standard {@link options} object.
	 */
    this.setUserPref = function (key, value, options){            
        var userPrefsHash = {};
        userPrefsHash[key] = value;
        WL.Client.setUserPrefs(userPrefsHash, options);            
    };
    
    /**
     * Updates the server with the current user prefs.
     * Make sure you call this method after setting or removing user prefs -
     * otherwise the changes will be lost in the next session.
     *     
     * @param key, type string          
     */
    this.setUserPrefs = function (userPrefsHash, options) {
        WL.Validators.validateArguments([
            'object', 
            WL.Validators.validateOptions.curry({
                onSuccess: 'function', 
                onFailure: 'function',
                invocationContext : function(){}})], arguments, 'WL.Client.setUserPrefs');
        
        options = extendWithDefaultOptions(options);
        
        function onStoreSuccess(transport) {  
            Object.extend(userPrefs, userPrefsHash);              
            options.onSuccess(new WL.Response(transport, options.invocationContext));                
        }
        function onStoreFailure(transport) {                
            options.onFailure(new WL.FailResponse(transport, options.invocationContext));                
        }
                              
        var userPrefsJSON = Object.toJSON(userPrefsHash);
        new Ajax.WLRequest(REQ_PATH_SET_USER_PREFS, {
            parameters: {userprefs : userPrefsJSON},
            onSuccess : onStoreSuccess,
            onFailure : onStoreFailure,
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });
    };

    this.deleteUserPref = function (key, options){
        WL.Validators.validateArguments([
            'string', 
            WL.Validators.validateOptions.curry({
                onSuccess: 'function', 
                onFailure: 'function'})], arguments, 'WL.Client.deleteUserPref');
            
        options = extendWithDefaultOptions(options);
        
        function onDeleteSuccess(transport) {                
            delete userPrefs[key];
            options.onSuccess(new WL.Response(transport, options.invocationContext));                
        }
        function onDeleteFailure(transport) {                
            options.onFailure(new WL.FailResponse(transport, options.invocationContext));                
        }
        new Ajax.WLRequest(REQ_PATH_DELETE_USER_PREF, {
            parameters: {userprefkey : key},
            onSuccess : onDeleteSuccess.bind(this),
            onFailure : onDeleteFailure,
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });            
    };
    
    /**
     * Verifies if the user pref key exists.   
     * @param key, type string
     *          
     * @return type boolean: true if exists. 
     */
    this.hasUserPref = function (key) {
        WL.Validators.validateArguments(['string'], arguments, 'WL.Client.hasUserPref');
        return (key in userPrefs);
    };
    
    this.getAppProperty = function(propKey) {             
        WL.Validators.validateArguments(['string'], arguments, 'WL.Client.getAppProperty');
        return getAppProp(propKey);
    };
    
    this.hasAppProperty = function (key) {
        WL.Validators.validateArguments(['string'], arguments, 'WL.Client.hasAppProperty');            
        return (key in gadgetProps) || (key in WL.StaticAppProps);
    };

    this.getEnvironment = function() {
        return getEnv();
    };

    /**
	 * Used to report user activity for auditing or reporting purposes.
	 * <p>
	 * The Worklight server maintains a separate database table to store app
	 * statistics for each day of the week. The tables are named gadget_stat_n,
	 * where n is a number from 1 to 7 which identifies the day of the week. The
	 * method adds a user- specified log line to the relevant table.
	 * 
	 * @param activityType Mandatory. A string that identifies the activity.
	 */
    this.logActivity = function (activityType) {
        WL.Validators.validateArguments(['string'], arguments, 'WL.Client.logActivity');            
        function onMySuccess(transport) {
            WL.Logger.debug("Activity [" + activityType + "] logged successfully.");
        }
        function onMyFailure(transport) {
            WL.Logger.error("Activity [" + activityType + "] logging failed.");
        }
        new Ajax.WLRequest(REQ_PATH_LOG_ACTIVITY, {
            parameters : {activity : activityType},
            onSuccess : onMySuccess,
            onFailure : onMyFailure,
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });
    };
    
    /**
	 * Updates the userInfo data with latest server information. The method was
	 * added as a workaround for identifying backend authentication failures;
	 * After procedure failure, the application can activate and the test the
	 * auth status using WL.Client.isUserAuthenticated(...)
	 */
    this.updateUserInfo = function (options) {
        WL.Validators.validateOptions({
            onSuccess: 'function', 
            onFailure: 'function'}, options, 'WL.Client.validateOptions');
       
        options = extendWithDefaultOptions(options);
        
        function onUpdateUserInfoSuccess(transport){
            Object.extend(userInfo, transport.responseJSON);
            options.onSuccess(new WL.Response(transport, options.invocationContext));
        }            

        function onUpdateUserInfoFailure(transport, msg){
            options.onFailure(new WL.FailResponse(transport, options.invocationContext));
        }            

        new Ajax.WLRequest(REQ_PATH_GET_USER_INFO, {
            onSuccess : onUpdateUserInfoSuccess,
            onFailure : onUpdateUserInfoFailure,
            timeout   : getAppProp(WL.AppProp.WLCLIENT_TIMEOUT_IN_MILLIS)
        });             
    };
    
    this.getUserInfo = function(realm, key){
        WL.Validators.validateArguments([WL.Validators.validateStringOrNull, 'string'], arguments, 'WL.Client.getUserInfo');
        return getUserInfoValue(key, realm);
    };
    
    /**
	 * Returns the logged-in user name or NULL if unknown. The user identity can
	 * be know by the server but NOT authenticated in case a Persistent Cookie
	 * is used. Use method isUserAuthenticated() to verify.
	 */
    this.getUserName = function (realm) {
        WL.Validators.validateStringOrNull(realm, 'WL.Client.getUserName');
        return getUserInfoValue(WL.UserInfo.USER_NAME, realm);
    };

    /**
	 * Returns the login name of the currently logged in user or NULL if unknown
	 * The loginName is used to by the iPhone native application to inject the
	 * last logged in username when the gadget starts-up
	 * @deprecated
	 */
    this.getLoginName = function(realm) {
        WL.Validators.validateStringOrNull(realm, 'WL.Client.getLoginName');
        return getUserInfoValue(WL.UserInfo.LOGIN_NAME, realm);
    };

    /**
     * Returns TRUE if the user is authenticated to the given realm.
     * If no realm is supplied will check the gadget server realm.
     */
    this.isUserAuthenticated = function(realm) {
        WL.Validators.validateStringOrNull(realm, 'WL.Client.isUserAuthenticated');
        var isAuth = getUserInfoValue(WL.UserInfo.IS_USER_AUTHENTICATED, realm);

        // userInfo properties are passed as strings.
        return !! parseInt(isAuth || 0, 10);
    };   
    
    /**
	 * Invokes a procedure exposed by a Worklight adapter.
	 * 
	 * @param invocationData
	 *            Mandatory. A JSON block of parameters. <br>
	 *            <code>{<br>
	 *            adapter : adapter-name.wlname,<br>
	 *            procedure : adapter-name.procedure-name.wlname,<br>
	 *            parameters : [],<br>
	 *            }</code>
	 *            
	 * @param options Optional. Parameters hash.
	 */
    this.invokeProcedure = function (invocationData, options) {
        
        WL.Validators.validateOptions({
            adapter   : 'string',
            procedure : 'string',
            parameters: 'object'}, invocationData, 'WL.Client.invokeProcedure');
            
        WL.Validators.validateOptions({
            onSuccess: 'function', 
            onFailure: 'function',
            invocationContext: function(){},
            onConnectionFailure: 'function',
            timeout  : 'number'}, options, 'WL.Client.invokeProcedure');                
        
        options = extendWithDefaultOptions(options);
        function onInvokeProcedureSuccess(transport) {
            if (! transport.responseJSON.isSuccessful){
                var failResponse = new WL.Response(transport, options.invocationContext);
                failResponse.errorCode = WL.ErrorCode.PROCEDURE_ERROR;
                failResponse.errorMsg = WL.ClientMessages.serverError; 
                failResponse.invocationResult = transport.responseJSON;
                if (failResponse.invocationResult.errors){
                    failResponse.errorMsg += " " + failResponse.invocationResult.errors;
                }
                options.onFailure(failResponse); 
            }
            else {
                var response = new WL.Response(transport, options.invocationContext);
                response.invocationResult = transport.responseJSON;
                options.onSuccess(response);
            }
        }

        function onInvokeProcedureFailure(transport) {
        	var errorCode = transport.responseJSON.errorCode;
        	if (options.onConnectionFailure && 
        		(errorCode == WL.ErrorCode.UNRESPONSIVE_HOST || errorCode == WL.ErrorCode.REQUEST_TIMEOUT)) {
        		options.onConnectionFailure (new WL.FailResponse(transport, options.invocationContext));
        	} else {
        		options.onFailure(new WL.FailResponse(transport, options.invocationContext));
        	}
        }

        // Build request options from invocationData
        var requestOptions = {
            onSuccess : onInvokeProcedureSuccess,
            onFailure : onInvokeProcedureFailure
        };
        
        if (!Object.isUndefined(options.timeout)) {
            requestOptions.timeout = options.timeout;
        }
        
        requestOptions.parameters = {};
        requestOptions.parameters.adapter = invocationData.adapter;
        requestOptions.parameters.procedure = invocationData.procedure;
        if (invocationData.parameters) {
            requestOptions.parameters.parameters = Object.toJSON(invocationData.parameters);
        }
        new Ajax.WLRequest(REQ_PATH_BACKEND_QUERY, requestOptions);
    };
    
    /**
     * Fetchs an HTML or XML from a given URL (3rd party host). 
     * Applications should use to bypass the single origin constraint of javascript XML.
     * - The user must be authenticated before the app can use the method.
     * - The content is returned in the response.responseXML or response.responseText       
     * - Valid hosts must be listed in conf/proxy_domains_whitelist.txt
     *   Each line in the file contains a single host name example: www.cnn.com
     * 
     * @param url - a URL. Must start with http://  
     * @param options (custom only): 
     *     isXML - if true, responseXML is set with content, otherwise responseText. 
     */
    this.makeRequest = function(url, options) {
        WL.Validators.validateArguments([
            'string', 
            WL.Validators.validateOptions.curry({
                onSuccess : 'function', 
                onFailure : 'function',
                timeout   : 'number',
                isXml     : 'boolean'})], arguments, 'WL.Client.makeRequest');
        
        options = extendWithDefaultOptions(options);            

        function onFetchXMLSuccess(transport) {
            var response = new WL.Response(transport, options.invocationContext);
            response.responseXML = transport.responseXML;
            options.onSuccess(response);
        }

        function onFetchTextSuccess(transport) {
            var response = new WL.Response(transport, options.invocationContext);
            response.responseText = transport.responseText;
            options.onSuccess(response);
        }

        function onFetchFailure(transport) {
            options.onFailure(new WL.FailResponse(transport, options.invocationContext));
        }

        var onSuccessCallback = options.isXml ? onFetchXMLSuccess : onFetchTextSuccess;
        var myoptions = {
            method : "get",
            parameters: {url : url},
            onSuccess : onSuccessCallback,
            onFailure : onFetchFailure,             
            evalJSON  : false
        };
        if ('timeout' in options){
            myoptions.timeout = options.timeout;
        }
        new Ajax.WLRequest(REQ_PATH_PROXY, myoptions);
    };

    this.close = function () {
        if (getEnv() === WL.Env.ADOBE_AIR){
            air.NativeApplication.nativeApplication.icon.bitmaps = [];
            var activeWindows = air.NativeApplication.nativeApplication.openedWindows;
            for (var i = 0; i < activeWindows.length; i++) {
                activeWindows[i].close();
            }
            air.NativeApplication.nativeApplication.exit();
            WL.Logger.debug("App closed");
        }            
    };

    this.minimize = function () {
        if (getEnv() === WL.Env.ADOBE_AIR) {
            var activeWindows = air.NativeApplication.nativeApplication.openedWindows;
	        for (var i = 0; i < activeWindows.length; i++) {
	        	if (getAppProp(WL.AppProp.SHOW_IN_TASKBAR)){
	        		activeWindows[i].minimize();	
	        	}
	        	else {
	            	activeWindows[i].visible = false;
	        	}
	        }   
	        setMinimized(true);             
            WL.Logger.debug("App minimized");                
        }            
    }; 
    
    this.restore = function () {
        if (getEnv() === WL.Env.ADOBE_AIR) {
            var activeWindows = air.NativeApplication.nativeApplication.openedWindows;
            for (var i = 0; i < activeWindows.length; i++) {
                if (getAppProp(WL.AppProp.SHOW_IN_TASKBAR)){
                    activeWindows[i].restore();    
                }
                else {
                    activeWindows[i].activate();
                }
            }
            setMinimized(false);                
            WL.Logger.debug("App restored");                
        }            
    };

    /**
	 * Reloads the application.
	 * <p>
	 * Note: The Apple OS X Dashboard does not allow a app to automatically
	 * reload. Therefore, in this environment, the reloadApp method displays a
	 * dialog box telling the user how to manually reload the app.
	 */
    this.reloadApp = function() {
        switch (getEnv()) {
            case WL.Env.OSX_DASHBOARD:
                WL.SimpleDialog.show(WL.ClientMessages.osxReloadGadget,
                		WL.ClientMessages.osxReloadGadgetInstructions,[{text:"OK"}]);
                break;
            case WL.Env.YAHOO_WIDGETS:
                Konfabulator.reloadWidget();
                break;
            default:
                document.location.reload();
                break;
        }
    };
    
    /**
     * @deprecated Use WL.Device.getNetworkInfo(callbackFunction) to check connectivity.
     * Look for isNetworkConnected in callbackFunction's network info parameter.
     */
    this.isConnected = function() {
    	return !!_isConnected;
    };
    
	this.setHeartBeatInterval = function(newIntervalInSecs) {
		initOptions.heartBeatIntervalInSecs = newIntervalInSecs;
    	
    	if (heartBeatPeriodicalExecuter) {
    		heartBeatPeriodicalExecuter.stop();
    		heartBeatPeriodicalExecuter = null;
    	}
    	
        if (initOptions.heartBeatIntervalInSecs > 0){
	        heartBeatPeriodicalExecuter = new PeriodicalExecuter(sendHeartBeat, initOptions.heartBeatIntervalInSecs);
		}
    };
};

__WL.prototype.Client = new __WLClient;
WL.Client = new __WLClient;
