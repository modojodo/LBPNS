/**
 * Created by Umer Hassan on 9/15/2015.
 */
/*jslint browser:true*/
/*jslint node: true */
'use strict';
var exports = module.exports;
var fs = require("fs"),
    url = require("url"),
    cheerio = require("cheerio"),
    request = require('request'),
    config = require('../config'),
    linkCrawler = require('./links-crawler');

exports.crawl = function (sitemap) {

    var karachiFilter, domain, urlToCrawl, $;
    karachiFilter = "/karachi/";

// Provide the URI with protocol (hence the URL), otherwise hostname and path can't be parsed
//    var domain = url.parse(process.argv[2]).host;

    request(sitemap, function (error, response, body) {
        if (error) {
            if (error.code === 'ENOTFOUND') {
                console.log("Check your internet connection OR protocol");
                //throw "NO INTERNET CONNECTIVITY";
            }
            if (error.code === 'ETIMEDOUT') {
                console.log("connection timedout");
                //throw "CONNECTION TIMEDOUT";
            }
        } else if (!error && response.statusCode === 200) {
            $ = cheerio.load(body);
            var links = '', linksArr, parsed, filteredLinks = [];
            $("loc").each(function () {
                links += $(this).text() + "\n";
            });
            linksArr = links.split("\n");
            for (var i = 0; i < linksArr.length - 1; i++) {
                parsed = url.parse(linksArr[i]);
                if (parsed.path.indexOf(karachiFilter) > -1 && parsed.query == null) {
                    filteredLinks.push(linksArr[i]);
                }
            }
            var store = [], $;
            filteredLinks = filteredLinks.splice(0, 1);
            console.log(filteredLinks);
            linkCrawler.readAndCrawlRec(filteredLinks, store, function (result) {
                for (var i = 0; i < result.length; i++) {
                    $ = cheerio.load(result[i].body);
                    //check if the page has an error message for not supporting the resaturant
                    if ($('.span8 > .alert-block').length > 0) {  // checking id the deals section (wrapper) is empty or not
                        //if there is alert message then remove that restaurant from the list
                        result.splice(i, 1);
                        console.log('removed');
                    }

                }
                console.log(result.length);
                var links = '';
                for (var i = 0; i < result.length; i++) {
                    if (i != result.length - 1) {
                        links += result[i].url + '\n';
                    } else {
                        links += result[i].url;
                    }
                }
                fs.writeFile('./filtered-links.txt', links, 'utf-8', function (err) {
                    if (!err) {
                        console.log("filtererd links saved");
                    } else {
                        console.log(err);
                    }
                });
            });
        }
    });
}
module.exports.crawl(config.eatoyeSitemap.url);