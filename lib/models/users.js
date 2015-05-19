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
userSchema.path('_id').validate(validName);
userSchema.path('pass').validate(validName);
userSchema.path('name').validate(validName);
userSchema.path('email').validate(validName);
userSchema.path('role').validate(validRole);
function validName(name) {
    return (name.length > 2);
}
function validRole(role) {
    return (role == 'admin' || role == 'user');
}
exports.User = require('mongoose').model('User', userSchema, 'hiconcept.users');
