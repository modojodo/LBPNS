var Deal = require('./models/deal'),
    Preferences = require('./models/preference');


//Filtering duplicates
function arrayDuplicateRemove(arr) {
    var c = 0;
    var tempArray = [];
    arr.sort();
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] != tempArray[c - 1]) {
            tempArray.push(arr[i]);
            c++;
        }
    }
    tempArray.sort();
    return tempArray;
}


function createQueryForPreferencesByRestaurant(pref) {
    return function (callback) {
        Deal.find({restaurant: pref}, function (err, deals) {
            if (!err) {
                var obj = {};
                obj['restaurant'] = [];
                obj['cuisines'] = [];
                console.log(obj['cuisines']);
                obj['restaurant'].push(pref);
                for (var i = 0; i < deals.length; i++) {
                    for (var j = 0; j < deals[i].cuisine.length; j++) {
                        obj['cuisines'].push(deals[i].cuisine[j]);
                        console.log(deals[i].cuisine[j]);
                    }
                }
                //console.log(obj['cuisines']);
                obj['cuisines'] = arrayDuplicateRemove(obj['cuisines']);

                if (!err) {
                    callback(null, obj);
                } else {
                    console.log('there');
                    callback(err, null);
                }
            } else {
            }
        });
    }
}

function createQueryForPreferencesByCuisine(pref) {
    console.log(pref);
    return function (callback) {
        Deal.find({cuisine: pref}, function (err, data) {
            if (!err) {
                var obj = {};
                obj['cuisines'] = [];
                obj['restaurant'] = [];
                obj['cuisines'].push(pref);
                for (var i = 0; i < data.length; i++) {
                    obj['restaurant'].push(data[i].restaurant);
                }
                obj['restaurant'] = arrayDuplicateRemove(obj['restaurant']);
                if (!err) {
                    callback(null, obj);
                } else {
                    console.log('there');
                    callback(err, null);
                }
            } else {
            }
        });
    }
}


module.exports = {
    arrayDuplicateRemove: arrayDuplicateRemove,
    createQueryForPreferencesByRestaurant: createQueryForPreferencesByRestaurant,
    createQueryForPreferencesByCuisine: createQueryForPreferencesByCuisine
}
