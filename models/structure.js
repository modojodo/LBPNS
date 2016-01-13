/**
 * Created by Umer on 12/31/2015.
 */
var mongoose = require('mongoose');

var dealSchema = mongoose.Schema({
    dealTitle: String,
    dealDescription: String,
    dealPrice: String,
    dealRestaurant: String,
    dealBlock: String
});

module.exports = mongoose.model('Structure', dealSchema);