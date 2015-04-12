global.__homePath = __dirname;
// modules
var server = require(__homePath+'/lib/server.js');
var router = require(__homePath+'/lib/router.js');
var errHandler = require(__homePath+'/lib/errHandler.js');
var readConfig = require(__homePath+'/lib/readConfig.js');
var initialize = require(__homePath+'/lib/initialize.js');
var requestHandler = require(__homePath+'/lib/requestHandler.js');

// define router handles
var handle = {};
handle['/'] = requestHandler.root;
handle['/management'] = requestHandler.management;
handle['/publish'] = requestHandler.publish;
handle['/subscribe'] = requestHandler.subscribe;

process.on('uncaughtException', function(error) {
    errHandler('FX::'+error);
    if (typeof error === 'object' && error.code == 'EACCES') {
        errHandler('H02::'+config.port);
        errHandler('H03');
    }
    if (typeof error === 'object' && error.code == 'ENOENT') {
        var fs = require('fs');
        if (!fs.existsSync(__homePath+'/log/')) {
            errHandler('EE51');
            fs.mkdirSync(__homePath+'/log',0775);
            errHandler('IE52');
            errHandler('H04');
        }
    }
});

// load config >> initialization >> server start
readConfig(__homePath+'/config/hiconcpt.yml', function(error, config) {
    if(error) {
        errHandler(error);
    } else {
        errHandler('I100'); // configuration check [OK]
        global.config = config;
        // start initialization
        initialize(function(error, admin) {
            if(error) {
                errHandler(error);
            } else {
                errHandler('I14'); // completed successfully
errHandler('T0::'+JSON.stringify(config)); //TODO remove
                //start web server
                setTimeout(function() {
                    server.start(router.route, handle, function(error) {
                        errHandler(error);
                    });
                },1000);
            }
        }); 
    }
});

