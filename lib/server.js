var express = require('express');
var url = require('url');
var basicAuth = require('basic-auth');
var crypto = require('crypto');

var app = express();

function hashPass(passwd) {
    return crypto.createHash('sha256').update(passwd).digest('base64').toString();
}

function start(route, handle, callback) {
    function onRequest(request, response, callback) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response, callback);
    };

//TODO: seperate authorization
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
        if (user.name === config.adminUser && user.pass === config.adminPass) {
            return next();
        } else {
            return unauthorized(response);
        };
    };

    app.use('/', auth, onRequest);
    
    app.listen(config.port, function (error) {
        if(error) {
            callback('E201::' + config.port);
        } else {
            callback('I200::' + config.port);
        }
    });
}

exports.start = start;
