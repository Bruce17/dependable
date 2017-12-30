/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   30.12.2017 11:08
 *
 * @namespace Library
 */

'use strict';

var path = require('path');
var fs = require('fs');
var Utils = require('./utils');

// Define all dependencies outside the container function to keep them
var factories = {};
var modules = {};

// Define some regex
var regex = {
    fileEnding: /\.\w+$/,
    dashes: /\-(\w)/g,
    scriptFiles: /\.(js|coffee)$/,
    strFunc: /function.*\(([\s\S]*?)\)/,
    strFuncES6: /\(([\s\S]*?)\)\s*\=>/
};

// Define a list of factory names which should be blacklisted e.g. in method "find"
var factoryBlacklist = [
    '_container'
];


var exports = module.exports = {};



/**
 * Check if a argument is not empty.
 *
 * @param {*} arg
 *
 * @returns {boolean}
 *
 * @function notEmpty
 * @memberOf Library
 * @property
 */
var notEmpty = function notEmpty(arg) {
    return arg;
};

/**
 * Return a functions argument list for di dependency injection.
 *
 * @param {function} func
 *
 * @returns {Array}
 *
 * @function argList
 * @memberOf Library
 * @protected
 */
var argList = function argList(func) {
    // Normal ES5 function check
    var match = func.toString().match(regex.strFunc);

    if (!match) {
        // ES6 fat arrow function check
        match = func.toString().match(regex.strFuncES6);

        if (!match) {
            throw new Error('Could not parse function arguments: ' + func.toString());
        }
    }

    return match[1].split(',')
        .filter(notEmpty)
        .map(function (str) {
            return str.trim();
        });
};

/**
 *
 * @param {Array}  visited
 * @param {string} name
 *
 * @returns {Number}
 *
 * @function haveVisited
 * @memberOf Library
 * @protected
 */
var haveVisited = function haveVisited(visited, name) {
    return visited.filter(function (n) {
        return n === name;
    }).length;
};

/**
 * Convert a function into the proper internal di factory format.
 *
 * @param {function} func
 *
 * @returns {object}
 *
 * @function toFactory
 * @memberOf Library
 * @protected
 */
var toFactory = function toFactory(func) {
    if (typeof func === 'function') {
        return {
            func: func,
            required: argList(func)
        };
    } else {
        return {
            func: function () {
                return func;
            },
            required: []
        };
    }
};

/**
 * Register a new dependency.
 *
 * @param {string}   name
 * @param {function} func
 *
 * @returns {function}
 *
 * @function registerOne
 * @memberOf Library
 * @protected
 */
var registerOne = function registerOne(name, func) {
    factories[name] = toFactory(func);

    return factories[name];
};

/**
 * Register a dependency in the di-container.
 *
 * @param {string|object} name Register a dependency by its name (+ function) or a hash-set at once.
 * @param {function}      func If a name is given, register this function.
 *
 * @returns {Array|function}
 *
 * @function register
 * @memberOf Library
 *
 * @example
 * // Register some simple dependencies
 * container.register('occupation', 'tax attorney');
 * container.register('transport', {
 *   type: 'station wagon',
 *   material: 'wood-paneled'
 * });
* container.register({
 *   'foo': 'bar',
 *   'obj': {
 *     'str': 'test',
 *     'num': 123
 *   }
 * });
 *
 * // Register a dependency that has other dependencies
 * container.register('song', function (occupation, transport, legalStatus) {
 *   var song = {};
 *
 *   song.chorus = function chorus() {
 *     return [
 *       'I\'m a ' + occupation,
 *       'On a ' + transport.material + ' ' + transport.type + ' I ride',
 *       'And I\'m ' + legalStatus.message
 *     ].join('\n');
 *   };
 *
 *   return song;
 * });
 */
exports.register = function register(name, func) {
    if (Utils.isObject(name)) {
        var hash = name;
        var results = [];

        var key;

        for (key in hash) {
            if (hash.hasOwnProperty(key)) {
                results.push(registerOne(key, hash[key]));
            }
        }

        return results;
    } else {
        return registerOne(name, func);
    }
};

