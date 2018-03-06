function wlCommonInit(){
}

$('.carousel.carousel-slider').carousel({fullWidth: true});

// card click event
$('#science').on('click',function() {
	getData('in','science');
});

$('#sports').on('click',function() {
	getData('in', 'sports');
});

$('#tech').on('click',function() {
	getData('in', 'technology');
});

$('#business').on('click',function() {
	getData('in', 'business');
});

$('#health').on('click',function() {
	getData('in', 'health');
});

$('#entertainment').on('click',function() {
	getData('in', 'entertainment');
});

$('#ustech').on('click',function() {
	getData('us', 'technology');
});

$('#usbusiness').on('click',function() {
	getData('us', 'business');
});

$('#usenter').on('click',function() {
	getData('us', 'entertainment');
});

$('#aljazeera').on('click',function() {
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

function getData(country,cat){
console.log(country);
$('#myNews').empty();
$.ajax({
	type : 'GET',
	url : "https://newsapi.org/v2/top-headlines?country="+country+"&category="+cat+"&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
	data : 'json',
	success: function(res){
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


function getNews(source) {
	console.log(source);
	$('#myNews').empty();
	$.ajax({
		type : 'GET',
		url : "https://newsapi.org/v2/top-headlines?sources="+source+"&apiKey=f7fd2ab5456b4fa4b41b7e1e4146cf72",
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
