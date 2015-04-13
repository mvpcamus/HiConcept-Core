#!/usr/bin/env node

global._homePath = __dirname;
// modules
var server = require(_homePath+'/lib/server.js');
var router = require(_homePath+'/lib/router.js');
var errHandler = require(_homePath+'/lib/errHandler.js');
var readConfig = require(_homePath+'/lib/readConfig.js');
var initialize = require(_homePath+'/lib/initialize.js');
var requestHandler = require(_homePath+'/lib/requestHandler.js');

// define router handles
var handle = {};
handle['/'] = requestHandler.root;
handle['/management'] = requestHandler.management;
handle['/publish'] = requestHandler.publish;
handle['/subscribe'] = requestHandler.subscribe;

process.on('uncaughtException', function(error) {
    if (typeof error === 'object') {
        errHandler('FX::'+error.stack);
        if (error.code == 'EACCES') {
            errHandler('H02::['+_config.port+']');
            errHandler('H03');
        }
    } else {
        error += '';
        errHandler('FX::'+error);
    }
});

process.on('exit', function(code) {
    if (code) {
        errHandler('F0::Terminate Process: '+process.title+'('+code+')'
             +', PID: '+process.pid+', Uptime: '+process.uptime()+'s');
    } else {
        errHandler('I0::Terminate Process: '+process.title+'('+code+')'
             +', PID: '+process.pid+', Uptime: '+process.uptime()+'s');
    }
});

process.on('SIGINT', function() {
    console.log('');
    process.exit(0);
});

// load config >> initialization >> server start
readConfig(function(error, config) {
    if(error) {
        errHandler(error);
    } else {
        errHandler('I100'); // configuration check [OK]
        global._config = config;
        // start initialization
        initialize(function(error, admin) {
            if(error) {
                errHandler(error);
            } else {
                errHandler('I14'); // completed successfully
//errHandler('T0::'+JSON.stringify(_config)+'\n'+JSON.stringify(process.env)); //TODO remove
                //start web server
                setTimeout(function() {
                    server.start(router.route, handle, function(error) {
                        if(error) {
                            errHandler(error);
                        } else {
                            errHandler('I200::['+_config.port+']'); // server started
                            errHandler('H04');
                        }
                    });
                },1000);
            }
        }); 
    }
});

