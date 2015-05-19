//==========================================================
//            RESTful API controller for data
//                    Auther: Jun Jo
//==========================================================
// 1. publish: publish a new data to topic (POST)
// 2. subscribe: subscribe data from topic (GET)
//==========================================================

var Data = require(_homePath+'/lib/models/data.js').Data;

// publish a new data to topic POST:/topics/:topic_id
exports.publish = function(request, response) {
    Topic = Data(request.params.topic_id);
    if (!request.body.time) {request.body.time = Date.now();}
    var data = new Topic({time: request.body.time,
                          data: request.body.data});
    data.save(function(error) {
        if (error) {
            response.status(500).send(error.message);
        } else {
            response.sendStatus(200);
        }
    });
}
// subscribe data from topic GET:/topics/:topic_id
exports.subscribe = function(request, response) {
    Topic = Data(request.params.topic_id);
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
