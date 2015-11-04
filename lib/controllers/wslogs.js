//==========================================================
//          pub/sub controller for websocket logs
//                    Author: Jun Jo
//==========================================================
// saveLog: publish a new log to websocket topic
//==========================================================

var wsLog = require(_homePath+'/lib/models/data.js').Data;

// publish a new log to websocket topic
exports.saveLog = function(request, data, callback) {
    var Topic = wsLog(request.params.topic_id);
    var log = new Topic({time: Date.now(),
                         data: {type: data.type,
                                src : data.src,
                                dest: data.dest,
                                msg : data.msg}});
    log.save(function(error) {
        if (error) {
            //TODO error message
        } else {
            if(typeof callback == 'function') callback();
        }
    });
}
