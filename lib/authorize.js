var basicAuth = require('basic-auth');
var Topic = require(_homePath+'/lib/models/topics.js').Topic;

module.exports = function(request, response, next) {
    var user = basicAuth(request).name;
    Topic.findOne({col: request.params.topic_id}).exec(function(error, found) {
        if (request.method.toLowerCase() == 'post') {
            if (found.write.indexOf(user) != -1) {
                return next();
            } else {
                return response.sendStatus(403);
            }
        } else if (request.method.toLowerCase() == 'get') {
            if (found.read.indexOf(user) != -1) {
                return next();
            } else {
                return response.sendStatus(403);
            }
        } else {
                return response.sendStatus(403);
        }
    });
}
