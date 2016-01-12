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
    preferencesByRestaurant = require('../models/preferences-by-restaurant'),
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
var foodKeywords = [], fileName = '../food-keywords.txt', fileContent;

//Reading food keyords text file
try {
    fileContent = fs.readFileSync(fileName, 'utf-8');
    foodKeywords = fileContent.split("\n");
    console.log(foodKeywords)
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
var restaurant = [], cuisinePref = [], branchPref = [];
db.on('open', function () {
    console.log('The connection to the db is open!');
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
    var store = [];
    linkCrawler.readAndCrawlRec(linnksToCrawl, store, function (result) {
        var i,  cuisineArray = [];
        //On every crawl attempt, removing all of the previous deals
        Deals.remove().exec();
        console.log('results received');
        for (i = 0; i < result.length; i++) {

            var $ = cheerio.load(result[i].body);
            var branch, title, content, qty, price;
            if ($('.mspan7-menu > .menu-item').length <= 0) {
                continue;
                console.log('inside if');
            } else {
                console.log('inside else');
                $('.mspan7-menu > .menu-item').each(function () {
                    if ($(this).find('.menu-subitems >.menu-subitem').length > 1) {  // if a single deals has more than one kind of quantity & prices
                        $(this).find('.menu-subitems >.menu-subitem').each(function () {
                            title = $(this).closest('.menu-item').find('.menu-item-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            content = $(this).closest('.menu-item').find('.menu-item-name > small').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            qty = $(this).find('.subitem-name').clone().children().remove().end().text().trim().replace(/\n|\r/g, "");
                            price = parseInt($(this).find('.subitem-price> span').clone().children().remove().end().text().trim().replace(/\n|\r/g, "").match(/\d/g).join(""));
                            branch = $("[itemprop='name']").text().trim().replace(/\n|\r/g, "");

                            //Tagging deals
                            cuisineArray = [];
                            for (var i = 0; i < foodKeywords.length; i++) {
                                var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                                var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                                if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                                    //console.log("found");
                                    cuisineArray.push(foodKeywords[i]);
                                    cuisinePref.push(foodKeywords[i]);
                                    restaurant = branch.split(",");
                                    branchPref.push(restaurant[0]);
                                }
                            }
                            if (cuisineArray.length === 0) {
                                cuisineArray.push("Misc.")
                            }
                            //use Deals instead of Deals to store data in old collection (deals)
                            var newDeal;
                            if (content.length <= 1) {
                                newDeal = new Deals({
                                    dealTitle: title,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    restaurant: restaurant[0],
                                    cuisine: cuisineArray
                                });
                            } else if (content.length > 0) {
                                newDeal = new Deals({
                                    dealTitle: title,
                                    dealContent: content,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    restaurant: restaurant[0],
                                    cuisine: cuisineArray
                                });
                            }
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
                        //Mapping
                        cuisineArray = [];
                        for (var i = 0; i < foodKeywords.length; i++) {
                            var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                            var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                            if (rege.test(content) || regep.test(content) || rege.test(title) || regep.test(title)) {
                                cuisineArray.push(foodKeywords[i]);
                                cuisinePref.push(foodKeywords[i]);
                                restaurant = branch.split(",");
                                branchPref.push(restaurant[0]);
                            }
                        }

                        if (cuisineArray.length === 0) {
                            cuisineArray.push("Misc.")
                        }
                        var newDeal;
                        if (content.length <= 1) {
                            newDeal = new Deals({
                                dealTitle: title,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                restaurant: restaurant[0],
                                cuisine: cuisineArray
                            });
                        } else if (content.length > 0) {
                            newDeal = new Deals({
                                dealTitle: title,
                                dealContent: content,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                restaurant: restaurant[0],
                                cuisine: cuisineArray
                            });
                        }
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


        }
        //    Prefrences Insertion
        // old work with array that puts preferences in one document, asad requested to create new document for every resturant

        branchPref = helper.arrayDuplicateRemove(branchPref);
        cuisinePref = helper.arrayDuplicateRemove(cuisinePref);
        console.log(branchPref);
        console.log(cuisinePref);
        preferences.remove().exec();
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

        function getGeoCode(attr) {
            console.log('in func');
            geocoder.geocode(attr, function (err, data) {
                console.log(data);
            });
        }


    });

});
