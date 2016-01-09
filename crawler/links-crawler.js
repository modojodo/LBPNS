/**
 * Created by Umer on 10/10/2015.
 */

/*jslint node: true */

"use strict";
var fs = require("fs"),
    request = require("request"),
    cheerio = require("cheerio");
var fileName = '../filtered-links', fileContent;

//for (var i = 0; i < siteUrls.length; i++) {
//    console.log('request sent');
//    request(siteUrls[i], {timeout:20000},function (err, res, body) {
//        if (!err) {
//            console.log("result received -----------------------");
//        } else {
//            console.log(err);
//        }
//    });
//}


function readAndCrawlRec(urlArr, resultStore, callback) {
    var url;
    url = urlArr.shift();
    console.log("next request called");
    request(url, {timeout: 20000}, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body === null) {
                urlArr.unshift(url);
                readAndCrawlRec(urlArr, resultStore, callback);
            } else {

                //console.log(response.request.uri);
                var obj = {
                    url: url,
                    body: body
                }
                resultStore.push(obj)
                if (urlArr.length) {
                    readAndCrawlRec(urlArr, resultStore, callback);
                } else {
                    console.log("Crawling completed");
                    callback(resultStore);
                }
            }

        } else {
            switch (error.code) {
                case 'ENOTFOUND':
                    console.log("Check your internet connection OR protocol");
                    urlArr.unshift(url);
                    readAndCrawlRec(urlArr, resultStore, callback);
                    break;
                case 'ETIMEDOUT':
                    console.log("Connection timedout, sending request again");
                    urlArr.unshift(url);
                    readAndCrawlRec(urlArr, resultStore, callback);
                    break;
                default :
                    console.log("There was some generic error");
                    urlArr.unshift(url);
                    readAndCrawlRec(urlArr, resultStore, callback);
            }
        }
    });
}

//
//siteUrls = ['https://eatoye.pk/karachi/arabian-nights', 'https://eatoye.pk/karachi/arizona-grill-hyderi'];
//console.log(siteUrls);
//siteUrls = siteUrls.splice(0, 1);
//var store = [], $;
//readAndCrawlRec(siteUrls, store, function (data) {
//    for (var i = 0; i < data.length; i++) {
//        console.log(data[i].url);
//        $ = cheerio.load(data[i].body);
//        console.log($('.span8 > .alert-block').length > 0);
//    }
//});
/*-------Execution of the script begins here-----*/
//
//try {
//    fileContent = fs.readFileSync(fileName, 'utf-8');
//    siteUrls = fileContent.split("\n");
//    //readAndCrawlRec(siteUrls.slice(0, 10));
//    //readLinkAndCrawl(siteUrls);
//
//} catch (e) {
//    if (e.code === 'ENOENT') {
//        console.log("There is no file found named as: " + fileName);
//    } else {
//        throw e;
//    }
//}


//fs.readFileSync('./filtered-links.txt', 'utf-8', function (err, data) {
//    if (!err) {
//        siteUrls = data.split("\n");
//
//        for (var i = 0; i < 5; i++) {
//            crawlLink(siteUrls[i], url_id);
//            url_id++;
//        }
//        console.log("done");
//
//    }
//});

//function crawlLink(link, id) {
//    //var linkPath, fileName, filePath;
//    var bodyText;
//    request(link, function (err, res, body) {
//        var $ = cheerio.load(body);
//        //linkPath = url.parse(link).path;
//        //fileName = linkPath.substring(linkPath.lastIndexOf("/") + 1);
//        //filePath = "result/" + fileName;
//        bodyText = $("body").not("script").text();
//        siteUrlsResult[id] = bodyText;
//    });
//
//}

module.exports = {readAndCrawlRec: readAndCrawlRec};
