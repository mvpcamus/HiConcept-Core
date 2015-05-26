var crypto = require('crypto');
exports.encrypt = function(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}
var userSchema = new require('mongoose').Schema({
    _id : { type: String, required: true, unique: true },
    pass : { type:String, required: true },
    name : { type: String, required: true },
    email : { type: String, required: true },
    age : Number,
    sex : String,
    role : { type: String, required: true }
});
userSchema.path('_id').validate(validId);
userSchema.path('pass').validate(validPass);
userSchema.path('name').validate(validName);
userSchema.path('email').validate(validEmail);
userSchema.path('role').validate(validRole);
function validId(id) {
    var reg = /^[a-zA-Z]\w{4,11}$/; // start with letter, length 5~12
    return reg.test(id);
}
function validPass(pass) {
    var reg = /^[0-9a-zA-Z+/=]{88,88}$/; // base64 encoded
    return reg.test(pass);
}
function validName(name) {
    var reg = /^\w.{1,35}$/; // start with letter, length 2~36
    return reg.test(name);
}
function validEmail(email) {
    var reg = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return reg.test(email);
}
function validRole(role) {
    return (role == 'admin' || role == 'user');
}
exports.User = require('mongoose').model('User', userSchema, 'hiconcept.users');
