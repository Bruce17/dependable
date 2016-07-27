/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   27.07.2016 09:15
 */

var container = require('../source/index').container();
var assert = require('assert');

describe('resolve', function () {
    beforeEach(function () {
        // Remove all dependencies from the dependency container
        container.clearAll();

        // Register some default dependencies
        container.register('foo', {});
        container.register('bar', 'hurp');
        container.register('baz', 1);
    });
    
    describe('correctly parses functions with', function () {
        it('no whitespaces in the argument lists', function (done) {
            container.resolve(function (foo,bar,baz) {
                assert.deepEqual(foo, {});
                assert.equal(bar, 'hurp');
                assert.equal(baz, 1);

                done();
            });
        });
    
        it('whitespaces in the argument lists', function (done) {
            container.resolve(function (foo, bar, baz) {
                assert.deepEqual(foo, {});
                assert.equal(bar, 'hurp');
                assert.equal(baz, 1);

                done();
            });
        });
        
        it('newlines in the argument lists', function (done) {
            container.resolve(function (foo,
                                        bar, 
                                        baz) {
                assert.deepEqual(foo, {});
                assert.equal(bar, 'hurp');
                assert.equal(baz, 1);

                done();
            });
        });
    });
});
