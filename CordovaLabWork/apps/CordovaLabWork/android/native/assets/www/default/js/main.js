
/* JavaScript content from js/main.js in folder common */
function wlCommonInit(){
	
}


function takeImg() {
	alert('Button Pressed');
	navigator.camera.getPicture(onSuccess, onFail, {
		quality : 50,
		destinationType : Camera.DestinationType.DATA_URL
	});
	function onSuccess(imageData) {
		var image = document.getElementById('photoid');
		image.src = "data:image/jpeg;base64," + imageData;
	}
	function onFail(message) {
		alert('Failed because: ' + message);
	}

}
/* JavaScript content from js/main.js in folder android */
// This method is invoked after loading the main HTML and successful initialization of the IBM MobileFirst Platform runtime.
function wlEnvInit(){
    wlCommonInit();
    // Environment initialization code goes here
}