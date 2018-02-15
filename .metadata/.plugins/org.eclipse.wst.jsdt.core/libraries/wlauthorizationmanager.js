/*
* Licensed Materials - Property of IBM
* 5725-I43 (C) Copyright IBM Corp. 2006, 2015. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
/**
 * @class
 * The <code>WLAuthorizationManager</code> class is instantiated as a singleton and can be used anywhere in the application 
 * to obtain the client ID and authorization header. It is also called internally to handle MobileFirst OAuth-based security model protocol.
 * <p>
 * All functions of the authorization manager are asynchronous and return a promise object.
 * <p>
 * The <code>WLAuthorizationManager</code> and <code>WLResourceRequest</code> classes are supported for the following hybrid environments only: 
 * Android, iOS, Windows Phone 8 and Window 8.
 *
 * @name WLAuthorizationManager
 */
__WLAuthorizationManager = function () {
	
	/**
	 * @description Returns cached authorization header.
	 * @returns A promise object that can be used to receive the header asynchronously. The header is sent as a string.
	 * @example
	 * WLAuthorizationHeader.getCachedAuthorizationHeader()<br>
	 * .then(<br>
	 *   function(response) { <br>
	 * 	   // success flow<br>
	 * 	 },<br>
	 * 	 function(error) {<br>
	 *     // error flow<br>
	 * 	 }<br>
	 * );
	 * @methodOf WLAuthorizationManager#
	 */
	this.getCachedAuthorizationHeader = function () {};
	
	/**
	 * @description Determines whether authorization is required or not.
	 * @param {Integer} responseStatus Mandatory. Specifies the response status code returned from the server.
	 * @param {String} responseAuthenticationHeader Mandatory. Specifies a string containing an authorization header value (usually the value of header 'WWW-Authenticate'), 
	 * returned with a response from the server.
	 * @returns A boolean value, indicating whether authorization is required (<code>true</code>), or not (<code>false</code>).
	 * @methodOf WLAuthorizationManager#
	 */
	this.isAuthorizationRequired = function (responseStatus, responseAuthenticationHeader) {};
	
	/**
	 * @description Sets the authorization persistence policy, which defines how the authorization information is persisted on the device.
	 * It can be set to one of the following values:
	 * <ul>
	 * <li><code>WLAuthorizarionManager.ALWAYS</code>, which stores the authorization data on the device and the user is not required to
	 * authenticate on subsequent application launches.
	 * <li><code>WLAuthorizarionManager.NEVER</code>, which maintains the authorization data 
	 * in the memory and the user will be authenticated on each application run.
	 * </ul> 
	 * @param authorizationPersistencePolicy Mandatory. Specifies the new policy to set.
	 * @deprecated In MobileFirst Platform 7.1, persisting authorization headers on the client side has no effect, since the MobileFirst server persists the security data across sessions.
	 * @returns A promise object, because this operation is asynchronous.
	 * @methodOf WLAuthorizationManager#
	 */
	this.setAuthorizationPersistencePolicy = function (authorizationPersistencePolicy) {};
	
	/**
	 * @description Parses the authentication header and retrieves the authorization scope.
	 * @param {String} responseAuthenticationHeader Mandatory. Specifies a string containing an authorization header value (usually the value of header 'WWW-Authenticate'), 
	 * returned with a response from the server.
	 * @returns A string containing authorization scope.
	 * 
	 * @methodOf WLAuthorizationManager#
	 */
	this.getAuthorizationScope = function (responseAuthenticationHeader) {};
	
	/**
	 * @description Obtains the authorization header for the specified scope. 
	 * @param {String} scope Optional. Specifies the scope to obtain an authorization header for. 
	 * @returns A promise object that can be used to receive the authorization header asynchronously. The header is sent as a string.
     * @example      
	 * WLAuthorizationManager.obtainAuthorizationHeader(scope)<br>
	 * .then (<br>
	 *   function(header) {<br>
	 * 	   // success flow with the header<br>
	 *   },<br>
	 *   function(error) {<br>
	 *     // failure flow<br>
	 *   }<br>
	 * };
	 * 
     * @methodOf WLAuthorizationManager#
	 */
	this.obtainAuthorizationHeader = function (scope) {}; 
	
	/**
	 * Adds a cached authorization header to the request. As this function is asynchronous, you 
	 * use the returned promise for completing the flow.
	 * @param {Object} request Mandatory. A request object. This object should expose the <code>setRequestHeader</code> function.
	 * @returns Promise object. 
	 * @example
	 * var xhr = new XMLHttpRequest();<br>
	 * WLAuthorizationManager.addCachedAuthorizationHeader(xhr)<br>
	 * .always(<br>
	 *   function(response) {<br>
	 * 	   // success or failure flow<br>
	 * 	 }<br>
	 * );
	 * 
     * @methodOf WLAuthorizationManager#
	 */ 
	this.addCachedAuthorizationHeader = function (request) {};
	
	/**
	 * @description Obtains user identity. The identity is returned via deferred callback.
	 * @returns Promise object. The methods calls either success or failure callbacks and passes the user identity as a string or error.
     * @example
	 * WLAuthorizationManager.getUserIdentity()<br>
	 * .then(<br>
	 *   function(data) {<br>
	 * 	   // success flow with user identity<br>
	 * 	 },<br>
	 * 	 function(error) {<br>
	 * 	   // failure flow with error<br>
	 * 	 }<br>
	 * );
	 * 
	 * @methodOf WLAuthorizationManager#
	 */
	this.getUserIdentity = function () {};
	
	/**
	 * @description Obtains device identity. The identity is returned via deferred callback.
	 * @returns Promise object. The methods calls either success or failure callbacks and passes the device identity as a string or error.
     * @example
	 * WLAuthorizationManager.getDeviceIdentity()<br>
	 * .then(<br>
	 *   function(data) {<br>
	 * 	   // success flow with device identity<br>
	 * 	 },<br>
	 * 	 function(error) {<br>
	 * 	   // failure flow with error<br>
	 * 	 }<br>
	 * );
	 * 
     * @methodOf WLAuthorizationManager#
	 */
	this.getDeviceIdentity = function () {};
	
	/**
	 * @description Obtains application identity. The identity is returned via deferred callback.
	 * @returns Promise object. The methods calls either success or failure callbacks and passes the application identity as a string or error.
     * @example
	 * WLAuthorizationManager.getAppIdentity()<br>
	 * .then(<br>
	 *   function(data) {<br>
	 * 	   // success flow with application identity<br>
	 * 	 },<br>
	 * 	 function(error) {<br>
	 * 	   // failure flow with error<br>
	 * 	 }<br>
	 * );
	 * </code>
     * @methodOf WLAuthorizationManager#
	 */
	this.getAppIdentity = function () {};
	

};

/**
 * Defines how the authorization data should be saved on the device.
 */
var __AuthorizationPersistencePolicy = {
		/**
		 * The authorization data is maintained in the memory only. The user will be re-authenticated on subsequent application
		 * launches.
		 */
		NEVER : "NEVER",
		/**
		 * The authorization data is saved on the device. Once authenticated, the user is not required to authorize again, until the 
		 * access token is up to date.
		 */
		ALWAYS: "ALWAYS",
		/**
		 * Currently is not supported and falls back to <code>NEVER</code>.
		 */
		BIOMETRICS: "BIOMETRICS" 
	};

WLAuthorizationManager = new __WLAuthorizationManager;
WLAuthorizationManager.AuthorizationPersistencePolicy = __AuthorizationPersistencePolicy;

