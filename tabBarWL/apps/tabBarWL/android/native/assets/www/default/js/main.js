
/* JavaScript content from js/main.js in folder common */
function wlCommonInit(){
	/*
	 * Use of WL.Client.connect() API before any connectivity to a MobileFirst Server is required. 
	 * This API should be called only once, before any other WL.Client methods that communicate with the MobileFirst Server.
	 * Don't forget to specify and implement onSuccess and onFailure callback functions for WL.Client.connect(), e.g:
	 *    
	 *    WL.Client.connect({
	 *    		onSuccess: onConnectSuccess,
	 *    		onFailure: onConnectFailure
	 *    });
	 *     
	 */
	
	// Common initialization code goes here
	
}

/* JavaScript content from js/main.js in folder android */
function wlEnvInit(){
    wlCommonInit();
    
    WL.TabBar.init();

    WL.TabBar.addItem( "page1" ,
    		function(){window.location.assign("#page1");},
    		"Page 1",
    		{}
    );

    WL.TabBar.addItem( "page2" ,
    		function(){window.location.assign("#page2");},
    		"Page 2",
    		{}
    ); 

}


