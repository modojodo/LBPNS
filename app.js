/*jslint node:true*/

var sitemapCrawler = require('./crawler/sitemap-crawler.js');

var request = require('request');
var eatoye = "http://www.eatoye.pk";



sitemapCrawler.crawl(eatoye);