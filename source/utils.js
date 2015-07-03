/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   10.06.2015 15:03
 */

'use strict';

/**
 * Check if an element is of type <Array>
 *
 * @param {*} ary
 *
 * @returns {boolean}
 */
exports.isArray = function isObject(ary) {
    return (ary === Object(ary)) && (ary instanceof Array);
};

/**
 * Check if an element is of type <Object>
 *
 * @param {*} obj
 *
 * @returns {boolean}
 */
exports.isObject = function isObject(obj) {
    return (obj === Object(obj)) && !(obj instanceof Array);
};

/**
 * Check if an element is of type <String>
 *
 * @param {*} str
 *
 * @returns {boolean}
 */
exports.isString = function isString(str) {
    return (str === String(str)) ||
        (this.isObject(str) && str.valueOf() === String(str.valueOf()));
};

/**
 * Check if `value` is `undefined`.
 *
 * @param {*} value
 * @returns {boolean}
 */
exports.isUndefined = function isUndefined(value) {
    return value === undefined;
};

/**
 * Check if an array contains an element.
 *
 * @param {array} haystack
 * @param {*} needle
 * @returns {boolean}
 */
exports.inArray = function inArray(haystack, needle) {
    var result = false;
    if (this.isArray(haystack)){
        var count=haystack.length;
        for(var i=0;i<count;i++)
        {
            if(this.simpleCompare(haystack[i], needle)){
                result = true;
            }
        }
    }
    return result;
};

/**
 * Does a simple comparison between 2 elements.
 * Notice that the order of keys in objects are relevant here.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
exports.simpleCompare = function simpleCompare(a, b){
    var result = false;
    if (this.isObject(a) && this.isObject(b)){
        result = JSON.stringify(a) === JSON.stringify(b);
    }
    else {
        result = a === b;
    }

    return result;
};
