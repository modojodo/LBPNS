/**
 * Created by Umer on 11/7/2015.
 */
/*jslint node:true*/
/*jslint unparam:true*/

"use strict";

var User = require('./../models/user');


module.exports = function (app, passport) {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        else
            res.redirect('/notLoggedIn');
    }

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/login', isLoggedIn, function (req, res) {
        res.redirect("/profile");
    });
    app.get('/signup', isLoggedIn, function (req, res) {
        res.send("User Profile page");
    });
    app.get('/profile', isLoggedIn, function (req, res) {
        res.send("User Profile page");
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/failedLogin',
        failureflash: true
    }));
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/failedSignup',
        failureflash: true
    }));
    app.get('/failedSignup', function (req, res) {
        res.send("Couldn't signup");
    });
    app.get('/failedLogin', function (req, res) {
        res.send("Couldn't login");
    });

    app.get('/', function (req, res) {
        res.end();
        console.log(req.cookies);
        console.log('================');
        console.log(req.session);
        console.log(req.session.cookie.maxAge);
    });
};