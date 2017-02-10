var config = require("./config");
var admins = {}
var documentClient = require("documentdb").DocumentClient;
var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });
var databaseUrl = "dbs/" + config.database.id;
var collectionAdminsUrl = databaseUrl + "/colls/" + config.collection.admins.id;
var documentUrl = collectionAdminsUrl + "/docs/";
var respuesta=[];

admins =  {
	Radmins: function ( email ){
		let query='SELECT * FROM admins A WHERE A.email="'+ email +'"';
		
		client.queryDocuments( collectionAdminsUrl,query ).toArray((err, results) => {
		let admins=results;
			if (err){
				respuesta=[{retrieved:false},{returned:err.body}];
			}
			else {
				respuesta=[{retrieved:true},{returned:admins}];
			}
		});
		
		return respuesta;
	}
}

module.exports = admins;