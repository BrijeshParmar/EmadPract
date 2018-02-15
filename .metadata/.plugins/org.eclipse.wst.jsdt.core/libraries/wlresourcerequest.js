/*
* Licensed Materials - Property of IBM
* 5725-I43 (C) Copyright IBM Corp. 2006, 2015. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
/**
 * @class
 * The <code>WLResourceRequest</code> object is used to send a request to any protected or unprotected resource using an absolute or relative URL.
 * It exposes a set of methods that allow you to set up and configure the requested object.
 * <p
 * If a request is sent to a protected resource, the <code>WLResourceRequest</code> object automatically handles the MobileFirst OAuth-based security model 
 * protocol and invokes the required challenges.<br>
 * The <code>WLAuthorizationManager</code> and <code>WLResourceRequest</code> classes are supported  for the following hybrid environments only: 
 * Android, iOS, Windows Phone 8 and Window 8.
 * 
 * @param {String} url Mandatory. Specifies absolute or relative URL. If you send a request to an adapter, you must add the <code>/adapters</code> path element.
 * For example: <code>/adapters/myAdapterName/myMethodName</code>
 * @param {String} method Mandatory. Request method, usually <code>WLResourceRequest.GET</code> or <code>WLResourceRequest.POST</code>
 * @param {Integer} timeout Optional. Request timeout, in milliseconds.
 * 
 * @example
 * <code>
 * var request = new WLResourceRequest('/adapters/sampleAdapter/multiplyNumbers', WLResourceRequest.GET);<br>
 * request.setQueryParameter('params', [5, 6]);<br>
 * request.send().then(<br>
 * 		function(response) {<br>
 * 			// success flow, the result can be found in response.responseJSON
 * 		},<br>
 * 		function(error) { <br>
 * 			// failure flow <br>
 * 			// the error code and description can be found in error.errorCode and error.errorMsg fields respectively <br>
 * 		}<br>
 * );<br>
 * 
 * </code>
 *
 * @name WLResourceRequest
 */
