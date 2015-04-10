// check initial.yml and create initial.json
// load administrator user & mongo db auth
function loadAdminInfo(callback) {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var crypto = require('crypto');

    var password = new Buffer('h1c0nc#ptp@s$w0rdC2mUsKam1Ll3MvP', 'utf8');
    var iv = new Buffer(12);
    var initFile = __homePath + '/config/initial.yml';
    var saveFile = __homePath + '/config/initial.json';

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

    iv.fill(null).write(config.dbName, null, 12);

    // load 'initial.yml' and create encrypted 'initial.json'
    if (fs.existsSync(initFile)) {
        try{
            var conf = yaml.safeLoad(fs.readFileSync(initFile, 'utf8'));
        } catch (error) {
            callback('FE02::initial.yml'); // cannot load admin profile setup
            callback('F112'); //admin profile check [FAIL]
            return callback('H00::'+initFile); // Please reconfig
        }
        var passed = true;
        if (typeof conf === 'object') {
            if (typeof conf.adminUser !== 'string') {
                callback('FE21::'+conf.adminUser); // invalid adminUser
                passed = false;
            }
            if (typeof conf.adminPass !== 'string') {
                callback('FE22::'+conf.adminPass); // invalid adminPass
                passed = false;
            }
            if (conf.mongoUser !== null && typeof conf.mongoUser !== 'string') {
                callback('FE23::'+conf.mongoUser); // invalid mongoUser
                passed = false;
            }
            if (conf.mongoPass !== null && typeof conf.mongoPass !== 'string') {
                callback('FE24::'+conf.mongoPass); // invalid mongoPass
                passed = false;
            }
        }
        if (passed === false || typeof conf !== 'object') {
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::'+initFile); // Please reconfig
        } else {
            var content = JSON.stringify(conf);
            content = encrypt(content, password, iv);
            content.id = content.id.toString('base64');
            fs.writeFileSync(saveFile, JSON.stringify(content), {encoding:'utf8', flag:'w'});
            fs.unlinkSync(initFile);
            callback('I110') // admin profile check [UPDATED]
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
            callback('FE03::initial.json'); // cannot load stored admin profile
            callback('F112'); // admin profile check [FAIL]
            return callback('H00::'+initFile); // Please reconfig
        } else {
            callback('I111'); // admin profile check [OK]
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
                  +config.dbUrl+'/'+config.dbName;
    } else {
        dbPath = 'mongodb://'+config.dbUrl+'/'+config.dbName;
    }
    MongoClient.connect(dbPath, {uri_decode_auth: true}, function(error, db) {
        if (error) {
            callback('FE31::'+config.dbUrl); // unreached url
            return callback('F121'); // MongoDB access test [FAIL]
        } else {
            db.stats(function(error, stats) {
                if (error) {
                    callback('FE32::'+config.dbName); // no permission
                    return callback('F121'); // MongoDB access test [FAIL]
                } else {
                    callback('I120'); // MongoDB access test [OK]
                    return db.close(function() {callback(null);}); // success
                }
            });
        }
    });
}

// check Node.js version
function checkNodeJs(callback) {
    var recVer = 'v0.12.2';
    var recVerArr = recVer.split('.');
    var curVer = process.version;
    var curVerArr = curVer.split('.');

    if (curVer == recVer) {
        callback('I130'); // Node.js version check [OK]
        return callback(null); // success
    }
    else if (curVerArr[0] != recVerArr[0] || curVerArr[1] < recVerArr[1]) {
        callback('EE::current Node.js version   > ['+curVer+']');
        callback('EE::recommend Node.js version > ['+recVer+']');
        callback('EE4'); // major version difference
        return callback('F132'); // Node.js version check [FAIL]
    }
    else {
        callback('WE::current Node.js version   > ['+curVer+']');
        callback('WE::recommend Node.js version > ['+recVer+']');
        callback('W01'); // This program may NOT run correctly
        callback('W131'); // Node.js version check [WARN]
        return callback(null);
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
                            return callback(null, admin); // success
                        }
                    });
                }
            });
        }
    });
}

