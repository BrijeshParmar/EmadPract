/*
 *  Licensed Materials - Property of IBM
 *  5725-G92 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

	
__JSONStore = function(){
 
	this.initCollection = function (name, searchFields, options){ };
	
	this.usePassword = function (pwd){ };
	
	this.clearPassword = function () {};
	
	this.closeAll = function (options) { };
	
	this.changePassword = function (oldPW, newPW, options) {};
	
	this.destroy =  function (options) {};
	
	this.getErrorMessage = function (statusCode) {};
		
};

__WL.prototype.JSONStore = new __JSONStore;
//WL.JSONStore = new __JSONStore;