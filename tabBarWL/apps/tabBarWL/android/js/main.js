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


