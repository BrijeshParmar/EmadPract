/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

__WLLogger = function() {

	/**
	 * Writes a debug message to the
	 * <code><Worklight Root Directory>/server/log/server/server.log</code>>
	 * file.
	 * 
	 * @param value
	 *            Mandatory. A string containing the message to be written to
	 *            the log file.
	 */
	this.debug = function(value) {
	};

	/**
	 * Writes an error message to the
	 * <code><Worklight Root Directory>/server/log/server/server.log</code>>
	 * file.
	 * 
	 * @param value
	 *            Mandatory. A string containing the message to be written to
	 *            the log file.
	 */
	this.error = function(value) {
	};

};

__WLServer = function() {
	/**
	 * Invokes a procedure exposed by a Worklight adapter.
	 * 
	 * @param invocationData
	 *            The invokeProcedure function accepts the following JSON block
	 *            of parameters:<br> { adapter : adapter-name.wlname, procedure :
	 *            adapter-name.procedure-name.wlname, parameters : [],
	 *            forceAccessToBackend : Boolean }
	 * 
	 * @return The invokeProcedure method returns an object containing the data
	 *         returned by the invoked procedure, and additional information
	 *         about the procedure invocation. The returned object has the
	 *         following structure:<br>
	 *         <code>
	 *         	{
	 *         		isSuccessful: Boolean,
	 *         		errorMessages: ["Error Msg1", �],
	 *         		// Application object returned by procedure
	 *         	}
	 *         </code>
	 * 
	 */
	this.invokeProcedure = function(invocationData) {
	};

	/**
	 * Calls a back-end HTTP service.
	 * 
	 * @param options
	 *            The invokeHttp function accepts the following JSON block of
	 *            parameters:<br> { method : 'get' or 'post',
	 *            returnedContentType: 'xml' or 'html', returnedContentEncoding :
	 *            'encoding', path: value, parameters: {name1: value1, � },
	 *            headers: {name1: value1, � }, cookies: {name1: value1, � },
	 *            body: { contentType: 'text/xml; charset=utf-8' or similar
	 *            value, content: stringValue }, transformation: { type: 'void',
	 *            'default', or 'xslFile', xslFile: fileName } }
	 * 
	 * @return The method returns the response of the HTTP service, after the
	 *         following processing:<br>
	 *         1. If the service returns HTML, the Worklight Server converts the
	 *         HTML response to XHTML. If the service returns XML, the Worklight
	 *         Server keeps it as is.<br>
	 *         2. If an XSL transformation has been defined in transformation
	 *         property, the Worklight Server executes the transformation on the
	 *         result of Step 1. The transformation should convert its XML input
	 *         to JSON. If no transformation was defined, the Worklight Server
	 *         automatically converts the result of Step 1 to JSON.
	 */
	this.invokeHttp = function(options) {
	};

	/**
	 * Calls a back-end CastIron service over HTTP.
	 * 
	 * @param options
	 *            The invokeCastIron function accepts the following JSON block of
	 *            parameters:<br> { method : 'get' or 'post',
	 *            returnedContentType: 'xml' or 'html', returnedContentEncoding :
	 *            'encoding', path: value, parameters: {name1: value1, � },
	 *            headers: {name1: value1, � }, cookies: {name1: value1, � },
	 *            body: { contentType: 'text/xml; charset=utf-8' or similar
	 *            value, content: stringValue }, transformation: { type: 'void',
	 *            'default', or 'xslFile', xslFile: fileName } }
	 * 
	 * @return The method returns the response of the HTTP service, after the
	 *         following processing:<br>
	 *         1. If the service returns HTML, the Worklight Server converts the
	 *         HTML response to XHTML. If the service returns XML, the Worklight
	 *         Server keeps it as is.<br>
	 *         2. If an XSL transformation has been defined in transformation
	 *         property, the Worklight Server executes the transformation on the
	 *         result of Step 1. The transformation should convert its XML input
	 *         to JSON. If no transformation was defined, the Worklight Server
	 *         automatically converts the result of Step 1 to JSON.
	 */
	this.invokeCastIron = function(options) {
	};

	
	
	/**
	 * Creates a prepared SQL statement, to be later invoked with
	 * <code>WL.Server.invokeSQLStatement</code>.
	 * 
	 * The method can only be used inside a procedure declared within an SQL
	 * adapter. It must be used outside of the scope of any JavaScript function.
	 * 
	 * @param statement
	 *            An SQL statement with one of the following verbs: select,
	 *            insert, delete, update. Use question marks ("?") as parameter
	 *            placeholder.
	 * @return An object representing the prepared statement.
	 */
	this.createSQLStatement = function(statement) {
	};

	/**
	 * Calls a prepared SQL statement created with
	 * <code>WL.Server.createSQLStatement</code>.
	 * 
	 * @param options
	 *            The invokeSQLStatement function accepts the following JSON
	 *            block of parameters:<br> { preparedStatement :
	 *            prepared-statement-variable, parametrers: [value-1, value-2,
	 *            �], transformation: { type: 'void', 'default', or 'xslFile',
	 *            xslFile: fileName } }
	 * 
	 * @return The method returns the result set of the prepared statement,
	 *         after the following processing:<br>
	 *         1. If no XSL transformation has been defined in the
	 *         transformation property, the Worklight Server converts the result
	 *         set into a JSON-formatted array, in which each item corresponds
	 *         to a row in the result set.<br>
	 *         2. If an XSL transformation has been defined in the
	 *         transformation property, the Worklight Server converts the result
	 *         set into an XML document having an element for each row in the
	 *         result set, where each such element contains sub-elements for
	 *         each returned column. The Server then executes the transformation
	 *         on this XML document. The transformation should convert its XML
	 *         input to JSON.
	 */
	this.invokeSQLStatement = function(options) {
	};

	/**
	 * The method can only be used inside a procedure declared within an SQL
	 * adapter. Calls a stored procedure on a database.
	 * 
	 * @param options
	 *            The invokeSQLStoredProcedure function accepts the following
	 *            JSON block of parameters:<br> { procedure : 'procedure-name',
	 *            parametrers: [value-1, value-2, �], transformation: { type:
	 *            'void', 'default', or 'xslFile', xslFile: fileName } }
	 * 
	 * @return The method returns the result set of the SQL stored procedure,
	 *         after the following processing:<br>
	 *         1. If no XSL transformation has been defined in the
	 *         transformation property, the Worklight Server converts the result
	 *         set into a JSON-formatted array, in which each item corresponds
	 *         to a row in the result set.<br>
	 *         2. If an XSL transformation has been defined in the
	 *         transformation property, the Worklight Server converts the result
	 *         set into an XML document having an element for each row in the
	 *         result set, where each such element contains sub-elements for
	 *         each returned column. The Server then executes the transformation
	 *         on this XML document. The transformation should convert its XML
	 *         input to JSON.
	 */
	this.invokeSQLStoredProcedure = function(options) {
	};
	
	/**
	 * Writes a JMS Text Message.
	 * @param message 
	 * 		{
			destination: "JNDI_DESTINATION",
			message:{   	
				body: "Some text here",
				properties:{MY_USER_PROPERTY:123456, JMSCorrelationID:"The_Correl_ID_I_Want_To_Set"}
			}
		}
		Description:
		destination: the jndi name of the resource that the message should be written to. The JNDI resource must be configured in the adapter.
		body: any text
		poroperties: Any JMS* property e.g. JMSCorrelationID that the JMS Specification allows to be set on writing of a message.
				The properties can also include any provider specific properties or any user defined property. Naming conventions of user defined and provider specific 
				properties are as per JMS specification.
				
		@return The method returns the result of the invocation along with the JMSMessageID of the message sent if the message got sent correctly.
		e.g. 
		{
  			"JMSMessageID": "ID:414d51204d59514d20202020202020202755bb4f2000b602",
  			"isSuccessful": true
		} 
	 */
	this.writeJMSMessage = function(message){};
	
	/**
	 * Reads a single JMS Message from the defined jndi resource.
	 * @param options
	 * 		({	destination: "JNDI_DESTINATION",
     *			timeout: 60
     *          filter : JMS_FILTER_STRING 
     *    });
     *    Description: 
     *    destination : the jndi name of the resource that the message should be written to. The JNDI resource must be configured in the adapter.
     *    timeout : The maximum length of time to wait for a message if there isn't one available immediately - in milliseconds.
     *    filter : standard JMS syntax message filter
     *    
     *   @return {  "body": "Message body",
     *              "isSuccessful": true,
     *                "properties": {
     *                    "JMSCorrelationID": null,
     *                     "JMSDeliveryMode": 1,
	 *		     }
	 * 	 Description:
	 * 	body : body of the message
	 *  properties : all Properties of the message that the JMS provider returns. Including JMS_PROVIDER_NAME_* properties as well as user properties.	 
	 * 
	 */	
	this.readSingleJMSMessage = function(options){};
	
	/**
	 * Reads all available JMS Messages from the defined jndi resource.
	 * @param options
	 * 		({	destination: "JNDI_DESTINATION",
     *			timeout: 60
     *          filter : JMS_FILTER_STRING 
     *    });
     *    Description: 
     *    destination : the jndi name of the resource that the message should be written to. The JNDI resource must be configured in the adapter.
     *    timeout : The maximum length of time to wait for a message if there isn't one available immediately - in milliseconds. NOTE: This timeout is per message request so the algorithm is 
     *    do
     *    {
     *    	message = getMessage(timeout);
     *    	if(message!=null) 
     *    		addToList(message)
     *    )while(message!=null)
     *    
     *    filter : standard JMS syntax message filter
     *   
     *    @return returns the individual messages as per readJMSMessage wrapped in a List messages i.e.
     *    {
     *        	"isSuccessful": true,
     *			"messages": [
     *   			{
     *                   "body": "msgBody",
     * 					 "properties": {
     * 					         "JMSCorrelationID": null,
     * 					         etc.
     *				},
     *				{
     * 					"body": "next Msg Body",
     * 					"properties": {
     *   				"JMSCorrelationID": null,
     *   				etc.
     *   			}
     *   			]
     *   	}
     *   				
     *     
	 * 
	 */	
	this.readAllJMSMessages = function(options){};
	
	
	/**
	 * Implements the standard request reply messaging pattern using correlationID's.
	 * Writes a message to the specified destination then waits for a reply. The replyTo destination is set automatically by the adapter.
	 * @param messageAndOptions
	 * {
     *    	destination: "JNDI_DESTINATION",
     *	    timeout: 60,
     *	    message:{as per writeJMSMessage
     *	}
     * 	
     * 	@returns the response message, if any, as per readJMSMessage
	 */
	this.requestReplyJMSMessage= function(messageAndOptions){};

	/**
	 * A map containing all server properties defined in the file
	 * worklight.properties.
	 */
	this.configuration = function() {
	};

	/**
	 * Returns an object with the user identity properties, as defined by the
	 * login module.
	 * 
	 * @return An object with the user identity properties, as defined by the
	 *         login module. There are no constraints as of the structure of the
	 *         object.
	 */
	this.getActiveUser = function() {
	};
	
	/**
	 * Returns a reference to the Java HttpServletRequest object that was used to invoke an adapter procedure.
	 * This method can be used in any adapter procedure. Use this method to return headers or other information 
	 * stored in an HttpServletRequest object.
	 * 
	 * @return A reference to the Java HttpServletRequest object.
	 *         
	 */
	this.getClientRequest = function() {
	};

	/**
	 * Creates an event source according to the options given. 
	 * @param options The JSON block contains the following properties: 
	 * 		name - Mandatory. A string containing the name of the event source. 
	 * 		onUserSubscribe - Optional. The name of the JavaScript function (in the adapter file) called when the user subscribes to this event source in the first time, on first device subscription. The callback function receives the user subscription object as input parameter.
	 * 		onUserUnsubscribe - Optional. The name of the JavaScript function (in the adapter file) called when the user unsubscribes from this event source in the first time, on first device subscription. The callback function receives the user subscription object as input parameter.
	 *		onDeviceUnsubscribe - Optional. The name of the JavaScript function which is called when the device subscription is removed by a client requestor by the cleanup task. The callback function receives the device subscription as input parameter.
	 *		poll - Optional. If the method of getting the notification data from the backend is polling, provide the following properties:
	 *			* interval � Mandatory. The interval in seconds between the polls.
	 *			* onPoll � Mandatory. The name of JavaScript function which is called on each poll.         
	 */
	this.createEventSource = function(options){};
	
	/**
	 * Returns a subscription object for the user with the specified ID to the specified event source. 
	 * @param eventSource - Mandatory. A string containing the name of the event source. 
	 * @param userId - Mandatory. A string containing the user ID, created during the login process. The user ID can be obtained by calling WL.Server.getActiveUser.
	 * @returns The method returns a subscription object containing the user ID, the mutable subscription state, and an array of the device subscriptions. The device subscriptions contain the device token, the application ID, the platform, and the options passed by the client in the subscribe call.   
	 */
	this.getUserNotificationSubscription = function(eventSource, userId){};
	
	/**
	 * Submits a notification to the specified device of a subscribed user, according to the specified options. 
	 * @param deviceSubscription The device subscription.
	 * @param options - The JSON block contains the following properties:
	 * 			badge - Optional. An integer value to be displayed in a badge on the application icon.
	 * 			sound - Optional. The name of a file to play when the notification arrives.
	 * 			alert - Optional. A string to be displayed in the alert.
	 * 			activateButtonLabel - Optional. The label of the dialog box button that will allow the user to open the app upon receiving the notification.
	 * 			payload - Optional. A JSON block that is transferred the application if opened by the user when receiving the notification, or if the application is already open while the notification is received.
	 *	@deprecated
	 */
	this.submitNotification = function(deviceSubscription, options){};
	
	/**
	 * Send the notification to all the device subscriptions of the given user subscription
	 */
	this.notifyAllDevices = function(userSubscription, options){};
	
	/**
	 * Send the notification to the device subscription with the given device ID which belongs to the given user subscription
	 */
	this.notifyDevice = function(userSubscription, device, options){};
	
	/**
	 * Send the notification to the given device subscription
	 */
	this.notifyDeviceSubscription = function(deviceSubscription, options){};
	
	/**
	 * Create and return default Notification JSON object.
	 * @param notificationText - Optional. A string to be displayed in the alert.
	 * @param badge - Optional. An integer value to be displayed in a badge on the application icon.
	 * @param payload - Optional. A JSON block that is transferred the application if opened by the user when receiving the notification, or if the application is already open while the notification is received.
	 */
	this.createDefaultNotification = function(notificationText, badge, payload){};
};

// //////////////////////////////////////////////////
// ///////// ONLY FOR CODE COMPLETION ///////////
// //////////////////////////////////////////////////
__WL.prototype.Server = new __WLServer;
__WL.prototype.Logger = new __WLLogger;

WL.Server = new __WLServer;
