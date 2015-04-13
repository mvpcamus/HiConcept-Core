// dependencies
var yaml = require('js-yaml');
var fs = require('fs');

var confFile = _homePath+'/config/hiconcpt.yml';

// load configuration file /config/hiconcpt.yml
module.exports = function(callback) {
    fs.readFile(confFile, 'utf8', function(error, data) {
        if(error) {
            callback('FE0::['+confFile+']'); // cannnot load
            callback('F101'); // configuration check [FAIL]
            return callback('H00::['+confFile+']');
        } else {
            try {
                var config = yaml.safeLoad(data);
            } catch (error) {
                callback('FE000'); // wrong format
                callback('F101'); // configuration check [FAIL]
                return callback('H00::['+confFile+']');
            }
            check(config, function(error) {
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
        callback('FE00'); // cannot load configuration
        passed = false;
    } else {
        if (typeof config.port !== 'number') {
            callback('FE10::['+config.port+']'); // invalid port number
            passed = false;
        }
        if (typeof config.https !== 'boolean') {
            callback('FE11::['+config.https+']'); // invalid https setting
            passed = false;
        } else if (config.https === true) {
            if (typeof config.sslCrt === 'string'
                && typeof config.sslKey === 'string') {
                if (!fs.existsSync(_homePath+'/config/ssl/'+config.sslCrt)) {
                    callback('FE14::['+config.sslCrt+']');
                    passed = false;
                }
                if (!fs.existsSync(_homePath+'/config/ssl/'+config.sslKey)) {
                    callback('FE14::['+config.sslKey+']');
                    passed = false;
                }
            }
        }
        if (typeof config.dbUrl !== 'string') {
            callback('FE12::['+config.dbUrl+']'); // invalid database url
            passed = false;
        }
        if (typeof config.dbName !== 'string' || config.dbName ==='test') {
            callback('FE13::['+config.dbName+']'); // invalid database name
            passed = false;
        }
    }
    if (passed === true) {
        return callback(null); // check ok
    } else {
        callback('F101'); // configuration check [FAIL]
        return callback('H00::['+confFile+']');
    }
}

