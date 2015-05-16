//==========================================================
//            RESTful API controller for users
//                    Auther: Jun Jo
//==========================================================
// 1. login: accept user login info (POST)
// 2. logout: perform user logout (POST)
// 3. createUser: create a new user account (POST)
// 4. readUser: read seleted user profile (GET)
// 5. updateUser: update selected user profile (PUT)
// 6. deleteUser: delete selected user account (DELETE)
//==========================================================

var encrypt = require(_homePath+'/lib/models/users.js').encrypt;
var User = require(_homePath+'/lib/models/users.js').User;

// accept user login info POST:/web/login
exports.login = function(request, response) {
    User.findOne({_id: request.body.id}).exec(function(error, user) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!user) {
            response.sendStatus(403);
        } else if (user.pass === encrypt(request.body.pass.toString())) {
            request.session.regenerate(function(error) {
                if (error) {
                    response.sendStatus(500);
                } else {
                    request.session.user_id = user.id;
                    request.session.userName = user.name;
                    request.session.userRole = user.role;
                    data = {};
                    data.id = request.session.id;
                    data.user = {id: user.id, role: user.role}; // TODO: update role
                    response.status(200).json(data);
                }
            });
        } else {
            response.sendStatus(403);
        }
    });
}
// perform user logout POST:/web/logout
exports.logout = function(request, response) {
    request.session.destroy(function(error) {
        if (error) {
            response.sendStatus(500);
        } else {
            response.sendStatus(200);
        }
    });
}
// create a new user account POST:/admin/users
exports.createUser = function(request, response) {
    var user = new User({_id: request.body.id});
    user.set('pass', encrypt(request.body.pass));
    user.set('email', request.body.email);
    user.set('name', request.body.name);
    user.set('age', request.body.age);
    user.set('sex', request.body.sex);
    user.set('role', request.body.role);
    user.save(function(error) {
        if (error) {
            response.status(500).send(error.message);
        } else {
            request.session.user_id = user.id;
            request.session.userName = user.name;
            request.session.userRole = user.role;
            response.sendStatus(200);
        }
    });
}
// read selected user profile GET:/admin/users/:user_id
exports.readUser = function(request, response) {
    User.findOne({_id: request.params.user_id}).exec(function(error, user) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!user) {
            response.sendStatus(404);
        } else {
            response.status(200).json(user);
        }
    });
}
// update selected user profile PUT:/admin/users/:user_id
exports.updateUser = function(request, response) {
    User.findOne({_id: request.params.user_id}).exec(function(error, user) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!user) {
            response.sendStatus(404);
        } else {
            if (request.body.pass) {
                user.set('pass', encrypt(request.body.pass));
            }
            user.set('email', request.body.email);
            user.set('name', request.body.name);
            user.set('age', request.body.age);
            user.set('sex', request.body.sex);
            user.save({upsert:true}, function(error) {
                if (error) {
                    response.status(500).send(error.message);
                } else {
                    request.session.userName = user.name;
                    response.sendStatus(200);
                }
            });
        }
    });
}
// delete selected user account DELETE:/admin/users/:user_id
exports.deleteUser = function(request, response) {
    User.findOne({_id: request.params.user_id}).exec(function(error, user) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!user) {
            response.sendStatus(404);
        } else {
            user.remove(function (error) {
                if (error) {
                    response.status(500).send(error.message);
                } else {
                    request.session.destroy(function(error) {
                        if (error) {
                            response.sendStatus(500);
                        } else {
                            response.sendStatus(200);
                        }
                    });
                }
            });
        }
    });
}
