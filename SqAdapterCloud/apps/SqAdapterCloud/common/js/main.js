/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

function wlCommonInit(){

	
}


function registerfunction()
{
	var uid,pwd,name,age;
	uid=$('#ruserid').val();
	pwd=$('#rpassword').val();
	name=$('#rname').val();
	age=$('#rage').val();
	city=$('#rcity').val();
	
	invocationData={
			adapter:'mysqladapter',
			procedure:'register',
			parameters:[uid,pwd,name,age,city]
	};
	options={
			onSuccess:rScr,
			onFailure:rFld
			
	};
	
	WL.Client.invokeProcedure(invocationData, options);
	
	
}

function loginfunction()
{
	var uid,pwd;
	uid=$('#luserid').val();
	pwd=$('#lpassword').val();
	
	invocationData={
			adapter:'mysqladapter',
			procedure:'login',
			parameters:[uid,pwd]
	};
	options={
			onSuccess:loginSuccess,
			onFailure:loginFailed
	};
	
	WL.Client.invokeProcedure(invocationData, options);
	
}


function loginSuccess(result){
	var rs=result.invocationResult.resultSet;
	if(rs.length==1){
		alert('Login Successfull');
		window.location.assign("#home");
		$('#1').val("Welcome "+rs[0].uname+",");
		$('#2').val("Age " +rs[0].age);
	}
	else{
		alert('Check UserId and Password');
	}
	
}

function loginFailed(){
	alert('Login failed due to server issues,please check your connection');
}

function rScr(result) {
	var flag = result.isSuccessFul;
	if (flag = true) {
		alert("Account Registed Successfully!!!");
		//alert("Record Affected : " + result.updateStatementResult.updateCount);
	} else {
		alert("please check your fields and retry!!!");
	}
}

function rFld() {
	alert("please check your connection with server and try again!!!");

}