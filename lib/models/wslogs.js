var wslogSchema = new require('mongoose').Schema({
    time : { type: Number, required: true },
    type : { type: String, required: true },
    src  : String,
    dest : String,
    msg  : { type: Object, required: true }
});
exports.wsLog = function(topicId) {
    if (typeof topicId == 'string') {
        return require('mongoose').model(topicId, wslogSchema, 'topic.'+topicId);
    } else {
        return null;
    }
}
