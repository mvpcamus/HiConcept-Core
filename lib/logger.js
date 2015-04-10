var winston = require('winston');
// custom levels
var levelSet = {
    levels: {
        Test: 0,
        Info: 1,
        Data: 2,
        Help: 3,
        WARN: 4,
        ERROR: 5,
        FATAL: 6
    },
    colors: {
        Test: 'magenta',
        Info: 'blue',
        Data: 'cyan',
        Help: 'green',
        WARN: 'yellow',
        ERROR: 'red',
        FATAL: 'red'
    }
};
winston.addColors(levelSet.colors);

// export custom logger
var Logger = exports.Logger = new (winston.Logger)({
    levels: levelSet.levels,
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'Test'
        }),
        new (winston.transports.DailyRotateFile)({
            filename: __homePath+'/log/hiconcpt',
            level: 'Data'
        })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'ERROR'
        }),
        new (winston.transports.DailyRotateFile)({
            filename: __homePath+'/log/exceptions'
        })
    ]
});

