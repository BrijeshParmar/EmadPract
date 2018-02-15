
/* JavaScript content from common/js/containerCommunicationAPI.js in Common Resources */
/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/* Copyright (C) Worklight Ltd. 2006-2012.  All rights reserved. */

// The wrapper is created by the descriptor which is environment specific.
var ContainerCAPI = function() {

    // initialization of the lastMessage var, will contain the last message sent in the hash, used in
    // checkUrl()
    // used only by the wrapper, can change in the future
    var lastMessage = '';
    var iid = '';

    // check if browser support postMessage. if not supportMessaging = false else supportMessaging = true
    var supportMessaging = false;

    // queryString(key, searchIn) is used to parse messages
    function getQueryParamValue(key, searchIn) {
	key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + key + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(searchIn);
	if (results == null) {
	    return null;
	} else {
	    return decodeURIComponent(results[1]);
	}
    }

    // parseMessage(message) parse the messge and send it to the wrapper
    // used only by the wrapper, can change in the future
    function parseMessage(message) {
	// check that in the URL path there is the iid
	if (message.indexOf(iid) < 0) { // // the iid is set in the wrapper
	    // alert('Error! message sent without iid \n iid:' + iid + ' message: ' + message); // Removed the
	    // alert since when opening the gadget does not have an iid
	    return; 
	}

	var title = getQueryParamValue('title', message);
	if (title !== null) {
	    setTitle(title);
	}

	var height = getQueryParamValue('height', message);
	if (height !== null) {
	    setHeight(height);
	}

	var iframeHeight = getQueryParamValue('iframeHeight', message);
	if (iframeHeight !== null) {
	    setIframeHeight(iframeHeight);
	}

	var setPreferenceKey = getQueryParamValue('setPreferenceKey', message);
	if (setPreferenceKey !== null) {
	    var setPreferenceValue = getQueryParamValue('setPreferenceValue', message);
	    setPreference(setPreferenceKey, setPreferenceValue);
	}

	var getPreferenceKey = getQueryParamValue('getPreference', message);
	if (getPreferenceKey !== null) {
	    getPreference(getPreferenceKey);
	}
    }

    // receiveMessage(e) is the handler for the listener if the browser supports postMessage
    function receiveMessage(e) {
	parseMessage('#' + e.data);
    }

    // checkUrl() is used by the wrapper to check the iFrame created inside the gadgets iFrame
    // since the wrapper and the iFrame created inside the gadget are in the same domain we can read the inner
    // iFrame hash
    // used in browsers that do not support postMessage
    // used only by the wrapper, can change in the future
    // wrapped in try/catch because only the gadget create the frames[0].frames[0]
    function checkUrl() {
	try {
	    if (window.frames[0].frames[0].location.hash !== lastMessage) {
		lastMessage = window.frames[0].frames[0].location.hash;
		parseMessage(lastMessage);
	    }
	} catch (e) {
	}
    }

    return {
	// Public methods:

	// init() runs on page load, can be called from the wrapper
	init : function(gadgetIID) {
	    iid = gadgetIID;
	    try {
		supportMessaging = typeof postMessage !== 'undefined' || document.postMessage;
	    } catch (e) {
	    }

	    // Required by Netvibes and Live:
	    var iframeElement = document.getElementById("worklight_iframe");
	    if (iframeElement !== null) {
		iframeElement.src = gadgetIframeURL; // gadgetIframeURL supplied by the wrapper
	    }

	    if (supportMessaging) {
		if (window.addEventListener) {
		    window.addEventListener("message", receiveMessage, false);
		} else if (window.attachEvent) {
		    window.attachEvent("onmessage", receiveMessage);
		}
	    } else {
		setInterval(checkUrl, 1000);
	    }
	}

    }; // End of return (public methods).
}();
