/**
 * Created by Umer on 12/31/2015.
 */
/*jslint node: true */

var CuisineDeals = require('../models/cuisinedeals'),
    Deal = require('../models/deal'),
    Preferences = require('../models/preferences');
function arrayDuplicateRemove(arr) {
    var c = 0;
    var tempArray = [];
    //console.log(arr);
    arr.sort();
    //console.log(arr);
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] != tempArray[c - 1]) {
            tempArray.push(arr[i]);
            c++;
        }
    }
    ;
    //console.log(tempArray);
    tempArray.sort();
    console.log(tempArray);
    return tempArray;
}

module.exports = function (app) {

    app.get('/fetchDeals', function (req, res, next) {
        CuisineDeals.find({}, 'cuisine -_id', function (err, deals) {
            if (!err) {
                console.log('Fetchde Deals!');
                res.json(deals);
            }
            else {
                console.log('there was an error in /fetchDeals route query');
            }
        });
    });


    app.get('/getPreferencesByRestaurant', function (req, res, next) {
        var restaurantPref = [], cuisinePref = [];
        Preferences.find({}, '-_id-_v', function (err, data) {
            restaurantPref = data[0].restaurants;
            console.log(restaurantPref);
            var store = [];
            fetchPreferencesByRestaurant(restaurantPref, store, function (err, data) {
                if (!err) {
                    res.json(data);
                } else {
                    console.log(err);
                    next();
                }

            });
        });
    });
    app.get('/getPreferencesByCuisine', function (req, res, next) {
        var cuisinePref = [];
        Preferences.find({}, '-_id-_v', function (err, data) {
            cuisinePref = data[0].cuisines;
            var store = [];
            fetchPreferencesByCuisine(cuisinePref, store, function (err, data) {
                if(!err){
                    console.log(data);
                    res.json(data);
                }
            });
        });

    });
    app.get('/getDealsByRestaurant', function (req, res) {
        var restaurants = [];
        Preferences.find({}, function (err, pref) {
            restaurants = pref[0].restaurants;
            console.log(restaurants);
            var store = [];
            fetchDealsByRestaurant(restaurants,store, function(err, data){
                if(!err){
                    res.json(data);
                }
            });
        });
    });
    app.get('/getDealsByCuisine', function (req, res) {
        var restaurants = [];
        Preferences.find({}, function (err, pref) {
            //console.log(pref);
            //restaurants = pref.restaurants;
            //console.log(restaurants);
            //var store = [];
            //fetchDealsByRestaurant(restaurants,store, function(err, data){
            //    if(!err){
            //        res.json(data);
            //    }
            //});
        });
    });


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
                obj['restaurant'] = arrayDuplicateRemove(obj['restaurant']);
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
                obj['cuisines'] = arrayDuplicateRemove(obj['cuisines']);
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