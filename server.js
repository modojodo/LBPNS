/**
 * Created by Umer on 11/2/2015.
 */

/*jslint node: true */
var app = require('express')();
var port = process.env.PORT || 80;

app.use(function (req, res, next) {
    console.log("Processing request for " + req.url);
    next();
});
app.use(function (req, res, next) {
    console.log("passed on to next middleware");
    res.end();
});
app.listen(port, function () {
    console.log("Server is up and running");
});