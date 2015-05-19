var basicAuth = require('basic-auth');
var encrypt = require(_homePath+'/lib/models/users.js').encrypt;
var User = require(_homePath+'/lib/models/users.js').User;

function unauthorized(response) {
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    response.status(401).end();
    return;
}

module.exports = function(request, response, next) {
    var user = basicAuth(request);
    if (!user || !user.name || !user.pass) {
        if (request.session.user_id) {
            User.findOne({_id: request.session.user_id}).exec(function(error, found) {
                return ((error || !found) ? unauthorized(response) : next());
            });
        } else {
            return unauthorized(response);
        }
    } else {
        User.findOne({_id: user.name}).exec(function(error, found) {
            if (!found) {
                return unauthorized(response);
            } else if (found.pass === encrypt(user.pass)) {
                return next();
            } else {
                return unauthorized(response);
            }
        });
    }
}
