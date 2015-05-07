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
exports.getModules = function(request, response) {
    Module.find({owner: request.params.user_id}).exec(function(error, modules) {
        if (error) {
            response.send(error.message).status(500).end();
        } else if(!modules) {
            response.sendStatus(404);
        } else {
            response.json(modules).status(200).end();
        }
    });
}
// create a new module POST:/admin/modules
exports.createModule = function(request, response) {
    Module.findOne({owner: request.session.user_id}).sort('-count').exec(function(error, mod) {
        if (error) {
            response.send(error.message).status(500).end();
        } else if (!request.session.user_id) {
            response.sendStatus(401);
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
                    response.send(error.message).status(500).end();
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });
}
// read selected module info GET:/admin/modules/:module_id
exports.readModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error) {
            response.send(error.message).status(500).end();
        } else if (!module) {
            response.sendStatus(404);
        } else {
            response.json(module).status(200).end();
        }
    });
}
// update selected module info PUT:/admin/modules/:module_id
exports.updateModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error) {
            response.send(error.message).status(500).end();
        } else if (!module) {
            response.sendStatus(404);
        } else {
            module.set('name', request.body.name);
            module.set('uuid', request.body.uuid);
            module.set('type', request.body.type);
            module.save({upsert:true}, function(error) {
                if (error) {
                    response.send(error.message).status(500).end();
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });
}
// delete selected module DELETE:/admin/modules/:module_id
exports.deleteModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error) {
            response.send(error.message).status(500).end();
        } else if (!module) {
            response.sendStatus(404);
        } else {
            module.remove(function (error) {
                if (error) {
                    response.send(error.message).status(500).end();
                }
                response.sendStatus(200);
            });
        }
    });
}
