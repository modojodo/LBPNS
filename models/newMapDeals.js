/**
 * Created by Haziq on 1/2/2016.
 */

var mongoose = require('mongoose');

var dealSchema = mongoose.Schema({
    dealTitle: String,
    dealContent: String,
    quantity: String,
    price: Number,
    branch: [String],
    cuisine:[String]
});

module.exports = mongoose.model('newMapDeals', dealSchema);