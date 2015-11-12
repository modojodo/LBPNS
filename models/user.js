/**
 * Created by Umer on 11/8/2015.
 */
/*jslint node:true*/
"use strict";
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    email: String,
    password: String
});

userSchema.methods.hashIt = function (pass) {
    return bcrypt.hashSync(pass, 8);
};

userSchema.methods.passIsValid = function (pass) {
    console.log("Inside password is valid method");
    var result = bcrypt.compareSync(pass, this.password);
    console.log("the decrypted passwd is " + result);
    return result;
};


module.exports = mongoose.model('User', userSchema);