// check initial.yml and create initial.json
// load administrator user & mongo db auth
function loadAdminInfo(callback) {
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

    iv.fill(null).write(_config.dbName, null, 12);

    // load 'initial.yml' and create encrypted 'initial.json'
    if (fs.existsSync(initFile)) {
        try{
            var conf = yaml.safeLoad(fs.readFileSync(initFile, 'utf8'));
        } catch (error) {
            callback('FE01::[initial.yml]'); // cannot load admin profile setup
            callback('F112'); //admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        }
        var passed = true;
        if (typeof conf === 'object') {
            if (typeof conf.adminUser !== 'string') {
                callback('FE20::['+conf.adminUser+']'); // invalid adminUser
                passed = false;
            }
            if (typeof conf.adminPass !== 'string') {
                callback('FE21::['+conf.adminPass+']'); // invalid adminPass
                passed = false;
            }
            if (conf.mongoUser !== null && typeof conf.mongoUser !== 'string') {
                callback('FE22::['+conf.mongoUser+']'); // invalid mongoUser
                passed = false;
            }
            if (conf.mongoPass !== null && typeof conf.mongoPass !== 'string') {
                callback('FE23::['+conf.mongoPass+']'); // invalid mongoPass
                passed = false;
            }
        }
        if (passed === false || typeof conf !== 'object') {
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        } else {
            var content = JSON.stringify(conf);
            content = encrypt(content, password, iv);
            content.id = content.id.toString('base64');
            fs.writeFileSync(saveFile, JSON.stringify(content), {encoding:'utf8', flag:'w'});
            fs.unlinkSync(initFile);
            callback('I110') // admin profile check [UPDATED]
            _config.adminUser = conf.adminUser;
            _config.adminPass = conf.adminPass;
            return callback(null, conf); // success
        }
    } 
    // load and decrypt 'initial.json'
    else {
        try {
            var content = require(saveFile);
            content.id  = new Buffer(content.id, 'base64')
            content = decrypt(content, password, iv);
            content = JSON.parse(content);
        } catch (error) {
            // nothing to do
        }
        if (typeof content !== 'object') {
            callback('FE02::[initial.json]'); // cannot load stored admin profile
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::['+initFile+']'); // Please reconfig
        } else {
            callback('I111'); // admin profile check [OK]
            _config.adminUser = content.adminUser;
            _config.adminPass = content.adminPass;
            return callback(null, content); // success
        }
    }
}

// check Mongo DB connection
function checkDBConnection(admin, callback) {
    var MongoClient = require('mongodb').MongoClient;
    var dbPath = null;
    if (admin.mongoUser !== null && admin.mongoUser !== undefined) {
        dbPath = 'mongodb://'+admin.mongoUser+':'+admin.mongoPass+'@'
                  +_config.dbUrl+'/'+_config.dbName;
    } else {
        dbPath = 'mongodb://'+_config.dbUrl+'/'+_config.dbName;
    }
    MongoClient.connect(dbPath, {uri_decode_auth: true}, function(error, db) {
        if (error) {
            callback('FE30::['+_config.dbUrli+']'); // unreached url
            return callback('F121'); // MongoDB access test [FAIL]
        } else {
            db.stats(function(error, stats) {
                if (error) {
                    callback('FE31::['+_config.dbName+']'); // no permission
                    return callback('F121'); // MongoDB access test [FAIL]
                } else {
                    callback('I120'); // MongoDB access test [OK]
                    return db.close(function() { //success
                        _config.dbPath = dbPath;
                        callback(null);
                    });
                }
            });
        }
    });
}

// check Node.js version
function checkNodeJs(callback) {
    var recVer = require(_homePath+'/lib/environment.json').NodejsVer;
    var recVerArr = recVer.split('.');
    var curVer = process.version;
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
                            return callback(error);
                        } else {
                            return callback(null); // success
                        }
                    });
                }
            });
        }
    });
}

