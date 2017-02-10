'use strict';
var restify = require('restify');
var jwt = require('jsonwebtoken');
var server = restify.createServer();
var config = require("./config");
var admins = require("./admins");
var documentClient = require("documentdb").DocumentClient;
var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = "dbs/" + config.database.id;
var collectionUrl = databaseUrl + "/colls/" + config.collection.id;
var documentUrl = collectionUrl + "/docs/";
var version="/v.1.0.0";

///////////////////obtencion

server.put( version + '/user/:token', Cuser );//ok
server.get( version + '/user/:id/:token', Ruser );//OK
server.post( version + '/user/:id/:token', Uuser );//ok
server.del( version + '/user/:id/:token', Duser );//ok
server.get( version + '/users/:token', Rusers );//ok

/////////////////////////////////////////////
server.get( version + '/admins/:email/:password', Radmins );//OK

/////////////////////////////////////////////

function Radmins( req, response, next ){
		let _token=null;
		let _email=req.params.email;
		let _password=req.params.password;
		let _respuesta=null;
		let _retrieved=null;
		let _returned=null;
		let _adminis=null;
	
	try{
		_respuesta=admins.Radmins( _email );
		_retrieved=_respuesta[0];
		_returned=_respuesta[1];
	
		if(_retrieved.retrieved==true){
			_adminis=_returned.returned[0];
			
			if( (_adminis.active==true) && (_adminis.password==_password) ){
				_token=jwt.sign(_adminis, config.superSecret.superSecret, { expiresIn: '1h' });
				console.log( "Accoeso concedido" );
				_respuesta[2]={token:_token};
				response.send( _respuesta );
			}else{
				console.log("NO NO NO, Sin Acceso!!!!!!!!")
				response.send([{retrieved:false},{returned:"Password y/o usuario no activo"}]);
			}
		}else{
			console.log("No se pudo contactar al servidor");
			response.send([{retrieved:false},{returned:"No se pudo contactar al servidor"}] );
		}
	}catch(err){
		response.send( [{retrieved:false},{returned:err}] );
	}finally{
		next();	
	}
};


function Rusers( req, response, next ) {
	let _token=req.params.token;
		
	jwt.verify(_token,config.superSecret.superSecret, function(err, decoded) {
		if (err) {
			response.send( [{retrieved:false},{returned:err.message}] );
		} else {
			client.queryDocuments(collectionUrl,'SELECT U.id , U.nombreAlumno FROM users U').toArray((err, results) => {
			let _usuarios=results;
			let respuesta=[];
				if (err){
					respuesta=[{retrieved:false},{returned:err.body}];
				}
				else {
					respuesta=[{retrieved:true},{returned:_usuarios}];
				}
			
			response.send( respuesta );
			});
		}
    });
	next();
};


function Ruser( req, response, next ) {
	let _id=req.params.id;
	let _token=req.params.token;
	
	jwt.verify(_token,config.superSecret.superSecret, function(err, decoded) {
		if (err) {
			response.send( [{retrieved:false},{returned:err.message}] );
		} else {
			client.queryDocuments(collectionUrl,'SELECT * FROM users U WHERE U.id="'+_id+'"').toArray((err, results) => {
			let _usuario=results;
			let respuesta=[];
				if (err){
					respuesta=[{retrieved:false},{returned:err.body}];
				}
				else {
					respuesta=[{retrieved:true},{returned:_usuario}];
				}
				response.send( respuesta );
			});
		}
    });
		
	next();
};


function Uuser( req, response, next ) {
	let _id=req.params.id;
	let _token=req.params.token;
	
	jwt.verify(_token,config.superSecret.superSecret, function(err, decoded) {
		if (err) {
			response.send( [{retrieved:false},{returned:err.message}] );
		} else {
			client.replaceDocument(documentUrl+_id, config.documents, (err, result) => {
			let _usuario=result;
			let respuesta=[];
				if (err){
					console.log(err);
					respuesta=[{updated:false},{returned:err.body}]
				}
				else {
					respuesta=[{updated:true},{returned:_usuario}]
				}
				response.send( respuesta );
        });
		}
    });

	next();
};


function Cuser( req, response, next ) {
	let _usuario= config.documents;
	let _token=req.params.token;

	jwt.verify(_token,config.superSecret.superSecret, function(err, decoded) {
		if (err) {
			response.send( [{created:false},{returned:err.message}] );
		} else {
			client.createDocument( collectionUrl, _usuario , (err, created) => {
			let respuesta=[];
				if (err){ 
					console.log(err.body);
					respuesta=[{created:false},{returned:err.body}];
				}
				else{
					respuesta=[{created:true},{returned:_usuario}];
				}
				response.send( respuesta );
			});
		}
    });
	
	next();
};


function Duser( req, response, next ) {
	let _id=req.params.id;
	let _token=req.params.token;
	
	jwt.verify(_token,config.superSecret.superSecret, function(err, decoded) {
		if (err) {
			response.send( [{retrieved:false},{returned:err.message}] );
		} else {
			client.deleteDocument(documentUrl+_id, (err, result) => {
			let _usuario=result;
			let respuesta=[];
				if (err){ 
					
					respuesta=[{deleted:false},{returned:err.body}];
				}
				else{
					respuesta=[{deleted:true},{returned:_usuario}];
				}
			response.send( respuesta );
			});
		}
    });
	
	next();
};

////////////////////////

function getCollection() {
    console.log("Getting collection:\n" + config.collection.id + "\n");

    return new Promise(function (resolve, reject) {
        client.readCollection(collectionUrl, function (err, result) {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, function (err, created) {
                        if (err) reject(err);else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

function getDatabase() {
    console.log("Getting database:\n" + config.database.id + "\n");

    return new Promise(function (resolve, reject) {
        client.readDatabase(databaseUrl, function (err, result) {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, function (err, created) {
                        if (err) reject(err);else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

getDatabase();
getCollection();
console.log( databaseUrl );
console.log( collectionUrl );
console.log( documentUrl );

////////////////////////
server.listen(8081, function() {
  console.log( '%s listening at %s', server.name, server.url );
});