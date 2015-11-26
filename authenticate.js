/**
 * Created by Umer on 11/11/2015.
 */
/*jslint node:true*/

"use strict";
var LocalStartegy = require('passport-local').Strategy;

var User = require('./models/user');


module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStartegy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, passwd, done) {
        var userCreated = false;
        console.log("inside authentication");
        User.findOne({'email': email}, function (err, user) {
            //user here contains the user if it already exists in the database
            if (err) {
                return done(err);
            }
            console.log("The user of the authenticate query : " + user);

            if (user) {
                console.log("inside signup authenticate if");
                return done(null, false, req.flash('signupError', 'This user is already registered!'));
            } else {
                console.log("inside signup authenticate esle");
                var newGem = new User();
                newGem.email = email;
                newGem.password = newGem.hashIt(passwd);

                newGem.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newGem);
                });
            }
        });
    }));

    passport.use('local-login', new LocalStartegy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, passwd, done) {
        console.log("inside authentication");
        User.findOne({'email': email}, function (err, user) {
            //user here contains the user if it already exists in the database
            if (err) {
                return done(err);
            }
            console.log("The user of the login query : " + user);

            if (!user) {
                console.log("inside login authenticate if");
                return done(null, false, req.flash('loginError', 'There is no such user registered!'));
            }

            if (!user.passIsValid(passwd)) {
                console.log("inside login authenticate password validation if");
                return done(null, false, req.flash('loginMessage', 'Wrong password!'));
            }


            return done(null, user);


        });
    }));
}
