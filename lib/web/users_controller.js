var crypto = require('crypto');
var userSchema = require('../models/users.js').userSchema;
var mongoose = require('mongoose'),
    User = mongoose.model('User', userSchema, 'hiconcept.users');
function hashPW(pwd){
  return crypto.createHash('sha512').update(pwd).
         digest('base64').toString();
}
exports.signup = function(req, res){
  var user = new User({_id: req.body.id});
  user.set('name', req.body.name);
  user.set('pass', hashPW(req.body.pass));
  user.set('email', req.body.email);
  user.save(function(err) {
    if (err){
      req.session.msg = err.message;
      res.redirect('/signup');
    } else {
      req.session.userid = user.id;
      req.session.username = user.name;
      req.session.msg = 'Authenticated as ' + user.name;
      res.redirect('/');
    }
  });
};
exports.login = function(req, res){
  User.findOne({ _id: req.body.id })
  .exec(function(err, user) {
    if (!user){
      err = 'User Not Found.';
    } else if (user.pass === 
               hashPW(req.body.pass.toString())) {
      req.session.regenerate(function(){
        req.session.userid = user.id;
        req.session.username = user.name;
        req.session.msg = 'Authenticated as ' + user.name;
        res.redirect('/');
      });
    }else{
      err = 'Authentication failed.';
    }
    if(err){
      req.session.regenerate(function(){
        req.session.msg = err;
        res.redirect('/login');
      });
    }
  });
};
exports.getUserProfile = function(req, res) {
  User.findOne({ _id: req.session.userid })
  .exec(function(err, user) {
    if (!user){
      res.json(404, {err: 'User Not Found.'});
    } else {
      res.json(user);
    }
  });
};
exports.updateUser = function(req, res){
  User.findOne({ _id: req.session.userid })
  .exec(function(err, user) {
    if (req.body.pass != '')
        user.set('pass', hashPW(req.body.pass));
    if (req.body.name != '')
        user.set('name', req.body.name);
    if (req.body.email != '')
        user.set('email', req.body.email);
    user.save(function(err) {
      if (err){
        req.session.msg = err;
      } else {
        req.session.msg = 'User Updated.';
      }
      res.redirect('/');
    });
  });
};
exports.deleteUser = function(req, res){
  User.findOne({ _id: req.session.userid })
  .exec(function(err, user) {
    if(user){
      user.remove(function(err){
        if (err){
          req.session.msg = err;
        }
        req.session.destroy(function(){
          res.redirect('/login');
        });
      });
    } else{
      req.session.msg = "User Not Found!";
      req.session.destroy(function(){
        res.redirect('/login');
      });
    }
  });
};
