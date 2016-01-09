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
function split(a, n) {
    var len = a.length, out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}
function crawl(arr, store) {
    var $;
    linkCrawler.readAndCrawlRec(arr, store, function (data) {
        //check if the page has an error message for not supporting the resaturant
        console.log(data.length);
        for (var i = 0; i < data.length; i++) {
            if (data[i]) {
                $ = cheerio.load(data[i].body);
                if ($('.span8 > .alert-block').length > 0) {
                    console.log(data[i].url);
                    console.log('removed');
                    data[i] = null;
                } else {
                    console.log(data[i].url);
                    console.log('not removed');
                }
            }
        }
        var counter = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i] !== null) {
                counter++
            }
        }
        console.log(counter);
        var links = '';
        for (var i = 0; i < data.length; i++) {
            if (data[i] !== null) {
                links += data[i].url + '\n';
            }
        }
        fs.appendFile('./filtered-links.txt', links, 'utf-8', function (err) {
            if (!err) {
                console.log("filtererd links saved");
            } else {
                console.log(err);
            }
        });
    });
}
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
            //fs.writeFile('./filtered-links.txt', 0, 'utf-8', function (err) {
            //    if (!err) {
            //        console.log("Emptied file!");
            //    } else {
            //        console.log(err);
            //    }
            //});
            fs.closeSync(fs.openSync('./filtered-links.txt', 'w'));
            var arr = split(filteredLinks, 20);
            //console.log(arr);
            for (i = 0; i < arr.length; i++) {
                var store = [];
                crawl(arr[i], store);
            }

        }
    });
}
module.exports.crawl(config.eatoyeSitemap.url);