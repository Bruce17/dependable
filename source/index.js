/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   02.06.2015 09:38
 */

var path = require('path');
var fs = require('fs');
var util = require('util');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync);

// Define all dependencies outside the container function to keep them
var factories = {};
var modules = {};

//simple dependency injection. No nesting, just pure simplicity
exports.container = function () {
    'use strict';

    var container = {};

    // Define some regex
    var regex = {
        fileEnding: /\.\w+$/,
        dashes: /\-(\w)/g,
        scriptFiles: /\.(js|coffee)$/,
        strFunc: /function.*?\(([\s\S]*?)\)/
    };

    /**
     * Register a dependency in the di-container.
     *
     * @param {string|object} name Register a dependency by its name (+ function) or a hash-set at once.
     * @param {function}      func If a name is given, register this function.
     *
     * @returns {Array|function}
     */
    var register = function (name, func) {
        if (name === Object(name)) {
            var hash = name;
            var results = [];

            var key;

            for (key in hash) {
                if (hash.hasOwnProperty(key)) {
                    results.push(registerOne(key, hash[key]));
                }
            }

            return results;
        }
        else {
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
     */
    var registerLibrary = function (name, func) {
        if (name === Object(name)) {
            var hash = name;
            var results = [];

            var key;

            for (key in hash) {
                if (hash.hasOwnProperty(key)) {
                    /* jshint -W083 */
                    results.push(registerOne(key, (function (library) {
                        return function () {
                            return library;
                        };
                    })(hash[key])));
                }
            }

            return results;
        }
        else {
            return registerOne(name, function () {
                return func;
            });
        }
    };

    /**
     * Register a new dependency.
     *
     * @param {string}   name
     * @param {function} func
     *
     * @returns {function}
     */
    var registerOne = function (name, func) {
        if (!func) {
            throw new Error('Cannot register empty function!');
        }

        factories[name] = toFactory(func);
        return factories[name];
    };

    /**
     * Return a list of all factories.
     *
     * @returns {object}
     */
    var list = function () {
        return factories;
    };

    /**
     * Load a directory of files or a file into the di-container.
     * The filename will be the identifier.
     *
     * @param {string} fileOrDir A file path or a path.
     * @param {object} options   Pass optional options to this method.
     *
     * @returns {Array|function} A list of register files or just one register file function.
     */
    var load = function (fileOrDir, options) {
        // Load a directory
        if (existsSync(fileOrDir)) {
            var stats = fs.statSync(fileOrDir);

            if (stats.isDirectory()) {
                return loadDir(fileOrDir, options);
            }
        }

        // Load a file
        return loadFile(fileOrDir, options);
    };

    /**
     * Load a file into the di-container.
     *
     * @param {string} file
     * @param {object} options Pass optional options to this method.
     *
     * @returns {function}
     */
    var loadFile = function (file, options) {
        options = (util.isObject(options) ? options : {});

        var module = file.replace(regex.fileEnding, '');

        // Remove dashes from files and camelcase results
        var name = path.basename(module).replace(regex.dashes, function (match, letter) {
            return letter.toUpperCase();
        });

        // Add a prefix to the dependency's name
        if ('prefix' in options && util.isString(options.prefix)) {
            name = options.prefix + name;
        }

        return register(name, require(module));
    };

    /**
     * Load files in a directory to the di-container.
     *
     * @param {string} dir
     * @param {object} options Pass optional options to this method.
     *
     * @returns {Array}
     */
    var loadDir = function (dir, options) {
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
            //TODO: erm ... useless!?
            //else {
            //    results.push(void 0);
            //}
        }

        return results;
    };

    /**
     * Convert a function into the proper internal di factory format.
     *
     * @param {function} func
     *
     * @returns {object}
     */
    var toFactory = function (func) {
        if (typeof func === 'function') {
            return {
                func: func,
                required: argList(func)
            };
        }
        else {
            return {
                func: function () {
                    return func;
                },
                required: []
            };
        }
    };

    /**
     * Return a functions argument list for di dependency injection.
     *
     * @param {function} func
     *
     * @returns {Array}
     */
    var argList = function (func) {
        // match over multiple lines
        var match = func.toString().match(regex.strFunc);

        if (!match) {
            throw new Error('Could not parse function arguments: ' + func.toString());
        }

        return match[1].split(',')
            .filter(notEmpty)
            .map(function (str) {
                return str.trim();
            });
    };

    /**
     * Check if a argument is not empty.
     *
     * @param {*} arg
     *
     * @returns {boolean}
     */
    var notEmpty = function (arg) {
        return arg;
    };

    /**
     * Gives you a single dependency.
     *
     * @param {string} name
     * @param {object} overrides
     * @param {Array}  visited
     *
     * @TODO: add visitation / detect require loops
     */
    var get = function (name, overrides, visited) {
        if (visited === undefined) {
            visited = [];
        }

        /* jshint -W116 */
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
                register(name, require(module));
                factory = factories[name];
            }
            else {
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
            }
            else {
                return get(name, overrides, visited);
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
     *
     * @param {Array}  visited
     * @param {string} name
     *
     * @returns {Number}
     */
    var haveVisited = function (visited, name) {
        return visited.filter(function (n) {
            return n === name;
        }).length;
    };

    /**
     * Resolve a dependency and overwrite it.
     *
     * @param {object}   overrides
     * @param {function} func
     */
    var resolve = function (overrides, func) {
        if (!func) {
            func = overrides;
            overrides = null;
        }

        register('__temp', func);
        return get('__temp', overrides, []);
    };

    var registerContainer = function () {
        // Let people access the container if they know what they're doing
        container.register('_container', container);
    };

    /**
     * Clear all dependencies
     */
    var clearAll = function () {
        factories = {};
        modules = {};

        registerContainer();
    };

    // Prepare the public functions to be passed to the outer world
    container = {
        get: get,
        resolve: resolve,
        register: register,
        registerLibrary: registerLibrary,
        load: load,
        list: list,
        clearAll: clearAll
    };

    if (!('_container' in factories)) {
        registerContainer();
    }

    return container;
};
