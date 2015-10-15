/**
 * Created by Umer on 10/10/2015.
 */

var fs = require("fs"),
    request = require("request");

var siteUrls = [], siteUrlsResult = [], url_id = 0, fileName = './filtered-links.txt', fileContent;

function crawlPage(page, callback) {
    "use strict";
    request(page, function (err, res, body) {
        if (!err) {

            callback(body);
        } else {
            throw err;
        }
    });
}

function readLinkAndCrawl(urlArr) {
    "use strict";
    var MAX_REQUEST_LIMIT = 5, pageLink, noOfReqExecuted = 0, pageBody, that = this;
    while (urlArr.length > 0) {
        if (noOfReqExecuted < MAX_REQUEST_LIMIT) {
            pageLink = urlArr.shift();
            console.log(pageLink);
            pageBody = crawlPage(pageLink, function (content) {
                console.log(content);

            });
            noOfReqExecuted += 1;
        }

    }
}
try {
    fileContent = fs.readFileSync(fileName, 'utf-8');
    siteUrls = fileContent.split("\n");
    readLinkAndCrawl(siteUrls);
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

