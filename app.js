/*jslint node:true*/
/*jslint unparam: true*/

"use strict";
var express = require('express'),
    app = express(),
    logger = require('morgan'),
    flash = require('express-flash'),
    credentials = require('./config'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('./models/user'),
    sitemapCrawler = require('./crawler/sitemap-crawler.js');


//pick port from production environment or use manual
var port = process.env.PORT || 3000;

mongoose.connect(credentials.mongo.development.connectionString);
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
app.use(bodyParser());
app.use(session({
    secret: credentials.cookieSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2592000000},
    rolling: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


require('./routes.js')(app, passport);
app.listen(port, function () {
    console.log("Server started at port:" + port);
});


//sitemapCrawler.crawl(eatoye);