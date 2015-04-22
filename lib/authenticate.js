var basicAuth = require('basic-auth');
var crypto = require('crypto');
var userSchema = require(_homePath+'/lib/models/users.js').userSchema;
var mongoose = require('mongoose'),
    User = mongoose.model('User', userSchema, 'hiconcept.users');

function encrypt(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}

function check(user, callback) {
    User.findOne({_id: user.name}).exec(function(error, found) {
        if (!found) {
            error = 'User Not Found.'; // TODO: connect callback for error messages 
        } else if (found.pass === encrypt(user.pass)) {
            return callback(null, true);
        } else {
            return callback('EC01::['+user+']', false);
        }
        if (error) {
            return callback(error, false);
        }
    });
}

function unauthorized(response) {
    response.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    response.sendStatus(401);
    response.end();
    return false;
}

module.exports = function(request, response, next) {
    var user = basicAuth(request);
    if (!user || !user.name || !user.pass) {
        return unauthorized(response);
    }
    check(user, function(error, result) {
        if (error) {
//            callback(error);
            return unauthorized(response);
        } else {
            if (result === true) {
//                callback('DC00::['+user.name+']');
                return next();
            } else {
                return unauthorized(response);
            }
        }
    });
}
