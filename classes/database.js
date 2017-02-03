var mysql = require('mysql');
var crypt = require('./crypt');
this.connection = null;
var config = '';

// try to load config
try{
    config = require('../config/config');
}
catch(e){
    console.log('Config file was not loaded.');
}


exports.connect = function(){
    var user = crypt.decrypt(config['database']['username']);
    var pass = crypt.decrypt(config['database']['password']);

    try{
        this.connection = mysql.createConnection({
            host: config['database']['host'],
            user: user,
            password: pass,
            database: config['database']['name']
        });
        console.log('Connection to database');

    }
    catch(e){
        console.log('Failed to connect to database.');
        console.log(e);
    }
};