var moduleSchema = require(_homePath+'/lib/models/modules.js').moduleSchema;
var mongoose = require('mongoose'),
    Module = mongoose.model('Module', moduleSchema, 'hiconcept.modules');

exports.add = function(request, response) {
    Module.findOne({owner: request.session.userid}).sort('-count').exec(function(error, mod) {
        if (error) {
            request.session.msg = error.message;
            response.redirect('/admin/module');
        } else {
            var id = 1 + (mod ? mod.count : 0);
            var module = new Module({_id: request.session.userid+'-['+id+']'});
            module.set('owner', request.session.userid);
            module.set('name', request.body.name);
            module.set('type', request.body.type);
            module.set('uuid', request.body.uuid);
            module.set('count', id);
            module.save(function(error) {
                if (error) {
                    request.session.msg = error.message;
                    response.redirect('/admin/module');
                } else {
                    request.session.msg = 'Module '+module.name+' Created.';
                    response.redirect('/');
                }
            });
        }
    });
}
exports.getModuleProfile = function(request, response) {
    Module.find({owner: request.session.userid}).exec(function(error, mod) {
        if (!mod) {
            response.status(404).json({error: 'Module Not Found.'});
        } else {
            response.status(200).json(mod);
        }
    });
}
exports.deleteModule = function(request, response) {
    Module.findOne({_id: request.params.moduleid}).exec(function(error, mod) {
        if (mod) {
            mod.remove(function (error) {
                if (error) {
                    request.session.msg = error;
                    response.status(500).end();
                }
                request.session.msg = 'Module '+mod.name+' Deleted.';
                response.status(200).end();
            });
        } else {
            request.session.msg = 'Module Not Found!';
            response.status(404).end();
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
