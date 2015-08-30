//==========================================================
//            RESTful API controller for modules
//                    Author: Jun Jo
//==========================================================
// 1. getModules: list up all modules of user (GET)
// 2. createModule: create a new module (POST)
// 3. readModule: read seleted module info (GET)
// 4. updateModule: update selected module info (PUT)
// 5. deleteModule: delete selected module (DELETE)
//==========================================================

var Module = require(_homePath+'/lib/models/modules.js').Module;

// list of all modules GET:/admin/modules
exports.getModules = function(request, response) {
    Module.find({owner: request.session.user_id}).sort('count').exec(function(error, modules) {
        if (error) {
            response.status(500).send(error.message);
        } else if(!modules) {
            response.sendStatus(404);
        } else {
            response.status(200).json(modules);
        }
    });
}
// create a new module POST:/admin/modules
exports.createModule = function(request, response) {
    Module.findOne({owner: request.session.user_id}).sort('-count').exec(function(error, mod) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!request.session.user_id) {
            response.sendStatus(401);
        } else {
            var count = 1 + (mod ? mod.count : 0);
            var module = new Module({_id: request.session.user_id+'.'+count});
            module.set('owner', request.session.user_id);
            module.set('name', request.body.name);
            module.set('uuid', request.body.uuid);
            module.set('type', request.body.type);
            module.set('count', count);
            module.save(function(error) {
                if (error) {
                    response.status(500).send(error.message);
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
            response.status(500).send(error.message);
        } else if (!module) {
            response.sendStatus(404);
        } else {
            response.status(200).json(module);
        }
    });
}
// update selected module info PUT:/admin/modules/:module_id
exports.updateModule = function(request, response) {
    Module.findOne({_id: request.params.module_id}).exec(function(error, module) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!module) {
            response.sendStatus(404);
        } else {
            module.set('name', request.body.name);
            module.set('uuid', request.body.uuid);
            module.set('type', request.body.type);
            module.save({upsert:true}, function(error) {
                if (error) {
                    response.status(500).send(error.message);
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
            response.status(500).send(error.message);
        } else if (!module) {
            response.sendStatus(404);
        } else {
            module.remove(function (error) {
                if (error) {
                    response.status(500).send(error.message);
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });
}
