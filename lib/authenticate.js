var basicAuth = require('basic-auth');
var crypto = require('crypto');
var userSchema = require(_homePath+'/lib/models/users.js').userSchema;
var mongoose = require('mongoose'),
    User = mongoose.model('User', userSchema, 'hiconcept.users');

function encrypt(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}

function unauthorized(response) {
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    response.status(401).end();
    return;
}

module.exports = function(request, response, next) {
    var user = basicAuth(request);
    if (!user || !user.name || !user.pass) {
        if (request.session.userid) {
            User.findOne({_id: request.session.userid}).exec(function(error, found) {
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
