/**
 * Created by Umer on 12/31/2015.
 */
/*jslint node: true */

var CuisineDeals = require('../models/cuisinedeals'),
    NewMapDeals = require('../models/newMapDeals'),
    Preferences = require('../models/preferences');
function arrayDuplicateRemove(arr) {
    var c = 0;
    var tempArray = [];
    //console.log(arr);
    arr.sort();
    //console.log(arr);
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] != tempArray[c - 1]) {
            tempArray.push(arr[i])
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
            //console.log(data);
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
                console.log(data);
                res.json(data);
            });
        });

    });
    function fetchPreferencesByCuisine(cuisinePref, store, callback) {
        var cuisine = cuisinePref.shift();
        NewMapDeals.find({cuisine: cuisine}, function (err, data) {
            if (!err) {
                var obj = {}
                obj[cuisine] = [];
                for (var i = 0; i < data.length; i++) {
                    obj[cuisine].push(data[i].restaurant);
                }
                obj[cuisine] = arrayDuplicateRemove(obj[cuisine]);
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
        NewMapDeals.find({restaurant: pref}, function (err, data) {
            if (!err) {
                var obj = {};
                obj[pref] = [];
                for (var j = 0; j < data.length; j++) {
                    for (var k = 0; k < data[j].cuisine.length; k++) {
                        obj[pref].push(data[j].cuisine[k]);
                    }
                }
                obj[pref] = arrayDuplicateRemove(obj[pref]);
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