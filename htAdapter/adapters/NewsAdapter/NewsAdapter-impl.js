function getNews(tag) {
	path = getPath(tag);
	
	var input = {
	    method : 'get',
	    returnedContentType : 'xml',
	    path : path
	};
	
	
	return WL.Server.invokeHttp(input);
}



function getPath(interest) {
	var path;
	if (interest == 'india') {
		path='/-2128936835.cms';
	}else if(interest=='sports') {
		path='/4719148.cms';
	}
	else if(interest=='tech'){
		path='/5880659.cms';
	}
	else{
		path='topstories.cms';
	}
	return 'rssfeeds' + path;
}

