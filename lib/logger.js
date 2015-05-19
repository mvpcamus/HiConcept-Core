var winston = require('winston');
var fs = require('fs');
var title = require(_homePath+'/package.json').name;
var ver = require(_homePath+'/package.json').version;
var env = require(_homePath+'/lib/environment.json').ProductLv;

// custom levels
var levelSet = {
    levels: {
        Test: 0,
        Hint: 1,
        Data: 2,
        Info: 3,
        WARN: 4,
        ERROR: 5,
        FATAL: 6
    },
    colors: {
        Test: 'magenta',
        Hint: 'green',
        Data: 'cyan',
        Info: 'blue',
        WARN: 'yellow',
        ERROR: 'red',
        FATAL: 'red'
    }
};
winston.addColors(levelSet.colors);

// check and create log directory
if (!fs.existsSync(_homePath+'/log/')) {
    fs.mkdirSync(_homePath+'/log', 0775);
}

// export custom logger
if (env == 'Development') {
    var Logger = exports.Logger = new (winston.Logger)({
        levels: levelSet.levels,
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: 'Test'
            }),
            new (winston.transports.DailyRotateFile)({
                filename: _homePath+'/log/develop.log',
                level: 'Test'
            })
        ],
        exceptionHandlers: [
            new (winston.transports.DailyRotateFile)({
                filename: _homePath+'/log/exceptions'
            })
        ]
    });
    Logger.WARN('Application is running on Development Environment');
} else {
    var Logger = exports.Logger = new (winston.Logger)({
        levels: levelSet.levels,
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: 'Hint'
            }),
            new (winston.transports.DailyRotateFile)({
                filename: _homePath+'/log/hiconcpt.log',
                level: 'Data'
            })
        ],
        exceptionHandlers: [
            new (winston.transports.DailyRotateFile)({
                filename: _homePath+'/log/exceptions'
            })
        ]
    });
    if (env != 'Production') {
        Logger.FATAL('Application Environment setting ERROR');
        Logger.FATAL('Terminate Process: '+process.title
            +', PID: '+process.pid+', Uptime: '+process.uptime()+'s');
        process.exit(1);
    }
}
Logger.Info('>>> %s v%s <<<', title, ver);
