/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   10.06.2015 15:04
 */

var Utils = require('../source/utils');

/* global expect */

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

    describe('isUndefined()', function () {
        it('should exist', function () {
            expect(Utils.isUndefined).to.be.ok;
            expect(Utils.isUndefined).to.be.a('function');
        });

        it('should return false', function () {
            var aryTestValues = [
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
                expect(Utils.isUndefined(val)).to.be.false;
            });
        });

        it('should return true', function () {
            var aryTestValues = [
                undefined
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.isUndefined(val)).to.be.true;
            });
        });
    });

    describe('simpleCompare()', function(){
        var collection;
        before(function(){
            collection = [
                'a',
                {foo: 'bar'},
                ['foo', 'bar'],
                1,
                [1, [2, [3, 4]]]
            ];
        });

        it('should exist', function () {
            expect(Utils.simpleCompare).to.be.ok;
            expect(Utils.simpleCompare).to.be.a('function');
        });

        it('should return true', function(){
            collection.forEach(function (val) {
                expect(Utils.simpleCompare(val, val)).to.be.true;
            });
        });

        it('should return false', function(){
            expect(Utils.simpleCompare('a')).to.be.false;
            expect(Utils.simpleCompare('a', 1)).to.be.false;
            expect(Utils.simpleCompare('a', ['a'])).to.be.false;
            expect(Utils.simpleCompare('a', {foo: 'bar'})).to.be.false;
            expect(Utils.simpleCompare(['foo', 'bar'], {foo: 'bar'})).to.be.false;
            expect(Utils.simpleCompare({foo: 'bar'}, {foo: 'bar', fooo: 'baar'})).to.be.false;
            expect(Utils.simpleCompare(1,'b')).to.be.false;
            expect(Utils.simpleCompare(['a'],'b')).to.be.false;
            expect(Utils.simpleCompare({foo: 'bar'},'b')).to.be.false;
            expect(Utils.simpleCompare([1, [2, [3, 4]]],[[[1, 2], 3], 4])).to.be.false;
        });
    });

    describe('inArray()', function () {
        var collection;

        before(function () {
            collection = ['a', 'b', 'c', {foo: 'bar'}, {bar: 'foo'}, {foo: 'bar', bar: 'foo'}, ['d', 'e']];
        });

        it('should exist', function () {
            expect(Utils.inArray).to.be.ok;
            expect(Utils.inArray).to.be.a('function');
        });

        it('should return true', function () {
            collection.forEach(function (val) {
                expect(Utils.inArray(collection, val)).to.be.true;
            });
        });

        it('should return false', function () {
            var aryTestValues = [
                'd',
                '',
                {c: 'c'},
                {bar: 'foo', foo: 'bar'}
            ];

            aryTestValues.forEach(function (val) {
                expect(Utils.inArray(collection, val)).to.be.false;
            });
        });
    });

    describe('escapeRegex()', function () {
        it('should exist', function () {
            expect(Utils.escapeRegex).to.be.ok;
            expect(Utils.escapeRegex).to.be.a('function');
        });

        it('should not escape a normal string', function () {
            var str = 'hello world!';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.equal(str);
        });

        it('should a string containing an asterisk', function () {
            var str = 'hello *!';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.not.equal(str);
            expect(result).to.equal('hello \\*!');
        });

        it('should escape a regex', function () {
            var str = '^foo*[a-z]+(bar)?$';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.not.equal(str);
            expect(result).to.equal('\\^foo\\*\\[a-z\\]\\+\\(bar\\)\\?\\$');
        });

        it('should escape "*abc"', function () {
            var str = '*abc';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.not.equal(str);
            expect(result).to.equal('\\*abc');
        });

        it('should escape "abc*"', function () {
            var str = 'abc*';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.not.equal(str);
            expect(result).to.equal('abc\\*');
        });

        it('should escape "*abc*"', function () {
            var str = '*abc*';

            var result = Utils.escapeRegex(str);

            expect(result).to.be.ok;
            expect(result).to.be.an('string');
            expect(result).to.not.equal(str);
            expect(result).to.equal('\\*abc\\*');
        });
    });
});