/**
 * Register a library dependency in the di-container.
 *
 * Difference between "register" and "registerLibrary": This method registers library methods which export a bunch
 * of methods via the module pattern. This methods wraps the actual library into another function to avoid the
 * library to be executed directly and to avoid dependency injection of function arguments.
 *
 * @param {string|object} name Register a library dependency by its name (+ function) or a hash-set at once.
 * @param {function}      func If a name is given, register this function.
 *
 * @returns {Array|function}
 *
 * @function registerLibrary
 * @memberOf Library
 *
 * @example
 * // Register some library methods
 * var lodash = require('lodash');
 * var promise = require('promise');
 * var express = require('express');
 *
 * container.registerLibrary('lodash', lodash);
 * container.registerLibrary({
 *   'promise': promise,
 *   'express': express
 * });
 */
exports.registerLibrary = function registerLibrary(name, func) {
    if (Utils.isObject(name)) {
        var hash = name;
        var results = [];

        var key;

        for (key in hash) {
            if (hash.hasOwnProperty(key)) {
                results.push(registerOne(key, (function (library) {
                    return function () {
                        return library;
                    };
                })(hash[key])));
            }
        }

        return results;
    } else {
        return registerOne(name, function () {
            return func;
        });
    }
};

/**
 * Return a list of all factories.
 *
 * @returns {object}
 *
 * @function list
 * @memberOf Library
 */
exports.list = function list() {
    return factories;
};

/**
 * Load a file into the di-container.
 *
 * @param {string} file
 * @param {object} options Pass optional options to this method.
 *
 * @returns {function}
 *
 * @function loadFile
 * @memberOf Library
 * @protected
 */
var loadFile = function loadFile(file, options) {
    options = (Utils.isObject(options) ? options : {});

    var module = file.replace(regex.fileEnding, '');

    // Remove dashes from files and camelcase results
    var name = path.basename(module).replace(regex.dashes, function (match, letter) {
        return letter.toUpperCase();
    });

    // Add a prefix to the dependency's name
    if ('prefix' in options && Utils.isString(options.prefix)) {
        name = options.prefix + name;
    }
    // Add a postfix to the dependency's name
    if ('postfix' in options && Utils.isString(options.postfix)) {
        name = name + options.postfix;
    }

    return exports.register(name, require(module));
};

/**
 * Load files in a directory to the di-container.
 *
 * @param {string} dir
 * @param {object} options Pass optional options to this method.
 *
 * @returns {Array}
 *
 * @function loadDir
 * @memberOf Library
 * @protected
 */
var loadDir = function loadDir(dir, options) {
    var fileNames = fs.readdirSync(dir);
    var files = fileNames.map(function(file) {
        return path.join(dir, file);
    });

    var results = [];
    var file;
    var stats;

    for (var i = 0, iMax = files.length; i < iMax; i++) {
        file = files[i];

        if (!file.match(regex.scriptFiles)) {
            continue;
        }

        stats = fs.statSync(file);
        if (stats.isFile()) {
            results.push(loadFile(file, options));
        }
    }

    return results;
};

/**
 * Load a directory of files or a file into the di-container.
 * The filename will be the identifier.
 *
 * @param {string} fileOrDir A file path or a path.
 * @param {Array}  subDirs   Also load content from subdirectories depending on "fileOrDir" as base path.
 * @param {object} options   Pass optional options to this method.
 *
 * @returns {Array|function} A list of register files or just one register file function.
 *
 * @function load
 * @memberOf Library
 *
 * @example
 * // Load all dependencies in a directory
 * container.load(__dirname + '/services');
 * // e.g. loads "Image.js", "Excel.js", "Export.js"
 *
 * // Load all dependencies in a directory and subdirectories
 * container.load(__dirname + '/models', ['user', 'role']);
 * // e.g. loads "user/Foo.js", "user/Bar.js", "role/NoAccess.js", "role/Admin.js"
 *
 * // Load all dependencies in a directory and prepend a prefix
 * container.load(__dirname + '/models', {prefix: 'Model'});
 * // e.g. loads "Foo.js" into "ModelFoo" or "Bar.js" into "ModelBar"
 *
 * // Load all dependencies in a directory, subdirectories and prepend a prefix
 * container.load(__dirname + '/models', ['user', 'role'], {prefix: 'Model'});
 * // e.g. loads "user/Foo.js" into "ModelFoo" or "role/Admin.js" into "ModelAdmin"
 *
 * // You can also use "postfix" to append a optional string to every loaded dependency.
 */
