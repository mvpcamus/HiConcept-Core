var crypto = require('crypto');
exports.encrypt = function(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var userSchema = exports.userSchema = new Schema({
    _id : { type: String, required: true, unique: true },
    pass : { type:String, required: true },
    name : { type: String, required: true },
    email : String,
    age : Number,
    sex : String
});
