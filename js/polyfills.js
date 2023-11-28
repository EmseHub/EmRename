if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}


// function checkIfArrObjsHasPropVal(arrObj, prop, val, caseSensitive) {
//     if (!caseSensitive) { val = val.toLowerCase(); }
//     for (var z = 0; z < arrObj.length; z++) {
//         var curVal = (caseSensitive) ? arrObj[i][prop] : arrObj[i][prop].toLowerCase();
//         if (curVal === val) { return true; }
//     }
//     return false;
// }