exports.load = function load(fileOrDir, subDirs, options) {
    // Maybe the user only passed two arguments an "path" + "options". Adjust the arguments in that case.
    if (options === undefined) {
        if (Utils.isObject(subDirs)) {
            options = subDirs;
        }
    }

    // Load a directory
    if (fs.statSync(fileOrDir).isDirectory()) {
        var results = loadDir(fileOrDir, options);

        // Load a subdirectory
        if (Utils.isArray(subDirs)) {
            var i, iLen;
            var subDir;

            // Iterate over each sub directory ...
            for (i = 0, iLen = subDirs.length; i < iLen; i++) {
                subDir = path.join(fileOrDir, subDirs[i]);

                // ... and load it via "loadDir"
                if (fs.statSync(subDir).isDirectory()) {
                    results.concat(
                        loadDir(subDir, options)
                    );
                }
            }
        }

        return results;
    }

    // Load a file
    return loadFile(fileOrDir, options);
};

/**
 * Gives you a single dependency.
 *
 * @param {string} name
 * @param {object} overrides
 * @param {Array}  visited
 *
 * @TODO: add visitation / detect require loops
 *
 * @function get
 * @memberOf Library
 *
 * @example
 * // Get a dependency from the di-container
 * var _ = container.get('lodash');
 * var IndexController = container.get('IndexController');
 */
exports.get = function get(name, overrides, visited) {
    if (visited === undefined) {
        visited = [];
    }

    // eslint-disable-next-line eqeqeq
    var isOverridden = (overrides != null);

    // Check for circular dependencies
    if (haveVisited(visited, name)) {
        throw new Error('Circular dependency with "' + name + '"');
    }
    visited = visited.concat(name);

    var factory = factories[name];
    if (!factory) {
        var module = modules[name];

        if (module) {
            exports.register(name, require(module));
            factory = factories[name];
        } else {
            throw new Error('Dependency "' + name + '" was not registered');
        }
    }

    // Use the one you already created
    if (factory.instance && !isOverridden) {
        return factory.instance;
    }

    // Apply args to the right
    var dependencies = factory.required.map(function (name) {
        if (overrides && overrides[name]) {
            return overrides[name];
        } else {
            return exports.get(name, overrides, visited);
        }
    });

    // Prepare the factory instance
    var instance = factory.func.apply(factory, dependencies);

    if (!isOverridden) {
        factory.instance = instance;
    }

    return instance;
};

/**
 * Return a list all matching factories.
 *
 * @param {string} searchPattern An matching factory name including optional asterisk characters as placeholders.
 *
 * @function find
 * @memberOf Library
 *
 * @example
 * // Find a dependency by its full name
 * var result = container.find('lodash');
 * console.log('lodash', result.lodash);
 *
 * // Find more dependencies
 * var controllers = container.find('*Controller');
 * console.log('controllers', controllers); // e.g. "IndexController", "AuthController", etc.
 */
exports.find = function find(searchPattern) {
    var result = {};
    var key;

    // Prepare a regex to select a specific set of the permissions.
    var preparedRegex = new RegExp(
        Utils.isString(searchPattern) && searchPattern.length > 0 ?
            '^' + Utils.escapeRegex(searchPattern).replace('\\*', '.*') + '$' :
            '',
        'i'
    );

    if (preparedRegex.source !== '' && preparedRegex.source !== '(?:)') {
        for (key in factories) {
            if (factories.hasOwnProperty(key) && !Utils.inArray(factoryBlacklist, key) && preparedRegex.test(key)) {
                result[key] = exports.get(key);
            }
        }
    }

    return result;
};

/**
 * Resolve a dependency and overwrite it.
 *
 * @param {object}   overrides
 * @param {function} func
 *
 * @function resolve
 * @memberOf Library
 *
 * @example
 * container.resolve(function (lodash) {
 *   console.log('lodash', lodash);
 * });
 */
exports.resolve = function resolve(overrides, func) {
    if (!func) {
        func = overrides;
        overrides = null;
    }

    exports.register('__temp', func);

    return exports.get('__temp', overrides, []);
};

/**
 * Register this di-container itself into the container.
 *
 * @param {object} container The container itself.
 *
 * @function registerContainer
 * @memberOf Library
 */
exports.registerContainer = function registerContainer(container) {
    // Let people access the container if they know what they're doing
    exports.register('_container', container);
};

/**
 * Clear all dependencies
 *
 * @function clearAll
 * @memberOf Library
 */
exports.clearAll = function clearAll() {
    factories = {};
    modules = {};
};
