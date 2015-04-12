// dependencies
var yaml = require('js-yaml');
var fs = require('fs');

// load configuration file /config/hiconcpt.yml
module.exports = function (filePath, callback) {
    fs.readFile(filePath, 'utf8', function(error, data) {
        if(error) {
            callback('FE0::'+filePath); // cannnot load
            return callback('F101'); // configuration check [FAIL]
        } else {
            try {
                var config = yaml.safeLoad(data);
            } catch (error) {
                callback('FE010'); // wrong format
                return callback('F101'); // configuration check [FAIL]
            }
            check(config, function (error) {
                if (error) {
                    return callback(error);
                } else {
                    return callback(null, config); // success
                }
            });
        }
    });
}

//TODO: config check function
function check(config, callback) {
    var passed = true;
    if (typeof config !== 'object') {
        callback('FE01'); // cannot load configuration
        passed = false;
    } else {
        if (typeof config.port !== 'number') {
            callback('FE11::'+config.port); // invalid port number
            passed = false;
        }
        if (typeof config.https !== 'boolean') {
            callback('FE12::'+config.https); // invalid https setting
            passed = false;
        } else if (config.https === true) {
            if (typeof config.sslCrt === 'string'
                && typeof config.sslKey === 'string') {
                if (!fs.existsSync(__homePath+'/config/ssl/'+config.sslCrt)) {
                    callback('FE15::'+config.sslCrt);
                    passed = false;
                }
                if (!fs.existsSync(__homePath+'/config/ssl/'+config.sslKey)) {
                    callback('FE15::'+config.sslKey);
                    passed = false;
                }
            }
        }
        if (typeof config.dbUrl !== 'string') {
            callback('FE13::'+config.dbUrl); // invalid database url
            passed = false;
        }
        if (typeof config.dbName !== 'string' || config.dbName ==='test') {
            callback('FE14::'+config.dbName); // invalid database name
            passed = false;
        }
    }
    if (passed === true) {
        return callback(null); // check ok
    } else {
        return callback('F101'); // configuration check [FAIL]
    }
}

