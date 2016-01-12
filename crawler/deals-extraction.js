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
    Deals = require('../models/deals'),
    preferences = require('../models/preferences'),
    preferencesByRestaurant = require('../models/preferences-by-restaurant'),
    Structure = require('../models/structure'),
    geocoder = require('geocoder'),
    config = require('../config'),
    async = require('async'),
    helper = require('../helper'),
//Haziq Code regex
//    reading from file
    fs = require("fs");
//For geo coding using API key

// optionnal
//var extra = {
//    apiKey: 'AIzaSyCJPe-a48_LewLoeTBIzg1ix3qxwQtXsqs',
//    formatter: null
//};
//var geocoderProvider = 'google';
//var httpAdapter = 'https';
//var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

mongoose.connect(config.mongo.production.connectionString);
var db = mongoose.connection;
var dealTitle, dealPrice, dealDescription, dealServing;
db.on('error', function (err) {
    console.log('Add the connection string');
});
var foodKeywords = [], fileName = '../food-keywords.txt', fileContent;
try {
    fileContent = fs.readFileSync(fileName, 'utf-8');
    foodKeywords = fileContent.split("\n");

} catch (e) {
    if (e.code === 'ENOENT') {
        console.log("There is no file found named as: " + fileName);
    } else {
        throw e;
    }
}
//replacing carriage return
for (var i = 0; i < foodKeywords.length; i++) {
    foodKeywords[i] = foodKeywords[i].replace(/\r?\n|\r/, "");
    foodKeywords[i] = foodKeywords[i].trim();
}
//capitalize function
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//Preferences vars
var cuisineP = [], branchP = [], rest = [], cuisinePUmer = [], branchPUmer = [];
var long;
var lat;
var branchesForLoc = [];
var location = [];
var fullAddress = [];
db.on('open', function () {
    console.log('The connection to the db is open!');
    console.log("The connection to the db is open");
    Structure.findOne({}, function (err, dealStructure) {
        if (!err) {
            console.log('Query executed');
            console.log(dealStructure);
            dealTitle = dealStructure.dealTitleClass;
            dealDescription = dealStructure.dealDescriptionClass;
            dealPrice = dealStructure.dealPriceClass;
            dealServing = dealStructure.dealServingClass;

        } else {
            console.log('Error occured executing the structure query');
        }
    });


    var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal", "https://eatoye.pk/karachi/mcdonalds-dha-phase-1", "https://eatoye.pk/karachi/pizza-max-malir-cantt"];
//var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal"];
    var store = [];
    var deals = [];
    var catByCuisine = [];
    var uniqueCuisinesP2 = [];
    var uniquebranchesP2 = [];
    linkCrawler.readAndCrawlRec(linnksToCrawl, store, function (result) {
        var i, $, cuisineArray = [];
        for (i = 0; i < result.length; i++) {
            $ = cheerio.load(result[i]);
            var branch, title, content, qty, price;
            if ($('.mspan7-menu > .menu-item').length <= 0) {
                continue;
            } else {
                $('.mspan7-menu > .menu-item').each(function () {
                    if ($(this).find('.menu-subitems >.menu-subitem').length > 1) {  // if a single deals has more than one kind of quantity & prices
                        $(this).find('.menu-subitems >.menu-subitem').each(function () {
                            title = $(this).closest('.menu-item').find('.menu-item-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            content = $(this).closest('.menu-item').find('.menu-item-name > small').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            qty = $(this).find('.subitem-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            price = parseInt($(this).find('.subitem-price> span').clone().children().remove().end().text().trim().replace(/\n|\r/g, "").match(/\d/g).join(""));
                            branch = $("[itemprop='name']").text().trim().replace(/\n|\r/g, "");


                            $(".item-address").first().remove();
                            if (!$(".item-address").text()) {
                            } else {
                                location[i] = $(".item-address").text();
                            }

                            var name = branch.split(",");
                            //console.log(name[0]+", "+location[i]);


                            //var query, tasks = [];
                            //query = createQuery(name[0]+", "+location[i]);
                            //tasks.push(query);
                            //
                            //function createQuery(attr) {
                            //    return function (callback) {
                            //        geocoder.geocode(attr, function(err, data) {
                            //            console.log(data);
                            //        });
                            //    }
                            //}
                            //
                            //async.parallel(tasks, function (err, results) {
                            //    if (!err) {
                            //        console.log("Testinggg!!!");
                            //        res.send(results);
                            //    }
                            //    else {
                            //        throw err;
                            //    }
                            //});


                            //fullAddress.push(name[0]+", "+location[i]);
                            //console.log(fullAddress);
                            //console.log('Title: ' + title);
                            //console.log('Content: ' + content);
                            //console.log('Quantity: ' + qty);
                            //console.log('Price: ' + price);
                            //console.log('Branch: ' + branch);
                            branchesForLoc.push(branch);
                            //Mapping
                            cuisineArray = [];
                            for (var i = 0; i < foodKeywords.length; i++) {
                                var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                                var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                                if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                                    //console.log("found");
                                    cuisineArray.push(foodKeywords[i]);
                                    cuisineP.push(foodKeywords[i]);
                                    cuisinePUmer.push(foodKeywords[i]);
                                    rest = branch.split(",");
                                    branchP.push(rest[0]);
                                    branchPUmer.push(rest[0]);
                                }
                            }
                            if (cuisineArray.length === 0) {
                                cuisineArray.push("Misc.")
                            }

                            //var temp = rest[0]+location[i];
                            //console.log(temp);
                            //console.log("Full Location : "+rest[1])
                            //console.log(branch);
                            //geocoder.geocode(branch, function(err, res) {
                            //    console.log(res);
                            //});
                            //geocoder.geocode(branch,function(err,data){
                            //
                            //});
                            //console.log(cuisineArray);
                            //console.log('----------------------------------------------------');
                            //use Deals instead of Deals to store data in old collection (deals)
                            if (content.length <= 1) {
                                var newDeal = new Deals({
                                    dealTitle: title,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    restaurant: rest[0],
                                    cuisine: cuisineArray,
                                    long: long,
                                    lat: lat
                                });
                            } else if (content.length > 0) {
                                var newDeal = new Deals({
                                    dealTitle: title,
                                    dealContent: content,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    restaurant: rest[0],
                                    cuisine: cuisineArray,
                                    long: long,
                                    lat: lat
                                });
                            }
                            deals.push(newDeal);
                            newDeal.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                                else {
                                }
                            });

                        });
                    } else {
                        title = $(this).find('.menu-item-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                        content = $(this).find('.menu-item-name > small').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                        qty = $(this).find('.menu-subitems >.menu-subitem>.subitem-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                        price = parseInt($(this).find('.menu-subitems >.menu-subitem>.subitem-price> span').clone().children().remove().end().text().trim().replace(/\n|\r/g, "").match(/\d/g).join(""));
                        branch = $("[itemprop='name']").text().trim().replace(/\n|\r/g, "");


                        $(".item-address").first().remove();
                        if (!$(".item-address").text()) {
                        } else {
                            location[i] = $(".item-address").text();
                        }
                        var name = branch.split(",");
                        //console.log(name[0]+", "+location[i]);


                        //fullAddress.push(name[0]+", "+location[i]);
                        //var fa = arrayDuplicateRemove(fullAddress);
                        //console.log(fa);

                        //console.log('Title: ' + title);
                        //console.log('Content: ' + content);
                        //console.log('Quantity: ' + qty);
                        //console.log('Price: ' + price);
                        //console.log('Branch: ' + branch);
                        branchesForLoc.push(branch);
                        //Mapping
                        cuisineArray = [];
                        for (var i = 0; i < foodKeywords.length; i++) {
                            var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                            var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                            if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                                //console.log("found");
                                cuisineArray.push(foodKeywords[i]);
                                cuisineP.push(foodKeywords[i]);
                                cuisinePUmer.push(foodKeywords[i]);
                                rest = branch.split(",");
                                branchP.push(rest[0]);
                                branchPUmer.push(rest[0]);
                            }
                        }
                        //console.log(branch);
                        //geocoder.geocode(branch, function(err, res) {
                        //    console.log(res);
                        //});
                        if (cuisineArray.length === 0) {
                            cuisineArray.push("Misc.")
                        }
                        //geocoder.geocode(branch,function(err,data){
                        //    console.log(data);
                        //});
                        //console.log(cuisineArray);
                        //console.log('----------------------------------------------------');
                        if (content.length <= 1) {
                            var newDeal = new Deals({
                                dealTitle: title,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                restaurant: rest[0],
                                cuisine: cuisineArray,
                                long: long,
                                lat: lat
                            });
                        } else if (content.length > 0) {
                            var newDeal = new Deals({
                                dealTitle: title,
                                dealContent: content,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                restaurant: rest[0],
                                cuisine: cuisineArray,
                                long: long,
                                lat: lat
                            });
                        }
                        //deals.push(newDeal);
                        newDeal.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            else {

                            }
                        });
                    }

                });
            }

            uniquebranchesP2 = helper.arrayDuplicateRemove(branchP);
            uniqueCuisinesP2 = helper.arrayDuplicateRemove(cuisineP);
            //    Getting full address
            var removeDupLocations = helper.arrayDuplicateRemove(location);
            location = [];
            var temp = uniquebranchesP2 + removeDupLocations;
            fullAddress.push(temp);
            //console.log(fullAddress);


            var newP2 = new preferencesByRestaurant({
                cuisines: uniqueCuisinesP2,
                restaurants: uniquebranchesP2
            });
            preferencesByRestaurant.remove().exec();
            newP2.save(function (err) {
                if (err) {
                    console.log('Erroe inserting prefernces');
                    throw err;
                }
                else {

                    console.log('Data has been successfyll entered!');
                }
            });
            uniqueCuisinesP2 = [];
            uniquebranchesP2 = [];
            branchP = [];
            cuisineP = [];

        }

        // Reverse Preferences


        var cuisinesR = [];
        var branchesR = [];

        //preferencesByRestaurant.find({}, function (err, data) {
        //    if (!err) {
        //        //console.log(data);
        //        cuisinesR = data[0];
        //        //branchesR = data[1];
        //        //console.log("Cuisines");
        //        console.log(cuisinesR);
        //        //console.log("Resturants");
        //        //console.log(branchesR);
        //    } else {
        //        console.log("err");
        //    }
        //});


        //    Prefrences Insertion


        // old work with array that puts preferences in one document, asad requested to create new document for every resturant
        var uniqueBranches = [];
        var uniqueCuisines = [];
        var dealsa;
        uniqueBranches = helper.arrayDuplicateRemove(branchPUmer);
        uniqueCuisines = helper.arrayDuplicateRemove(cuisinePUmer);
        var uniqueBranchesForLoc = helper.arrayDuplicateRemove(branchesForLoc);
        //console.log(uniqueBranchesForLoc);
        //for(var i = 0; i<uniqueBranchesForLoc.length;i++){
        //    geocoder.geocode(uniqueBranchesForLoc[i]+"karachi", function(err, data) {
        //        console.log(data);
        //    });
        //}
        preferences.remove().exec();
        var newP = new preferences({
            cuisines: uniqueCuisines,
            restaurants: uniqueBranches
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

        function getGeoCode(attr) {
            console.log('in func');
            geocoder.geocode(attr, function (err, data) {
                console.log(data);
            });
        }


    });

});
