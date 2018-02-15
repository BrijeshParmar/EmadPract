var procedure1Statement = WL.Server.createSQLStatement("select COLUMN1, COLUMN2 from TABLE1 where COLUMN3 = ?");
function procedure1(param) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : procedure1Statement,
		parameters : [param]
	});
}

var loginStatement = WL.Server.createSQLStatement("select * from sinfo where userid=? and password=?");
function login(uid,pwd){
	return WL.Server.invokeSQLStatement({
		preparedStatement:loginStatement,
		parameters:[uid,pwd]
	});
}

var registerStatement = WL.Server.createSQLStatement("insert into sinfo values(?,?,?,?,?)");
function register(uid,pwd,name,age,city){
	return WL.Server.invokeSQLStatement({
		preparedStatement:registerStatement,
		parameters:[uid,pwd,name,age,city]
	});
}
