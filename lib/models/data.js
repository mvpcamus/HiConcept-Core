var dataSchema = new require('mongoose').Schema({
    time : { type: Number, required: true },
    data : { type: Object, required: true }
});
exports.Data = function(topicId) {
    if (typeof topicId == 'string') {
        return require('mongoose').model(topicId, dataSchema, 'topic.'+topicId);
    } else {
        return null;
    }
}
