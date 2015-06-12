var express = require('express');
var authen = require(_homePath+'/lib/authenticate.js');
var author = require(_homePath+'/lib/authorize.js');

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
    app.get('/admin/users/:user_id', authen.web, users.readUser);
    app.put('/admin/users/:user_id', authen.web, users.updateUser);
    app.delete('/admin/users/:user_id', authen.web, users.deleteUser);

    var modules=require(_homePath+'/lib/controllers/modules.js');
    app.get('/admin/modules', authen.web, modules.getModules);
    app.post('/admin/modules', authen.web, modules.createModule);
    app.get('/admin/modules/:module_id', authen.web, modules.readModule); 
    app.put('/admin/modules/:module_id', authen.web, modules.updateModule); 
    app.delete('/admin/modules/:module_id', authen.web, modules.deleteModule);

    var topics=require(_homePath+'/lib/controllers/topics.js');
    app.get('/admin/topics', authen.web, topics.getTopics);
    app.post('/admin/topics', authen.web, topics.createTopic);
    app.get('/admin/topics/:topic_id', authen.web, topics.readTopic); 
    app.put('/admin/topics/:topic_id', authen.web, topics.updateTopic); 
    app.delete('/admin/topics/:topic_id', authen.web, topics.deleteTopic);

    // HiConcept core routes
    var data=require(_homePath+'/lib/controllers/data.js');
    app.post('/topics/:topic_id', authen.core, author, data.publish);
    app.get('/topics/:topic_id', authen.core, author, data.subscribe);
}
