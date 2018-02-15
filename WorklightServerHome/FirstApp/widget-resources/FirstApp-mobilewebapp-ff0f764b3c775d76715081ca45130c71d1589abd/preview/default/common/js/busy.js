
/* JavaScript content from common/js/busy.js in Common Resources */
/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

function getBusyOverlay(parent, overlayOptions, busy) {
	var win, overlay, busy, wlBusyTitle, viewportWidth, viewportHeight, busyWidth, busyHeight;
	// create busy elements
	win = WLJSX.newElement('<div/>', {
	    'id' : 'WLbusyContainer'
	});

	overlay = WLJSX.newElement('<div/>', {
	    'id' : 'WLbusyOverlay'
	});

	busy = WLJSX.newElement('<div/>', {
	    'id' : 'WLbusy'
	});

	wlBusyTitle = WLJSX.newElement('<h1/>', {
	    'id' : 'WLbusyTitle'
	});

	WLJSX.html(wlBusyTitle, overlayOptions.text);

	WLJSX.prepend(busy, wlBusyTitle);

	WLJSX.prepend(win, overlay);
	WLJSX.append(win, busy);

	// append busy to content
	WLJSX.prepend(parent, win);

	// position the busy in the middle of the screen
	//viewportWidth = WLJSX.getViewportWidth();
	//viewportHeight = WLJSX.getViewportHeight();
	
	// position the busy in the middle of the parent element
	viewportWidth = WLJSX.width(parent);
	viewportHeight = WLJSX.height(parent);
	
	busyWidth = WLJSX.width(busy);
	busyHeight = WLJSX.height(busy);

	WLJSX.css(busy, {
	    left : viewportWidth / 2 - busyWidth / 2 + 'px',
	    top : viewportHeight / 2 - busyHeight / 2 + 'px'
	});
	
	return true;
}
