/**
 * Created by Umer on 12/31/2015.
 */
/*jslint node: true */

var Deal = require('../models/deal');

module.exports = function (app) {

    app.get('/fetchDeals', function (req, res, next) {
        var response;
        Deal.find({}, function (err, deals) {
            if (!err) {
                console.log('Fetchde Deals!');
                res.json(deals);
            }
            else {
                console.log('there was an error in /fetchDeals route query');
            }
        });
    });

}