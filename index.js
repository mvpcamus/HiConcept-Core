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
                config.adminUser = admin.adminUser;
                config.adminPass = admin.adminPass;
                config.mongoUser = admin.mongoUser;
                config.mongoPass = admin.mongoPass;

errHandler('T0::'+JSON.stringify(config)); //TODO remove

                errHandler('I14'); // completed successfully
                //start server;
            }
        }); 
    }
});

/* initialize(start);

// start server
function start(error) {
    server.start(router.route, handle, config);
    requestHandler.initDB(config);
}*/
