// silly, debug, verbose, info, warn, error
var winston = require('winston');
var Logger = exports.Logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'silly'
        }),
        new (winston.transports.DailyRotateFile)({
            filename: __dirname+'/../log/error.log',
            level: 'info'
        })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'error'
        }),
        new (winston.transports.DailyRotateFile)({
            filename: __dirname+'/../log/exceptions'
        })
    ]
});

