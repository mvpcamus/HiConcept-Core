module.exports = function(app, server, callback) {
    loadAddonList(function(addons) {
        if(addons===false || (typeof addons.enable == 'boolean' && !addons.enable)) {
            return callback(null); // no addon load
        } else {
            var item = 0;
            try {
                for(item; item<addons.list.length; item++) {
                    require(_homePath+'/addons/'+addons.list[item]+'/index.js')(app, server, callback);
                };
                return callback(null);
            } catch (error) {
                return callback('FE03::['+addons.list[item]+']');
            }
        }
    });
};

function loadAddonList(callback) {
    var yaml = require('js-yaml');
    var fs = require('fs');
    var confFile = _homePath+'/addons/addons.yml';

    fs.readFile(confFile, 'utf8', function(error, data) {
        if(error) {
            return callback(false); // no addons.yml
        } else {
            try {
                var addons = yaml.safeLoad(data);
                return callback(addons);
            } catch (error) {
                return callback({enable:true, list:['check addons.yml syntax']}); // addons.yml parse error
            }
        }
    });
};
