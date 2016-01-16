/*jslint node:true*/
/*jslint unparam: true*/

"use strict";
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    flash = require('express-flash'),
    config = require('./config'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('./models/user');
    //sitemapCrawler = require('./crawler/sitemap-crawler.js');


//pick port from production environment or use manual
var port = process.env.PORT || 3000;

mongoose.connect(config.mongo.production.connectionString);
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Add the connection string');
});
db.on('open', function () {
    console.log("The connection to the db is open");
});

require('./authenticate')(passport);

app.use(express.static('public'));
app.use(logger('dev'));


//We don't need cookieParser anymore with express-session, but using express-session solely
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: config.cookieSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2592000000},
    rolling: true
}));
app.use(function cookieLogger(req, res, next) {
    console.log(req.cookies);
    next();
});
app.use(function(req, res, next){
    console.log(req.body);
    next();
});
//app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


require('./routes/authentication.js')(app, passport);
require('./routes/panel.js')(app);
require('./routes/data-fetch')(app);
app.all('*', function(req, res){
    res.send('404 - Not Found', 404);
});
app.listen(port, function () {
    console.log("Server started at port:" + port);
});



//sitemapCrawler.crawl(eatoye);