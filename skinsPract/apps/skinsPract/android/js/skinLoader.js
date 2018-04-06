function getSkinName() {
	var skinName = "default";
	String version=device.version;
	version=version.substring(0,3);
	if (version == "4.4.2") {
		skinName = "android.etc"; 
	}else if(version == "5.1.1") {
		skinName = "android.next"; 
	} else {
		skinName = "default";
	}
	return skinName;
}
//===================================== IOS EXAMPLE =========================================================

/*
 * Determines the skin according to the type of device. Useful for iOS devices with 
 * different screen resolution.
 */

/*function getSkinName() {
	var skinName = "default"; // The default is used for iPhone 3 and iPod Touch devices
	var platform = device.platform;
	if (platform.toLowerCase().indexOf("ipad") != -1) {
		skinName = "ipad"; 
	} 
	return skinName;
}
*/

//===================================== ANDROID EXAMPLE =====================================================

/*
 * Determines the skin according to operating system. Useful for Android devices that run different
 * operating system versions with different capabilities.
 */

/*function getSkinName() {
	var skinName = "default";
	if (device.version == "2.2" || device.version == "2.1") {
		skinName = "android.HTML5"; 
	}
	return skinName;
}
*/

// ===================================== BLACKBERRY EXAMPLE ==================================================

/*
 * Determines the skin according to screen resolution. Useful for BlackBerry devices 
 * with various screen resolutions
 */

/*function getSkinName() {
	var skinName = "default";
	var screenHeight = screen.height;
	var screenWidth = screen.width;
	if (isPlaybook()) {
		skinName = "blackberry.playBook";
	} else if (screenHeight <= 240 || screenWidth <= 320) {
		// BlackBerry Curve
		skinName = "blackberry.lowDensity"; 
	} else if (screenHeight >= 320 || screenWidth >= 360 ) {
		// BlackBerry Torch, Bold, and Tour
		skinName = "blackberry.highDensity";
	} 
	return skinName;
}

function isPlaybook () {
	return navigator.userAgent.indexOf("RIM Tablet OS") > -1;
} 
*/






