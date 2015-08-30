//==========================================================
//          pub/sub controller for websocket logs
//                    Author: Jun Jo
//==========================================================
// 1. publish: publish a new log to websocket topic
// 2. subscribe: subscribe logs from websocket topic
//==========================================================

var wsLog = require(_homePath+'/lib/models/wslogs.js').wsLog;

// publish a new log to websocket topic
exports.publish = function(request, data, callback) {
    var Topic = wsLog(request.params.topic_id);
    var log = new Topic({time: Date.now(),
                         type: data.type,
                         src : data.src,
                         dest: data.dest,
                         msg : data.msg});
    log.save(function(error) {
        if (error) {
            //TODO error message
        } else {
            if(typeof callback == 'function') callback();
        }
    });
}
// subscribe logs from websocket topic : TODO
exports.subscribe = function(request, response) {
    var Topic = wsLog(request.params.topic_id);
    var query;
    if (request.query) {
        query = null; // TODO create query
    } else {
        query = {};
    }
    Topic.find(query).exec(function(error, data) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!data) {
            response.sendStatus(404);
        } else {
            response.status(200).json(data);
        }
    });
}
