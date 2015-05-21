// check initial.yml and create initial.json
// load administrator user & mongo db auth
function loadAdminInfo(dbConf, callback) {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var crypto = require('crypto');

    var password = new Buffer('h1c0nc#ptp@s$w0rdC2mUsKam1Ll3MvP', 'utf8');
    var iv = new Buffer(12);
    var initFile = _homePath + '/config/initial.yml';
    var saveFile = _homePath + '/config/initial.json';

    // AES-256-GCM encryption
    function encrypt(string, password, iv) {
        var buf = new Buffer(string, 'utf8');
        var cipher = crypto.createCipheriv('aes-256-gcm', password, iv);
        var hash = cipher.update(buf, 'utf8', 'base64');
        hash += cipher.final('base64');
        var tag = cipher.getAuthTag().toString('base64'); // buffer to base64
        return {id: tag, data: hash};
    };
    // AES-256-GCM decryption
    function decrypt(hashed, password, iv) {
        var buf = new Buffer(hashed.data, 'base64');
        var decipher = crypto.createDecipheriv('aes-256-gcm', password, iv);
        decipher.setAuthTag(new Buffer(hashed.id, 'base64'));
        var string = decipher.update(buf, 'base64', 'utf8');
        string += decipher.final('utf8');
        return string;
    };

    iv.fill(null).write(dbConf.dbName, null, 12);

    // load 'initial.yml' and create encrypted 'initial.json'
    if (fs.existsSync(initFile)) {
        try{
            var conf = yaml.safeLoad(fs.readFileSync(initFile, 'utf8'));
        } catch (error) {
            callback('EE01::[initial.yml]'); // cannot load admin profile setup
            callback('F112'); //admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        }
        var passed = true;
        if (typeof conf === 'object') {
            if (typeof conf.adminUser !== 'string') {
                callback('EE20::['+conf.adminUser+']'); // invalid adminUser
                passed = false;
            }
            if (typeof conf.adminPass !== 'string') {
                callback('EE21::['+conf.adminPass+']'); // invalid adminPass
                passed = false;
            }
            if (conf.mongoUser !== null && typeof conf.mongoUser !== 'string') {
                callback('EE22::['+conf.mongoUser+']'); // invalid mongoUser
                passed = false;
            }
            if (conf.mongoPass !== null && typeof conf.mongoPass !== 'string') {
                callback('EE23::['+conf.mongoPass+']'); // invalid mongoPass
                passed = false;
            }
        }
        if (passed === false || typeof conf !== 'object') {
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        } else {
            var dbPath = null;
            if (conf.mongoUser !== null && conf.mongoUser !== undefined) {
                dbPath = 'mongodb://'+conf.mongoUser+':'+conf.mongoPass+'@'
                          +dbConf.dbUrl+'/'+dbConf.dbName;
            } else {
                dbPath = 'mongodb://'+dbConf.dbUrl+'/'+dbConf.dbName;
            }
            var savePath = encrypt(dbPath, password, iv);
            fs.writeFileSync(saveFile, JSON.stringify(savePath), {encoding:'utf8', flag:'w'});
            fs.unlinkSync(initFile);
            callback('I110') // admin profile check [UPDATED]
            return callback(null, dbPath, conf); // success
        }
    } 
    // load and decrypt 'initial.json'
    else {
        try {
            var dbPath = require(saveFile);
            dbPath = decrypt(dbPath, password, iv);
        } catch (error) {
            dbPath = undefined;
        }
        var pathPart = dbPath.split('://');
        if (pathPart[0] !== 'mongodb') {
            callback('EE02::[initial.json]'); // cannot load stored admin profile
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        } else {
            callback('I111'); // admin profile check [OK]
            return callback(null, dbPath, null); // success
        }
    }
}

// check Mongo DB connection & administrator account
function checkDBConnection(dbPath, admin, callback) {
    var mongoose = require('mongoose');
    var encrypt = require(_homePath+'/lib/models/users.js').encrypt;
    var User = require(_homePath+'/lib/models/users.js').User;

    mongoose.connect(dbPath, function(error) {
        if (error) {
            callback('EE30'); // cannot open connection
            return callback('F121'); // MongoDB access test [FAIL]
        } else {
            if (!admin) {
                // check admin account at db
                User.findOne({role:'admin'}).exec(function(error, result) {
                    if (error) {
                        callback('EE3::'+error.errmsg); // DB operation failed
                        return callback('F121'); // MongoDB access test [FAIL]
                    } else if (!result) { // no admin account at db
                        callback('EE0::administrator account'); // cannot load
                        callback('F121');
                        return callback('H00::['+_homePath+'/config/initial.yml]');
                    } else {
                        mongoose.connection.close(function() {
                            callback('I120'); // MongoDB access test [OK]
                            return callback(null); // success
                        });
                    }
                })
            } else {
                // create or replace admin account at db
                User.findOneAndRemove({role:'admin'}).exec(function(error) {
                    if (error) {
                        callback('EE3::'+error.errmsg); // DB operation failed
                        return callback('F121'); // MongoDB access test [FAIL]
                    } else {
                        var newAdmin = new User({_id: admin.adminUser,
                                                 pass: encrypt(admin.adminPass),
                                                 email: admin.adminUser,
                                                 name: 'Administrator',
                                                 role: 'admin'});
                        newAdmin.save(function(error) {
                            if (error) {
                                if (error.code == 11000) {
                                    callback('EE3::user ['+admin.adminUser+'] already exists');
                                    callback('F121'); // MongoDB access test [FAIL]
                                    return callback('H00::['+_homePath+'/config/initial.yml]');
                                } else {
                                    callback('FE3::'+error.errmsg); // DB operation failed
                                    return callback('F121'); // MongoDB access test [FAIL]
                                }
                            } else {
                                mongoose.connection.close(function() {
                                    callback('I120'); // MongoDB access test [OK]
                                    return callback(null); // success
                                });
                            }
                        });
                    }
                })
            }
        }
    });
}

// check Node.js version
function checkNodeJs(callback) {
    var recVer = require(_homePath+'/package.json').engines.node.match(/\d+\.\d+\.\d+$/)[0];
    var recVerArr = recVer.split('.');
    var curVer = process.version.match(/\d+\.\d+\.\d+$/)[0];
    var curVerArr = curVer.split('.');
    if (curVer == recVer) {
        callback('I130'); // Node.js version check [OK]
        return callback(null); // success
    }
    else if (curVerArr[0] != recVerArr[0] || curVerArr[1] < recVerArr[1]) {
        callback('EE40::['+curVer+']');
        callback('EE41::['+recVer+']');
        callback('EE42'); // major difference
        return callback('F132'); // Node.js version check [FAIL]
    }
    else {
        callback('WE40::['+curVer+']');
        callback('WE41::['+recVer+']');
        callback('W01'); // This program may NOT run correctly
        callback('W131'); // Node.js version check [WARN]
        return callback(null); // success
    } 
}

// execute initialization test
module.exports = function (dbConf, callback) {
    loadAdminInfo(dbConf, function(error, dbPath, admin) {
        if(error) {
            callback(error);
        } else {
            checkDBConnection(dbPath, admin, function(error) {
                if(error) {
                    callback(error);
                } else {
                    checkNodeJs(function(error) {
                        if(error) {
                            return callback(error);
                        } else {
                            return callback(null, dbPath); // success
                        }
                    });
                }
            });
        }
    });
}
