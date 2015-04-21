var express = require('express');
var url = require('url');
var basicAuth = require('basic-auth');
var authenticate = require(_homePath+'/lib/authenticate.js');

var app = express();

function start(route, handle, callback) {
    function onRequest(request, response, callback) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response, callback);
    };

    function auth(request, response, next) {
//console.log(request); //TODO: remove later
        function unauthorized(response) {
            response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            response.sendStatus(401);
            response.end();
            return false;
        };
        var user = basicAuth(request);
        if (!user || !user.name || !user.pass) {
            return unauthorized(response);
        };
        authenticate(user.name, user.pass, function(error, result) {
            if(error) {
                callback(error);
                return unauthorized(response);
            } else {
                if (result === true) {
                    callback('DC00::['+user.name+']');
                    return next();
                } else {
                    return unauthorized(response);
                }
            }
        });
    };

    app.get('/*', auth, onRequest);
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var urlencodedParser = bodyParser.urlencoded({extended: false});
    var parser = null;

//    if(request.is('json')) {parser = jsonParser;}
//    if(request.is('text/*')) {parser = urlencodedParser;}
    app.post('/management/users', auth, urlencodedParser, function(request, response) {
        response.send('post message: '+JSON.stringify(request.body)+'\n');
        response.status(200).end();
    });

    app.post('/publish/:user/:topic', auth, jsonParser, function(request, response) {
        console.log('ip: '+request.ip);
        console.log('params: '+JSON.stringify(request.params));
        console.log('body: '+JSON.stringify(request.body));
        console.log('qeury: '+JSON.stringify(request.query));
        response.send('post message: '+JSON.stringify(request.body)+'\n');
        response.status(200).end();
    });
    
    app.listen(_config.port, function (error) {
        if(error) {
            callback('E201::'+_config.port);
        } else {
            callback(null);
        }
    });
}

exports.start = start;
