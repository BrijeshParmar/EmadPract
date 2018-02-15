/*
* Licensed Materials - Property of IBM
* 5725-I43 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/


/**
 * @class
 * @ilog.undocumented.jsFile
 * @ilog.undocumented.constructor
 * @name WL.Geo
 */
__WLGeo = function() {
		
	/**
	 * Calculates the distance between two coordinates.
	 * <p>
	 * The distance between two coordinates is calculated. The result is returned in meters, using a spherical model of the Earth.
	 * </p>	 
	 * @param {object} coordinate1 The first coordinate.
	 * @param {number} coordinate1.longitude The longitude, as a decimal number.
	 * @param {number} coordinate1.latitude The latitude, as a decimal number.
	 * @param {object} coordinate2 The second coordinate. 
	 * @param {number} coordinate2.longitude The longitude, as a decimal number.
	 * @param {number} coordinate2.latitude The latitude, as a decimal number.
	 * @methodOf WL.Geo#
	 */	
	this.getDistanceBetweenCoordinates = function(coordinate1, coordinate2) {};
	
	//-------------------------------------------------------------------------------------------
	// Circle related functions 
	
	/**
	 * Calculates the distance of a coordinate from a circle.
	 * 
	 * 
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {object} circle The circle. 
	 * @param {number} circle.longitude The longitude of the circle's center, as a decimal number.
	 * @param {number} circle.latitude The latitude of the circle's center, as a decimal number.
	 * @param {number} circle.radius  The radius, in meters.
	 * @param {object} [options] Optional parameters.
	 * @param {object} [options.bufferZoneWidth] The buffer zone width is measured in meters. It enlarges the radius of the circle by this amount. Negative values make the circle smaller. The default value is 0.
	 * @returns The distance, in meters, to the circle, taking into account the buffer zone. The distance is positive for coordinates outside the circle, and negative for coordinates within the circle.
	 * @methodOf WL.Geo#
	 */	
	 this.getDistanceToCircle = function(coordinate, circle, options) {};
	
	/**
	 * Returns a Boolean value based on whether a coordinate lies within a circle, based on a given level of confidence.
	 * 
	 * 
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {number} [coordinate.accuracy]  The accuracy of the coordinate. The default value is 0.
	 * @param {object} circle The circle. 
	 * @param {number} circle.longitude The longitude of the circle's center, as a decimal number.
	 * @param {number} circle.latitude The latitude of the circle's center, as a decimal number.
	 * @param {number} circle.radius  The radius, in meters.
	 * @param {object} [options] Optional parameters.
	 * @param {string} [options.confidenceLevel] Has three possible values:
	 *            		<ul>
	 *            			<li><code>low</code> -  The coordinate lies within the circle. Accuracy is not taken into account.</li>
	 *            			<li><code>medium</code> -  The coordinate lies within the circle at approximately a 70% confidence interval. Accuracy is taken into account.</li>
	 *            			<li><code>high</code> -  The coordinate lies within the circle at approximately a 95% confidence interval. Accuracy is taken into account.</li>            		
	 *            		</ul>
	 *            		<br>
	 *            		The default value is <code>low</code>.
	 * @param {object} [options.bufferZoneWidth] The buffer zone width is measured in meters. It enlarges the radius of the circle by this amount. Negative values make the circle smaller. The default value is 0.
	 * @returns The value <code>true</code> is returned if the coordinate lies within the circle, at the given level of confidence. The dimensions of the circle used in this check incorporate any changes specified for the <code>options.bufferZoneWidth</code> parameter.
	 * @methodOf WL.Geo#
	 */	
	this.isInsideCircle = function(coordinate, circle, options) {};
	
	/**
	 * Returns a Boolean value based on whether a coordinate lies outside of a circle, based on a given level of confidence.
	 * 
	 * 
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {number} [coordinate.accuracy]  The accuracy of the coordinate. The default value is 0.
	 * @param {object} circle The circle. 
	 * @param {number} circle.longitude The longitude of the circle's center, as a decimal number.
	 * @param {number} circle.latitude The latitude of the circle's center, as a decimal number.
	 * @param {number} circle.radius  The radius, in meters.
	 * @param {object} [options] Optional parameters.
	 * @param {string} [options.confidenceLevel] Has three possible values:
	 *            		<ul>
	 *            			<li><code>low</code> -  The coordinate lies outside the circle. Accuracy is not taken into account.</li>
	 *            			<li><code>medium</code> -   The coordinate lies outside the circle at approximately a 70% confidence interval. Accuracy is taken into account.</li>
	 *            			<li><code>high</code> -   The coordinate lies outside the circle at approximately a 95% confidence interval. Accuracy is taken into account.</li>            		
	 *            		</ul>
	 *            		<br>
	 *            		The default value is <code>low</code>.
	 * @param {object} [options.bufferZoneWidth] The buffer zone width is measured in meters. It enlarges the radius of the circle by this amount. Negative values make the circle smaller. The default value is 0.
	 * @returns The value <code>true</code> is returned if the coordinate lies outside the circle, at the given level of confidence. The dimensions of the circle used in this check incorporate any changes specified for the <code>options.bufferZoneWidth</code> parameter.
	 * @methodOf WL.Geo#
	 */		
	this.isOutsideCircle = function(coordinate, circle, options) {};
	
	
	//-------------------------------------------------------------------------------------------
	// Polygon related functions 
	/**
	 * Calculates the distance of a coordinate from a polygon.
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {object[]} polygon The <code>polygon</code> parameter consist of an array of coordinates. Each coordinate has the following properties:
	 *            <ul>
	 *            	<li><code>longitude</code> -  The longitude, as a decimal number.</li>
	 *            	<li><code>latitude</code> -  The  latitude, as a decimal number.</li>            	
	 *            </ul>     
	 * @param {object} [options] Optional parameters.
	 * @param {number} [options.bufferZoneWidth]  The buffer zone width is measured in meters. It increases the size of the polygon in all directions by this amount. Negative values decrease the polygon's size. The default value is 0.
	 * @returns The distance, in meters, to the polygon, taking into account the buffer zone. The distance is positive for coordinates outside the polygon, and negative for coordinates within the polygon.
	 * @methodOf WL.Geo#
	 */	
	this.getDistanceToPolygon = function(coordinate, polygon, options) {};
	

	/**
	 * Returns a Boolean value based on whether a coordinate lies within a polygon, based on a given level of confidence.
	 * 
	 * 
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {number} [coordinate.accuracy]  The accuracy of the coordinate. The default value is 0.
	 * @param {object[]} polygon The <code>polygon</code> parameter consist of an array of coordinates. Each coordinate has the following properties:
	 *            <ul>
	 *            	<li><code>longitude</code> -  The longitude, as a decimal number.</li>
	 *            	<li><code>latitude</code> -  The latitude, as a decimal number.</li>            	
	 *            </ul>     
	 * @param {object} [options] Optional parameters.
	 * @param {string} [options.confidenceLevel] Has three possible values:
	 *            		<ul>
	 *            			<li><code>low</code> -  The coordinate lies within the polygon. Accuracy is not taken into account.</li>
	 *            			<li><code>medium</code> -   The coordinate lies within the polygon at approximately a 70% confidence interval. Accuracy is taken into account.</li>
	 *            			<li><code>high</code> -   The coordinate lies within the polygon at approximately a 95% confidence interval. Accuracy is taken into account.</li>            		
	 *            		</ul>
	 *            		<br>
	 *            		The default value is <code>low</code>.
	 * @param {number} [options.bufferZoneWidth]  The buffer zone width is measured in meters. It increases the size of the polygon in all directions by this amount. Negative values decrease the polygon's size. The default value is 0.
	 * @returns The value <code>true</code> is returned if the coordinate lies within the polygon, at the given level of confidence. The dimensions of the polygon used in this check incorporate any changes specified for the <code>options.bufferZoneWidth</code> parameter.
	 * @methodOf WL.Geo#
	 */	
	this.isInsidePolygon = function(coordinate, polygon, options) {};
	
	/**
	 * Returns a Boolean value based on whether a coordinate lies outside a polygon, based on a given level of confidence.
	 * 
	 * 
	 * @param {object} coordinate The coordinate.
	 * @param {number} coordinate.longitude The longitude, as a decimal number.
	 * @param {number} coordinate.latitude The latitude, as a decimal number.
	 * @param {number} [coordinate.accuracy]  The accuracy of the coordinate. The default value is 0.
	 * @param {object[]} polygon The <code>polygon</code> parameter consist of an array of coordinates. Each coordinate has the following properties:
	 *            <ul>
	 *            	<li><code>longitude</code> -  The longitude, as a decimal number.</li>
	 *            	<li><code>latitude</code> -  The  latitude, as a decimal number.</li>            	
	 *            </ul>     
	 * @param {object} [options] Optional parameters.
	 * @param {string} [options.confidenceLevel] Has three possible values:
	 *            		<ul>
	 *            			<li><code>low</code> -  The coordinate lies outside the polygon. Accuracy is not taken into account.</li>
	 *            			<li><code>medium</code> -   The coordinate lies outside the polygon at approximately a 70% confidence interval. Accuracy is taken into account.</li>
	 *            			<li><code>high</code> -   The coordinate lies outside the polygon at approximately a 95% confidence interval. Accuracy is taken into account.</li>            		
	 *            		</ul>
	 *            		<br>
	 *            		The default value is <code>low</code>.
	 * @param {number} [options.bufferZoneWidth]  The buffer zone width is measured in meters. It increases the size of the polygon in all directions by this amount. Negative values decrease the polygon's size. The default value is 0.
	 * @returns The value <code>true</code> is returned if the coordinate lies outside the polygon, at the given level of confidence. The dimensions of the polygon used in this check incorporate any changes specified for the <code>options.bufferZoneWidth</code> parameter.
	 * @methodOf WL.Geo#
	 */		
	this.isOutsidePolygon = function(coordinate, polygon, options) {};
};

