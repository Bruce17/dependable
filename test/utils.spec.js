/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   10.06.2015 15:04
 */

var Utils = require('../source/utils');

describe('Utils', function () {
    it('should exist', function () {
        expect(Utils).to.be.ok;
    });

    describe('isObject()', function () {
        it('should exist', function () {
            expect(Utils.isObject).to.be.ok;
            expect(Utils.isObject).to.be.a('function');
        });

        it('should return false', function () {
            var aryTestValues = [
                undefined,
                null,
                false,
                true,
                Boolean(true),
                Boolean(false),
                NaN,
                123,
                Number(123),
                'foo',
                String('foo')
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isObject(val)).to.be.false;
            });
        });

        it('should return true', function () {
            var aryTestValues = [
                {},
                {foo: 'bar'},
                new Object({foo: 'bar'}),
                new Boolean(true),
                new String('foo'),
                new Number(123)
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isObject(val)).to.be.true;
            });
        });
    });

    describe('isString()', function () {
        it('should exist', function () {
            expect(Utils.isString).to.be.ok;
            expect(Utils.isString).to.be.a('function');
        });

        it('should return false', function () {
            var aryTestValues = [
                undefined,
                null,
                false,
                true,
                Boolean(true),
                Boolean(false),
                NaN,
                123,
                Number(123),
                [1, 2, 3],
                Array(1, 2, 3),
                {},
                {foo: 'bar'},
                Object({foo: 'bar'}),
                new Object({foo: 'bar'})
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isString(val)).to.be.false;
            });
        });

        it('should return true', function () {
            var aryTestValues = [
                'foo bar',
                String('foo bar'),
                new String('foo bar')
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isString(val)).to.be.true;
            });
        });
    });

    describe('isArray()', function () {
        it('should exist', function () {
            expect(Utils.isArray).to.be.ok;
            expect(Utils.isArray).to.be.a('function');
        });

        it('should return false', function () {
            var aryTestValues = [
                undefined,
                null,
                false,
                true,
                Boolean(true),
                Boolean(false),
                NaN,
                123,
                Number(123),
                'foo',
                String('foo'),
                {},
                {foo: 'bar'},
                Object({foo: 'bar'}),
                new Object({foo: 'bar'})
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isArray(val)).to.be.false;
            });
        });

        it('should return true', function () {
            var aryTestValues = [
                [1, 2, 3],
                Array(1, 2, 3),
                new Array(1, 2, 3)
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isArray(val)).to.be.true;
            });
        });
    });
});