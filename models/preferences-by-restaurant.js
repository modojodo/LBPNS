/**
 * Created by Haziq on 1/2/2016.
 */

var mongoose = require('mongoose');

var preferencesSchema = mongoose.Schema({
    cuisines : [String],
    restaurant : [String]
});
module.exports = mongoose.model('preferencesByRestaurant', preferencesSchema);
