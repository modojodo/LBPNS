/**
 * Created by Haziq on 1/2/2016.
 */

var mongoose = require('mongoose');

var cuisineSchema = mongoose.Schema({
    cuisine: Object
});

module.exports = mongoose.model('cuisinedeal', cuisineSchema);