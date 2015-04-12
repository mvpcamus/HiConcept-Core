var winston = require('winston');
var env = require(__homePath+'/lib/environment.json').ProductLv;

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

// export custom logger
if (env == 'Production') { 
    var Logger = exports.Logger = new (winston.Logger)({
        levels: levelSet.levels,
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: 'Info'
            }),
            new (winston.transports.DailyRotateFile)({
                filename: __homePath+'/log/hiconcpt.log',
                level: 'Data'
            })
        ],
        exceptionHandlers: [
            new (winston.transports.DailyRotateFile)({
                filename: __homePath+'/log/exceptions'
            })
        ]
    });
} else if (env == 'Development') {
    var Logger = exports.Logger = new (winston.Logger)({
        levels: levelSet.levels,
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: 'Test'
            }),
            new (winston.transports.DailyRotateFile)({
                filename: __homePath+'/log/develop.log',
                level: 'Test'
            })
        ],
        exceptionHandlers: [
            new (winston.transports.DailyRotateFile)({
                filename: __homePath+'/log/exceptions'
            })
        ]
    });
} else {
    console.error('FATAL: Environment setting ERROR');
    process.exit([exitCode=1]);
}

