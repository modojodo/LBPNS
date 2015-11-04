/**
 * Created by Umer on 10/10/2015.
 */

/*jslint node: true */

"use strict";
var fs = require("fs"),
    request = require("request"),
    cheerio = require("cheerio");

var siteUrls = [], fileName = './filtered-links.txt', fileContent, pageBodyStore = [];

//function crawlPage(page) {
//    console.log("called");
//    request(page, function (err, res, body) {
//        if (!err) {
//            console.log("completed");
//            console.log(body);
//        } else {
//            throw err;
//        }
//    });
//}

//function readLinkAndCrawl(urlArr) {
//    var MAX_REQUEST_LIMIT = 5, pageLink, noOfReqExecuted = 0, pageBody, that = this;
//    while (urlArr.length > 0) {
//        console.log("inside loop");
//        if (noOfReqExecuted < MAX_REQUEST_LIMIT) {
//            pageLink = urlArr.shift();
//            console.log(pageLink);
//            pageBody = crawlPage(pageLink);
//            noOfReqExecuted += 1;
//        }
//
//    }
//}


//function readLinksAndCrawl(urlArray) {
//    console.log("called");
//    var link, body, pages = [];
//    console.log(urlArray.length);
//    while (urlArray.length > 0) {
//        console.log("inside while")
//        body = null;
//        link = urlArray.shift();
//        body = request('GET', link);
//        if (body !== null) {
//            pages.push(body.getBody('utf-8'));
//            console.log(body.getBody('utf-8'));
//        }
//        console.log(pages.length);
//    }
//    return pages;
//}


function storePageBody(body) {
    pageBodyStore.push(body);
}

function dumIntoDB() {

}

function readAndCrawlRec(urlArr) {
    var url;
    url = urlArr.shift();
    console.log("next request called");
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body === null) {
                urlArr.unshift(url);
                readAndCrawlRec(urlArr);
            } else {
                storePageBody(body);
                console.log(body);
                if (urlArr.length) {
                    readAndCrawlRec(urlArr);
                } else {
                    console.log("Crawling completed");
                }
            }

        } else {
            switch (error.code) {
                case 'ENOTFOUND':
                    console.log("Check your internet connection OR protocol");
                    break;
                case 'ETIMEDOUT':
                    console.log("Connection timedout, sending request again");
                    urlArr.unshift(url);
                    readAndCrawlRec(urlArr);
                    break;

            }
        }

    });
}


try {
    fileContent = fs.readFileSync(fileName, 'utf-8');
    siteUrls = fileContent.split("\n");
    readAndCrawlRec(siteUrls.slice(0, 10));
    //readLinkAndCrawl(siteUrls);

} catch (e) {
    if (e.code === 'ENOENT') {
        console.log("There is no file found named as: " + fileName);
    } else {
        throw e;
    }
}


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

