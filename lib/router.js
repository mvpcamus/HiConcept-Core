var crypto = require('crypto');
var express = require('express');
var authen = require(_homePath+'/lib/authenticate.js');

// TODO: devide webUI & core routes using express router

module.exports = function(app) {
    // HiConcept webUI routes
    var users = require(_homePath+'/lib/web/controllers/users.js');
    app.use('/admin/static', express.static(_homePath+'/lib/web/static'));
    app.get('/', function(request, response) {
        if (request.session.userid) {
            response.render('user_main', {id: request.session.userid,
                                      name: request.session.username,
                                      msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/user', function(request, response) {
        if (request.session.userid) {
            response.render('user_profile', {msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/signup', function(request, response) {
        if (request.session.userid) {
            response.redirect('/');
        } else {
            response.render('user_signup', {msg: request.session.msg});
        }
    });
    app.get('/admin/login', function(request, response) {
        if (request.session.userid) {
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
    app.get('/admin/module', function(request, response) {
        if (request.session.userid) {
            response.render('module_add', {msg: request.session.msg});
        } else {
            request.session.msg = 'Access denied!';
            response.redirect('/admin/login');
        }
    });
    app.get('/admin/module/profile', authen, modules.getModuleProfile);
    app.delete('/admin/module/:moduleid', authen, modules.deleteModule);
    app.post('/admin/module', modules.add);

    // HiConcept core routes
    app.post('/publish/:user/:topic', authen, function(request, response) {
        response.send('from  : '+JSON.stringify(request.ip)+'\n'+
                      'params: '+JSON.stringify(request.params)+'\n'+
                      'body  : '+JSON.stringify(request.body)+'\n'+
                      'query : '+JSON.stringify(request.query)+'\n');
        response.status(200).end();
    });
}

