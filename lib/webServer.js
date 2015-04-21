var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

var dbPath = 'mongodb://hiconcept:hiconpass@localhost/hicontest';
var conn = mongoose.connect(dbPath);
var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', './web/views');
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
    secret: 'SECRET',
    cookie: {maxAge: 60*60*1000},
    resave: true,
    saveUninitialized: false,
    store: new mongoStore({
        url: dbPath,
        collection: 'hiconcept.sessions'
    })
}));

require('./web/router.js')(app);
app.listen(9994);
