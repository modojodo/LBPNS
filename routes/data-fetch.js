/**
 * Created by Umer on 12/31/2015.
 */
/*jslint node: true */

var Deal = require('../models/deal'),
    Preferences = require('../models/preference'),
    helper = require('../helper'),
    async = require('async');

module.exports = function (app) {

    app.get('/getPreferencesByRestaurant', function (req, res, next) {
        var restaurantPref = [], query, tasks = [];
        Preferences.find({}, '-_id-_v', function (err, data) {
            restaurantPref = data[0].restaurants;
            console.log(restaurantPref.length);
            for (var i = 0; i < restaurantPref.length; i++) {
                query = helper.createQueryForPreferencesByRestaurant(restaurantPref[i]);
                tasks.push(query);
            }
            async.parallel(tasks, function (err, results) {
                res.send(results);
            });
        });
    });
    app.get('/getPreferencesByCuisine', function (req, res, next) {
        var cuisinePref = [], tasks = [];
        Preferences.find({}, '-_id-_v', function (err, data) {
            cuisinePref = data[0].cuisines;
            for (var i = 0; i < cuisinePref.length; i++) {
                query = helper.createQueryForPreferencesByCuisine(cuisinePref[i]);
                tasks.push(query);
            }
            async.parallel(tasks, function (err, results) {
                res.send(results);
            });
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

    //This method might have to be removed
    function fetchDealsByRestaurant(restPref, store, callback) {
        var pref = restPref.shift();
        Deal.find({restaurant: pref}, function (err, deals) {
            if (!err) {
                var obj = {};
                obj['restaurant'] = [];
                obj['cuisines'] = [];
                obj['restaurant'].push(pref);
                for (var i = 0; i < deals.length; i++) {
                    obj['cuisines'].push(deals[i]);
                }
                store.push(obj);
                if (restPref.length) {
                    fetchDealsByRestaurant(restPref, store, callback);
                } else {
                    console.log("Categorized!!!-------------------");
                    callback(null, store);
                }
            } else {
                callback(err, null);
            }
        });
    }

    function fetchPreferencesByCuisine(cuisinePref, store, callback) {
        var cuisine = cuisinePref.shift();
        Deal.find({cuisine: cuisine}, function (err, data) {
            if (!err) {
                var obj = {};
                obj['cuisines'] = [];
                obj['restaurant'] = [];
                obj['cuisines'].push(cuisine);
                for (var i = 0; i < data.length; i++) {
                    obj['restaurant'].push(data[i].restaurant);
                }
                obj['restaurant'] = helper.arrayDuplicateRemove(obj['restaurant']);
                store.push(obj);
                if (cuisinePref.length) {
                    fetchPreferencesByCuisine(cuisinePref, store, callback);
                } else {
                    console.log("Categorized!!!-------------------");
                    callback(null, store);
                }
            } else {
                callback(err, null)
            }
        });
    }

    function fetchPreferencesByRestaurant(restaurantPref, store, callback) {
        var pref = restaurantPref.shift();
        Deal.find({restaurant: pref}, function (err, data) {
            if (!err) {
                var obj = {};
                obj['restaurant'] = [];
                obj['cuisines'] = [];
                obj['restaurant'].push(pref);
                for (var j = 0; j < data.length; j++) {
                    for (var k = 0; k < data[j].cuisine.length; k++) {
                        obj['cuisines'].push(data[j].cuisine[k]);
                    }
                }
                obj['cuisines'] = helper.arrayDuplicateRemove(obj['cuisines']);
                store.push(obj);
                if (restaurantPref.length) {
                    fetchPreferencesByRestaurant(restaurantPref, store, callback);
                } else {
                    console.log("Categorized!!!-------------------");
                    callback(null, store);
                }
            } else {
                callback(err, null)

            }
        });
    }

}