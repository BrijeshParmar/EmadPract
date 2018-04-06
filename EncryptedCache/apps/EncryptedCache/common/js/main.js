/*
*
    COPYRIGHT LICENSE: This information contains sample code provided in source code form. You may copy, modify, and distribute
    these sample programs in any form without payment to IBM® for the purposes of developing, using, marketing or distributing
    application programs conforming to the application programming interface for the operating platform for which the sample code is written.
    Notwithstanding anything to the contrary, IBM PROVIDES THE SAMPLE SOURCE CODE ON AN "AS IS" BASIS AND IBM DISCLAIMS ALL WARRANTIES,
    EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
    FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND ANY WARRANTY OR CONDITION OF NON-INFRINGEMENT. IBM SHALL NOT BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR OPERATION OF THE SAMPLE SOURCE CODE.
    IBM HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS OR MODIFICATIONS TO THE SAMPLE SOURCE CODE.

*/

var busyIndicator = null;

function wlCommonInit() {
	busyIndicator = new WL.BusyIndicator();
	
	$('#openCache').click(openCacheClicked);
	$('#closeCache').click(closeCacheClicked);
	$('#destroyCache').click(destroyCacheClicked);

	$('#encryptButton').click(encryptButtonClicked);
	$('#decryptButton').click(decryptButtonClicked);
	$('#removeButton').click(removeButtonClicked);
}

//Open
function openCacheClicked(){
	var key = $('#encryptionKey').val();	
	if (!key || key == "") 	{ 	
		alert("Invalid key");	
		return;	
	}
	
	busyIndicator.show();
	
	WL.EncryptedCache.open(key, true, onOpenComplete, onOpenError);
	function onOpenComplete(status){
		busyIndicator.hide();
		alert("Encrypted cache succesfully opened");
	}
	function onOpenError(status){
		busyIndicator.hide();
		switch(status){
			case WL.EncryptedCache.ERROR_KEY_CREATION_IN_PROGRESS:
				alert("ERROR: KEY CREATION IN PROGRESS");
				break;
			case WL.EncryptedCache.ERROR_LOCAL_STORAGE_NOT_SUPPORTED:
				alert("ERROR: LOCAL STORAGE NOT SUPPORTED");
				break;
			case WL.EncryptedCache.ERROR_NO_EOC:
				alert("ERROR: NO EOC");
				break;
			case WL.EncryptedCache.ERROR_COULD_NOT_GENERATE_KEY:
				alert("ERROR: COULD NOT GENERATE KEY");
				break;
			case WL.EncryptedCache.ERROR_CREDENTIALS_MISMATCH:
				alert("ERROR: CREDENTIALS MISMATCH");
				break;
			default:
				alert("AN ERROR HAS OCCURED. STATUS :: " + status);
		}
	}	
}

// Close
function closeCacheClicked(){
	WL.EncryptedCache.close(onCloseCompleteHandler, onCloseFailureHandler);
}
function onCloseCompleteHandler(status){
	alert("Encrypted cache closed successfuly");
}
function onCloseFailureHandler(status){
	alert("Could not close Encrypted cache");
}

// Destroy
function destroyCacheClicked(){
	WL.EncryptedCache.destroy(onDestroyCompleteHandler, onDestroyErrorHandler);
	//alert("Encrypted cache destroyed");
}
function onDestroyCompleteHandler(status){
	alert("Encrypted cache destroyed");
}
function onDestroyErrorHandler(status){
	alert("Error destroying Encrypted cache");
}

// Encrypt
function encryptButtonClicked(){
	var key = $("#key").val(); 
	var value = $("#value").val();
	
	if (!key || key == "") 	{ 
		alert("Invalid key");	
		return;	
	}
	
	if (!value|| value == "") {
		alert("Invalid value");	
		return;	
	}
	
	WL.EncryptedCache.write(key, value, onWriteSuccess, onWriteFailure);
	function onWriteSuccess(status){
		alert("Succesfully encrypted into cache.");
	}
	function onWriteFailure(status){
		if (status == WL.EncryptedCache.ERROR_EOC_CLOSED) 
			alert("Encrypted cache closed, write failed. error code= "+ status);
	}
}

// Decrypt
function decryptButtonClicked(){
	var key = $("#key").val(); 
	if (!key || key == "") 	{
		alert("Invalid key");
		return;	
	}
	
	WL.EncryptedCache.read(key, onDecryptReadSuccess, onDecryptReadFailure);
	function onDecryptReadSuccess(value){
		alert("Read success. Retrieved value :: " + key + " = " + value); 
	}
	function onDecryptReadFailure(status){
		alert("Encrypted cache closed, reading failed");
	}
}

// Remove
function removeButtonClicked(){
	var key = $("#key").val(); 
	if (!key || key == "") 	{ 
		alert("Invalid key");	
		return;	
	}
	
	WL.EncryptedCache.remove(key, onRemoveSuccess, onRemoveFailure);
	function onRemoveSuccess(status){
		alert("Succesfully removed from cache."); 
	}
	function onRemoveFailure(status){
		alert("Encrypted cache closed, remove failed");
	}
}
