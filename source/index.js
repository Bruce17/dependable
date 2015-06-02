/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   02.06.2015 09:38
 */

var path = require('path');
var fs = require('fs');

var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync);

//simple dependency injection. No nesting, just pure simplicity
exports.container = function () {
    'use strict';

    var factories = {};
    var modules = {};

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
                    results.push(registerOne(key, hash[key]))
                }
            }

            return results;
        }
        else {
            return registerOne(name, func);
        }
    };

    /**
     * Register a new dependency.
     *
     * @param {string}   name
     * @param {function} func
     * @param {boolean}  isFile Add a note to load this dependency lazy on request, because it is a module in a file.
     *
     * @returns {function}
     */
    var registerOne = function (name, func, isFile) {
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
     *
     * @returns {Array|function} A list of register files or just one register file function.
     */
    var load = function (fileOrDir) {
        // Load a directory
        if (existsSync(fileOrDir)) {
            var stats = fs.statSync(fileOrDir);

            if (stats.isDirectory()) {
                return loadDir(fileOrDir);
            }
        }

        // Load a file
        return loadFile(fileOrDir);
    };

    /**
     * Load a file into the di-container.
     *
     * @param {string} file
     *
     * @returns {function}
     */
    var loadFile = function (file) {
        var module = file.replace(regex.fileEnding, '');

        // Remove dashes from files and camelcase results
        var name = path.basename(module).replace(regex.dashes, function (match, letter) {
            return letter.toUpperCase();
        });

        return register(name, require(module));
    };

    /**
     * Load files in a directory to the di-container.
     *
     * @param {string} dir
     *
     * @returns {Array}
     */
    var loadDir = function (dir) {
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
                results.push(loadFile(file));
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
                isFile: false,
                required: argList(func)
            };
        }
        else {
            return {
                func: function () {
                    return func;
                },
                isFile: false,
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

        var isOverridden = (overrides != null);

        // Check for circular dependencies
        if (haveVisited(visited, name)) {
            throw new Error('Circular dependency with "' + name + '"');
        }
        visited = visited.concat(name);

        var factory = factories[name];
        if (!factory) {
            var module = modules[name];

            if (!module) {
                register(name, require(module));
                factory = factories[name];
            }
            else {
                throw new Error('Dependency "' + name + '" was not registered');
            }
        }

        // Use the one you already created
        if (factory.instance && !isOverridden) {
            return factory.instance
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

        register("__temp", func);
        return get("__temp", overrides, []);
    };

    // Preppare the public functions to be passed to the outer world
    var container = {
        get: get,
        resolve: resolve,
        register: register,
        load: load,
        list: list
    };

    // Let people access the container if they know what they're doing
    container.register('_container', container);

    return container;
};
