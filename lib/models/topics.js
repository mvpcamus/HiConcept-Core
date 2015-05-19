var topicSchema = new require('mongoose').Schema({
    name : { type: String, required: true },
    owner : { type: String, required: true },
    read : { type: Array, required: true },
    write : { type: Array, required: true },
    col : { type: String, required: true }
});
topicSchema.path('name').validate(validName);
function validName(name) {
    return (name.length > 2);
}
exports.Topic = require('mongoose').model('Topic', topicSchema, 'hiconcept.topics');
