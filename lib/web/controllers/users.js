var crypto = require('crypto');
var userSchema = require(_homePath+'/lib/models/users.js').userSchema;
var mongoose = require('mongoose'),
    User = mongoose.model('User', userSchema, 'hiconcept.users');

// TODO: use encrypt function in authenticat.js
function encrypt(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}

exports.signup = function(request, response) {
    var user = new User({_id: request.body.id});
    user.set('name', request.body.name);
    user.set('pass', encrypt(request.body.pass));
    user.set('email', request.body.email);
    user.save(function(error) {
        if (error) {
            request.session.msg = error.message;
            response.redirect('/admin/signup');
        } else {
            request.session.user_id = user.id;
            request.session.username = user.name;
            request.session.msg = 'Authenticated as '+user.name;
            response.redirect('/');
        }
    });
}
exports.login = function(request, response) {
    User.findOne({_id: request.body.id}).exec(function(error, user) {
        if (!user) {
            error = 'User Not Found.';
        } else if (user.pass === encrypt(request.body.pass.toString())) {
            request.session.regenerate(function() {
                request.session.user_id = user.id;
                request.session.username = user.name;
                request.session.msg = 'Authenticated as '+user.name;
                response.redirect('/');
            });
        } else {
            error = 'Authentication failed.';
        }

        if (error) {
            request.session.regenerate(function() {
                request.session.msg = error;
                response.redirect('/admin/login');
            });
        }
    });
}
exports.getUserProfile = function(request, response) {
    User.findOne({_id: request.session.user_id}).exec(function(error, user) {
        if (!user) {
            response.status(404).json({error: 'User Not Found.'});
        } else {
            response.status(200).json(user);
        }
    });
}
exports.updateUser = function(request, response) {
    User.findOne({_id: request.session.user_id}).exec(function(error, user) {
        if (request.body.pass != '') user.set('pass', encrypt(request.body.pass));
        if (request.body.name != '') user.set('name', request.body.name);
        if (request.body.email != '') user.set('email', request.body.email);
        user.save(function(error) {
            if (error) {
                request.session.msg = error;
            } else {
                request.session.msg = 'User Updated.';
            }
            response.redirect('/');
        });
    });
}
exports.deleteUser = function(request, response) {
    User.findOne({_id: request.session.user_id}).exec(function(error, user) {
        if (user) {
            user.remove(function (error) {
                if (error) {
                    request.session.msg = error;
                }
                request.session.destroy(function() {
                    response.redirect('/admin/login');
                });
            });
        } else {
            request.session.msg = 'User Not Found!';
            request.session.destroy(function() {
                response.redirect('/admin/login');
            });
        }
    });
}
