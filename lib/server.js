var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');

module.exports.start = start;
module.exports.close = close;

function start(httpConf, dbPath, callback) {
    mongoose.connect(dbPath);
    mongoose.connection.on('error', function(error) {
        setTimeout(function() {
            callback('EE3::['+error+']');
            process.exit(1);
        },500);
    });
    mongoose.connection.on('disconnected', function() {
        setTimeout(function() {
            callback('EE3::[disconnected]');
            process.exit(1);
        },500);
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
            url: dbPath,
            collection: 'hiconcept.sessions'
        })
    }));

    require(_homePath+'/lib/router.js')(app);

    if (httpConf.https && typeof httpConf.sslCerts == 'object') {
        var constants = require('constants');
        var https = require('https');
        var tls = require('tls');
        var fs = require('fs');
        var options = {
            secureProtocol: 'SSLv23_method',
            secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3,
            key: httpConf.sslCerts.key,
            cert: httpConf.sslCerts.crt
        }
        https.createServer(options, app).listen(httpConf.port, function(error) {
            if(error) {
                callback('E211::'+httpConf.port);
            } else {
                callback(null);
            }
        });
    } else if (!httpConf.https) {
        var http = require('http');
        http.createServer(app).listen(httpConf.port, function (error) {
            if(error) {
                callback('E201::'+httpConf.port);
            } else {
                callback(null);
            }
        });
    } else {
        callback('FE14');
    }
}

function close(callback) {
    mongoose.connection.close(callback);
}
