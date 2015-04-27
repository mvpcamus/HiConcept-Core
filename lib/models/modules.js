var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var moduleSchema = exports.moduleSchema = new Schema({
    _id : { type: String, required: true, unique: true },
    owner : { type: String, required: true },
    name : { type: String, required: true },
    type : String,
    uuid : String,
    count : { type: Number, required: true }
});