__WL.prototype.Geo = new __WLGeo;

WL.Geo = new __WLGeo;




/**
 * @class
 * @ilog.undocumented.jsFile
 * @ilog.undocumented.constructor
 * @name WL.Device.Geo
 */	
__WLDeviceGeo = function() {
	/** 
	 * Acquires a geographical position.
	 * @description <p>
	 * The device attempts to acquire a geographical position. This attempt could be based on geo-location data acquired by the device, or it could involve the use of WiFi. If the attempt is successful, the following actions take place:
	 * <ul>
	 * <li>The device context might be updated. This action is dependent on the freshness of the data in the context, and the new position data being at least as accurate as the existing position data.</li>
	 * <li>The <code>onSuccess</code> function is invoked.</li>
	 * <li>If the device context was updated, triggers might be activated.</li></ul>
	 * </p>
	 * <p>
	 * @note {Note} Because acquirePosition might activate triggers, you should not call <code>acquirePosition</code> from a trigger callback. 
	 * 		Potentially, this could cause an endless loop of trigger evaluations leading to callbacks leading to <code>acquirePosition</code> calls.
	 * @see For more information about the permissions that are required for Android, iOS, and Windows Phone 8, see the IBM Worklight client-side API topic in the product documentation.
	 * </p>
	 * @param {function} onSuccess A callback function that is invoked when a position is acquired successfully. The position is passed as a parameter to the callback function and is described in the <a href="http://www.w3.org/TR/geolocation-API/#position_interface">W3C Geolocation specification</a>. Note that the
	 * 					<code>timestamp</code> property is represented as the number of milliseconds that has elasped since Jan 1, 1970.
	 * @param {function} onFailure A callback function that is invoked if the acquisition fails.<p>The callback function receives a PositionError parameter, as described in the <a href="http://www.w3.org/TR/geolocation-API/#position_error_interface">W3C Geolocation specification</a>.</p>
	 * @param {object} [options] Options that are used during the acquisition configuration process.
	 * @param {number} [options.timeout] The number of milliseconds spent waiting for each reading. If this amount of time elapses before a reading is obtained, the <code>onFailure</code> function is called. By default the timeout interval is infinite.
	 * @param {boolean} options.enableHighAccuracy  A Boolean value indicating whether it is possible to obtain high-accuracy measurements, for example by using GPS.
	 * @param {object} [options.highAccuracyOptions] When <code>options.enableHighAccuracy</code> is true, this property may specify additional parameters.
	 * @param {number} [options.highAccuracyOptions.desiredAccuracy] An integer value that gives the required accuracy in meters. A higher <code>desiredAccuracy</code> value could result in power savings. 
	 *                									For example, the platform might choose to use a WiFi or Network-based approach to determining the position, instead of GPS.
	 * @param {number} [options.highAccuracyOptions.iOSBestAccuracy] The value can be <code>WL.Device.Geo.IOS_BEST_ACCURACY</code> or <code>WL.Device.Geo.IOS_BEST_ACCURACY_FOR_NAVIGATION</code>. If <code>iOSBestAccuracy</code> is present, it overrides the <code>desiredAccuracy</code> setting.
	 *                See iOS Accuracy constants:
	 *                <a href="https://developer.apple.com/library/mac/#documentation/CoreLocation/Reference/CoreLocationConstantsRef/Reference/reference.html#//apple_ref/c/data/kCLLocationAccuracyBest">kCLLocationAccuracyBest</a>
	 *                and <a href="https://developer.apple.com/library/mac/#documentation/CoreLocation/Reference/CoreLocationConstantsRef/Reference/reference.html#//apple_ref/c/data/kCLLocationAccuracyBestForNavigation">KCLLocationAccuracyBestForNavigation</a></li>
	 * @param {number} [options.maximumAge] A time, measured in milliseconds. A cached position is returned for the first acquisition, if the age of that position is less than the specified <code>maximumAge</code> value.
	 *					<br>A higher <code>maximumAge</code> value can result in previously acquired positional data being used. This saves power, but the trade-off is that the data is not as fresh.

	 * @note {Note} The <code>options</code> parameter is different from the <code>policy</code> parameter that is passed to the <code>WL.Device.startAcquisition</code> function.
	 *   If <code>aPolicy</code> is the <code>policy</code> parameter for <code>WL.Device.startAcquisition</code>, then <code>aPolicy.Geo</code> would be the options object that could be passed to this API.</p>
	 * @methodOf WL.Device.Geo#
	 * */
	this.acquirePosition = function(onSuccess, onFailure, options){};
			
	/**
	 * This constant should be used to configure best accuracy on iOS.
	 * @memberOf WL.Device.Geo#
	 */
	this.IOS_BEST_ACCURACY = -1;
	
	/**
	 * This constant should be used to configure best accuracy for navigation on iOS
	 * (which is even more accurate than IOS_BEST_ACCURACY).
	 * This setting should only be used when plugged in.
	 * @memberOf WL.Device.Geo#
	 */
	this.IOS_BEST_ACCURACY_FOR_NAVIGATION = -2;
};

