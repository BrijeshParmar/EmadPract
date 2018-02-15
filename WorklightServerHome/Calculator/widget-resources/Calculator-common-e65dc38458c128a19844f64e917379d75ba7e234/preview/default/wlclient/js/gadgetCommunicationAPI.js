
/* JavaScript content from wlclient/js/gadgetCommunicationAPI.js in Common Resources */
/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/* Copyright (C) Worklight Ltd. 2006-2012.  All rights reserved. */

// Gadget Communication API Module (Singleton).
var GadgetCAPI = function() {

    var iFrameUrl = '';
    var iid = '';
    var initialized = false;

    // check if browser support postMessage. if not supportMessaging = false else supportMessaging = true
    var supportMessaging = false;

    try {
	supportMessaging = typeof postMessage != 'undefined' || document.postMessage;
    } catch (e) {
    }

    // sendMessage(message) sends the message via postMessage or the hash depending on browser support
    function sendMessage(message) {
	if (!initialized) {
	    WL.Logger.debug("GadgetCAPI not initialized.");
	    throw "GadgetCAPI not initialized.";
	}
	if (supportMessaging) {
	    var target = undefined;
	    try {
		if (parent.postMessage) {
		    target = parent;
		} else if (parent.document.postMessage) {
		    target = parent.document;
		}
	    } catch (e) {
	    }
	    WL.Logger.debug("GadgetCAPI.sendMessage using postMessage. Message: " + 'iid=' + iid + '&' + message);
	    target.postMessage('iid=' + iid + '&' + message, '*');
	} else {
	    if (!WLJSX.$('empty_iframe')) {
		GadgetCAPI.initInsideGadget();
	    }
	    WL.Logger.debug("GadgetCAPI.sendMessage using iFrame. URL: " + iFrameUrl + '#iid=' + iid + '&' + message);
	    window.frames['empty_iframe'].location.href = iFrameUrl + '#iid=' + iid + '&' + message;
	}
    }

    return {

	// Public Methods:
	init : function(gadgetIID) {
	    iid = gadgetIID;
	    if (!supportMessaging) {
		var params = WLJSX.String.toQueryParams('' + window.location);
		if (params.parent !== 'undefined') {		   
		    iFrameUrl = params.parent + '?view=home&url=http://myworklight.com/';
		    var iFrame = document.createElement('iframe');
		    iFrame.height = 0;
		    iFrame.width = 0;
		    iFrame.style.height = '0';
		    iFrame.style.width = '0';
		    iFrame.style.border = 'none';
		    iFrame.src = iFrameUrl;
		    iFrame.name = 'empty_iframe';
		    iFrame.id = 'empty_iframe';
		    document.body.appendChild(iFrame);
		    initialized = true;
		} else {
		    WL.Logger.debug("Error: parent query parameter is not available for gadgetCAPI");
		    initialized = false;
		}
	    } else {
		initialized = true;
	    }
	    if (initialized) {
		WL.Logger.debug("GadgetCAPI initialized");
	    }
	},

	setTitle : function(title) {
	    sendMessage('title=' + title);
	},

	setHeight : function(height) {
	    sendMessage('height=' + height + '&iframeHeight=' + height);
	},

	setContainerPref : function(key, value) {
	    sendMessage('setPreferenceKey=' + key + '&setPreferenceValue=' + value);
	},

	getContainerPref : function(key) {
	    sendMessage('getPreference=' + key);
	}

    }; // End Return clause (public methods).
}();
