//==========================================================
//            RESTful API controller for data
//                    Author: Jun Jo
//==========================================================
// 1. publish: publish a new data to topic (POST)
// 2. subscribe: subscribe data from topic (GET)
//==========================================================

var Data = require(_homePath+'/lib/models/data.js').Data;

// publish a new data to topic POST:/topics/:topic_id
exports.publish = function(request, response) {
    var Topic = Data(request.params.topic_id);
    if (!request.body.time) {request.body.time = Date.now();}
    var data = new Topic({time: request.body.time,
                          data: request.body.data});
    data.save(function(error) {
        if (error) {
            return response.status(500).send(error.message);
        } else {
            return response.sendStatus(200);
        }
    });
}

// subscribe data from topic GET:/topics/:topic_id
exports.subscribe = function(request, response) {
    var Topic = Data(request.params.topic_id);
    var query = {};

    function getPropNames(object) {
        var names = [];
        var count = 0;
        if (typeof object == 'object') {
            for (var prop in object) {
                names[count] = prop;
                count++;
            }
        }
        if (names) return names;
        else return undefined;
    }

    if (request.query) {
        try {
            if (request.query.time) {
                var qtime = JSON.parse(request.query.time);
                if (typeof qtime[0] == 'number' && typeof qtime[1] == 'number')
                    query.time = {$gte:qtime[0], $lte:qtime[1]};
                else throw 1; // INVALID TIME QUERY
            }
            if (request.query.data) {
                var qdata = JSON.parse(request.query.data);
                var props = getPropNames(qdata);
                for (var i in props) {
                    query['data.'+props[i]] = qdata[props[i]];
                }
            }
        } catch (error) {
            return response.status(400).send('INVALID QUERY');
        }
    } else {
        query = null;
    }
    if (query) {
        Topic.find(query,{_id:0, __v:0}).exec(function(error, data) {
            if (error) {
                return response.status(500).send(error.message);
            } else if (!data) {
                return response.sendStatus(404);
            } else {
                return response.status(200).json(data);
            }
        });
    } else {
        return response.status(400).send('INVALID QUERY');
    }
}
