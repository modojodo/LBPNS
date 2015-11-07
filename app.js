/*jslint node:true*/
/*jslint unparam: true*/

"use strict";
var app = require('express')(),
    logger = require('morgan'),
    credentials = require('./credentials'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    sitemapCrawler = require('./crawler/sitemap-crawler.js');
var port = process.env.PORT || 3000;

app.use(logger('dev'));

//mongoose.connect(credentials.mongo.development.connectionString);

//We don't need cookieParser anymore with express-session, but using express-session solely
app.use(cookieParser());
app.use(session({
    secret: credentials.cookieSecret,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use('/', function (req, res) {
    res.send('Our First Express program!');
    console.log(req.cookies);
    console.log('================');
    console.log(req.session);
});
app.listen(port, function () {
    console.log("Server started at port:" + port);
});


//sitemapCrawler.crawl(eatoye);