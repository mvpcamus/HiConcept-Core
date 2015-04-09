// winston logger levels: [silly, debug, verbose, info, warn, error]
//global.logger = require(__dirname+'/lib/logger.js').Logger;

// modules
var server = require(__dirname+'/lib/server.js');
var router = require(__dirname+'/lib/router.js');
var errHandler = require(__dirname+'/lib/errHandler.js');
var readConfig = require(__dirname+'/lib/readConfig.js');
var initialize = require(__dirname+'/lib/initialize.js');
var requestHandler = require(__dirname+'/lib/requestHandler.js');

// define router handles
var handle = {};
handle['/'] = requestHandler.root;
handle['/management'] = requestHandler.management;
handle['/publish'] = requestHandler.publish;
handle['/subscribe'] = requestHandler.subscribe;

// load config >> initialization >> server start
readConfig(__dirname+'/config/hiconcpt.yml', function(error, config) {
    if(error) {
        errHandler(error);
    } else {
        errHandler('V00'); // configuration check... OK
        global.config = config;
        initialize(function(error, admin) {
            if(error) {
                errHandler(error);
            } else {
                config.adminUser = admin.adminUser;
                config.adminPass = admin.adminPass;
                config.mongoUser = admin.mongoUser;
                config.mongoPass = admin.mongoPass;

console.log(config); //TODO

                errHandler('V01');
                //start server;
            }
        }); 
    }
});

// initialize & check out


/* initialize(start);

// start server
function start(error) {
    server.start(router.route, handle, config);
    requestHandler.initDB(config);
}*/
