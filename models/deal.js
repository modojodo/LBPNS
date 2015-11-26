/**
 * Created by Jahangir on 11/25/2015.
 */
/*jslint node:true*/

var mongoose = require('mongoose');

var dealSchema = mongoose.Schema({
    dealTitle: String,
    dealContent: String,
    quantity: String,
    price: Number,
    branch: String
});

module.exports = mongoose.model('Deal', dealSchema);