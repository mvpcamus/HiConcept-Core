var express = require('express');
var authen = require(_homePath+'/lib/authenticate.js');

// TODO: devide webUI & core routes using express router

module.exports = function(app) {
    // HiConcept webUI routes
    app.use('/static', express.static(_homePath+'/lib/web/static'));

    var users = require(_homePath+'/lib/controllers/users.js');
    app.get('/', function(request, response) {
        response.redirect('/web');
    });
    app.get('/web*', function(request, response) {
        response.render('index');
    });
    app.post('/web/login', users.login);
    app.post('/web/logout', users.logout);

    app.post('/admin/users', users.createUser);
    app.get('/admin/users/:user_id', authen, users.readUser);
    app.put('/admin/users/:user_id', authen, users.updateUser);
    app.delete('/admin/users/:user_id', authen, users.deleteUser);

    var modules=require(_homePath+'/lib/controllers/modules.js');
    app.get('/admin/:user_id/modules', authen, modules.getModules);
    app.post('/admin/modules', authen, modules.createModule);
    app.get('/admin/modules/:module_id', authen, modules.readModule); 
    app.put('/admin/modules/:module_id', authen, modules.updateModule); 
    app.delete('/admin/modules/:module_id', authen, modules.deleteModule);

    // HiConcept core routes
    app.post('/publish/:user/:topic', authen, function(request, response) {
        response.send('from  : '+JSON.stringify(request.ip)+'\n'+
                      'params: '+JSON.stringify(request.params)+'\n'+
                      'body  : '+JSON.stringify(request.body)+'\n'+
                      'query : '+JSON.stringify(request.query)+'\n');
        response.sendStatus(200);
    });
}

