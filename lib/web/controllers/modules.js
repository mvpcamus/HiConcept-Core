//==========================================================
//            RESTful API controller for modules
//                    Auther: Jun Jo
//==========================================================
// 1. getModules: list up all modules of given user_id
// 2. createModule: create a new module (POST)
// 3. readModule: read seleted module info (GET)
// 4. updateModule: update selected module info (PUT)
// 5. deleteModule: delete selected module (DELETE)
//==========================================================

var moduleSchema = require(_homePath+'/lib/models/modules.js').moduleSchema;
var mongoose = require('mongoose'),
    Module = mongoose.model('Module', moduleSchema, 'hiconcept.modules');

// list of all modules GET:/admin/:user_id/modules
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
// create a new module POST:/admin/modules
exports.createModule = function(request, response) {
    Module.findOne({owner: request.session.user_id}).sort('-count').exec(function(error, mod) {
        if (error) {
            request.session.msg = error.message;
            response.redirect('/admin/modules');
        } else {
            var count = 1 + (mod ? mod.count : 0);
            var module = new Module({_id: request.session.user_id+'-['+count+']'});
            module.set('owner', request.session.user_id);
            module.set('name', request.body.name);
            module.set('uuid', request.body.uuid);
            module.set('type', request.body.type);
            module.set('count', count);
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
// read selected module info GET:/admin/modules/:module_id
exports.readModule = function(request, response) {  //TODO: test
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error || !module) {
            request.session.msg = error ? error.message : 'ERROR: module not found';
            response.status(404).end(request.session.msg);
        } else {
            response.status(200).json(module);
        }
    });
}
// update selected module info PUT:/admin/modules/:module_id
exports.updateModule = function(request, response) {    //TODO: test
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error || !module) {
            request.session.msg = error ? error.message : 'ERROR: module not found';
            response.status(404).end(request.session.msg);
        } else {
            module.set('name', request.body.name);
            module.set('uuid', request.body.uuid);
            module.set('type', request.body.type);
            module.save({upsert:true}, function(error) {
                if (error) {
                    request.session.msg = error.message;
                    response.status(500).end(request.session.msg);
                } else {
                    request.session.msg = 'Module Updated';
                    response.status(200).end(request.session.msg);
                }
            });
        }
    });
}
// delete selected module DELETE:/admin/modules/:module_id
exports.deleteModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error || !module) {
            request.session.msg = error ? error.message : 'ERROR: module not found';
            response.status(404).end(request.session.msg);
        } else {
            module.remove(function (error) {
                if (error) {
                    request.session.msg = error.message;
                    response.status(500).end(request.session.msg);
                }
                request.session.msg = 'Module '+module.name+' Deleted.';
                request.params.user_id = module.owner;
                getModules(request, response); // update module list
            });
        }
    });
}

