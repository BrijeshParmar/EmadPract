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
 * @name WL.Trusteer
 */
__WLTrusteer = function(){
	
	/**
	 * Get Trusteer risk assessment data 
	 *
	 * @param onSuccess - A callback function invoked when Trusteer SDK is installed and risk assessment is available.
	 * @param onFailure - A callback function invoked when Trusteer SDK is not installed or Trusteer SDK failed to initialize (i.e. license)
	 *
	 * @return Trusteer risk assessment data in JSON format:
	 * {
	 *	   ״plat.android.dumpsys":{"value":0,"additionalData":"","lastCalculated":1411295111000,"name":"plat.android.dumpsys"},
	 *	   "os.ver_up_to_date":{"value":0,"additionalData":"","lastCalculated":1411295111000,"name":"os.ver_up_to_date"},
	 *	   "device_key":"BEFAFED62456EECC7B5F0E120318EADF85625CD979CF1A9125BF6FF3F7CFB801",
	 *	   "os.rooted.native":{"value":1000,"additionalData":"","lastCalculated":1411295111000,"name":"os.rooted.native"},
	 *	   "network.wifi":{"value":0,"additionalData":"status: OFF","lastCalculated":0,"name":"network.wifi"},
	 *	   "os.rooted.hiders":{"value":0,"additionalData":"","lastCalculated":1411295111000,"name":"os.rooted.hiders"},
	 *	   "plat.android.apprestrict":{"value":1000,"additionalData":"","lastCalculated":1411295111000,"name":"plat.android.apprestrict"},
	 *	   "os.rooted":{"value":1000,"additionalData":"","lastCalculated":1411295111000,"name":"os.rooted"},
	 *	   "total.risk.generic":{"value":600,"additionalData":"","lastCalculated":1411295111000,"name":"total.risk.generic"},
	 *	   "tas.config_update":{"value":0,"additionalData":"","lastCalculated":1411295111000,"name":"tas.config_update"},
	 *	   "malware.any":{"value":0,"additionalData":"","lastCalculated":1411295111000,"name":"malware.any"}
	 *	} 
	 * <p>
	 * For more information, see Trusteer SDK documentation.
	 * @methodOf WL.Trusteer#
	 */	
	this.getRiskAssessment = function (onSuccess,onFailure) {};
};

__WL.prototype.Trusteer = new __WLTrusteer;
WL.Trusteer = new __WLTrusteer;