/**
 * @class Each method returns a geo policy. You can modify the returned object before using it in the WL.Device.startAcquisition or WL.Device.Geo.acquirePosition APIs.
 * @ilog.undocumented.jsFile
 * @ilog.undocumented.constructor
 * @name WL.Device.Geo.Profiles
 */	
__WLDeviceGeoProfiles = function() {
	/**
	 * Returns a profile to use for accurately tracking devices.
	 * @description The object returned can be freely modified.
	 * The object returned is:<pre><code>
	 *    {
	 *       enableHighAccuracy:false,
	 *       minChangeTime: 300000, //5 minutes
	 *       minChangeDistance: 1000, // 1Km
	 *       maximumAge: 300000  //5 minutes
	 *    }</code></pre>
	 * @methodOf WL.Device.Geo.Profiles#
	 */
	this.PowerSaving = function() {};
	
	/**
	 * Returns a profile which roughly tracks devices, representing.
	 * @description a trade-off between accuracy and power use.
	 * The object returned can be freely modified.
	 * The object returned is:<pre><code>
	 *    {
	 *       enableHighAccuracy:true,
	 *       highAccuracyOptions: {
	 *          desiredAccuracy: 200  //meters
	 *       },
	 *       minChangeTime: 30000, //30 seconds
	 *       minChangeDistance: 50, // meters
	 *       maximumAge: 60000  //60 seconds
	 *    }</code></pre>
	 * @methodOf WL.Device.Geo.Profiles#
	 */
	this.RoughTracking = function() {}; 
	
	/**
	 * Returns a profile to use for accurately tracking devices.
	 * @description The object returned can be freely modified.
	 * The object returned is:<pre><code>
	 *    {
	 *       enableHighAccuracy:true,
	 *	     highAccuracyOptions: {
	 *          iOSBestAccuracy: WL.Device.Geo.IOS_BEST_ACCURACY
	 *       },
	 *       maximumAge: 0 
	 *    }</code></pre>
	 * @methodOf WL.Device.Geo.Profiles#					
	 */
	this.LiveTracking = function() {};
};	

/**
 * @class
 * @ilog.undocumented.jsFile
 * @ilog.undocumented.constructor
 * @name WL.Device.Wifi
 */	
