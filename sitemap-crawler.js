/**
 * Created by Umer Hassan on 9/15/2015.
 */
var fs = require("fs");
var request = require("request");
var url = require("url");
var cheerio = require("cheerio");


var sitemap = "/sitemap.xml";
var karachi = "/karachi/";

// Provide the URI with protocol (hence the URL), otherwise hostname and path can't be parsed
var domain = url.parse(process.argv[2]).host;
var domainSitemap = domain + sitemap;



request("http://"+domainSitemap, function (error, response, body) {
    if (error) {
        if (error.code == 'ENOTFOUND') {
            console.log("no internet connectivity");
            //throw "NO INTERNET CONNECTIVITY";
        }
        if (error.code === 'ETIMEDOUT') {
            console.log("connection timedout");
            //throw "CONNECTION TIMEDOUT";
        }
    } else if (!error && response.statusCode == 200) {
        //console.log(body);
        $ = cheerio.load(body);
        var links = '';
        $("loc").each(function () {
            links += $(this).text() + "\n";
        });
        var linksArr = links.split("\n");
        var parsed;
        var filteredLinks = '';
        for (var i = 0; i < linksArr.length - 1; i++) {
            parsed = url.parse(linksArr[i]);
            if (parsed.path.indexOf(karachi) > -1 && parsed.query == null) {
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


