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