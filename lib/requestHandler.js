// dependencies
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//var mongoose = require('mongoose');

var findDocuments = function(db, callback) {
    var collection = db.collection('user.info');
    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}

function root(request, response, callback) {
    if (_config.dbPath) {
        MongoClient.connect(_config.dbPath, {uri_decode_auth: true}, function(err, db) {
            assert.equal(null, err);
            findDocuments(db, function(docs) {
                var list = [];
                for (var i=0; i<docs.length; i++) {
                    list.push(docs[i]._id);
                }
                response.write(JSON.stringify(list, null));
                response.end();
                db.close(callback(null));
            });
        });
    } else {
        callback('Cannot find database'); //TODO: no database case
    }
}

function management(request, response) {
    response.end('management');
}

function publish(request, response) {
    response.end('publish');
}

function subscribe(request, response) {
    response.end('subscribe');
}

exports.root = root;
exports.management = management;
exports.publish = publish;
exports.subscribe = subscribe;
