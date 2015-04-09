var logger = require(__dirname+'/logger.js').Logger;
var errors = require(__dirname+'/errCodes.json');

// returns to callback (error level, err message)
module.exports = function(code, callback) {
    code = code + '';
    var codeArr = code.split('');
    var errMsg = '';
    for (var i=1; i<codeArr.length; i++) {
        var string = codeArr[0];
        for (var j=1; j<=i; j++) {
            string += codeArr[j];
        }
        if (errors[string] !== undefined) {
            errMsg += ((i==1 ? '':' > ') + errors[string]);
        } else {
            errLog('U', errors['0'] + code, callback);
        }
    }
    errLog(codeArr[0], errMsg, callback);
}

function errLog(level, message, callback) {
    switch (level) {
        case 'V':
            logger.verbose(message, function() {
                if(typeof callback === 'function') callback(null);});
            break;
        case 'D':
            logger.debug(message, function() {
                if(typeof callback === 'function') callback(null);});
            break;
        case 'I':
            logger.info(message, function() {
                if(typeof callback === 'function') callback(null);});
            break;
        case 'W':
            logger.warn(message, function() {
                if(typeof callback === 'function') callback(null);});
            break;
        case 'E':
            logger.error(message, function() {
                if(typeof callback === 'function') callback(null);});
            break;
        case 'F':
            logger.error('SERVER STOPED :: FATAL ERROR ::');
            logger.error(message, function() {
                process.exit([exitCode=1]);});
            break;
        default:
            logger.error('SERVER STOPED :: Unknown ERROR ::');
            logger.error(message, function() {
                process.exit([exitCode=1]);});
    }
}

