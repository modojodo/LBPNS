/**
 * Created by Umer on 11/2/2015.
 */

/*jslint node: true */
/*jslint unparam:true*/

"use strict";
var app = require('express')();
var port = process.env.PORT || 4040;

app.use(function (req, res, next) {
    console.log('\n\nALLWAYS');
    next();
});
app.get('/a', function (req, res) {
    console.log('/a: route terminated');
    res.send('a');
});
app.get('/a', function (req, res) {
    console.log('/a: never called');
});
app.get('/b', function (req, res, next) {
    console.log('/b: route not terminated');
    next();
});
app.use(function (req, res, next) {
    console.log('SOMETIMES');
    next();
});
app.get('/b', function (req, res, next) {
    console.log('/b (part 2): error thrown');
    throw new Error('b failed');
});
app.use('/b', function (err, req, res, next) {
    console.log('/b error detected and passed on');
    next(err);
});
app.get('/c', function (err, req) {
    console.log('/c: error thrown');
    throw new Error('c failed');
});
app.use('/c', function (err, req, res, next) {
    console.log('/c: error deteccted but not passed on');
    next();
});
app.use(function (err, req, res, next) {
    console.log('unhandled error detected: ' + err.message);
    res.send('500 - server error');
});
app.use(function (req, res) {
    console.log('route not handled');
    res.send('404 - not found');
});


app.listen(port, function () {
    console.log("Server is up and running");
});