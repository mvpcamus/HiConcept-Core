var moduleSchema = require(_homePath+'/lib/models/modules.js').moduleSchema;
var mongoose = require('mongoose'),
    Module = mongoose.model('Module', moduleSchema, 'hiconcept.modules');

exports.add = function(request, response) {
    Module.findOne({owner: request.session.user_id}).sort('-count').exec(function(error, mod) {
        if (error) {
            request.session.msg = error.message;
            response.redirect('/admin/modules');
        } else {
            var id = 1 + (mod ? mod.count : 0);
            var module = new Module({_id: request.session.user_id+'-['+id+']'});
            module.set('owner', request.session.user_id);
            module.set('name', request.body.name);
            module.set('type', request.body.type);
            module.set('uuid', request.body.uuid);
            module.set('count', id);
            module.save(function(error) {
                if (error) {
                    request.session.msg = error.message;
                    response.redirect('/admin/modules');
                } else {
                    request.session.msg = 'Module '+module.name+' Created.';
                    response.redirect('/');
                }
            });
        }
    });
}
var getModules = exports.getModules = function(request, response) {
    Module.find({owner: request.params.user_id}).exec(function(error, mod) {
        if (error || !mod) {
            request.session.msg = error ? error.message : 'ERROR: db access failed';
            response.status(404).end(request.session.msg);
        } else {
            response.status(200).json({module: mod, message: request.session.msg});
        }
    });
}
exports.deleteModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, mod) {
        if (error || !mod) {
            request.session.msg = error ? error.message : 'ERROR: module not found';
            response.status(404).end(request.session.msg);
        } else {
            mod.remove(function (error) {
                if (error) {
                    request.session.msg = error.message;
                    response.status(500).end(request.session.msg);
                }
                request.session.msg = 'Module '+mod.name+' Deleted.';
                request.params.user_id = mod.owner;
                getModules(request, response);
            });
        }
    });
}

/*
exports.updateUser = function(request, response) {
    User.findOne({_id: request.session.userid}).exec(function(error, user) {
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
    User.findOne({_id: request.session.userid}).exec(function(error, user) {
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
*/
