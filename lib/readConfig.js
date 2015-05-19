// dependencies
var yaml = require('js-yaml');
var fs = require('fs');

var confFile = _homePath+'/config/hiconcpt.yml';

// load configuration file /config/hiconcpt.yml
module.exports = function(callback) {
    fs.readFile(confFile, 'utf8', function(error, data) {
        if(error) {
            callback('EE0::['+confFile+']'); // cannnot load
            callback('F101'); // configuration check [FAIL]
            return callback('H00::['+confFile+']');
        } else {
            try {
                var config = yaml.safeLoad(data);
            } catch (error) {
                callback('EE000'); // wrong format
                callback('F101'); // configuration check [FAIL]
                return callback('H00::['+confFile+']');
            }
            check(config, function(error) {
                if (error) {
                    return callback(error);
                } else if (config.https) {
                    config.sslCerts = {
                        crt: fs.readFileSync(_homePath+'/config/ssl/'+config.sslCrt),
                        key: fs.readFileSync(_homePath+'/config/ssl/'+config.sslKey)}
                    return callback(null, config); // success
                } else {
                    return callback(null, config); // success
                }
            });
        }
    });
}

function check(config, callback) {
    var passed = true;
    if (typeof config !== 'object') {
        callback('EE00'); // cannot load configuration
        passed = false;
    } else {
        if (typeof config.port !== 'number') {
            callback('EE10::['+config.port+']'); // invalid port number
            passed = false;
        }
        if (typeof config.https !== 'boolean') {
            callback('EE11::['+config.https+']'); // invalid https setting
            passed = false;
        } else if (config.https === true) {
            if (typeof config.sslCrt === 'string'
                && typeof config.sslKey === 'string') {
                if (!fs.existsSync(_homePath+'/config/ssl/'+config.sslCrt)) {
                    callback('EE14::['+config.sslCrt+']');
                    passed = false;
                }
                if (!fs.existsSync(_homePath+'/config/ssl/'+config.sslKey)) {
                    callback('EE14::['+config.sslKey+']');
                    passed = false;
                }
            }
        }
        if (typeof config.dbUrl !== 'string') {
            callback('EE12::['+config.dbUrl+']'); // invalid database url
            passed = false;
        }
        if (typeof config.dbName !== 'string' || config.dbName ==='test') {
            callback('EE13::['+config.dbName+']'); // invalid database name
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
