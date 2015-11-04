//==========================================================
//           websocket packet routing controller
//                    Author: Jun Jo
//==========================================================
// websocket packet { msgid: packet sending time (ms),
//                    dest : destination module ID,
//                    data : data object payload,
//                    type : 'OPEN', 'RECV', 'ERROR' }
// websocket logMsg { time : logged time (auto-generate),
//                    type : 'UCAST', 'BCAST', 'FAIL', 'ERROR',
//                    src  : packet source,
//                    dest : packet SENT destination,
//                    msg  : received original packet }
//==========================================================

var saveLog = require(_homePath+'/lib/controllers/wslogs.js').saveLog;

exports.route = function(ws, request, next) {
    var current = require('basic-auth')(request).name;
    ws.on('message', function(data, flags) {
        var msg = JSON.parse(data);
        if(ws.clients[msg.dest] && ws.clients[msg.dest].readyState === ws.OPEN) {
            ws.clients[msg.dest].send(data, null,
                saveLog(request, {type:'UCAST', src:current, dest:msg.dest, msg:msg}));
        } else if(msg.dest.toLowerCase() == '__broadcast') {
            for(client in ws.clients) {
                if(ws.clients[client].readyState === ws.OPEN) {
                    ws.clients[client].send(data, null,
                        saveLog(request, {type:'BCAST', src:current, dest:client, msg:msg}));
                } else {
                    delete ws.clients[client]; // remove CLOSED clients
                }
            }
        } else {
            if(ws.clients[msg.dest]) delete ws.clients[msg.dest]; // remove CLOSED clients
            if(ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({msgid:msg.msgid, dest:msg.dest,
                    data:'CANNOT REACH DESTINATION', type:'ERROR'}), null,
                    saveLog(request, {type:'FAIL', src:current, dest:null, msg:msg}));
            }
        }
    });
    ws.on('close', function(code, message) {
        saveLog(request, {type:'ERROR', src:null, dest:current, msg:'CONNECTION LOST'});
        delete ws.clients[current];
    });
    ws.on('error', function(error) {
        saveLog(request, {type:'ERROR', src:null, dest:null, msg:error});
    });
}
