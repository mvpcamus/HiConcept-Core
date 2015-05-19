//==========================================================
//            RESTful API controller for topics
//                    Auther: Jun Jo
//==========================================================
// 1. getTopics: list up all topics of given user_id
// 2. createTopic: create a new topic (POST)
// 3. readTopic: read seleted topic info (GET)
// 4. updateTopic: update selected topic info (PUT)
// 5. deleteTopic: delete selected topic (DELETE)
//==========================================================

var Topic = require(_homePath+'/lib/models/topics.js').Topic;

// list of all topics GET:/admin/:user_id/topics
exports.getTopics = function(request, response) {
    Topic.find({owner: request.params.user_id}).exec(function(error, topics) {
        if (error) {
            response.status(500).send(error.message);
        } else if(!topics) {
            response.sendStatus(404);
        } else {
            response.status(200).json(topics);
        }
    });
}
// create a new topic POST:/admin/topics
exports.createTopic = function(request, response) {
    var newTopic = new Topic({name: request.body.name,
                              owner: request.session.user_id,
                              read: [request.session.user_id,],
                              write: [request.session.user_id,]});
    newTopic.set('col', newTopic._id.toString());
    newTopic.save(function(error) {
        if (error) {
            response.status(500).send(error.message);
        } else {
            response.sendStatus(200);
        }
    });
}
// read selected topic info GET:/admin/topics/:topic_id
exports.readTopic = function(request, response) {
    Topic.findOne({_id: request.params.topic_id}).exec(function(error, topic) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!topic) {
            response.sendStatus(404);
        } else {
            response.status(200).json(topic);
        }
    });
}
// update selected topic info PUT:/admin/topics/:topic_id
exports.updateTopic = function(request, response) {
    Topic.findOne({_id: request.params.topic_id}).exec(function(error, topic) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!topic) {
            response.sendStatus(404);
        } else {
            topic.set('name', request.body.name);
            topic.set('read', topic.read); // TODO update read list
            topic.set('write', topic.write); //TODO update write list
            topic.save({upsert:true}, function(error) {
                if (error) {
                    response.status(500).send(error.message);
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });
}
// delete selected topic DELETE:/admin/topics/:topic_id
exports.deleteTopic = function(request, response) {
    Topic.findOne({_id: request.params.topic_id}).exec(function(error, topic) {
        if (error) {
            response.status(500).send(error.message);
        } else if (!topic) {
            response.sendStatus(404);
        } else {
            topic.remove(function (error) {
                if (error) {
                    response.status(500).send(error.message);
                } else {
// TODO delete topic data consequently
                    response.sendStatus(200);
                }
            });
        }
    });
}