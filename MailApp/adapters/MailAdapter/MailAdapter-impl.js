function sendM(from, msg, subject) {
	var obj = new com.mail.mailus.PasswordMail();
	return {
		result: obj.sendMail(from,msg,subject)
	};
}
