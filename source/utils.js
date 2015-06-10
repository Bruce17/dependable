/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   10.06.2015 15:03
 */


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
