/**
 * Created by Umer Hassan on 9/15/2015.
 */
var fs = require("fs");
var request = require("request");
var url = require("url");
var cheerio = require("cheerio");


var sitemap = "/sitemap.xml"

// Provide the URI with protocol (hence the URL), otherwise hostname and path can't be parsed
var domain_input = process.argv[2];
var domain = url.parse(domain_input).hostname;
var domainSitemap = domain + sitemap;


request("https://eatoye.pk/sitemap.xml", function (error, response, body) {

    if (!error && response.statusCode == 200) {
        $ = cheerio.load(body);
        var links ='';
        $("loc").each(function () {
            links += $(this).text() + "\n";
        });
        //fs.writeFile("./links.txt", links, function (err) {
        //    if (err) {
        //        return console.log(err);
        //    }
        //    console.log("The file was saved!");
        //});
        var linksArr =links.split("\n");
        linksArr.forEach(function(link){
            console.log(url.parse(link).path);
        })
    }
});


