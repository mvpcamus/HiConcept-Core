var topicSchema = new require('mongoose').Schema({
    name : { type: String, required: true },
    owner : { type: String, required: true },
    read : { type: Array },
    write : { type: Array },
    col : { type: String, required: true }
});
topicSchema.path('name').validate(validName);
function validName(name) {
    var reg = /^\w.{1,19}%/; // start with letter, length 2~20
    return reg.test(name);
}
exports.Topic = require('mongoose').model('Topic', topicSchema, 'hiconcept.topics');
