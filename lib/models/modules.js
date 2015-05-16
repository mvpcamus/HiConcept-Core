var moduleSchema = new require('mongoose').Schema({
    _id : { type: String, required: true, unique: true },
    owner : { type: String, required: true },
    name : { type: String, required: true },
    uuid : String,
    type : { type: String, required: true },
    count : { type: Number, required: true }
});
moduleSchema.path('name').validate(validName);
moduleSchema.path('uuid').validate(validName);
moduleSchema.path('type').validate(validType);
function validName(name) {
    return (name.length > 2);
}
function validType(type) {
    return (type == 'sensor' || type == 'service');
}
exports.Module = require('mongoose').model('Module', moduleSchema, 'hiconcept.modules');
