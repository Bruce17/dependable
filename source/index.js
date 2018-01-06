/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   02.06.2015 09:38
 *
 * @namespace Index
 */

'use strict';

var lib = require('./library.js');

/* istanbul ignore next */
if (typeof console.debug === 'undefined') {
    console.debug = console.info;
}

/**
 * simple dependency injection. No nesting, just pure simplicity
 *
 * @returns {{}}
 *
 * @namespace Container
 * @memberOf Index
 *
 * @example
 * // Fetch module and init the di-container
 * var container = require('@bruce17/dependable').container();
 */
exports.container = function () {
    // Prepare the public functions to be passed to the outer world
    var container = {
        get: lib.get,
        resolve: lib.resolve,
        register: lib.register,
        registerLibrary: lib.registerLibrary,
        load: lib.load,
        list: lib.list,
        find: lib.find,
        clearAll: function () {
            lib.clearAll();

            lib.registerContainer(container);
        }
    };

    var factories = lib.list();
    if (!('_container' in factories)) {
        lib.registerContainer(container);
    }

    return container;
};
