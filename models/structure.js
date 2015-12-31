/**
 * Created by Umer on 12/31/2015.
 */
var mongoose = require('mongoose');

var dealSchema = mongoose.Schema({
    dealTitleClass: String,
    dealDescriptionClass: String,
    dealServingClass: String,
    dealPriceClass: String
});

module.exports = mongoose.model('Structure', dealSchema);