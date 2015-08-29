exports.route = function(ws, request, next) {
    var current = require('basic-auth')(request).name;
    ws.on('message', function(data, flags) {
        var msg = JSON.parse(data);
        if(ws.clients[msg.dest] && ws.clients[msg.dest].readyState === ws.OPEN) {
            ws.clients[msg.dest].send(data);
        } else if(msg.dest == 'BROADCAST_MESSAGE') {
            for(client in ws.clients) {
                if(ws.clients[client].readyState === ws.OPEN) {
                    ws.clients[client].send(data);
                } else {
                    delete ws.clients[client]; // remove CLOSED clients
                }
            }
        } else {
            if(ws.clients[msg.dest]) delete ws.clients[msg.dest]; // remove CLOSED clients
            if(ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({
                    msgid: msg.msgid,
                    dest: msg.dest,
                    data: 'CANNOT REACH DESTINATION ('+msg.dest+')',
                    type: 'ERROR'
                }));
            }
        }
    });
    ws.on('close', function(code, message) {
        delete ws.clients[current];
    });
    ws.on('error', function(error) {
        console.error('websocket error: '+error); //TODO: error routine
    });
}
