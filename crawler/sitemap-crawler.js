/**
 * Created by Umer Hassan on 9/15/2015.
 */

/*jslint node: true */
var exports = module.exports;
var fs = require("fs");
//var linksCrawler = require('./crawler/links-crawler.js');
var url = require("url");
var cheerio = require("cheerio");
var request = require('request');

exports.crawl = function (sitemapDomain) {
    var sitemap, karachiFilter, domain, urlToCrawl;
    sitemap = "/sitemap.xml";
    karachiFilter = "/karachi/";

// Provide the URI with protocol (hence the URL), otherwise hostname and path can't be parsed
//    var domain = url.parse(process.argv[2]).host;
    domain = url.parse(sitemapDomain).host;
    urlToCrawl = domain + sitemap;

    request("http://" + urlToCrawl, function (error, response, body) {
        if (error) {
            if (error.code === 'ENOTFOUND') {
                console.log("Check your internet connection OR protocol");
                //throw "NO INTERNET CONNECTIVITY";
            }
            if (error.code === 'ETIMEDOUT') {
                console.log("connection timedout");
                //throw "CONNECTION TIMEDOUT";
            }
        } else if (!error && response.statusCode == 200) {
            $ = cheerio.load(body);
            var links = '', linksArr, parsed, filteredLinks = '';
            $("loc").each(function () {
                links += $(this).text() + "\n";
            });
            linksArr = links.split("\n");
            for (var i = 0; i < linksArr.length - 1; i++) {
                parsed = url.parse(linksArr[i]);
                if (parsed.path.indexOf(karachiFilter) > -1 && parsed.query == null) {
                    if (i != linksArr.length - 1) {
                        filteredLinks += linksArr[i] + "\n";
                    } else {
                        filteredLinks += linksArr[i];
                    }

                }
            }
            console.log(filteredLinks);
            fs.writeFile('./filtered-links.txt', filteredLinks, function (err) {
                if (!err) {
                    console.log("filtererd links saved");
                } else {
                    console.log(err);
                }
            });
        }
    });


}

