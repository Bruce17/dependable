/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   10.06.2015 15:03
 *
 * @namespace Utils
 */

var regex = {
    escape: /[.*+?^${}()|[\]\/\\]/g
};
var regexInst = {
    escape: new RegExp(regex.escape.source)
};


/**
 * Check if an element is of type <Array>
 *
 * @param {*} ary
 *
 * @returns {boolean}
 *
 * @function isArray
 * @memberOf Utils
 */
exports.isArray = function isObject(ary) {
    'use strict';

    return (ary === Object(ary)) && (ary instanceof Array);
};

/**
 * Check if an element is of type <Object>
 *
 * @param {*} obj
 *
 * @returns {boolean}
 *
 * @function isObject
 * @memberOf Utils
 */
exports.isObject = function isObject(obj) {
    'use strict';

    return (obj === Object(obj)) && !(obj instanceof Array);
};

/**
 * Check if an element is of type <String>
 *
 * @param {*} str
 *
 * @returns {boolean}
 *
 * @function isString
 * @memberOf Utils
 */
exports.isString = function isString(str) {
    'use strict';

    return (
        (str === String(str)) ||
        (this.isObject(str) && str.valueOf() === String(str.valueOf()))
    );
};

/**
 * Check if `value` is `undefined`.
 *
 * @param {*} value
 *
 * @returns {boolean}
 *
 * @function isUndefined
 * @memberOf Utils
 */
exports.isUndefined = function isUndefined(value) {
    'use strict';

    return value === undefined;
};

/**
 * Check if an array contains an element.
 *
 * @param {array} haystack
 * @param {*}     needle
 *
 * @returns {boolean}
 *
 * @function inArray
 * @memberOf Utils
 */
exports.inArray = function inArray(haystack, needle) {
    'use strict';

    var result = false;

    if (this.isArray(haystack)) {
        var count = haystack.length;

        for (var i = 0; i < count; i++) {
            if (this.simpleCompare(haystack[i], needle)) {
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
 *
 * @returns {boolean}
 *
 * @function simpleCompare
 * @memberOf Utils
 */
exports.simpleCompare = function simpleCompare(a, b) {
    'use strict';

    var result = false;

    if (this.isObject(a) && this.isObject(b)) {
        result = (JSON.stringify(a) === JSON.stringify(b));
    } else {
        result = (a === b);
    }

    return result;
};

/**
 * Escape a string containing regex content.
 *
 * @param {String|RegExp} string
 *
 * @returns {string}
 *
 * @NOTICE: this method is borrowed from "lodash"
 *
 * @function escapeRegex
 * @memberOf Utils
 */
exports.escapeRegex = function escapeRegex(string) {
    'use strict';

    var escapeString = (this.isString(string) ? string : '');

    return (escapeString && regexInst.escape.test(escapeString)) ?
        escapeString.replace(regex.escape, '\\$&') :
        escapeString
        ;
};
