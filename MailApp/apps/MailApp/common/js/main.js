function wlCommonInit(){
}
var myindi;
function onSend(){
	var to = $('#to').val();
	var sub = $('#subject').val();
	var msg = $('#msg').val();
	var invocationData = {
			adapter : 'MailAdapter',
			procedure : 'sendM',
			parameters:[to,msg,sub]
		};
		
		var options = {
				onSuccess : feedResult,
				onFailure : feedError
		};
		myindi = new WL.BusyIndicator(null, {
			text : "Please Wait......."
		});
		myindi.show();
		WL.Client.invokeProcedure(invocationData, options);
}


function feedResult(result) {
	var obj = result.invocationResult;
	myindi.hide();
	WL.SimpleDialog.show("Sending Mail", "Mail Sent", [ {
		text : 'OK',
		handler : function() {
		}
	} ]);

	
}

function feedError() {
	myindi.hide();
	WL.SimpleDialog.show("Error!!!!!",
			"Unable to contact  API, Please check your internet!!!!", [ {
				text : 'OK',
				handler : function() {
				}
			} ]);
}
