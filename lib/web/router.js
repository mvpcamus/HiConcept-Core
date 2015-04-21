var crypto = require('crypto');
var express = require('express');
module.exports = function(app) {
  var users = require('./users_controller.js');
  app.use('/static', express.static('./web/static'));
  app.get('/', function(req, res){
    if (req.session.userid) {
      res.render('index', {id: req.session.userid,
                           name: req.session.username,
                           msg: req.session.msg});
    } else {
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
  });
  app.get('/user', function(req, res){
    if (req.session.userid) {
      res.render('user', {msg: req.session.msg});
    } else {
      req.session.msg = 'Access denied!';
      res.redirect('/login');
    }
  });
  app.get('/signup', function(req, res){
    if(req.session.userid){
      res.redirect('/');
    }
    res.render('signup', {msg: req.session.msg});
  });
  app.get('/login',  function(req, res){
    if(req.session.userid){
      res.redirect('/');
    }
    res.render('login', {msg: req.session.msg});
  });
  app.get('/logout', function(req, res){
    req.session.destroy(function(){
      res.redirect('/login');
    });
  });
  app.post('/signup', users.signup);
  app.post('/user/update', users.updateUser);
  app.post('/user/delete', users.deleteUser);
  app.post('/login', users.login);
  app.get('/user/profile', users.getUserProfile);
}
