exports.echo = function(ws, request) {
    ws.on('message', function(data) {
        console.log(data);
        ws.send(data);
    });
    ws.on('close', function() {
        console.log('websocket closed');
    });
}

exports.route = function(ws, request, clients) {
    var clientId = require('basic-auth')(request).name;
    ws.on('message', function(data, flags) {
        var msg = JSON.parse(data);

        if(clients[msg.dest]) {
            clients[msg.dest].send(data);
        } else {
            ws.send(JSON.stringify({
                msgid: msg.msgid,
                dest: msg.dest,
                data: 'CANNOT REACH DESTINATION',
                type: 'ERROR'
            }));
        }

    });
    ws.on('close', function(code, message) {
        delete clients[clientId];
    });
    ws.on('error', function(error) {
        console.log('error: '+error); //TODO: error routine
    });
}
