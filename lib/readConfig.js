// dependencies
var yaml = require('js-yaml');
var fs = require('fs');

// load configuration file /config/hiconcpt.yml
module.exports = function (filePath, callback) {
    fs.readFile(filePath, 'utf8', function(error, data) {
        if(error) {
            return eallback('F000'); // cannnot load file
        } else {
            try {
                var config = yaml.safeLoad(data);
            } catch (error) {
                return callback('F001'); // false configuration
            }
            check(config, function (error) {
                if (error) {
                    return callback(error);
                } else {

console.log(JSON.stringify(config)); //TODO

                    return callback(null, config); // success
                }
            });
        }
    });
}

//TODO: config check function
function check(config, callback) {
    if (typeof config !== 'object') {
        callback('F001'); // false configuration
    } else if (typeof config.port !== 'number') {
        callback('F0010'); // invalid port number
    } else if (typeof config.https !== 'boolean') {
        callback('F0011'); // invalid https setting
    } else if (typeof config.dbUrl !== 'string') {
        callback('F0012'); // invalid database url
    } else if (typeof config.dbName !== 'string' || config.dbName ==='test') {
        callback('F0013'); // invalid database name
    } else {
        callback(null); // check ok
    }
}

