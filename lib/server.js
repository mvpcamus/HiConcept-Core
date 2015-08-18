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
        app = wsService(app, httpsServer).app; // update websocket routes of express app
        require(_homePath+'/lib/router.js')(app);
    } else if (!httpConf.https) {
        var http = require('http');
        var httpServer = http.createServer(app).listen(httpConf.port, function (error) {
            if(error) {
                callback('E201::'+httpConf.port);
            } else {
                callback(null);
            }
        });
        app = wsService(app, httpServer).app; // update websocket routes of express app
        require(_homePath+'/lib/router.js')(app);
    } else {
        callback('FE14');
    }
}

function close(callback) {
    mongoose.connection.close(callback);
}

function wsService(app, server) {
    var ServerResponse = require('http').ServerResponse;
    var WebSocketServer = require('ws').Server;
    var wsServers = {};

    function addSocketRoute(route, middleware, callback) {
        var args = [].splice.call(arguments, 0);

        if (args.length < 2)
            throw new SyntaxError('Invalid number of arguments');

        if (args.length === 2) {
            middleware = [middleware];
        } else if (typeof middleware === 'object') {
            middleware.push(callback);
        } else {
            middleware = args.slice(1);
        }

        var wss = new WebSocketServer({
            server: server,
            path: route
        });

        wsServers[route] = wss;

        wss.on('connection', function(ws) {
            var response = new ServerResponse(ws.upgradeReq);
            response.writeHead = function (statusCode) {
                if (statusCode > 200) ws.close();
            };
            ws.upgradeReq.method = 'ws';

            app.handle(ws.upgradeReq, response, function(err) {
                var idx = 0;
                (function next (err) {
                    if (err) return;
                    var cur = middleware[idx++];
                    if (!middleware[idx]) {
                        cur(ws, ws.upgradeReq);
                    } else {
                        cur(ws.upgradeReq, response, next);
                    }
                }(err));
            });
        });

        return app;
    };

    app.ws = addSocketRoute;

    return {
        app: app,
        getWss: function (route) {
          return wsServers[route];
        }
    };
}

