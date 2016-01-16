/**
 * Created by Umer on 11/8/2015.
 */
/*jslint node:true*/
"use strict";
var mongoose = require('mongoose');
    //bcrypt = require('bcrypt');

var adminSchema = mongoose.Schema({
    userName: String,
    password: String
});


module.exports = mongoose.model('Admin', adminSchema);