__WLDeviceWifi = function () {

	 /**
	 * Acquires the currently visible access points. This API function is available only for Android. 
	 * @description <p>
	 * The device attempts to acquire the currently visible access points. If the attempt is successful, and ongoing WiFi acquisition is enabled (using WL.Device.startAcquistion), the following actions take place:
	 *  	<ol> 
	 * 			<li> The device context is updated.</li> 
	 *  		<li> An <code>onSuccess</code> callback is performed. </li>
	 * 			<li>Triggers are activated.</li></ol>
	 * If there is no ongoing WiFi acquisition, only the <code>onSuccess</code> callback function is called.
	 * </p>
	 * <p>
	 * @note {Note} Because <code>acquireVisibleAccessPoints</code> might activate triggers, you must be careful when calling <code>acquireVisibleAccessPoints</code> from a trigger callback. 
	 * 				Potentially, this could cause an endless loop of trigger evaluations leading to callbacks leading to <code>acquireVisibleAccessPoints</code> calls.
	 *</p>
	 * @see For more information about the permissions that are required for Android, see the IBM Worklight client-side API topic in the product documentation.	 
	 * @param {function} onSuccess A callback function that is invoked when the visible access points are acquired successfully. The appropriate WiFi access points array, filtered according to the provided policy setting, is passed as a parameter to this function.
	 * @param {function} onFailure A callback function that is invoked if the acquisition is unsuccessful. The callback function receives a numeric code, and one of the following values:
	 * 					<ul>
	 * 						<li>WL.Device.Wifi.PERMISSION: There is a permissions problem.</li>
	 * 						<li>WL.Device.Wifi.DISABLED: The wifi on the device is turned off.</li>
	 * 						<li>WL.Device.Wifi.FAILED_START_SCAN: The device failed to start scanning. It is recommended that you try again after a few seconds.</li>
	 * 					</ul> 
	 * @param {object} wifiPolicy A WiFi policy object that is used to configure the acquisition. 
	 * @param {object[]} wifiPolicy.accessPointFilters An array object that specifies the WiFi access points that you want to detect. Each entry has an SSID name specification, and optionally a MAC specification.
	 * 													The MAC specification can be a wildcard value, represented by an asterisk (*), in which case all MACs for this SSID are reported. If no MAC is specified,
	 * 													 and this WiFi is visible, then only its SSID is reported; only a single entry appears, regardless of the number of access points that have this SSID. 
	 * 													The SSID specification can be a wildcard, represented by an asterisk (*), in which case all visible networks are reported. 
	 * @param {number} [wifiPolicy.signalStrengthThreshold] An integer value that specifies the signal strength threshold as a percentage. Access points whose signal is weaker than this threshold are not reported in the list of visible access points. 
	 *												  However, a connected access point that passes the <code>wifiPolicy.accessPointFilters</code> is always visible, even when its signal strength is below this threshold. The default value is 15.
	 * 
	 * @note {Note} The <code>wifiPolicy</code> parameter is different from the policy parameter passed to the <code>WL.Device.startAcquisition</code> function. If <code>aPolicy</code> is the <span class="keyword parmname parmname">policy</span> parameter for <code>WL.Device.startAcquisition</code>, then <code>aPolicy.Wifi</code> would be the WiFi policy that
	 * 	  could be passed to this API.
	 * @methodOf WL.Device.Wifi# 			
	 */
	this.acquireVisibleAccessPoints = function(onSuccess, onFailure, wifiPolicy){};

/**
 * Acquires the currently connected WiFi access point information.
 * @description <p>
 * The device attempts to acquire the currently connected WiFi access point information. If the attempt is successful, the access point
 * information is passed to the <code>onSuccess</code> callback function. The access point information
	includes the following fields:<div class="tablenoborder"><table cellpadding="4" cellspacing="0" summary="" class="table" rules="all" frame="border" border="1"><thead class="thead" align="left"><tr class="row" valign="bottom"><th class="entry" valign="bottom" id="d68e27">Field</th>
	<th class="entry" valign="bottom" id="d68e29">Description</th>
	<th class="entry" valign="bottom" id="d68e31">Platform availability</th>
	</tr>
	</thead>
	<tbody class="tbody"><tr class="row"><td class="entry" valign="top" headers="d68e27 ">SSID</td>
	<td class="entry" valign="top" headers="d68e29 ">The connected network SSID.</td>
	<td class="entry" valign="top" headers="d68e31 ">Android, iOS, and Windows Phone 8.</td>
	</tr>
	<tr class="row"><td class="entry" valign="top" headers="d68e27 ">MAC</td>
	<td class="entry" valign="top" headers="d68e29 ">The MAC address of the connected access point.</td>
	<td class="entry" valign="top" headers="d68e31 ">Android and iOS.</td>
	</tr>
	<tr class="row"><td class="entry" valign="top" headers="d68e27 ">signalStrength</td>
	<td class="entry" valign="top" headers="d68e29 ">The signal strength of the connected access
	point.</td>
	<td class="entry" valign="top" headers="d68e31 ">Android.</td>
	</tr>
	</tbody>
	</table>
 * @see For more information about the permissions that are required for Android, iOS, and Windows Phone 8, see the IBM Worklight client-side API topic in the product documentation. 
 * @param {function} onSuccess A callback function that is invoked when access point connection information is acquired successfully. The acquisition result is passed as a parameter to this function.
 * @param {function} onFailure A callback function that is invoked if the acquisition is unsuccessful. The callback function receives a numeric code, and one of the following values:
 * 					<ul>
 * 						<li>WL.Device.Wifi.PERMISSION: There is a permissions problem.</li>
 * 						<li>WL.Device.Wifi.DISABLED: The wifi on the device is turned off.</li>
 * 						<li>WL.Device.Wifi.FAILED_START_SCAN: The device failed to start scanning. It is recommended that you try again after a few seconds.</li>
 * 					</ul> 
 * @methodOf WL.Device.Wifi#
 */
this.getConnectedAccessPoint = function(onSuccess, onFailure){};

/**
 * Error code returned when trying to acquire WIFI position due to application's lack of permissions
 * @memberOf WL.Device.Wifi# 
 */
this.PERMISSION = 0;

/**
 * Error code returned when attempting WIFI acquisition if WIFI is disabled
 * @memberOf WL.Device.Wifi# 
 */
this.DISABLED = 1;

/**
 * Error code returned when failing to initiate WIFI scan due to OS reasons
 * @memberOf WL.Device.Wifi# 
 */
this.FAILED_START_SCAN = 2;
};



