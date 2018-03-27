function wlCommonInit(){
	
	
}

/*function splashover(){
	setTimeout(function(){
		WL.Page.load("./new.html", {
			onComplete : function(){},
			onUnload : function(){}
		});
		},3000);
}*/

/*$('.carousel.carousel-slider').carousel({fullWidth: true});*/

// card click event
$('#science').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in','science',ct);
});

$('#sports').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in', 'sports',ct);
});

$('#tech').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in', 'technology',ct);
});

$('#business').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in', 'business',ct);
});

$('#health').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in', 'health',ct);
});

$('#entertainment').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('in', 'entertainment',ct);
});

$('#ustech').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('us', 'technology',ct);
});

$('#usbusiness').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('us', 'business',ct);
});

$('#usenter').on('click',function() {
	var ct=0; // Counter for Busy Indicator
	getData('us', 'entertainment',ct);
});

$('#aljazeera').on('click',function(e) {
	/*e.preventDefault();
	alert("1");*/
	getNews('al-jazeera-english');
});

$('#arstech').on('click',function() {
	getNews('ars-technica');
});

$('#bbcnew').on('click',function() {
	getNews('bbc-news');
});

$('#techcr').on('click',function() {
	getNews('techcrunch');
});

function getData(country,cat,ct){
	console.log(country);
	$('#myNews').empty();
	$('#myNews').append("<center>"+"<div class='preloader-wrapper big active' id='mydiv'> "+
			"  <div class='spinner-layer spinner-blue'> " +
			"  <div class='circle-clipper left'> " +
			"<div class='circle'> "+
			  "</div> "+
			"</div> "+
			"<div class='gap-patch'> "+
			  "<div class='circle'>"+
			"</div>"+
			" </div> " +
			"    <div class='circle-clipper right'> " +
			"<div class='circle'> " +
			"  </div> " +
			" </div> " +
			"</div>" + " </div> ");
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?country="+country+"&category="+cat+"&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success: function(res){
			if(ct==0){
			$('#myNews').empty();
			ct=ct+1;
			}
			if(res.status == 'ok' && res.totalResults > 0) {
				for(var i=0; i <= res.totalResults; i++) {
					if(res.articles[i].urlToImage == null) {
						$('#myNews').append("<div class='row'> "+
								"  <div class='col s12'> " +
								"  <div class='card'> " +
								"<div class='card-image'> "+
								  "<img src='./images/1.png'> "+
								 " <span class='card-title'>"+res.articles[i].title+"</span> "+
								"</div> "+
								"<div class='card-content'> "+
								  "<p> "+res.articles[i].description+"</p>"+
								"</div>"+
								" <div class='card-action'> " +
								"    <a href='"+res.articles[i].url+"'>Read More</a> " +
								"   </div> " +
								"  </div> " +
								" </div> " +
								"</div>");
					} else {
						if(ct==0)
							{
						$('#myNews').empty();
							ct=ct+1;
							}
					$('#myNews').append("<div class='row'> "+
	"  <div class='col s12'> " +
	"  <div class='card'> " +
	"<div class='card-image'> "+
	  "<img src='"+res.articles[i].urlToImage+"'> "+
	 " <span class='card-title'>"+res.articles[i].title+"</span> "+
	"</div> "+
	"<div class='card-content'> "+
	  "<p> "+res.articles[i].description+"</p>"+
	"</div>"+
	" <div class='card-action'> " +
	"    <a href='"+res.articles[i].url+"'>Read More</a> " +
	"   </div> " +
	"  </div> " +
	" </div> " +
	"</div>");
					}
				}			
			
			}
		}
		
		
		
	});
	}


function getNewsAl(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=al-jazeera-english&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		/*url : "https://newsapi.org/v2/top-headlines?sources="+source+"&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",*/
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsArs(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=ars-technica&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsBbc(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsTec(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsGoo(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=google-news&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsCBS(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=cbs-news&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsHack(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=hacker-news&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}

function getNewsCry(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources=crypto-coins-news&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
		data : 'json',
		success : function(res) {
			if (res.status == 'ok' && res.totalResults > 0) {
				for (var i = 0; i <= res.totalResults; i++) {
					if (res.articles[i].urlToImage == null) {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='./images/1.png'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					} else {
						$('#myNews').append(
								"<div class='row'> "
										+ "  <div class='col s12'> "
										+ "  <div class='card'> "
										+ "<div class='card-image'> "
										+ "<img src='"
										+ res.articles[i].urlToImage + "'> "
										+ " <span class='card-title'>"
										+ res.articles[i].title + "</span> "
										+ "</div> "
										+ "<div class='card-content'> "
										+ "<p> " + res.articles[i].description
										+ "</p>" + "</div>"
										+ " <div class='card-action'> "
										+ "    <a href='" + res.articles[i].url
										+ "'>Read More</a> " + "   </div> "
										+ "  </div> " + " </div> " + "</div>");
					}
				}

			}
		}

	});
}