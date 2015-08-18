exports.echo = function(ws, request) {
    ws.on('message', function(data) {
        console.log(data);
        ws.send(data);
    });
    ws.on('close', function() {
        console.log('websocket closed');
    });
}

exports.route = function(ws, request) {
    ws.on('open', function() {
        console.log('websocket opened');
    });
    ws.on('message', function(data, flags) {
        console.log('message: '+data);
        console.log('flags: '+flags);
        ws.send(data);
    });
    ws.on('close', function(code, message) {
        console.log('close code: '+code+', msg: '+message);
    });
    ws.on('error', function(error) {
        console.log('error: '+error);
    });
}
