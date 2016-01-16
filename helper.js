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

module.exports = {
    arrayDuplicateRemove: arrayDuplicateRemove,
}
