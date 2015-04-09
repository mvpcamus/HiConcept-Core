// check initial.yml and create initial.json
// load administrator user & mongo db auth
function loadAdminInfo(callback) {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var crypto = require('crypto');

    var password = new Buffer('h1c0nc#ptp@s$w0rdC2mUsKam1Ll3MvP', 'utf8');
    var iv = new Buffer(12);
    var initFile = __dirname + '/../config/initial.yml';
    var saveFile = __dirname + '/../config/initial.json';

    // AES-256-GCM encryption
    function encrypt(string, password, iv) {
        var buf = new Buffer(string, 'utf8');
        var cipher = crypto.createCipheriv('aes-256-gcm', password, iv);
        var hash = cipher.update(buf, 'utf8', 'base64');
        hash += cipher.final('base64');
        var tag = cipher.getAuthTag();
        return {id: tag, data: hash};
    };
    // AES-256-GCM decryption
    function decrypt(hashed, password, iv) {
        var buf = new Buffer(hashed.data, 'base64');
        var decipher = crypto.createDecipheriv('aes-256-gcm', password, iv);
        decipher.setAuthTag(hashed.id);
        var string = decipher.update(buf, 'base64', 'utf8');
        string += decipher.final('utf8');
        return string;
    };

    try {
        iv.fill(null).write(config.dbName, null, 12);
        if(fs.existsSync(initFile)) {
            var conf = yaml.safeLoad(fs.readFileSync(initFile, 'utf8'));
            if(conf.adminUser === null || conf.adminUser === undefined) {
                callback('F0110'); // invalid adminUser
            } else if (conf.adminPass === null || conf.adminPass === undefined) {
                callback('F0111'); // invalid adminPass
            } else if (conf.mongoUser === undefined) {
                callback('F0112'); // invalid mongoUser
            } else if (conf.mongoPass === undefined) {
                callback('F0113'); // invalid mongoPass
            } else {
                var content = JSON.stringify(conf);
                content = encrypt(content, password, iv);
                content.id = content.id.toString('base64');
                fs.writeFileSync(saveFile, JSON.stringify(content), {encoding:'utf8', flag:'w'});
//                logger.debug(saveFile + ' file is created.');

console.log(saveFile + ' file is created.'); //TODO

                fs.unlinkSync(initFile);
                return callback(null, conf); // success
            }
        } else if(fs.existsSync(saveFile)) {
            var content = require(saveFile);
            content.id  = new Buffer(content.id, 'base64')
            content = decrypt(content, password, iv);
            content = JSON.parse(content);
            if (content.adminUser === undefined || content.adminPass === undefined
                || content.mongoUser === undefined || content.mongoPass === undefined) {
//                throw error = "Please reset administrator info using 'initial.yml'."
                callback('F011'); // false configuration
            } else {

console.log('initial.json loading OK...'); // TODO

                callback(null, content); // success
            }
        } else {
            callback('F01'); // at '/config/initial.yml'
//            throw error = "Please reconfirm 'initial.yml' file."
        };
    } catch (error) {
        callback('F01'); // at '/config/initial.yml'
//        logger.error('Initialization failed.');
//        logger.error(error);
//        process.exit([exitCode=1]);
    }
}

// check Mongo DB connection
function checkDBConnection(admin, callback) {
    var MongoClient = require('mongodb').MongoClient;
    var dbPath = null;
    if (admin.mongoUser !== null && admin.mongoUser !== undefined) {
        dbPath = 'mongodb://' + admin.mongoUser + ':' + admin.mongoPass + '@' + config.dbUrl + '/' + config.dbName;
    } else {
        dbPath = 'mongodb://' + config.dbUrl + '/' + config.dbName;
    }
    MongoClient.connect(dbPath, {uri_decode_auth: true}, function(error, db) {
        if (error) {
            callback('F020'); // cannot connect to db url
//            logger.error('Cannot connect to MongoDB. Please check MongoDB URL.');
//            process.exit([exitCode=1]);
        } else {
            db.stats(function(error, stats) {
                if (error) {
                    callback('F021'); // cannot access to database
//                    logger.error('Cannot access to MongoDB. Please check MongoDB Permission.');
//                    process.exit([exitCode=1]);
                } else {
//                    logger.debug('MongoDB connection check OK...');

console.log('Mongo DB connection check OK...'); // TODO

                    //logger.debug(JSON.stringify(stats));
                    db.close(function() {callback(null);}); // success
                }
            });
        }
    });
}

// check Node.js version
function checkNodeJs(callback) {
    var recommended = 'v0.12.2';
    if (process.version !== recommended) {
//        logger.warn('This program may NOT run correctly.');
//        logger.warn('  Current node.js version = ' + process.version);
//        logger.warn('  Recommended version     = ' + recommended);
        return callback('W000'); // recommened Node.js version
    } else {
//        logger.debug('Node.js version check OK...');

console.log('Node.js version check OK...'); // TODO

        return callback(null); // success
    }
}

// execute initialization test
module.exports = function (callback) {
    loadAdminInfo(function(error, admin) {
        if(error) {
            callback(error);
        } else {
            checkDBConnection(admin, function(error) {
                if(error) {
                    callback(error);
                } else {
                    checkNodeJs(function(error) {
                        if(error) {
                            callback(error);
                        } else {
                            callback(null, admin); // success
                        }
                    });
                }
            });
        }
    });
}

