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
//mongoose.model('User', userSchema, 'hiconcept.system.users');
