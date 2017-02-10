const uuidV4 = require('uuid/v4');
var Chance = require('chance'),
    chance = new Chance();
// ADD THIS PART TO YOUR CODE
var config = {}

config.endpoint = "https://escuelas.documents.azure.com:443/";
config.primaryKey = "jFlLOdNLaGtBBSlFCBMuajtjwdLw1lBvtr3Kcmkze4lYwAXRpTeqKQIktHVanZw6GuX5DBZfVTc6f0Wq8lYnGA==";

config.database = {
    "id": "controlEscuelas"
};

config.collection = {
    "id": "users"
};

config.collection.admins = {
    "id": "admins"
};

config.superSecret={
	"superSecret":"d30ff585-0804-471f-9904-52ff92a8695ee96c4ff4-f443-4adf-a871-e8e9de0ffda177e0fa1c-7019-407a-b010-1f6670d9d35b"
}

config.documents={
  "id": uuidV4(),
  "ttl":500,
  "nombreAlumno": chance.name()+' '+chance.last(),
  "fAlta": "12-03-2015",
  "sucursalInscrito": chance.address(),
  "fNacimiento": chance.birthday(),
  "fBaja": "",
  "telefono":chance.phone(),
  "contactoEmergencia": [
    {
      "nombre": chance.name()+' '+chance.last(),
      "telefono": chance.phone()
    },
    {
      "nombre": chance.name()+' '+chance.last(),
      "telefono":chance.phone()
    }
  ],
  "matricula": chance.natural({min: 9000000000000000, max: 9007199254740992}) ,
  "torneos": [
    {
      "nombre": chance.sentence({words: 2}) ,
      "sede":  chance.address(),
      "clase": "trofeo",
      "premios": {
        "plata": chance.integer({min: 0, max: 5})
      }
    },
    {
      "nombre": chance.sentence({words: 2}) ,
      "sede":  chance.address(),
      "clase": "medalla",
      "premios": {
        "plata": chance.integer({min: 0, max: 10}) ,
        "bronce": chance.integer({min: 0, max: 10}),
        "oro": chance.integer({min: 0, max: 10})
      }
    }
  ],
  "examenes": [
    {
      "sede": chance.sentence({words: 2}) ,
      "sinodal": chance.name()+' '+chance.last(),
      "fAplicacion": chance.date(),
      "jurado": [
       chance.name()+' '+chance.last(),
       chance.name()+' '+chance.last(),
       chance.name()+' '+chance.last()
      ],
      "aprobado": false
    }
  ]
};

module.exports = config;