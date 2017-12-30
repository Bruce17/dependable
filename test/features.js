/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   30.12.2017 16:45
 *
 * @namespace Test.Features
 */

'use strict';

/**
 * Check if the current Node.js supports ES6 fat arrows.
 */
exports.hasFatArrow = (function () {
    var hasFeature = true;

    try {
        eval('var test = (x) => x;')
    } catch (ex) {
        hasFeature = false;
    }

    return hasFeature;
})();
