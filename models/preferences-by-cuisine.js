/**
 * Created by Haziq on 1/2/2016.
 */

var mongoose = require('mongoose');

var preferencesSchema = mongoose.Schema({
    cuisine : [String],
    restaurants : [String]
});
module.exports = mongoose.model('preferencesByCuisine', preferencesSchema);
