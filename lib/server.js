var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');

function start(callback) {
    mongoose.connect(_config.dbPath);
    mongoose.connection.on('error', function(error) {
        callback('EE3::['+error+']');
        process.exit(1);
    });
    mongoose.connection.on('disconnected', function() {
        callback('EE3::[disconnected]');
        process.exit(1);
    });

    var app = express();

    app.engine('.html', require('ejs').__express);
    app.set('views', _homePath+'/lib/web/views');
    app.set('view engine', 'html');

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(expressSession({
        secret: 'H1c0nc#PtC0dE',
        cookie: {maxAge: 60*60*1000},
        resave: true,
        saveUninitialized: false,
        store: new mongoStore({
            url: _config.dbPath,
            collection: 'hiconcept.sessions'
        })
    }));

    require(_homePath+'/lib/router.js')(app);

    app.listen(_config.port, function (error) {
        if(error) {
            callback('E201::'+_config.port);
        } else {
            callback(null);
        }
    });
}

exports.start = start;
