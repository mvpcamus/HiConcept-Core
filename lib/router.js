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
    app.get('/admin/users/:user_id', authen, users.readUser);
    app.put('/admin/users/:user_id', authen, users.updateUser);
    app.delete('/admin/users/:user_id', authen, users.deleteUser);

    var modules=require(_homePath+'/lib/controllers/modules.js');
    app.get('/admin/modules', authen, modules.getModules);
    app.post('/admin/modules', authen, modules.createModule);
    app.get('/admin/modules/:module_id', authen, modules.readModule); 
    app.put('/admin/modules/:module_id', authen, modules.updateModule); 
    app.delete('/admin/modules/:module_id', authen, modules.deleteModule);

    var topics=require(_homePath+'/lib/controllers/topics.js');
    app.get('/admin/topics', authen, topics.getTopics);
    app.post('/admin/topics', authen, topics.createTopic);
    app.get('/admin/topics/:topic_id', authen, topics.readTopic); 
    app.put('/admin/topics/:topic_id', authen, topics.updateTopic); 
    app.delete('/admin/topics/:topic_id', authen, topics.deleteTopic);

    // HiConcept core routes
    var data=require(_homePath+'/lib/controllers/data.js');
    app.post('/topics/:topic_id', authen, author, data.publish);
    app.get('/topics/:topic_id', authen, author, data.subscribe);

    app.post('/publish/:user/:topic', authen, function(request, response) {
        response.status(200).send('from  : '+JSON.stringify(request.ip)+'\n'+
                                  'params: '+JSON.stringify(request.params)+'\n'+
                                  'body  : '+JSON.stringify(request.body)+'\n'+
                                  'query : '+JSON.stringify(request.query)+'\n');
    });
}
