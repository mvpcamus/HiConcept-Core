//==========================================================
//            RESTful API controller for topics
//                    Auther: Jun Jo
//==========================================================
// 1. getTopics: list up all topics of user (GET)
// 2. createTopic: create a new topic (POST)
// 3. readTopic: read seleted topic info (GET)
// 4. updateTopic: update selected topic info (PUT)
// 5. deleteTopic: delete selected topic (DELETE)
//==========================================================

var Topic = require(_homePath+'/lib/models/topics.js').Topic;

// list of all topics GET:/admin/topics
exports.getTopics = function(request, response) {
    Topic.find({owner: request.session.user_id}).exec(function(error, topics) {
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
                              read: [],
                              write: []});
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
            if(request.body.readAdd && topic.read.indexOf(request.body.readAdd) == -1) {
                topic.read.push(request.body.readAdd);
            }
            if(request.body.readDel && topic.read.indexOf(request.body.readDel) != -1) {
                topic.read.splice(topic.read.indexOf(request.body.readDel),1);
            }
            if(request.body.writeAdd && topic.write.indexOf(request.body.writeAdd) == -1) {
                topic.write.push(request.body.writeAdd);
            }
            if(request.body.writeDel && topic.write.indexOf(request.body.writeDel) != -1) {
                topic.write.splice(topic.read.indexOf(request.body.writeDel),1);
            }
            topic.set('read', topic.read);
            topic.set('write', topic.write);
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
