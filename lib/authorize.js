var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');

function encrypt(password) {
    return crypto.createHash('sha512').update(password).digest('base64').toString();
}

// callback(error, authResult)
module.exports = function(user, pass, callback) {
    MongoClient.connect(_config.dbPath, {uri_decode_auth: true}, function(error, db) {
        if(error) {
            callback(error);
        } else {
            var collection = db.collection('user.info');
            collection.find({"_id":user}).toArray(function(error, docs) {
                if(error) {
                    callback(error);
                } else {
//callback('T0::pass: ['+encrypt(pass)+']');
                    if(typeof docs[0] == 'object' && docs[0].pass == encrypt(pass))
                        return callback(null, true);
                    else
                        return callback('EC01::['+user+']',false);
                }
            });
        }
    });
}
