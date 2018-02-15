function wlCommonInit(){
	
}

var myhead="";

function myfunction(x){
	invocationData = {
			adapter : 'NewsAdapter',
			procedure : 'getNews',
			parameters : [x]
		};

		options = {
			onSuccess : feedScs,
			onFailure : feedFld
		};
		
myhead=x;
		WL.Client.invokeProcedure(invocationData, options);
}

function feedScs(result){
	var news = result.invocationResult.rss.channel.item;
	alert("Total : "+news.length+" news");
	$('#newshead').empty();
	$('#newshead').append(myhead.toUpperCase()+"news");
	$('#mydisplay').empty();
	for(i=0;i<news.length;i++){
		var single = news[i];
		var ndata = "";
		ndata += "<div class='ndiv'>";
		ndata += "<div class='hd'>"  +single.title + "</div>";
		ndata += "<div class='dt'> "  +single.pubData + "</div>";
		ndata += "<div class='desc'> "  +single.description + "</div>";
		ndata += "<div class='link'><a href='"+single.link+"'>.....Read More</a></div>";
		ndata += "</div>";
		$('#newshead').append(ndata);
	}
	
	window.location.assign("#dispPage");
	
}

function feedFld(){
	alert("Unable to connect News API");
}
