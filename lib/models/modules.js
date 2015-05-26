var moduleSchema = new require('mongoose').Schema({
    _id : { type: String, required: true, unique: true },
    owner : { type: String, required: true },
    name : { type: String, required: true },
    uuid : String,
    type : { type: String, required: true },
    count : { type: Number, required: true }
});
moduleSchema.path('name').validate(validName);
moduleSchema.path('uuid').validate(validUuid);
moduleSchema.path('type').validate(validType);
function validName(name) {
    var reg = /^\w.{1,19}$/; // start with letter, length 2~20
    return reg.test(name);
}
function validUuid(uuid) {
    var reg = /^.{3,32}$/; // length 3~32
    return reg.test(uuid);
}
function validType(type) {
    return (type == 'sensor' || type == 'service');
}
exports.Module = require('mongoose').model('Module', moduleSchema, 'hiconcept.modules');
