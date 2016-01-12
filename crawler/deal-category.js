"use strict";
var cheerio = require('cheerio'),
    request = require('request'),
    linkCrawler = require('./links-crawler'),
    mongoose = require('mongoose'),
    newMapDeals = require('../models/newMapDeals'),
    preferences = require('../models/preference'),
    cuisinedeals = require('../models/cuisinedeals'),
    config = require('../config');
mongoose.connect(config.mongo.production.connectionString);
var db = mongoose.connection;
db.on('error', function (err) {
    console.log('Add the connection string');
});
var cuisine;
var restaurants;
var catByCuisine;
var deals = [];
db.on('open', function () {
    console.log('Connection is open');
    preferences.find({}, function (err, data) {
        if (!err) {
            cuisine = data[0].cuisines;
            restaurants = data[0].restaurants;
        } else {
            console.log("err");
        }
    });

    newMapDeals.find({}, function (err, data) {
        if (!err) {
            deals = data;
        } else {
            console.log("err");
        }
        //console.log(deals);
        var obj = {};
        for (var i = 0; i < cuisine.length; i++) {

            obj[cuisine[i]] = [];
            for (var j = 0; j < deals.length; j++) {
                for (var k = 0; k < deals[j].cuisine.length; k++) {
                    var deal = {}
                    if (cuisine[i] == deals[j].cuisine[k]) {
                        if (!deals[j].dealContent) {
                            deal = {
                                dealTitle: deals[j].dealTitle,
                                dealQuantity: deals[j].quantity,
                                price: deals[j].price,
                                branch: deals[j].branch
                            }
                        } else {
                            deal = {
                                dealTitle: deals[j].dealTitle,
                                dealContent: deals[j].dealContent,
                                dealQuantity: deals[j].quantity,
                                price: deals[j].price,
                                branch: deals[j].branch

                            }
                        }
                        obj[cuisine[i]].push(deal);
                    }
                }
            }
        }


        for (var key in obj) {
            var dealObj={};
            dealObj[key] =obj[key];
            var newCuisine = new cuisinedeals({
                cuisine: dealObj
            });
            newCuisine.save(function (err) {
                if (err) {
                    throw err;
                }
                else {
                    console.log("done");
                }
            });
        }


    });
})
