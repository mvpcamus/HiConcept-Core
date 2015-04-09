var express = require('express');
var url = require('url');
var basicAuth = require('basic-auth');
var crypto = require('crypto');

var app = express();

function hashPass(passwd) {
    return crypto.createHash('sha256').update(passwd).digest('base64').toString();
}

function start(route, handle, config) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response);
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
        if (user.name === config.adminId && user.pass === config.adminPs) {
            return next();
        } else {
            return unauthorized(response);
        };
    };

    app.use('/', auth, onRequest);
    
    try {
        app.listen(config.port);
        logger.info('Server has started on port ' + config.port);
    } catch (error) {
        logger.error('Cannot start server on port ' + config.port);
    }
}

exports.start = start;
