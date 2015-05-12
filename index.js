#!/usr/bin/env node

global._homePath = __dirname;
// modules
var errHandler = require(_homePath+'/lib/errHandler.js');
var readConfig = require(_homePath+'/lib/readConfig.js');
var initialize = require(_homePath+'/lib/initialize.js');
var server = require(_homePath+'/lib/server.js');

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
readConfig(function(error, config, sslCerts) {
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
errHandler('T0::'+JSON.stringify(_config)); //TODO remove
                //start web server
                setTimeout(function() {
                    server.start(sslCerts, function(error) {
                        if(error) {
                            errHandler(error);
                        } else { // server started
                            errHandler((sslCerts?'I210':'I200')+'::['+_config.port+']');
                            errHandler('H04');
                        }
                    });
                },1000);
            }
        }); 
    }
});

