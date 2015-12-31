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
    Structure = require('../models/structure'),
    config = require('../config');

mongoose.connect(config.mongo.production.connectionString);
var db = mongoose.connection;
var dealTitle, dealPrice, dealDescription, dealServing;
db.on('error', function (err) {
    console.log('Add the connection string');
});
db.on('open', function () {
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
});
var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal", "https://eatoye.pk/karachi/mcdonalds-airport",
    "https://eatoye.pk/karachi/kfc-muhammad-ali-society", "https://eatoye.pk/karachi/pizza-max-tariq-road"];
//var linnksToCrawl = ["https://eatoye.pk/karachi/kfc-gulshan-e-iqbal"];
var store = [];

linkCrawler.readAndCrawlRec(linnksToCrawl, store, function (result) {
    console.log(result.length);
    var i, $;
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
                        console.log('----------------------------------------------------');
                        var newDeal = new Deal({
                            dealTitle: title,
                            dealContent: content,
                            quantity: qty,
                            price: price,
                            branch: branch
                        });
                        newDeal.save(function (err) {
                            if (err) {
                                throw err;
                            }
                            else {
                                console.log("Successfully inserted the data");
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
                    console.log('----------------------------------------------------');
                    var newDeal = new Deal({
                        dealTitle: title,
                        dealContent: content,
                        quantity: qty,
                        price: price,
                        branch: branch
                    });
                    newDeal.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            console.log("Successfully inserted the data");
                        }
                    });
                }

            });
        }
    }
});