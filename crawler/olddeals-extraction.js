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
    Deal = require('../models/deal'),
    newMapDeals = require('../models/newMapDeals'),
    preferences = require('../models/preference'),
    Structure = require('../models/structure'),
    config = require('../config'),
//Haziq Code regex
//    reading from file
    fs = require("fs");
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
var cuisineP = [], branchP = [], rest = [];


db.on('open', function () {
    console.log('The connection to the db is open!');
    //console.log("The connection to the db is open");
    //Structure.findOne({}, function (err, dealStructure) {
    //    if (!err) {
    //        console.log('Query executed');
    //        console.log(dealStructure);
    //        dealTitle = dealStructure.dealTitleClass;
    //        dealDescription = dealStructure.dealDescriptionClass;
    //        dealPrice = dealStructure.dealPriceClass;
    //        dealServing = dealStructure.dealServingClass;
    //
    //    } else {
    //        console.log('Error occured executing the structure query');
    //    }
    //});


    var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal"];
//var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal"];
    var store = [];
var deals = [];
    var catByCuisine = [];
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
                            console.log('Title: ' + title);
                            console.log('Content: ' + content);
                            console.log('Quantity: ' + qty);
                            console.log('Price: ' + price);
                            console.log('Branch: ' + branch);
                            //Mapping
                            cuisineArray = [];
                            for (var i = 0; i < foodKeywords.length; i++) {
                                var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                                var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');
                                if (rege.test(content) || regep.test(content)) {
                                    console.log("found");
                                    cuisineArray.push(foodKeywords[i]);
                                    cuisineP.push(foodKeywords[i]);
                                    rest = branch.split(",");
                                    branchP.push(rest[0]);
                                }
                            }
                            if(cuisineArray.length===0){
                                cuisineArray.push("Misc.")
                            }
                            console.log(cuisineArray);
                            console.log('----------------------------------------------------');
                            //use Deals instead of newMapDeals to store data in old collection (deals)
                            if(content.length<=1){
                                var newDeal = new newMapDeals({
                                    dealTitle: title,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    cuisine: cuisineArray
                                });
                            } else if(content.length>0){
                                var newDeal = new newMapDeals({
                                    dealTitle: title,
                                    dealContent: content,
                                    quantity: qty,
                                    price: price,
                                    branch: branch,
                                    cuisine: cuisineArray
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
                        console.log('Title: ' + title);
                        console.log('Content: ' + content);
                        console.log('Quantity: ' + qty);
                        console.log('Price: ' + price);
                        console.log('Branch: ' + branch);

                        //Mapping
                        cuisineArray = [];
                        for (var i = 0; i < foodKeywords.length; i++) {
                            var rege = new RegExp("\\b" + foodKeywords[i] + "\\b", 'i');
                            var regep = new RegExp("\\b" + foodKeywords[i] + "s" + "\\b", 'i');

                            if (rege.test(content) || regep.test(content)) {
                                console.log("found");
                                cuisineArray.push(foodKeywords[i]);
                                cuisineP.push(foodKeywords[i]);
                                rest = branch.split(",");
                                branchP.push(rest[0]);
                            }
                        }
                        if(cuisineArray.length===0){
                            cuisineArray.push("Misc.")
                        }
                        console.log(cuisineArray);
                        console.log('----------------------------------------------------');
                        if(content.length<=1){
                            var newDeal = new newMapDeals({
                                dealTitle: title,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                cuisine: cuisineArray
                            });
                        } else if(content.length>0){
                            var newDeal = new newMapDeals({
                                dealTitle: title,
                                dealContent: content,
                                quantity: qty,
                                price: price,
                                branch: branch,
                                cuisine: cuisineArray
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
                    }

                });
            }
        }
        //    Prefrences Insertion

//Filtering duplicates

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

        var uniqueBranches = [], uniqueCuisines = [];
        uniqueBranches = arrayDuplicateRemove(branchP);
        uniqueCuisines = arrayDuplicateRemove(cuisineP);
        for(var i=0;i<deals.length;i++){
            uniqueBranches[i]
        }
        console.log("in open");
        preferences.remove().exec();
        var newP = new preferences({
            cuisines: uniqueCuisines,
            resturants: uniqueBranches
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


});

Status API Training Shop Blog About Pricing
© 2016 GitHub, Inc. Terms 
