/**
 * Created by Umer on 12/31/2015.
 */
/*jslint node: true */

var Deal = require('../models/deal'),
    Preferences = require('../models/preference'),
    PreferencesByRestaurant = require('../models/preferences-by-restaurant'),
    PreferencesByCuisine = require('../models/preferences-by-cuisine'),
    helper = require('../helper'),
    async = require('async');

module.exports = function (app) {

    app.get('/getPreferencesByRestaurant', function (req, res, next) {
        PreferencesByRestaurant.find({}, {_id: 0, _v: 0}, function (err, results) {
            if (!err) {
                res.send(results);
            } else {
                throw err;
            }
        });
    });
    app.get('/getPreferencesByCuisine', function (req, res, next) {
        PreferencesByCuisine.find({}, {_id: 0, _v: 0}, function (err, results) {
            if (!err) {
                res.send(results);
            } else {
                throw err;
            }
        });
    });

    app.post('/getUserPreferenceDeals', function (req, res) {
        var restaurant, cuisines, preference, userPreferences, query, tasks = [];
        userPreferences = JSON.parse(req.body.preferences);
        for (var i = 0; i < userPreferences.length; i++) {
            preference = userPreferences[i];
            restaurant = Object.keys(preference)[0];
            cuisines = preference[restaurant];
            query = createQuery(restaurant, cuisines);
            tasks.push(query);
        }
        function createQuery(restaurant, cuisines) {
            return function (callback) {
                Deal.find({restaurant: restaurant, cuisine: {$in: cuisines}}, '-_id-_v').exec(function (err, deals) {
                    console.log(restaurant);
                    console.log(cuisines);
                    if (!err) {
                        callback(null, deals);
                    } else {
                        console.log('there');
                        callback(err, null);
                    }
                });
            }
        }

        async.parallel(tasks, function (err, results) {
            if (!err) {
                console.log("Testinggg!!!");
                res.send(results);
            }
            else {
                throw err;
            }
        });
    });

}