/**
 * @name WL.Device
 * @ilog.undocumented.jsFile
 * @ilog.undocumented.constructor
 * @class
*/
__WLDevice = function() {
	/**
 	 * Get network information from the device
	 * @description Fetches network information from the device and returns it to the specified callback function. Available on Android and iOS.
	 * @param callback Mandatory. The function that is called after the data is copied to the clipboard.
	 * @returns The callback function receives a JSON structure, as described in the following table:
	 * 	<p>
	 * 	<p><table border="1">
		<tr>
		<th><b>Property</b></th>
		<th><b>Description</b></th>
		<th><b>Availability on Android</b></th>
		<th><b>Availability on iOS</b></th>
		</tr>
		<tr>
		<td>isNetworkConnected</td>
		<td>Mandatory. Whether the device has an IP address (that is, it is connected through WiFi or a mobile network)</td>
		<td>Yes</td>
		<td>Yes</td>
		</tr>
		<tr>
		<td>isAirplaneMode</td>
		<td>Mandatory. Whether the device is in airplane mode or not</td>
		<td>Yes</td>
		<td>No</td>
		</tr>
		<tr>
		<td>isRoaming</td>
		<td>Mandatory. Whether the device is roaming (not on its home mobile network)</td>
		<td>Yes</td>
		<td>No</td>
		</tr>
		<tr>
		<td>networkConnectionType</td>
		<td>Mandatory. Returns <code>mobile or WIFI</code></td>
		<td>Yes</td>
		<td>Yes</td>
		</tr>
		<tr>
		<td>wifiName</td>
		<td>Mandatory. Name of the WiFi network, if connected</td>
		<td>Yes</td>
		<td>No</td>
		</tr>
		<tr>
		<td>telephonyNetworkType</td>
		<td>Mandatory. Type of the mobile network (such as <code>HSDPA or EDGE</code>)</td>
		<td>Yes</td>
		<td>No</td>
		</tr>
		<tr>
		<td>carrierName</td>
		<td>Mandatory. Name and ID of the mobile carrier</td>
		<td>Yes</td>
		<td>No</td>
		</tr>
		<tr>
		<td>ipAddress</td>
		<td>Mandatory. IP address of the device<br />
			<b>Note:</b>The value ipAddress is set to the first non-null value of the possible four IP addresses in this order:
			<ul>
				<li>IPv4 WiFi address</li>
				<li>IPv4 3G address</li>
				<li>IPv6 WiFi address</li>
				<li>IPv6 3G address</li>
			</ul>
			For example, if both IPv4 addresses are not present, the value ipAddress takes the value of the IPv6 WiFi address.
		</td>
		<td>Yes</td>
		<td>Yes</td>
		</tr>
		<tr>
		<td>Ipv4Addresses</td>
		<td>Optional array that contains key value pairs:
			<ul>
				<li>wifiAddress - The IPv4 WiFi address if it is present</li>
				<li>3GAddress - The IPv4 3G address if it is present</li>
			</ul>
		</td>
		<td>Yes</td>
		<td>Yes</td>
		</tr>
		<tr>
		<td>Ipv6Addresses</td>
		<td>Optional array that contains key value pairs:
			<ul>
				<li>wifiAddress - The IPv6 WiFi address if it is present (only on iOS)</li>
				<li>3GAddress - The IPv6 3G address if it is present</li>
			</ul>
		</td>
		<td>Yes</td>
		<td>Yes</td>
		</tr>
		</table>
		</p>
	 * @example 
	 * WL.Device.getNetworkInfo(function (networkInfo) {
	 * 	alert (networkInfo.ipAddress); 
	 * });
	 * @methodOf WL.Device# 
 	 */
	this.getNetworkInfo = function(callback) {
		callback({});
	};
	
	/**
	 * Supported environments: Android, iOS, WindowsPhone8, Blackberry, Blackberry10.
	 * @description <p> Network call to the Worklight server to retrieve the 'friendly name' associated with the device. </p>
	 *
	 * @param options - A required property. An object containing the following callback functions:
	 * <ul>
	 * 	<li>
	 * 		<b>onSuccess</b> Called after a successful network call to the server. Will be passed an object with the friendly name.
	 * 	</li>
	 * 	<li>
	 * 		<b>onFailure</b> Called if an error occurred while trying to retrieve the friendly name from the server.
	 * 	</li>
	 * </ul>
	 * @return A json object that contains a response from the server that includes friendly name associated with the device. The friendly name returned will be null if the 
	 * friendly name has not been set for this device. Examples:
	 * <ul>
	 * <li>{ responseJSON: { friendlyName: "John's Device" } }</li>
	 * <li>{ responseJSON: { friendlyName: null } }</li>
	 * </ul>
	 * @methodOf WL.Device#
	*/
	this.getFriendlyName = function(options) {
		
	};
	
	/**
	 * Supported environments: Android, iOS, WindowsPhone8, Blackberry, Blackberry10.
	 * @description <p> Network call to the Worklight server to associate a 'friendly name' with the current device </p>
	 *
	 * @param friendlyName - A required property. A string that defines the friendly name being set for the device. 
	 * 
	 * @param options - An optional property. An object containing the following callback functions:
	 * <ul>
	 * 	<li>
	 * 		<b>onSuccess</b> Called after a successful network call to the server.
	 * 	</li>
	 * 	<li>
	 * 		<b>onFailure</b> Called if an error occurred while trying to receive the friendly name from the server.
	 * 	</li>
	 * </ul>
	 * @methodOf WL.Device#
	*/
	this.setFriendlyName = function(friendlyName, options) {
		
	};
	
	/**
	 * Supported environments: Android, iOS, WindowsPhone8, Blackberry, Blackberry10.
	 * @description <p>	Retrieves the device ID from the device. This is the device ID that Worklight uses to create a 
	 *  user to device mapping on the server. For many environments, this is NOT the UUID of the device 
	 *  generated by the manufacturer.</p>
	 *
	 * @param options - A required property. An object containing the following callback functions:
	 * <ul>
	 * 	<li>
	 * 		<b>onSuccess</b> Called when the device ID has been successfully retrieved. Returns on object containing the device ID.
	 * 	</li>
	 * 	<li>
	 * 		<b>onFailure</b> Called if an error occurred while trying to retrieve the device ID.
	 * 	</li>
	 * </ul>
	 * @return A json object containing the device ID
	 * 
	 * Example: { deviceID: "ABCDEFG-HIJK-1234-5678-MNOPQR" }
	 * @methodOf WL.Device#
	*/
	this.getID = function(options) {
		
	};
	
	
	/**
	 * 
	 * Starts ongoing acquisition for sensors that are provided in the policy.
	 * @description 
	 * <p>
	 * Ongoing acquisition is started for the GPS and WiFi sensors that are provided in the policy. When new sensor information is acquired, the device context is updated, and the specified triggers are evaluated for activation.
	 * @see For more information about the permissions that are required for Android, iOS, and Windows Phone 8, see the IBM Worklight client-side API topic in the product documentation.
	 * </p> 
	 * @param {object} policy This parameter is used to configure the acquisition. The parameter specifies relevant entries for each sensor. 
	 * @param {object} [policy.Geo] This parameter controls how Geo data is acquired. <b>Note:</b>The object is based on the W3C specification for geolocation. For more information, see the <a href="http://www.w3.org/TR/geolocation-API/">W3C Geolocation API Specification</a>.
	 * @param {number} [policy.Geo.timeout] The timeout interval for position acquisition, specified in milliseconds. 
	 * 							The default value is infinite. If no position is acquired since the last position was acquired, or since <code>WL.Device.startAcquisition</code> was called, then the <code>onFailure</code> function is called.
	 * @param {boolean} policy.Geo.enableHighAccuracy A Boolean value indicating whether it is possible to obtain high-accuracy measurements, for example by using GPS.
	 * @param {object} [policy.Geo.highAccuracyOptions] When <code>enableHighAccuracy</code> is true, this property might specify additional parameters.
	 * @param {number} [policy.Geo.highAccuracyOptions.desiredAccuracy] An integer value that gives the required accuracy in meters. 
	 *                				On some platforms, a higher <code>desiredAccuracy</code> value could result in power savings. For example, the platform might choose to use a WiFi or Network-based approach to determining the position, instead of GPS.
	 * @param {number} [policy.Geo.highAccuracyOptions.iOSBestAccuracy] The value can be <code>WL.Device.Geo.IOS_BEST_ACCURACY</code> or <code>WL.Device.Geo.IOS_BEST_ACCURACY_FOR_NAVIGATION</code>. If <code>iOSBestAccuracy</code> is present, it overrides the <code>desiredAccuracy</code> setting.
	 *                See iOS Accuracy constants:
	 *                <a href="https://developer.apple.com/library/mac/#documentation/CoreLocation/Reference/CoreLocationConstantsRef/Reference/reference.html#//apple_ref/c/data/kCLLocationAccuracyBest">kCLLocationAccuracyBest</a>
	 *                and <a href="https://developer.apple.com/library/mac/#documentation/CoreLocation/Reference/CoreLocationConstantsRef/Reference/reference.html#//apple_ref/c/data/kCLLocationAccuracyBestForNavigation">KCLLocationAccuracyBestForNavigation</a>
	 * @param {number} [policy.Geo.minChangeDistance] An integer value giving the minimum distance in meters that the position must change by since the last update 
	 *     								in order to receive a new updated position. On some platforms, higher values can improve battery life, although the effect is generally less than that of 
	 *     								<code>minChangeTime</code>. The default value is 0.
	 * @param {number} [policy.Geo.minChangeTime] An integer value giving the minimum time in milliseconds between updates.
	 *     								 On some platforms, higher values can improve battery life. For example, the system might choose to power off hardware between readings. The default value is 0.
     *     			<br>
	 *     			<b>Note:</b>This property is available only on Android and Windows Phone 8.
	 * @param {number} [policy.Geo.maximumAge] A time, measured in milliseconds. A cached position is returned for the first acquisition, if the age of that position is less than the specified <code>maximumAge</code> value.		
	 * @param {object} [policy.Wifi] This parameter controls how WiFi data is acquired.
	 * @param {number} [policy.Wifi.interval] A polling interval, specified in milliseconds. WiFi polling is performed each interval. The default value is 10000 (10 seconds).
	 * @param {number} [policy.Wifi.signalStrengthThreshold] An integer value that specifies the signal strength threshold as a percentage. Access points whose signal is weaker than this threshold are not reported in the list of visible access points. 
	 *												  However, a connected access point is still visible as the <code>connectedAccessPoint</code> under WiFi in the device context, even when its signal strength is below this threshold. The default value is 15.
	 * @param {object[]} [policy.Wifi.accessPointFilters] An array object that specifies the WiFi access points that you want to detect. Each entry has an SSID name specification, and optionally a MAC specification.
	 * 											 The MAC specification can be a wildcard value, represented by an asterisk (*), in which case all MACs for this SSID are reported. If no MAC is specified, and this WiFi is visible, then only its SSID is reported;
	 * 											 only a single entry appears, regardless of the number of access points that have this SSID. The SSID specification can be a wildcard, represented by an asterisk (*), in which case all visible networks are reported.
	 * <br><br>
	 * <b>Example of a policy object:</b>
	 * <pre><code>{
	 *    Geo: {
	 *       timeout:3000,  
	 *       enableHighAccuracy: true
	 *    },
	 *    Wifi: {
	 *       interval : 3000,
	 *       signalStrengthThreshold : 15,
	 *       accessPointFilters : [
	 *          {SSID : "net1"},
	 *          {SSID : "net2",MAC : "*"}	 
	 *       ]
	 *    }
	 * }</code></pre>
	 * @param {object} triggers The triggers parameter holds trigger definitions for all sensors, in the format <code>{Geo:{...}, Wifi:{...}}</code>. The Geo and Wifi objects hold the key-value entries that define triggers, in the format <code>triggerName:{triggerDefinition}</code>.
	 * <br><br> 
	 * 					The <code>triggerDefinition</code> object consists of the following parameters:
	 * 							<ul>
	 * 								<li><code>type </code> - The trigger type.
	 * 									<p>
	     * 									The Geo object has the following trigger types: <ul><li><code>PositionChange</code></li><li><code>Enter</code></li><li><code>Exit</code></li><li><code>DwellInside</code></li><li><code>DwellOutside</code></li></ul>
		 * 									<br><br>
		 * 									The <code>PositionChange</code> trigger has an optional <code>minChangeDistance</code> parameter that has an integer value giving a distance in meters. 
		 * 									After the first acquisition, this trigger will be activated only when the reported position has changed by at least this amount. The value should be greater than that of the
		 * 									<code>minChangeDistance</code> parameter defined on the Geo policy, otherwise it will have no effect.
		 * 									<br><br>
		 * 									The <code>Enter</code>, <code>Exit</code>, <code>DwellInside</code>, and <code>DwellOutside</code> triggers (known collectively as <i>geo-fence triggers</i>), have the following parameters:
		 * 									<ul>
		 * 										<li>An area definition. This mandatory parameter is defined as an object, with a value of <code>circle:{longitude:,latitude:,radius:}</code>  or 
		 * 										 <code>polygon:{coordinates: [{longitude:,latitude:},{longitude:,latitude:},{longitude:,latitude:},{longitude:,latitude:}]}</code></li>
		 * 									 	<li><code>bufferZoneWidth</code> <i>Optional</i> - Use this parameter to change the size of the buffer zone, which is the area in which triggers are activated. The value of bufferZoneWidth indicates in meters how much 
		 * 											to change the area. It can have either a positive or negative value. If it has a positive value, the area becomes bigger. If it has a negative value, the area becomes smaller. All geo-fence triggers operate on this new area. 
		 * 											The default value is 0, which leaves the area unchanged</li>
		 * 										<li><code>confidenceLevel</code> <i>Optional</i> - Has three possible values: 
		 * 											<ul>
		 * 												<li><code>low</code> - The trigger is eligible for activation when the position is inside the area (Enter, DwellInside) or outside the area (Exit, DwellOutside), respectively. <code>Low</code> is the default value.</li>
		 * 												<li><code>medium</code> - The trigger is eligible for activation when there is approximately a 70% confidence interval that the device is inside the area, or outside the area, respectively. This takes into account the acquired accuracy of the position</li>
		 * 												<li><code>high</code> - The trigger is eligible for activation when there is approximately a 95% confidence interval that the device is inside the area, or outside the area, respectively. This takes into account the acquired accuracy of the position.</li>
		 * 											</ul>	  									 		
		 * 									</ul>
		 * 									<br><br>
		 * 									For the <code>DwellInside</code>, and <code>DwellOutside</code> triggers, there is an additional parameter, <code>dwellingTime</code>, which is defined in milliseconds. This determines how long the device must be inside or outside the area before the trigger is activated.
	 * 								  	</p>
	 * 
	 * 									<p>
	 * 										The Wifi object has the following trigger types: <ul><li><code>VisibleAccessPointsChange</code></li><li><code>Enter</code></li><li><code>Exit</code></li><li><code>DwellInside</code></li><li><code>DwellOutside</code></li><li><code>Connect</code></li><li><code>Disconnect</code></li></ul>
	 * 										<br><br>
	 * 										The <code>Enter</code>, <code>Exit</code>, <code>DwellInside</code>, and <code>DwellOutside</code> triggers (known collectively as <i>WiFi-fence triggers</i>) have the following parameters:
	 * 										<ul>
	 * 											<li><code>areaAccessPoints</code> - This mandatory parameter defines which access points must be visible. Access points are defined in the same way as for <code>accessPointFilters</code> in the WiFi acquisition policy.
	 * 												 Each access point has the format: <code>{SSID:,MAC:}</code> or <code>{SSID:}</code>. The SSID value can be a wildcard, represented by an asterisk (*). The string <code>{SSID: "*"}</code> matches any SSID given in the Wifi policy, but no other SSIDs.
	 * 												 <br><br>
	 * 												All access points defined here should pass the <code>accessPointFilters</code> check defined in the WiFi policy.
	 * 											</li>
	 * 								    		<li><code>otherAccessPointsAllowed</code> <i>Optional</i> - A Boolean value that indicates whether only the access points specified for <code>areaAccessPoints</code> should be visible, or whether other access points might be visible as well, where visibility is determined according to the WiFi acquisition policy. 
	 * 													If the value is <code>true</code>, the trigger can be activated even when other access points are visible. If the value is <code>false</code>, this trigger is not activated when other access points are visible. The default value is <code>false</code>.
	 * 											</li>
	 * 											<li><code>confidenceLevel</code> <i>Optional</i> - A String parameter that has three possible values:
	 * 												<ul>
	 * 													<li>A <code>low</code> confidence level is used to indicate that the WiFi acquisition policy <code>signalStrengthThreshold</code> value is used when determining whether an access point is visible. <code>low</code> is the default value.</li>
	 *													<li>A <code>medium</code> confidence level is used to indicate that a signal strength of at least 50% is necessary for an access point to be visible.</li>
	 *													<li>A <code>high</code> confidence level is used to indicate that a signal strength of at least 80% is necessary for an access point to be visible.</li>
	 *												</ul>
	 *												<b>Note:</b> The <code>confidenceLevel</code> parameter is not supported by DwellOutside.
	 * 										</ul>
	 * 										<br><br>
	 * 										The <code>DwellInside</code> and <code>DwellOutside</code> triggers have one additional parameter, <code>dwellingTime</code>, which is a time defined in milliseconds. It defines how long the device must be inside, or outside, the area before the trigger is activated.
	 * 										<br><br>
	 * 										The <code>Connect</code> and <code>Disconnect</code> triggers have one parameter, <code>connectedAccessPoint</code>, which is defined in the same way as a single access points specification object in the WiFi acquisition policy: <code>{SSID:,MAC:} or {SSID:}</code>. 
	 * 										The SSID value can be a wildcard, represented by an asterisk (*). The string <code>{SSID: "*"}</code> matches any SSID given in the Wifi policy, but no other SSIDs. If you specify <code>{SSID: "*"}</code> when you are already connected to an access point that matches the <code>accessPointFilters</code> value, and the connection is switched to another access point that matches the <code>accessPointFilters</code>  value, the Connect trigger is not activated. 
	 * 										The device must be disconnected from all access points that match the filters before the <connect>Connect</connect> trigger can activate.
	 * 										<br><br>
	 * 										The defined access point should pass the <code>accessPointFilters</code> check defined in the WiFi policy. The trigger is activated only if the connected access point matches this specification.
	 *										<br><br>
	 *										<b>Note:</b> The <code>VisibleAccessPointsChange</code>, <code>Enter</code>, <code>Exit</code>, <code>DwellInside</code>, and <code>DwellOutside</code> triggers are currently supported only on Android.	
	 * 									</p>	
	 * 							</li>
	 * 							<li><code>callback</code> <i>Optional</i> - A callback function that is called when the trigger is activated. The callback function receives the current device context as a parameter.</li>
	 * 							<li><code>eventToTransmit</code> <i>Optional</i> - An object that contains the definition of an event to create, and transmit to the server, when the trigger is activated. The event definition contains two parameters:
	 * 								<ul>
	 * 								 <li><code>event</code> - An object with flexible key-value pairs that define the event payload. The current device context is automatically added to the event.</li>
	 * 								 <li><code>transmitImmediately</code> <i>Optional</i> - A Boolean flag that indicates whether the event should be transmitted immediately or according to the transmission policy. If its value is <code>true</code>, the event is added to the transmission buffer and the whole contents of the transmission buffer are flushed to the server. Otherwise the event is added only to the transmission buffer. The default value is <code>false</code></li>  
	 * 								</ul>
	 * 							</li>
	 * 						</ul>
	 * 	<br><br>
	 * <b>Example of a triggers object:</b>
	 * <pre><code>{ 
	 *     Geo: {
	 *        userMoved: { 
	 *           type: "PositionChange",
	 *           minChangeDistance: 20,
	 *           callback: handleNewPosition,
	 *           eventToTransmit: { 
	 *              event: { 
	 *                 name: "UserMoved",
	 *                 userName: "Jane Doe"
	 *              },
	 *              transmitImmediately: true 
	 *           }
	 *        }
	 *     },
	 *     Wifi: {
	 *        userMoved: { 
	 *           type: "VisibleAccessPointsChange",
	 *           callback: handleVisibleWifiChange,
	 *           eventToTransmit: { 
	 *              event: { 
	 *                 name: "VisibleAccessPointsChanged",
	 *                 userName: "Jane Doe"
	 *              },
	 *              transmitImmediately: true
	 *           }
	 *        }
	 *     }
	 *  }</code></pre>
	 *  @param {object} onFailure An object that defines the error callback functions for each sensor. The structure of the object is: <code>{Geo: errorCallbackFunc, Wifi: errorCallbackFunc}</code>.
	 *  @param {function} [onFailure.Geo] For Geo sensors, the callback function receives a PositionError parameter, as described in the <a href="http://www.w3.org/TR/geolocation-API/#position_error_interface">W3C Geolocation specification</a>.
	 *	@param {function} [onFailure.Wifi]For WiFi sensors, the callback function receives a numeric code, and one of the following values:
	 *					<ul>
	 *						<li>WL.Device.Wifi.PERMISSION: There is a permissions problem</li>
	 *						<li>WL.Device.Wifi.DISABLED: The WiFi on the device is turned off.</li>
	 *						<li>WL.Device.Wifi.FAILED_START_SCAN: The device failed to start scanning. It is recommended that you try again after a few seconds.</li>
	 *					</ul>
 	 *	@note {Note}
	 * 	Triggers track state, for example, whether the user was previously outside a polygon area, and is currently inside it but not at the requisite confidence level. For this reason, if a subsequent call is made to <code>startAcquisition</code>, and a trigger is still present, no changes are made to it. After it has been defined the trigger can be removed, but it is effectively immutable and cannot be changed. You can still modify the triggers object, for example, by deleting obsolete triggers. Triggers are identified by their names; these are the names of the properties for the triggers parameter that was received. 		
	 * @methodOf WL.Device#  
	 */
	this.startAcquisition = function(policy, triggers, onFailure){};

	/**
	 * Stops the ongoing acquisition, and clears all trigger states.
	 * @description 
	 * <p>
	 * The ongoing acquisition is stopped. The stop action is delegated to all relevant sensors, and all trigger states are cleared.
	 * </p>
	 * @methodOf WL.Device#
	 */
	this.stopAcquisition = function(){};

	
	this.Geo = new __WLDeviceGeo;
	
	this.Geo.Profiles = new __WLDeviceGeoProfiles;
	
	this.Wifi = new __WLDeviceWifi;
	
	

	/**
     * Get the current device context. 
     * 
     * @returns Device context object. The object is comprised of object entries for each sensor and a timestamp of last change, in the form: <i>{Geo:{...},Wifi:{...},lastModified:...}</i>
     * 		<ul><li>	Geo:  object with the following fields: 
     * 					<ul><li>timestamp - The timestamp of last update of Geo object (number of milliseconds elapsed since Jan 1, 1970)</li>
    	 * 				<li>coords - The coordinates object returned by the navigator service. For more information see @see navigator.geolocation.getCurrentPosition()</li></ul>
    	 *     </li>					
    	 * 		<li>	Wifi: 
    	 * 				<ul><li>timestamp - The timestamp of last update of Wifi object (number of milliseconds elapsed since Jan 1, 1970)</li>
    	 *			    <li>accessPoints - Filtered access points (a subset of all visible access points filtered according to policy). In the format [{SSID:...},{SSID:...,MAC:...}]</li>
    	 *				<li>connectedAccessPoint - Information about the connected access point if it is passes the policy filter. In the format {SSID: } or {SSID: , MAC: }</li>
    	 * 			    <li></li></ul>   
    	 *	    </li>
    	 *      <li>	lastModified: timestamp - matches the maximum timestamp of Geo/Wifi. If neither have a timestamp, then won't be present.</li>
    	 *      <li>	timezoneOffset: an integer indicating how many minutes must be added to local times in order to arrive at UTC time.</li>
    	 *  </ul>
     * <br><br />
     * If <code>WL.Client.startAcquisition</code> has not been called since startup or since the latest call to <code>WL.Client.stopAcquisition()</code>, returns <code>null</code>.
     * @example <pre><code>{
     *      Geo: {
     *          timestamp: 1364754322150,
     *          coords: {
     *             speed: null,
     *             heading: null,
     *             altitudeAccuracy: null,
     *             accuracy: 100,
     *             altitude: null,
     *             longitude: 34.777819,
     *             latitude: 32.066158
     *          }
     *       },
     *       Wifi: {
     *          timestamp: 1364754322168,
     *          accessPoints": [{"SSID":"IBM"}, {"SSID":"IBMVISITOR","MAC":"00:01:02:04"}],
     *          connectedAccessPoint": {"SSID":"IBM"}
     *       }
     *       lastModified: 1364754322150,
     *       timezoneOffset: 420
     * }</code></pre>
     * 
     * @methodOf WL.Device#
     */
   this.getContext = function(){};
};
__WL.prototype.Device = new __WLDevice;
WL.Device = new __WLDevice;
