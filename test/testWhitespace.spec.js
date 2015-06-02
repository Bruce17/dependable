var container = require('../source/index').container();
//var assert = require('assert');

describe('resolve', function () {
    beforeEach(function () {
        // Remove all dependencies from the dependency container
        container.clearAll();

        // Register some default dependencies
        container.register('foo', {});
        container.register('bar', 'hurp');
        container.register('baz', 1);
    });

    it('correctly parses functions with newlines in the argument lists', function (done) {
        container.resolve(function (foo, bar, baz) {
            done();
        });
    });
});
