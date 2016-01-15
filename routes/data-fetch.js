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
    //app.get('/getPreferencesByCuisine', function (req, res, next) {
    //    PreferencesByCuisine.find({}, {_id: 0, _v: 0}, function (err, results) {
    //        if (!err) {
    //            res.send(results);
    //        } else {
    //            throw err;
    //        }
    //    });
    //});
    //
    //app.post('/getUserPreferenceDealsByRestaurant', function (req, res) {
    //    var restaurant, cuisines, preference, userPreferences, query, tasks = [];
    //    userPreferences = JSON.parse(req.body.preferences);
    //    for (var i = 0; i < userPreferences.length; i++) {
    //        preference = userPreferences[i];
    //        restaurant = Object.keys(preference)[0];
    //        cuisines = preference[restaurant];
    //        query = createQuery(restaurant, cuisines);
    //        tasks.push(query);
    //    }
    //    function createQuery(restaurant, cuisines) {
    //        return function (callback) {
    //            Deal.find({restaurant: restaurant, cuisine: {$in: cuisines}}, '-_id-_v').exec(function (err, deals) {
    //                console.log(restaurant);
    //                console.log(cuisines);
    //                if (!err) {
    //                    callback(null, deals);
    //                } else {
    //                    console.log('there');
    //                    callback(err, null);
    //                }
    //            });
    //        }
    //    }
    //
    //    async.parallel(tasks, function (err, results) {
    //        var responseRes = [];
    //        if (!err) {
    //            console.log("Testinggg!!!");
    //            for (var i = 0; i < results.length; i++) {
    //                for (var j = 0; j < results[i].length; j++) {
    //                    responseRes.push(results[i][j]);
    //                }
    //            }
    //            //res.json({deals: responseRes});
    //            res.send(results);
    //        }
    //        else {
    //            throw err;
    //        }
    //    });
    //});

    //Temporary
    app.post('/getPreferencesByCuisine', function (req, res) {

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


    });

    app.post('/getUserPreferenceDealsByRestaurant', function (req, res) {
        //Deal.find({branch: /KFC/}, {_id: 0, _v: 0},{$group:'price'}, function (err, result) {
        //    console.log(result);
        //    res.send(result);
        //});
        var preferences = JSON.parse(req.body.preferences);
        console.log(preferences);
        var tasks = [];
        var restaurant, cuisines;
        for (var i = 0; i < preferences.length; i++) {
            restaurant = Object.keys(preferences[i])[0]
            cuisines = preferences[i][restaurant];
            tasks.push(createQuery(restaurant, cuisines));
        }
        async.parallel(tasks, function (err, results) {
            var tasks = [];
            for (var i = 0; i < results.length; i++) {
                for (var j = 0; j < results[i]['location'].length; j++) {
                    var location = results[i]['location'][j];
                    var cuisines = results[i]['cuisines'];
                    console.log(location);
                    console.log(cuisines);
                    tasks.push(createSecondQuery(location, cuisines));
                }
            }

            async.parallel(tasks, function (err, results) {
                res.send(results);
            });
        });

        function createSecondQuery(location, cuisines) {
            return function (callback) {
                Deal.find({location: location['_id'], cuisine: {$in: cuisines}}, {
                    _id: 0,
                    _v: 0
                }, function (err, result) {
                    if (!err) {
                        console.log(location);
                        var lat = location['_id']['lat'];
                        var lng = location['_id']['lng'];
                        console.log(lat)
                        console.log(lng)
                        var loc = lat + "," + lng;
                        var obj = {};
                        obj[loc] = result;
                        callback(null, obj);
                    } else {
                        callback(err, null);
                    }
                });
            }
        }

        function createQuery(restaurant, cuisines) {
            return function (callback) {
                Deal.aggregate([{
                    $match: {
                        restaurant: restaurant,
                        cuisine: {
                            $in: cuisines
                        }
                    }
                }, {$group: {_id: '$location'}}], function (err, result) {
                    if (!err) {
                        var obj = {
                            location: result,
                            cuisines: cuisines
                        }
                        callback(null, obj);
                    } else {
                        callback(result, null);
                    }

                });
            }
        }

        Deal.aggregate([{
            $match: {
                restaurant: "KFC",
                cuisine: {$in: ['Burger']}
            }
        }, {$group: {_id: '$location'}}], function (err, result) {
            Deal.find({location: result[0]['_id'], cuisine: {$in: ['Burger']}}, function (err, result) {
                //res.send(result);
            });

        })
    });
}