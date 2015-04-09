// dependencies
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
//var mongoose = require('mongoose');

// global value
var dbUrl = null;
var dbName = null;
function initDB(config) {
    dbUrl = config.dbUrl;
    dbName = config.dbName;
}

var findDocuments = function(db, callback) {
    var collection = db.collection('management');
    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
}


function root(request, response) {
    if (dbName) {
        MongoClient.connect('mongodb://'+dbUrl+'/'+dbName, function(err, db) {
            assert.equal(null, err);
            findDocuments(db, function(docs) {
                var list = [];
                for (var i=0; i<docs.length; i++) {
                    list.push(docs[i].username);
                }
                response.write(JSON.stringify(list, null));
                response.end();
                db.close();
            });
        });

/*        mongoose.connect('mongodb://localhost/'+dbname);
        mongoose.connection.once('open', function() {
            console.log(mongoose.connection.collection);
            mongoose.connection.db.collectionNames(function(err, names) {
//                console.log(names);
                for (var i in names) {
                    response.write(JSON.stringify(names[i]));
                }
                response.end();
                mongoose.disconnect();
            });
        }); */
    } else {
        logger.error('Cannot find database');
    }
}

function management(request, response) {
    response.end('management');
    logger.debug('management request: ' + request.body);
/*    mongoose.connect('mongodb://localhost/'+dbname);
    mongoose.connection.once('open', function() {
        var management = mongoose.connection.collection("management");
        var items = management.prototype.find;
        console.log(items);
        response.end();
        mongoose.disconnect();
    }); */
}

function publish(request, response) {
    response.end('publish');
    logger.debug('publish request: ' + request.body);
}

function subscribe(request, response) {
    response.end('subscribe');
    logger.debug('subscribe request: ' + request.body);
}

exports.initDB = initDB;
exports.root = root;
exports.management = management;
exports.publish = publish;
exports.subscribe = subscribe;