__WLResourceRequest = function (_url, _method, _timeout) {
    var url = (_url === null || typeof(_url) === 'undefined') ? logAndThrowError('Request URL must be specified.', 'WLResourceRequest') : _url.trim();
    var method = (typeof(_method) === 'undefined' || !isValidRequestMethod(_method)) ? logAndThrowError('Request method is invalid or not specified.', 'WLResourceRequest') : _method;
    var timeout = _timeout;
    var queryParameters = {};
    var headers = {};

    /**
     * @description Returns request URL. The URL must have been passed to the constructor.
     * @methodOf WLResourceRequest#
     */
    this.getUrl = function () {};
    
    /**
     * @description Returns current request method. A valid request method must have been passed to constructor.
     * @methodOf WLResourceRequest#
     */
    this.getMethod = function () {};
    
    /**
     * @description Returns query parameters as a JSON object with key-value pairs.
     * @methodOf WLResourceRequest#
     */
	this.getQueryParameters = function () {};
	
	/**
	 * @description Sets query parameters.
	 * @param {object} parameters Optional. A JSON object with key-value pairs. 
	 * If this parameter is null, or undefined, the query parameters are cleared.
     * @methodOf WLResourceRequest#
	 */
	this.setQueryParameters = function (parameters) {}; 
	
	/**
	 * @description Sets a new query parameter. If a parameter with the same name already exists, it will be replaced.
	 * @param {String} name Mandatory. Parameter name.
	 * @param value Mandatory. Parameter value. Should be string, number or boolean.
     * @methodOf WLResourceRequest#
	 */
	this.setQueryParameter = function (name, value) {}; 
	
	// receives string, returns array of header values (even if only 1). if name==undefined returns all headers
	/**
	 * @description Returns array of header values.
	 * @param {String} name Optional. Header name. If header name is specified, this function returns an array of header values 
	 * stored with this header, or undefined, if the specified header name is not found. If <code>name</code> is null, or undefined,
	 * this function returns all headers.
     * @methodOf WLResourceRequest#
	 */
	this.getHeaders = function (name) {}; 
	
	/**
	 * @description Returns array of header names. It can be empty, if no headers have been added.
     * @methodOf WLResourceRequest#
	 */
	this.getHeaderNames = function () {}; 
	
	/**
	 * @description Returns a first header value stored with the specified header name. The value is returned as a string. 
	 * Can be undefined if a header with the specified name does not exist.
	 * @param {String} name Mandatory. Header name.
     * @methodOf WLResourceRequest#
	 */
	this.getHeader = function (name) {}; 
	
	/**
	 * @description Sets request headers. The existing headers are replaced. 
	 * @param {Object} requestHeaders Optional. JSON object with request headers. Each header value should be either string, or array of strings. This function 
	 * throws an error if one of the specified header values is not valid. If this parameter is not specified, all headers will be removed.
     * @methodOf WLResourceRequest#
	 */
	this.setHeaders = function (requestHeaders) {}; 
	
	/**
	 * @description Sets a new header or replaces an existing header with the same name.
	 * @param {String} name Mandatory. Header name.
	 * @param value Mandatory. Header value. The value must be of a simple type (string, boolean or value).
     * @methodOf WLResourceRequest#
	 */
	this.setHeader = function (name, value) {}; 
	
	/**
	 * @description Adds a new header. If a header with the same name already exists, the header value will be added to the existing header. The name is 
	 * case insensitive.
	 * @param {String} name Mandatory. Header name.
	 * @param value Mandatory. Header value. The value must be of a simple type (string, number or boolean).
     * @methodOf WLResourceRequest#
	 */
	this.addHeader = function (name, value) {}; 

	/**
	 * @description Returns request timeout, in milliseconds.
     * @methodOf WLResourceRequest# 
	 */
	this.getTimeout = function() {}; 
	
	/**
	 * @description Sets request timeout. If timeout is not specified, then a default timeout will be used.
	 * @param {Integer} requestTimeout Mandatory. Request timeout, in milliseconds.
     * @methodOf WLResourceRequest#
	 */
	this.setTimeout = function (requestTimeout) {}; 
	
	/**
	 * @description Sends the request to a server.
	 * @param content Optional. Body content. It can be of a simple type (like string), object, or undefined.
	 * @returns Promise
     * @example
	 * <code>
	 * var request = WLResourceRequest(url, method, timeout);<br>
	 * request.send(content).then(<br>
	 * 	function(response) {
	 *    // success flow
	 *  }, <br>
	 * 	function(error) {
	 *    // fail flow
	 *  } <br>
	 * );
	 * </code>
     * @methodOf WLResourceRequest#
	 */
    this.send = function (content) {};
	
    /**
	 * @description Sends the request to a server with URL encoded form parameters.
	 * @param {Object} json Mandatory. Body content as JSON object or string as form data. The JSON object values must be a simple type.
	 * The content type will be set to <code>application/x-www-form-urlencoded<code>.
	 * @returns Promise
     * @example
	 * <code>
	 * var request = WLResourceRequest(url, method, timeout);<br>
	 * request.send(json).then(<br>
	 *   function(response) {
	 *     // success flow
	 *   }, <br>
	 * 	 function(error) {
	 *     // fail flow
	 *   } <br>
	 * );
	 * </code>
     * @methodOf WLResourceRequest#
	 */
	this.sendFormParameters = function (json) {};
	
};

WLResourceRequest.GET = "GET";
WLResourceRequest.POST = "POST";
WLResourceRequest.PUT = "PUT";
WLResourceRequest.DELETE = "DELETE";
WLResourceRequest.HEAD = "HEAD";
WLResourceRequest.OPTIONS = "OPTIONS";
WLResourceRequest.TRACE = "TRACE";
WLResourceRequest.CONNECT = "CONNECT";

WLResourceRequest = new __WLResourceRequest;

