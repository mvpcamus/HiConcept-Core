var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');

function start(sslCerts, callback) {
    mongoose.connect(_config.dbPath);
    mongoose.connection.on('error', function(error) {
        callback('EE3::['+error+']');
        process.exit(1);
    });
    mongoose.connection.on('disconnected', function() {
        callback('EE3::[disconnected]');
        process.exit(1);
    });

    var app = express();

    app.engine('.html', require('ejs').__express);
    app.set('views', _homePath+'/lib/web/views');
    app.set('view engine', 'html');

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(expressSession({
        secret: 'H1c0nc#PtC0dE',
        name: '_hiconcept_sid',
        cookie: {path:'/', maxAge: null},
        resave: true,
        saveUninitialized: false,
        store: new mongoStore({
            url: _config.dbPath,
            collection: 'hiconcept.sessions'
        })
    }));

    require(_homePath+'/lib/router.js')(app);

    if (_config.https && typeof sslCerts == 'object') {
        var constants = require('constants');
        var https = require('https');
        var tls = require('tls');
        var fs = require('fs');
        var options = {
            secureProtocol: 'SSLv23_method',
            secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3,
            key: sslCerts.key,
            cert: sslCerts.crt
        }
        https.createServer(options, app).listen(_config.port, function(error) {
            if(error) {
                callback('E211::'+_config.port);
            } else {
                callback(null);
            }
        });
    } else if (!_config.https) {
        var http = require('http');
        http.createServer(app).listen(_config.port, function (error) {
            if(error) {
                callback('E201::'+_config.port);
            } else {
                callback(null);
            }
        });
    } else {
        callback('FE14');
    }
}

exports.start = start;
