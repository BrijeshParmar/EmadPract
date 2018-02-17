/*
* Licensed Materials - Property of IBM
* 5725-G92 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

function wlCommonInit(){

}

function registerFunction(){
	var email=document.getElementById("ruserid").value;
	var name=document.getElementById("rname").value;
	var age=document.getElementById("rage").value;
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(email.value)) {
		alert('Please provide a valid email address');
		email.focus;
	}
	if(!(/^[A-Za-z ]+$/.test(name))&& name.length > 10){
		alert('Please Provide Name');
		name.focus;
	}
	if(age<18 || age>60){
		alert('Please Provide Proper Age');
		age.focus;
	}
}