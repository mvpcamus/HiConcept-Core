var express = require('express');
var authen = require(_homePath+'/lib/authenticate.js');

// TODO: devide webUI & core routes using express router

module.exports = function(app) {
    // HiConcept webUI routes
    var users = require(_homePath+'/lib/web/controllers/users.js');
    app.use('/admin/static', express.static(_homePath+'/lib/web/static'));
    app.get('/', function(request, response) {
        if (request.session.user_id) {
            response.render('user_main', {id: request.session.user_id,
                                          name: request.session.username,
                                          msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/user', function(request, response) {
        if (request.session.user_id) {
            response.render('user_profile', {msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/signup', function(request, response) {
        if (request.session.user_id) {
            response.redirect('/');
        } else {
            response.render('user_signup', {msg: request.session.msg});
        }
    });
    app.get('/admin/login', function(request, response) {
        if (request.session.user_id) {
            response.redirect('/');
        } else {
            response.render('user_login', {msg: request.session.msg});
        }
    });
    app.get('/admin/logout', function(request, response) {
        request.session.destroy(function() {
            response.redirect('/admin/login');
        });
    });
    app.get('/admin/user/profile', authen, users.getUserProfile);
    app.post('/admin/signup', users.signup);
    app.post('/admin/user/update', users.updateUser);
    app.post('/admin/user/delete', users.deleteUser);
    app.post('/admin/login', users.login);

    var modules=require(_homePath+'/lib/web/controllers/modules.js');
    app.get('/admin/modules', function(request, response) {
        if (request.session.user_id) {
            response.render('module_add', {msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/:user_id/modules', authen, modules.getModules);
    app.post('/admin/modules', authen, modules.add);
    app.get('/admin/modules/:module_id', authen); //TODO: read method
    app.put('/admin/modules/:module_id', authen); //TODO: update method
    app.delete('/admin/modules/:module_id', authen, modules.deleteModule);

    // HiConcept core routes
    app.post('/publish/:user/:topic', authen, function(request, response) {
        response.send('from  : '+JSON.stringify(request.ip)+'\n'+
                      'params: '+JSON.stringify(request.params)+'\n'+
                      'body  : '+JSON.stringify(request.body)+'\n'+
                      'query : '+JSON.stringify(request.query)+'\n');
        response.status(200).end();
    });
}

