/**
 * Created by Umer on 11/25/2015.
 */
/*jslint node:true*/
/*jslint unparam: true*/

"use strict";
var cheerio = require('cheerio'),
    request = require('request'),
    linkCrawler = require('./links-crawler'),
    mongoose = require('mongoose'),
    Deals = require('../models/deal'),
    preferences = require('../models/preference'),
    PreferencesByRestaurant = require('../models/preferences-by-restaurant'),
    PreferencesByCuisine = require('../models/preferences-by-cuisine'),
    Structure = require('../models/structure'),
    geocoder = require('geocoder'),
    config = require('../config'),
    async = require('async'),
    helper = require('../helper'),
    fs = require("fs");

mongoose.connect(config.mongo.production.connectionString);
var db = mongoose.connection;
var dealTitle, dealPrice, dealDescription, dealServing;
db.on('error', function (err) {
    console.log('Add the connection string');
});
var foodKeywords = [], urlsArr = [], foodKeyWordsFile = '../food-keywords.txt', filteredLinksFile = "../filtered-links.txt";

//Reading food keyords text file
try {
    var fileContent = fs.readFileSync(foodKeyWordsFile, 'utf-8');
    foodKeywords = fileContent.split("\n");
} catch (e) {
    if (e.code === 'ENOENT') {
        console.log("There is no file found named as: " + foodKeyWordsFile);
    } else {
        throw e;
    }
}
//Reading filtered links file

try {
    var fileContent = fs.readFileSync(filteredLinksFile, 'utf-8');
    urlsArr = fileContent.split("\n");
    urlsArr.splice(urlsArr.length - 1, 1);

} catch (e) {
    if (e.code === 'ENOENT') {
        console.log("There is no file found named as: " + filteredLinksFile);
    } else {
        throw e;
    }
}
//replacing carriage return
for (var i = 0; i < foodKeywords.length; i++) {
    foodKeywords[i] = foodKeywords[i].replace(/\r?\n|\r/, "").trim();
}
for (var i = 0; i < urlsArr.length; i++) {
    urlsArr[i] = urlsArr[i].replace(/\r?\n|\r/, "").trim();
}
//capitalize function
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
var restaurant = [], cuisinePref = [], branchPref = [];

var GEO_CODE_API_REQUEST_LIMIT = 10,
    GEO_CODE_API_TIME_LIMIT = 5000, //in milliseconds
    FIRST_ELEMENT = 0;
