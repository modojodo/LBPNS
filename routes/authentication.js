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
    app.get('/authenticate', function (req, res) {
        if (req.isAuthenticated())
            res.json({authenticated: "true"});
        else
            res.json({authenticated: "false"});
    });
    //app.post('/login', passport.authenticate('local-login', {
    //    successRedirect: '/profile',
    //    failureRedirect: '/failedLogin',
    //    failureflash: true
    //}));
    app.post('/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({logged: "false"});
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.json({logged: "true"});
            });
        })(req, res, next);
    });
    //app.post('/signup', passport.authenticate('local-signup', {
    //    successRedirect: '/profile',
    //    failureRedirect: '/failedSignup',
    //    failureflash: true
    //}));
    app.post('/signup', function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({signedUp: "false"});
            }
            if (user) {
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.json({signedUp: "true"});
                });

            }

        })(req, res, next);
    });
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
    app.post('/adminLogin', function (req, res, next) {
        Admin.find({},function(err, data){
            console.log(data[0].userName);
            console.log(data[0].password);

            if(req.body.userName.length>4&&req.body.password.length>4&&req.body.userName===data[0].userName&&req.body.password===data[0].password){
                //    do login
                res.sendfile(path.resolve("./public/BootstrapPanel/index.html"));
            } else{
                res.send("fail");
            }
        });

    });
};
