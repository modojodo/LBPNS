/**
 * Created by Umer on 12/4/2015.
 */
/*jslint node:true*/
"use strict";
var cheerio = require('cheerio'),
    request = require('request'),
    url = require('url');

var eatoyeDemoLink = "https://eatoye.pk/karachi/kfc";

module.exports = function (app) {
    app.get('/eatoyeDemo', function (req, res) {
        var urlToAppend = url.parse(eatoyeDemoLink).protocol + "//" + url.parse(eatoyeDemoLink).host;
        request(eatoyeDemoLink, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(body);
                //    prepend href, src
                $('link[rel="stylesheet"]').each(function () {
                    var styleUrl = $(this).attr('href');
                    $(this).attr('href', urlToAppend + styleUrl);
                });
                $('script').each(function () {
                    var srcUrl = $(this).attr('src');
                    if (srcUrl !== undefined && srcUrl.charAt(0) === '/') {
                        $(this).attr('src', urlToAppend + srcUrl);
                    }
                });
                $('img').each(function () {
                    var srcUrl = $(this).attr('src');
                    if (srcUrl !== undefined && srcUrl.charAt(0) === '/') {
                        $(this).attr('src', urlToAppend + srcUrl);
                    }
                });
                var _body = $.html();
                res.send(_body);
            }
        });

    });


};