db.on('open', function () {
    console.log('The connection to the db is open!');
    Structure.findOne({}, function (err, dealStructure) {
        if (!err) {
            var dealBlock = dealStructure.dealBlock;
            var dealTitle = dealStructure.dealTitle;
            var dealDescription = dealStructure.dealDescription;
            var dealPrice = dealStructure.dealPrice;
            var dealRestaurant = dealStructure.dealRestaurant;

            var linnksToCrawl = ["https://eatoye.pk/karachi/dominos-pizza-dha"]
            //"https://eatoye.pk/karachi/mcdonalds-dha-phase-1", "https://eatoye.pk/karachi/pizza-max-malir-cantt"];
            var store = [];
            linkCrawler.readAndCrawlRec(urlsArr, store, function (result) {
                //On every crawl attempt, removing all of the previous deals
                Deals.remove().exec();
                var q = async.queue(function (task, callback) {
                    var err = task.chunk(task.item, callback);

                }, GEO_CODE_API_REQUEST_LIMIT);
                var interval = setInterval(function () {

                    if (result.length > 0) {
                        var arrayChunk = result.splice(FIRST_ELEMENT, GEO_CODE_API_REQUEST_LIMIT);
                        console.log('Pushing some more tasks');
                        for (var i = 0; i < arrayChunk.length; i++) {
                            q.push({chunk: workerTask, item: arrayChunk[i]}, function (err) {
                                if (err) {
                                    console.log('Error from individual geocode task: ' + err);
                                }
                            });
                        }

                    }
                    function workerTask(item, callback) {
                        var branch, title, content, qty, price, location, location_type;
                        var $ = cheerio.load(item.body);
                        branch = $("h1").text().trim().replace(/\n|\r/g, "");
                        branch = branch + ", Karachi";
                        geocoder.geocode(branch, function (err, data) {
                            if (!err) {
                                console.log(data);
                                if (data.status !== 'ZERO_RESULTS') {
                                    var geoloc = data.results[0].geometry.location;
                                    location_type = data.results[0].geometry.location_type;
                                    var title, description, price, branchName, restaurant, location, locationType, cuisineArray = [];
                                    if (location_type !== "APPROXIMATE") {
                                        var dealsArr = [], dealDoc;
                                        $(dealBlock).each(function () {
                                            title = $(this).find(dealTitle).clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                                            description = $(this).find(dealDescription).clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                                            price = $(this).find(dealPrice).first().clone().children().remove().end().text().trim().replace(/\n|\r/g, "").match(/\d/g).join("");
                                            branchName = branch;
                                            restaurant = branch.split(",")[0];
                                            location = geoloc;
                                            locationType = location_type;
                                            //Tagging  deals
                                            cuisineArray = [];
                                            for (var i = 0; i < foodKeywords.length; i++) {
                                                var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                                                var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                                                if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                                                    cuisineArray.push(foodKeywords[i]);
                                                    cuisinePref.push(foodKeywords[i]);
                                                    branchPref.push(restaurant);
                                                } else {
                                                    cuisinePref.push("Miscellaneous");
                                                    cuisineArray.push("Miscellaneous");
                                                }
                                            }
                                            //if (cuisineArray.length === 0) {
                                            //    cuisineArray.push("Miscellaneous");
                                            //}
                                            cuisineArray = helper.arrayDuplicateRemove(cuisineArray);
                                            if (description !== '') {
                                                dealDoc = {
                                                    dealTitle: title,
                                                    dealContent: description,
                                                    price: price,
                                                    branch: branchName,
                                                    restaurant: restaurant,
                                                    cuisine: cuisineArray,
                                                    location: location,
                                                    locationType: locationType
                                                };
                                            } else {
                                                dealDoc = {
                                                    dealTitle: title,
                                                    price: price,
                                                    branch: branchName,
                                                    restaurant: restaurant,
                                                    cuisine: cuisineArray,
                                                    location: location,
                                                    locationType: locationType
                                                };
                                            }
                                            dealsArr.push(dealDoc);
                                        });
                                        Deals.collection.insert(dealsArr, function (err, docs) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                callback();
                                                console.info('Deals of an individual links entered');
                                            }
                                        });
                                    } else {
                                        callback();
                                    }

                                }
                            } else {
                                console.log('error in geocoding: ' + err)
                                callback(err);
                            }

                        });

                    }
                }, GEO_CODE_API_TIME_LIMIT);
                q.drain = function () {
                    console.log('current tasks finished');
                    if (!result.length) {
                        clearInterval(interval);
                        console.log('All of the urls processing finished');
                        console.log('interval cleared');
                        branchPref = helper.arrayDuplicateRemove(branchPref);
                        cuisinePref = helper.arrayDuplicateRemove(cuisinePref);
                        console.log(branchPref);
                        console.log(cuisinePref);
                        preferences.remove(function (err, removed) {
                            var newP = new preferences({
                                cuisines: cuisinePref,
                                restaurants: branchPref
                            });
                            newP.save(function (err) {
                                if (err) {
                                    console.log('Erroe inserting prefernces');
                                    throw err;
                                }
                                else {
                                    console.log('Data has been successfyll entered!');

                                }
                            });
                        });
                        getPreferencesByRestaurant(branchPref);
                        getPreferencesByCuisine(cuisinePref);
                    }
                }
                //async.each(result, function (item, callback) {
                //    var branch, title, content, qty, price, location, location_type;
                //    var $ = cheerio.load(item.body);
                //    branch = $("h1").text().trim().replace(/\n|\r/g, "");
                //    branch = branch + ", Karachi";
                //    geocoder.geocode(branch, function (err, data) {
                //        if (!err) {
                //            if ( data.status !== 'ZERO_RESULTS') {
                //                var geoloc = data.results[0].geometry.location;
                //                location_type = data.results[0].geometry.location_type;
                //                var title, description, price, branchName, restaurant, location, locationType, cuisineArray = [];
                //                if (location_type !== "APPROXIMATE") {
                //                    $(dealBlock).each(function () {
                //                        title = $(this).find(dealTitle).clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                //                        description = $(this).find(dealDescription).clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                //                        price = $(this).find(dealPrice).first().clone().children().remove().end().text().trim().replace(/\n|\r/g, "").match(/\d/g).join("");
                //                        branchName = branch;
                //                        restaurant = branch.split(",")[0];
                //                        location = geoloc;
                //                        locationType = location_type;
                //                        //Tagging  deals
                //                        cuisineArray = [];
                //                        for (var i = 0; i < foodKeywords.length; i++) {
                //                            var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                //                            var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                //                            if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                //                                cuisineArray.push(foodKeywords[i]);
                //                                cuisinePref.push(foodKeywords[i]);
                //                                branchPref.push(restaurant);
                //                            } else {
                //                                cuisinePref.push("Miscellaneous");
                //                                cuisineArray.push("Miscellaneous");
                //                            }
                //                        }
                //                        //if (cuisineArray.length === 0) {
                //                        //    cuisineArray.push("Miscellaneous");
                //                        //}
                //                        cuisineArray = helper.arrayDuplicateRemove(cuisineArray);
                //                        if (description !== '') {
                //                            var newDeal = new Deals({
                //                                dealTitle: title,
                //                                dealContent: description,
                //                                price: price,
                //                                branch: branchName,
                //                                restaurant: restaurant,
                //                                cuisine: cuisineArray,
                //                                location: location,
                //                                locationType: locationType
                //                            });
                //                        } else {
                //                            var newDeal = new Deals({
                //                                dealTitle: title,
                //                                price: price,
                //                                branch: branchName,
                //                                restaurant: restaurant,
                //                                cuisine: cuisineArray,
                //                                location: location,
                //                                locationType: locationType
                //                            });
                //                        }
                //                        newDeal.save(function (err) {
                //                            if (!err) {
                //                                console.log('Deal entered');
                //                            } else {
                //                                console.log(err);
                //                                console.log('Deal could not be entered, error!');
                //                            }
                //                        });
                //                    });
                //
                //
                //                }
                //            }
                //        } else {
                //            consol.log(err);
                //        }
                //
                //        callback();
                //    });
                //
                //}, function (err) {
                //    if (!err) {
                //        branchPref = helper.arrayDuplicateRemove(branchPref);
                //        cuisinePref = helper.arrayDuplicateRemove(cuisinePref);
                //        console.log(branchPref);
                //        console.log(cuisinePref);
                //        preferences.remove(function (err, removed) {
                //            var newP = new preferences({
                //                cuisines: cuisinePref,
                //                restaurants: branchPref
                //            });
                //            newP.save(function (err) {
                //                if (err) {
                //                    console.log('Erroe inserting prefernces');
                //                    throw err;
                //                }
                //                else {
                //                    console.log('Data has been successfyll entered!');
                //
                //                }
                //            });
                //        });
                //        getPreferencesByRestaurant(branchPref);
                //        getPreferencesByCuisine(cuisinePref);
                //    }
                //
                //});
            });

        } else {
            console.log('Error occured executing the structure query');
        }
    });
});
function getPreferencesByRestaurant(branchPref) {
    var query, tasks = [];
    for (var i = 0; i < branchPref.length; i++) {
        query = createQueryForPreferencesByRestaurant(branchPref[i]);
        tasks.push(query);
    }
    async.parallel(tasks, function (err, results) {
        PreferencesByRestaurant.remove(function (err, removed) {
            if (!err) {
                PreferencesByRestaurant.collection.insert(results, function (err, docs) {
                    if (err) {
                        // TODO: handle error
                    } else {
                        console.info('PreferencesByRestaurant were successfylly stored');
                    }
                });
            }
        });
    });
}
function createQueryForPreferencesByRestaurant(pref) {
    return function (callback) {
        Deals.find({restaurant: pref}, function (err, deals) {
            if (!err) {
                var obj = {};
                obj['restaurant'] = [];
                obj['cuisines'] = [];

                obj['restaurant'].push(pref);
                for (var i = 0; i < deals.length; i++) {
                    for (var j = 0; j < deals[i].cuisine.length; j++) {
                        obj['cuisines'].push(deals[i].cuisine[j]);
                    }
                }
                obj['cuisines'] = helper.arrayDuplicateRemove(obj['cuisines']);

                if (!err) {
                    callback(null, obj);
                } else {

                    callback(err, null);
                }
            } else {
            }
        });
    }
}
function getPreferencesByCuisine(cuisinePref) {
    var query, tasks = [];
    for (var i = 0; i < cuisinePref.length; i++) {
        query = createQueryForPreferencesByCuisine(cuisinePref[i]);
        tasks.push(query);
    }
    async.parallel(tasks, function (err, results) {
        PreferencesByCuisine.remove(function (err, removed) {
            if (!err) {
                PreferencesByCuisine.collection.insert(results, function (err, docs) {
                    if (err) {
                        // TODO: handle error
                    } else {
                        console.info('PreferencesByCuisine were successfylly stored');
                    }
                });
            }
        });
    });
}
function createQueryForPreferencesByCuisine(pref) {
    return function (callback) {
        Deals.find({cuisine: pref}, function (err, data) {
            if (!err) {
                var obj = {};
                obj['restaurant'] = [];
                obj['cuisines'] = [];
                obj['cuisines'].push(pref);
                for (var i = 0; i < data.length; i++) {
                    obj['restaurant'].push(data[i].restaurant);
                }
                obj['restaurant'] = helper.arrayDuplicateRemove(obj['restaurant']);
                if (!err) {
                    callback(null, obj);
                } else {
                    callback(err, null);
                }
            } else {
            }
        });
    }
}