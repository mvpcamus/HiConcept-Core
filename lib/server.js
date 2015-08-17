var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');
var websocket = require('websocket').server;

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
        var options = {
            secureProtocol: 'SSLv23_method',
            secureOptions: constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3,
            key: httpConf.sslCerts.key,
            cert: httpConf.sslCerts.crt
        }
        var httpsServer = https.createServer(options, app).listen(httpConf.port, function(error) {
            if(error) {
                callback('E211::'+httpConf.port);
            } else {
                callback(null);
            }
        });
        wsService(httpsServer); // start websocket on https
    } else if (!httpConf.https) {
        var http = require('http');
        var httpServer = http.createServer(app).listen(httpConf.port, function (error) {
            if(error) {
                callback('E201::'+httpConf.port);
            } else {
                callback(null);
            }
        });
        wsService(httpServer); // start websocket on http
    } else {
        callback('FE14');
    }
}

function close(callback) {
    mongoose.connection.close(callback);
}

function wsService(httpServer) {
    wsServer = new websocket({
        httpServer: httpServer,
        autoAcceptConnections: false
    });
    wsServer.on('request', function (request) {
        if(request.httpRequest.headers['sec-websocket-protocol'] === 'echo-protocol') {
            var connection = request.accept('echo-protocol', request.origin);
            connection.on('message', function (message) {
                if(message.type === 'utf8') {
                    console.log('Received message:' + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                } else if (message.type === 'binary') {
                    connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', function (reasonCode, description) {
                console.log('Peer ' + connection.remoteAddress + ' disconnected.');
            });
        } else if(request.httpRequest.headers['sec-websocket-protocol'] === 'protocol2') {
            var connection = request.accept('protocol2', request.origin);
            connection.on('message', function (message) {
                if(message.type === 'utf8') {
                    console.log('Second Protocol:' + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                }
            });
        } else {
            request.reject();
        }
    });
}
