var logger = require(__homePath+'/lib/logger.js').Logger;
var errors = require(__homePath+'/lib/errCodes.json');
var logSpacer = require(__homePath+'/lib/environment.json').LogSpacer;

// returns to callback (err level, err message, callback)
module.exports = function(code, callback) {
    code = code + '';
    var codeMsg = code.split('::');
    code = codeMsg[0]; // error code
    var codeArr = code.split('');
    var errMsg = '';
    for (var i=1; i<codeArr.length; i++) {
        var subCode = '';
        for (var j=1; j<=i; j++) {
            subCode += codeArr[j];
        }
        if (errors[subCode] !== undefined && errors[subCode] !== null) {
            errMsg += (errors[subCode] + (i==(codeArr.length-1) ? '' : logSpacer));
        } else if (errors[subCode] === null) {
            // nothing to do
        } else {
            return errLog('U', errors['U'] + code, callback);
        }
    }
    if (codeMsg.length > 1) { // additional error message argument
        if (errMsg.length) errMsg += logSpacer;
        for (var i=1; i<codeMsg.length; i++) {
            errMsg += ((i==1 ? '' : '::') + codeMsg[i]);
        }
    }
    return errLog(codeArr[0], errMsg, callback);
}

// levels: Test > Hint > Data > Info > WARN > ERROR > FATAL
function errLog(level, message, callback) {
    switch (level) {
        case 'I':
            logger.Info(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        case 'E':
            logger.ERROR(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        case 'H':
            logger.Hint(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        case 'D':
            logger.Data(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        case 'W':
            logger.WARN(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        case 'T':
            logger.Test(message, function() {
                if (typeof callback === 'function') callback(null);});
            break;
        default: // include 'F'
            logger.FATAL(message, function() {
                if (typeof callback === 'function') callback(null);
                else process.exit([exitCode=1]);
            });
    }
}

