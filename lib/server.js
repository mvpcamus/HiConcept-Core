var express = require('express');
var url = require('url');
var basicAuth = require('basic-auth');
var authorize = require(_homePath+'/lib/authorize.js');

var app = express();

function start(route, handle, callback) {
    function onRequest(request, response, callback) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response, callback);
    };

    function auth(request, response, next) {
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
        authorize(user.name, user.pass, function(error, result) {
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

    app.use('/', auth, onRequest);
    
    app.listen(_config.port, function (error) {
        if(error) {
            callback('E201::'+_config.port);
        } else {
            callback(null);
        }
    });
}

exports.start = start;
