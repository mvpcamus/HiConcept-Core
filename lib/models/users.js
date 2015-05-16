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
exports.User = require('mongoose').model('User', userSchema, 'hiconcept.users');
