// module authorization for topics
module.exports.core = function(request, response, next) {
    var user = require('basic-auth')(request).name;
    var Topic = require(_homePath+'/lib/models/topics.js').Topic;
    Topic.findOne({col: request.params.topic_id}).exec(function(error, found) {
        if (error) {
            return response.sendStatus(500);
        } else if (found) {
            if (found.owner == user) {
                return next();
            } else if (request.method.toLowerCase() == 'post'
                        && found.write.indexOf(user) != -1) {
                return next();
            } else if (request.method.toLowerCase() == 'get'
                        && found.read.indexOf(user) != -1) {
                return next();
            } else {
                return response.sendStatus(403);
            }
        } else {
            return response.sendStatus(404);
        }
    });
}

// module authorization for websocket
module.exports.ws = function(ws, request, next) {
    var user = require('basic-auth')(request).name;
    var Topic = require(_homePath+'/lib/models/topics.js').Topic;
    Topic.findOne({col: request.params.topic_id}).exec(function(error, found) {
        if (error) {
            delete ws.clients[user];
            return ws.close(1011, 'internal server error');
        } else if (found) {
            if (found.owner == user) {
                return next();
            } else if (found.write.indexOf(user) != -1) {
                return next();
            } else {
                delete ws.clients[user];
                return ws.close(1008, 'unauthorized');
            }
        } else {
            delete ws.clients[user];
            return ws.close(1008, 'unauthorized');
        }
    });
}
