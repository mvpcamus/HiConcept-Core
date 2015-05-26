// user session authentication for web interface
module.exports.web = function(request, response, next) {
    var User = require(_homePath+'/lib/models/users.js').User;
    if (request.session.user_id) {
        User.findOne({_id: request.session.user_id}).exec(function(error, found) {
            return ((error || !found) ? unauthorized(response) : next());
        });
    } else {
        return response.sendStatus(401);
    }
}

// module basic authentication for core interface
module.exports.core = function(request, response, next) {
    var user = require('basic-auth')(request);
    var Module = require(_homePath+'/lib/models/modules.js').Module;
    if (user && !!user.name && !!user.pass) {
        Module.findOne({_id: user.name}).exec(function(error, found) {
            if (found && found.uuid == user.pass) {
                return next();
            } else {
                response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return response.sendStatus(401);
            }
        });
    } else {
        response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return response.sendStatus(401);
    }
}
