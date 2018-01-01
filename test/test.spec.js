/**
 * @author Michael Raith
 * @email  mraith@gmail.com
 * @date   02.06.2015 11:38
 */

/* global expect */

var container = require('../source/index').container();
var features = require('./features');
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');


/**
 * Return os temp directory.
 *
 * @return {string}
 */
var getTempDir = function () {
    return (typeof os.tmpdir !== 'undefined' ? os.tmpdir() : os.tmpDir());
};


/**
 * NOTICE: this file was automatically converted from Coffeescript back to pure JavaScript.
 */
describe('inject', function () {
    var testFiles = [];

    beforeEach(function () {
        // Remove all dependencies from the dependency container
        container.clearAll();
    });

    afterEach(function () {
        // After each test, delete temporary files
        testFiles.forEach(function (testFileName) {
            if (fs.existsSync(testFileName)) {
                fs.unlinkSync(testFileName);
            }
        });

        testFiles = [];
    });


    it('should create a container', function () {
        expect(container).to.be.ok;
        expect(container).to.be.an('object');
    });

    describe('cache', function () {
        it('should re-use the same instance', function () {
            container.register('a', function () {
                return {
                    one: 'one'
                };
            });

            var a = container.get('a');

            assert.deepEqual(a, {
                one: 'one'
            });
            assert.notEqual(a, {
                one: 'one'
            });

            var a2 = container.get('a');

            assert.equal(a, a2);
        });
    });

    describe('overrides', function () {
        it('should override a dependency', function () {
            container.register('a', function (b) {
                return {
                    value: b
                };
            });
            container.register('b', 'b');

            var a = container.get('a', {
                b: 'henry'
            });

            assert.equal(a.value, 'henry');
        });

        it('should not cache when you override', function () {
            container.register('a', function (b) {
                return {
                    value: b
                };
            });
            container.register('b', 'b');

            var overriddenA = container.get('a', {
                b: 'henry'
            });

            var a = container.get('a');

            assert.notEqual(a.value, 'henry', 'it cached the override value');
            assert.equal(a.value, 'b');
        });

        it('should ignore the cache when you override', function () {
            container.register('a', function (b) {
                return {
                    value: b
                };
            });
            container.register('b', 'b');

            var a = container.get('a');
            var overriddenA = container.get('a', {
                b: 'henry'
            });

            assert.notEqual(overriddenA.value, 'b', 'it used the cached value');
            assert.equal(overriddenA.value, 'henry');
        });

        it('should override on resolve', function (done) {
            container.register('a', function (b) {
                return {
                    value: b
                };
            });
            container.register('b', 'b');

            container.resolve({
                b: 'bob'
            }, function (a) {
                assert.equal(a.value, 'bob');
                done();
            });
        });
    });


    describe('register()', function () {
        var depA, depB;

        beforeEach(function () {
            depA = 'foo bar';
            depB = {
                foo: 'bar',
                obj: {
                    str: 'test',
                    num: 123,
                    ary: [1, 2, 3]
                }
            };
        });

        it('should exist', function () {
            expect(container.register).to.be.ok;
            expect(container.register).to.be.a('function');
        });

        describe('type "string" and "object"', function () {
            it('should register a string dependency', function () {
                container.register('a', 'a');

                expect(container.get('a')).to.equal('a');
            });

            it('should register a dependency', function () {
                container.register('depA', depA);
                container.register('depB', depB);

                expect(container.get('depA')).to.equal(depA);
                expect(container.get('depA')).to.not.equal(depB);
                expect(container.get('depB')).to.equal(depB);
                expect(container.get('depB')).to.not.equal(depA);
            });

            it('should register dependencies via object', function () {
                container.register({
                    depA: depA,
                    depB: depB
                });

                expect(container.get('depA')).to.equal(depA);
                expect(container.get('depA')).to.not.equal(depB);
                expect(container.get('depB')).to.equal(depB);
                expect(container.get('depB')).to.not.equal(depA);
            });

            it('should register dependencies via object with object/class pairs', function () {
                var depA = function () {
                    return 'foo bar';
                };
                var depB = {
                    foo: 'bar',
                    num: 123
                };

                container.register({
                    a: function () {
                        return depA;
                    },
                    b: depB
                });

                expect(container.get('a')).to.equal(depA);
                expect(container.get('a')).to.not.equal(depB);
                expect(container.get('b')).to.equal(depB);
                expect(container.get('b')).to.not.equal(depA);
            });
        });

        describe('type "function"', function () {
            var depFnc1, depFnc2, depFnc3, depFnc4;
            var result1, result2, result3, result4;

            beforeEach(function () {
                depFnc1 = function () {
                    return 'foo';
                };
                depFnc2 = function foo() {
                    return 'bar';
                };
                depFnc3 = function (depFnc1,depFnc2) { // no whitespace between args
                    return depFnc1 + ' ' + depFnc2;
                };
                depFnc4 = function foo(   depFnc1,    depFnc2   ) { // with whitespace between args
                    return depFnc2 + ' ' + depFnc1;
                };

                result1 = 'foo';
                result2 = 'bar';
                result3 = 'foo bar';
                result4 = 'bar foo';
            });

            it('should register a dependency', function () {
                container.register('depFnc1', depFnc1);
                container.register('depFnc2', depFnc2);
                container.register('depFnc3', depFnc3);
                container.register('depFnc4', depFnc4);

                expect(container.get('depFnc1')).to.equal(result1);
                expect(container.get('depFnc1')).to.not.equal(result2);
                expect(container.get('depFnc1')).to.not.equal(result3);
                expect(container.get('depFnc1')).to.not.equal(result4);

                expect(container.get('depFnc2')).to.not.equal(result1);
                expect(container.get('depFnc2')).to.equal(result2);
                expect(container.get('depFnc2')).to.not.equal(result3);
                expect(container.get('depFnc2')).to.not.equal(result4);

                expect(container.get('depFnc3')).to.not.equal(result1);
                expect(container.get('depFnc3')).to.not.equal(result2);
                expect(container.get('depFnc3')).to.equal(result3);
                expect(container.get('depFnc3')).to.not.equal(result4);

                expect(container.get('depFnc4')).to.not.equal(result1);
                expect(container.get('depFnc4')).to.not.equal(result2);
                expect(container.get('depFnc4')).to.not.equal(result3);
                expect(container.get('depFnc4')).to.equal(result4);
            });

            it('should register a dependencies via object', function () {
                container.register({
                    depFnc1: depFnc1,
                    depFnc2: depFnc2,
                    depFnc3: depFnc3,
                    depFnc4: depFnc4,
                });

                expect(container.get('depFnc1')).to.equal(result1);
                expect(container.get('depFnc1')).to.not.equal(result2);
                expect(container.get('depFnc1')).to.not.equal(result3);
                expect(container.get('depFnc1')).to.not.equal(result4);

                expect(container.get('depFnc2')).to.not.equal(result1);
                expect(container.get('depFnc2')).to.equal(result2);
                expect(container.get('depFnc2')).to.not.equal(result3);
                expect(container.get('depFnc2')).to.not.equal(result4);

                expect(container.get('depFnc3')).to.not.equal(result1);
                expect(container.get('depFnc3')).to.not.equal(result2);
                expect(container.get('depFnc3')).to.equal(result3);
                expect(container.get('depFnc3')).to.not.equal(result4);

                expect(container.get('depFnc4')).to.not.equal(result1);
                expect(container.get('depFnc4')).to.not.equal(result2);
                expect(container.get('depFnc4')).to.not.equal(result3);
                expect(container.get('depFnc4')).to.equal(result4);
            });
        });

        describe('type "function" (ES6 fat arrow)', function () {
            var depFnc1, depFnc2, depFnc3, depFnc4;
            var result1, result2, result3, result4;

            beforeEach(function () {
                if (!features.hasFatArrow) {
                    this.skip();
                }

                depFnc1 = eval('() => "foo";');
                depFnc2 = eval('() => "bar";');
                // no whitespace between args
                depFnc3 = eval('(depFnc1,depFnc2) => depFnc1 + " " + depFnc2;');
                // with whitespace between args
                depFnc4 = eval('(   depFnc1,\tdepFnc2   ) => {\nreturn depFnc2 + " " + depFnc1;\n}\n');

                result1 = 'foo';
                result2 = 'bar';
                result3 = 'foo bar';
                result4 = 'bar foo';
            });

            it('should register a dependency', function () {
                container.register('depFnc1', depFnc1);
                container.register('depFnc2', depFnc2);
                container.register('depFnc3', depFnc3);
                container.register('depFnc4', depFnc4);

                expect(container.get('depFnc1')).to.equal(result1);
                expect(container.get('depFnc1')).to.not.equal(result2);
                expect(container.get('depFnc1')).to.not.equal(result3);
                expect(container.get('depFnc1')).to.not.equal(result4);

                expect(container.get('depFnc2')).to.not.equal(result1);
                expect(container.get('depFnc2')).to.equal(result2);
                expect(container.get('depFnc2')).to.not.equal(result3);
                expect(container.get('depFnc2')).to.not.equal(result4);

                expect(container.get('depFnc3')).to.not.equal(result1);
                expect(container.get('depFnc3')).to.not.equal(result2);
                expect(container.get('depFnc3')).to.equal(result3);
                expect(container.get('depFnc3')).to.not.equal(result4);

                expect(container.get('depFnc4')).to.not.equal(result1);
                expect(container.get('depFnc4')).to.not.equal(result2);
                expect(container.get('depFnc4')).to.not.equal(result3);
                expect(container.get('depFnc4')).to.equal(result4);
            });

            it('should register a dependencies via object', function () {
                container.register({
                    depFnc1: depFnc1,
                    depFnc2: depFnc2,
                    depFnc3: depFnc3,
                    depFnc4: depFnc4,
                });

                expect(container.get('depFnc1')).to.equal(result1);
                expect(container.get('depFnc1')).to.not.equal(result2);
                expect(container.get('depFnc1')).to.not.equal(result3);
                expect(container.get('depFnc1')).to.not.equal(result4);

                expect(container.get('depFnc2')).to.not.equal(result1);
                expect(container.get('depFnc2')).to.equal(result2);
                expect(container.get('depFnc2')).to.not.equal(result3);
                expect(container.get('depFnc2')).to.not.equal(result4);

                expect(container.get('depFnc3')).to.not.equal(result1);
                expect(container.get('depFnc3')).to.not.equal(result2);
                expect(container.get('depFnc3')).to.equal(result3);
                expect(container.get('depFnc3')).to.not.equal(result4);

                expect(container.get('depFnc4')).to.not.equal(result1);
                expect(container.get('depFnc4')).to.not.equal(result2);
                expect(container.get('depFnc4')).to.not.equal(result3);
                expect(container.get('depFnc4')).to.equal(result4);
            });
        });

        describe('check regex to receive dependencies', function () {
            it('should read dependencies from a multi line function (no spaces after function name)', function (done) {
                var afile = path.join(getTempDir(), 'AA1.js');
                var acode = 'module.exports = function() {\nreturn "a";\n}\n';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'BB1.js');
                var bcode = 'module.exports = function(\nAA1\n) {\nreturn AA1 + "b";\n}\n';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('AA1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('BB1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should read dependencies from a multi line function (spaces after function name)', function (done) {
                var afile = path.join(getTempDir(), 'AA1.js');
                var acode = 'module.exports = function () {\nreturn "a";\n}\n';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'BB1.js');
                var bcode = 'module.exports = function (\nAA1\n) {\nreturn AA1 + "b";\n}\n';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('AA1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('BB1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should read dependencies from a multi line ES6 fat arrow function', function (done) {
                if (!features.hasFatArrow) {
                    this.skip();
                }

                var afile = path.join(getTempDir(), 'AA1.js');
                var acode = 'module.exports = () => {\nreturn "a";\n}\n';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'BB1.js');
                var bcode = 'module.exports = (\nAA1\n) => {\nreturn AA1 + "b";\n}\n';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('AA1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('BB1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should read dependencies from a multi line ES6 fat arrow function short syntax', function (done) {
                if (!features.hasFatArrow) {
                    this.skip();
                }

                var afile = path.join(getTempDir(), 'AA1.js');
                var acode = 'module.exports = () => "a";\n';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'BB1.js');
                var bcode = 'module.exports = (\nAA1\n) => AA1 + "b";\n';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('AA1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('BB1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });
        });

        describe('force exception in method "argList()"', function () {
            it('should throw an exception', function () {
                var depA = function () {
                    return 'foo';
                };

                depA.toString = function () {
                    return 'some weird result';
                };

                var status = true;
                var statusMessage;

                try {
                    container.register('depA', depA);

                    status = false;
                    statusMessage = 'It should thrown an exception to be not able to parse a method\'s signature';
                } catch (ex) {}

                assert.ok(status, statusMessage);
            });
        });

        describe('check behaviour', function () {
            it('should return the same instance to everyone', function () {
                container.register('asdf', function () {
                    return {
                        woot: 'hi'
                    };
                });
                container.register('a', function (asdf) {
                    asdf.a = 'a';
                });
                container.register('b', function (asdf) {
                    asdf.b = 'b';
                });

                var asdf = container.get('asdf');
                var a = container.get('a');
                var b = container.get('b');

                expect(asdf.a).to.equal('a');
                expect(asdf.b).to.equal('b');
            });
        });
    });

    describe('registerLibrary()', function () {
        var libA, libB;
        var depA, depB;

        beforeEach(function () {
            libA = function () {
                return 'foo bar';
            };
            libB = function () {
                return {num: 123};
            };

            depA = function () {
                return 'a';
            };
            depB = function (depA) {
                return depA + 'b';
            };
        });

        it('should exist', function () {
            expect(container.registerLibrary).to.be.ok;
            expect(container.registerLibrary).to.be.a('function');
        });

        it('should register a library function', function () {
            container.registerLibrary('libA', libA);
            container.registerLibrary('libB', libB);

            expect(container.get('libA')).to.equal(libA);
            expect(container.get('libA')).to.not.equal(libB);
            expect(container.get('libB')).to.equal(libB);
            expect(container.get('libB')).to.not.equal(libA);
        });

        it('should register a library function via hash', function () {
            container.registerLibrary({
                libA: libA,
                libB: libB
            });

            expect(container.get('libA')).to.equal(libA);
            expect(container.get('libA')).to.not.equal(libB);
            expect(container.get('libB')).to.equal(libB);
            expect(container.get('libB')).to.not.equal(libA);
        });

        it('should register a library and normal dependency', function () {
            container.register({
                depA: depA,
                depB: depB
            });
            container.registerLibrary({
                libA: libA,
                libB: libB
            });

            // Check libraries
            var resultLibA = container.get('libA');
            var resultLibB = container.get('libB');
            expect(resultLibA).to.equal(libA);
            expect(resultLibB).to.equal(libB);

            // Execute library and check result
            expect(libA()).to.equal('foo bar');
            expect(libB()).to.deep.equal({num: 123});

            // Check dependency result
            expect(container.get('depA')).to.not.equal(depA);
            expect(container.get('depA')).to.equal('a');
            expect(container.get('depB')).to.not.equal(depB);
            expect(container.get('depB')).to.equal('ab');
        });
    });

    describe('load()', function () {
        describe('use method without options', function () {
            var removeFileExtension = function (str) {
                return str.replace(/\.\w+$/, '');
            };

            it('should let you register a file', function (done) {
                var afile = path.join(getTempDir(), 'A1.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'B1.js');
                var bcode = 'module.exports = function(A1) { return A1 + "b" }';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('A1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('B1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject');

                var afile = path.join(dir, 'A2.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir, 'B2.js');
                var bcode = 'module.exports = function(A2) { return A2 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir, function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir);

                            var b = container.get('B2');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });

            it('should let you load a file without an extension', function (done) {
                var afile = path.join(getTempDir(), 'A1.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'B1.js');
                var bcode = 'module.exports = function(A1) { return A1 + "b" }';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(removeFileExtension(afile));

                    var a = container.get('A1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(removeFileExtension(bfile));
                        var b = container.get('B1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            describe('should crash if trying to load a file with an unknown extension', function () {
                var aryFileEndings = [
                    '.ts',
                    '.coffee'
                ];

                aryFileEndings.forEach(function (fileEnding) {
                    it('*' + fileEnding, function (done) {
                        var afile = path.join(getTempDir(), 'A1' + fileEnding);
                        var acode = 'module.exports = function() { return "a" }';
                        testFiles.push(afile);

                        fs.writeFile(removeFileExtension(afile), acode, function (err) {
                            assert.ifError(err);

                            try {
                                container.load(afile);

                                assert.fail(true, 'Should throw exception "Cannot find module ..."');
                            } catch (ex) {
                                expect(ex).to.be.ok;
                                expect(ex.message).to.contain('no such file or directory');
                            }

                            done();
                        });
                    });
                });
            });

            it('should not crash if trying to load something as a file without an extension (crashed on fs.stat)', function (done) {
                var afile = path.join(getTempDir(), 'A1');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'B1');
                var bcode = 'module.exports = function(A1) { return A1 + "b" }';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile);

                    var a = container.get('A1');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile);
                        var b = container.get('B1');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            describe('should crash if trying to load something as a module file with an unknown extension', function () {
                var aryFileEndings = [
                    '.ts',
                    '.coffee'
                ];

                aryFileEndings.forEach(function (fileEnding) {
                    it('*' + fileEnding, function (done) {
                        var afile = path.join(getTempDir(), 'A1' + fileEnding);
                        var acode = 'module.exports = function() { return "a" }';
                        testFiles.push(afile);

                        fs.writeFile(afile, acode, function (err) {
                            assert.ifError(err);

                            try {
                                container.load(afile);

                                assert.fail(true, 'Should throw exception "Cannot find module ..."');
                            } catch (ex) {
                                expect(ex).to.be.ok;
                                expect(ex.message).to.contain('Cannot find module');
                            }

                            done();
                        });
                    });
                });
            });

            // NOTICE: this test does not work. We need to load every module to read the module's dependencies!
            xit('should be lazy', function (done) {
                var dir = path.join(getTempDir(), 'testinject');

                var cfile = path.join(dir, 'C.js');
                var ccode = 'throw new Error("Should not be loaded because we do not require it");';
                testFiles.push(cfile);

                var dfile = path.join(dir, 'D.js');
                var dcode = 'module.exports = function() { return "d"; };';
                testFiles.push(dfile);

                fs.mkdir(dir, function (err) {
                    fs.writeFile(cfile, ccode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(dfile, dcode, function (err) {
                            assert.ifError(err);

                            container.load(dir);

                            assert.equal('d', container.get('D'));
                            done();
                        });
                    });
                });
            });
        });

        describe('test prefix option', function () {
            var options;

            beforeEach(function () {
                options = {
                    prefix: 'Test_'
                };
            });

            it('should let you register a file', function (done) {
                var afile = path.join(getTempDir(), 'A3.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'B3.js');
                var bcode = 'module.exports = function(Test_A3) { return Test_A3 + "b" }';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile, options);

                    var a = container.get('Test_A3');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile, options);
                        var b = container.get('Test_B3');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject');

                var afile = path.join(dir, 'A4.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir, 'B4.js');
                var bcode = 'module.exports = function(Test_A4) { return Test_A4 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir, function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir, options);

                            var b = container.get('Test_B4');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });
        });

        describe('test postfix option', function () {
            var options;

            beforeEach(function () {
                options = {
                    postfix: '_Test'
                };
            });

            it('should let you register a file', function (done) {
                var afile = path.join(getTempDir(), 'A32.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(getTempDir(), 'B32.js');
                var bcode = 'module.exports = function(A32_Test) { return A32_Test + "b" }';
                testFiles.push(bfile);

                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    container.load(afile, options);

                    var a = container.get('A32_Test');
                    assert.equal(a, 'a');

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        container.load(bfile, options);
                        var b = container.get('B32_Test');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject');

                var afile = path.join(dir, 'A42.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir, 'B42.js');
                var bcode = 'module.exports = function(A42_Test) { return A42_Test + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir, function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir, options);

                            var b = container.get('B42_Test');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });
        });

        describe('test sub directory', function () {
            var subDirs;

            beforeEach(function () {
                subDirs = [
                    'foo/'
                ];
            });

            it('should let you register a file', function (done) {
                var baseDir = getTempDir() + '/';

                var afile = path.join(baseDir, 'A5.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(baseDir + subDirs[0], 'B5.js');
                var bcode = 'module.exports = function(A5) { return A5 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(baseDir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        container.load(afile);

                        var a = container.get('A5');
                        assert.equal(a, 'a');

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(bfile);
                            var b = container.get('B5');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject/');

                var afile = path.join(dir, 'A6.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir + subDirs[0], 'B6.js');
                var bcode = 'module.exports = function(A6) { return A6 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir, subDirs);

                            var b = container.get('B6');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });
        });

        describe('test sub directory and prefix option', function () {
            var subDirs;
            var options;

            beforeEach(function () {
                subDirs = [
                    'foo/'
                ];

                options = {
                    prefix: 'Test_'
                };
            });

            it('should let you register a file', function (done) {
                var baseDir = getTempDir() + '/';

                var afile = path.join(baseDir, 'A7.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(baseDir + subDirs[0], 'B7.js');
                var bcode = 'module.exports = function(Test_A7) { return Test_A7 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(baseDir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        container.load(afile, options);

                        var a = container.get('Test_A7');
                        assert.equal(a, 'a');

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(bfile, options);
                            var b = container.get('Test_B7');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject/');

                var afile = path.join(dir, 'A8.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir + subDirs[0], 'B8.js');
                var bcode = 'module.exports = function(Test_A8) { return Test_A8 + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir, subDirs, options);

                            var b = container.get('Test_B8');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });
        });

        describe('test sub directory and postfix option', function () {
            var subDirs;
            var options;

            beforeEach(function () {
                subDirs = [
                    'foo/'
                ];

                options = {
                    postfix: '_Test'
                };
            });

            it('should let you register a file', function (done) {
                var baseDir = getTempDir() + '/';

                var afile = path.join(baseDir, 'A9.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(baseDir + subDirs[0], 'B9.js');
                var bcode = 'module.exports = function(A9_Test) { return A9_Test + "b" }';
                testFiles.push(bfile);

                fs.mkdir(baseDir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        container.load(afile, options);

                        var a = container.get('A9_Test');
                        assert.equal(a, 'a');

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(bfile, options);
                            var b = container.get('B9_Test');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });

            it('should let you register a whole directory', function (done) {
                var dir = path.join(getTempDir(), 'testinject/');

                var afile = path.join(dir, 'A10.js');
                var acode = 'module.exports = function() { return "a" }';
                testFiles.push(afile);

                var bfile = path.join(dir + subDirs[0], 'B10.js');
                var bcode = 'module.exports = function(A10_Test) { return A10_Test + "b" }';
                testFiles.push(bfile);

                fs.mkdir(dir + subDirs[0], function (err) {
                    fs.writeFile(afile, acode, function (err) {
                        assert.ifError(err);

                        fs.writeFile(bfile, bcode, function (err) {
                            assert.ifError(err);

                            container.load(dir, subDirs, options);

                            var b = container.get('B10_Test');
                            assert.equal(b, 'ab');

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('find()', function(){
        var libA, libB, bibC, bibD;
        var depA, depB, abhC, abhD;

        before(function(){
            libA = function () {
                return 'foo bar';
            };
            libB = function () {
                return {num: 123};
            };
            bibC = function () {
                return {foo: 'bar'};
            };
            bibD = function () {
                return 123;
            };

            depA = function () {
                return 'a';
            };
            depB = function (depA) {
                return depA + 'b';
            };
            abhC = function () {
                return 'c';
            };
            abhD = function (abhC) {
                return abhC + 'd';
            };
        });

        beforeEach(function () {
            container.register({
                depA: depA,
                depB: depB,
                abhC: abhC,
                abhD: abhD
            });
            container.registerLibrary({
                libA: libA,
                libB: libB,
                bibC: bibC,
                bibD: bibD
            });
        });

        it('should exist', function () {
            expect(container.find).to.be.ok;
            expect(container.find).to.be.a('function');
        });

        it('should return an empty result for an empty search pattern ""', function(){
            var dependencies = container.find('');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(0);
        });

        it('should return all dependencies for search pattern "*"', function(){
            var dependencies = container.find('*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(8);
        });

        it('should return all dependencies "dep*"', function(){
            var dependencies = container.find('dep*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(2);
            expect(dependencies).to.have.property('depA');
            expect(dependencies).to.have.property('depB');
        });

        it('should return all dependencies "abh*"', function(){
            var dependencies = container.find('abh*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(2);
            expect(dependencies).to.have.property('abhC');
            expect(dependencies).to.have.property('abhD');
        });

        it('should return all libraries "lib*"', function(){
            var dependencies = container.find('lib*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(2);
            expect(dependencies).to.have.property('libA');
            expect(dependencies).to.have.property('libB');
        });

        it('should return all libraries "bib*"', function(){
            var dependencies = container.find('bib*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(2);
            expect(dependencies).to.have.property('bibC');
            expect(dependencies).to.have.property('bibD');
        });

        it('should return all dependencies "*A"', function(){
            var dependencies = container.find('*A');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(2);
            expect(dependencies).to.have.property('depA');
            expect(dependencies).to.have.property('libA');
        });

        it('should return a direct match "depA"', function(){
            var dependencies = container.find('depA');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(1);
            expect(dependencies).to.have.property('depA');
        });

        it('should not allow regex as argument"', function(){
            var dependencies = container.find('bib.*');

            expect(dependencies).to.be.ok;
            expect(dependencies).to.be.an('object');
            expect(Object.keys(dependencies)).to.have.length(0);
        });
    });

    describe('get()', function () {
        it('should exist', function () {
            expect(container.get).to.be.ok;
            expect(container.get).to.be.a('function');
        });

        it('should return module without deps', function () {
            var Abc = function () {
                return 'abc';
            };

            container.register('abc', Abc);

            expect(container.get('abc')).to.equal('abc');
        });

        it('should get a single dependency', function () {
            var Stuff = function (names) {
                return names[0];
            };

            var Names = function () {
                return ['one', 'two'];
            };

            container.register('stuff', Stuff);
            container.register('names', Names);

            expect(container.get('stuff')).to.equal('one');
        });

        it('should resolve multiple dependencies', function () {
            var post = function (Comments, Users) {
                var Post;

                return Post = (function () {
                    function Post(comments1, author) {
                        this.comments = comments1;
                        this.author = author;
                    }

                    Post.prototype.authorName = function () {
                        return Users.getName(this.author);
                    };

                    Post.prototype.firstCommentText = function () {
                        return Comments.getText(this.comments[0]);
                    };

                    return Post;
                })();
            };

            var comments = function () {
                return {
                    getText: function (obj) {
                        return obj.text;
                    }
                };
            };

            var users = function () {
                return {
                    getName: function (obj) {
                        return obj.name;
                    }
                };
            };

            container.register('Post', post);
            container.register('Users', users);
            container.register('Comments', comments);

            var PostClass = container.get('Post');

            var postOne = new PostClass(
                [
                    {text: 'woot'}
                ],
                {
                    name: 'bob'
                }
            );

            expect(postOne.authorName()).to.be.ok;
            expect(postOne.authorName()).to.equal('bob');
            expect(postOne.firstCommentText()).to.be.ok;
            expect(postOne.firstCommentText()).to.equal('woot');


            var postTwo = new PostClass(
                [
                    {text: 'some text'},
                    {text: 'another comment'}
                ],
                {
                    name: 'alice'
                }
            );

            expect(postTwo.authorName()).to.be.ok;
            expect(postTwo.authorName()).to.equal('alice');
            expect(postTwo.firstCommentText()).to.be.ok;
            expect(postTwo.firstCommentText()).to.equal('some text');
        });

        it('should let me use different databases for different collections (pass in info)', function () {
            var db = function (data) {
                return {
                    data: data,
                    get: function (key) {
                        return this.data[key];
                    },
                    set: function (key, value) {
                        return this.data[key] = value;
                    }
                };
            };

            var name = function () {
                return 'bob';
            };

            var people = function (name, db) {
                return {
                    name: name,
                    add: function (person) {
                        return db.set(person.name, person);
                    },
                    find: function (name) {
                        return db.get(name);
                    }
                };
            };

            var places = function (name, db) {
                return {
                    name: name,
                    add: function (place) {
                        return db.set(place.name, place);
                    },
                    find: function (name) {
                        return db.get(name);
                    }
                };
            };

            container.register('name', name);
            container.register('people', people);
            container.register('places', places);

            var peopleDb = db({});
            var placesDb = db({});
            var peoplez = container.get('people', {
                db: peopleDb
            });
            var placez = container.get('places', {
                db: placesDb
            });

            expect(peoplez.name, 'bob');
            expect(placez.name, 'bob');

            peoplez.add({
                name: 'one'
            });
            placez.add({
                name: 'two'
            });

            expect(peoplez.find('one')).to.be.ok;
            expect(placez.find('one')).to.be.not.ok;

            expect(peoplez.find('two')).to.be.not.ok;
            expect(placez.find('two')).to.be.ok;
        });

        it('should get nested dependencies', function () {
            var gpa = function () {
                return {
                    age: 86
                };
            };

            var dad = function (gpa) {
                return {
                    age: gpa.age - 20
                };
            };

            var son = function (dad) {
                return {
                    age: dad.age - 30
                };
            };

            container.register('gpa', gpa);
            container.register('dad', dad);
            container.register('son', son);

            expect(container.get('gpa').age).to.equal(86);
            expect(container.get('dad').age).to.equal(66);
            expect(container.get('son').age).to.equal(36);
        });

        it('should throw error on circular dependency', function () {
            var one = function (two) {
                return two + 1;
            };

            var two = function (one) {
                return one + 2;
            };

            container.register('one', one);
            container.register('two', two);

            var err;
            try {
                container.get('one');
            }
            catch (e) {
                err = e;
            }

            assert.ok(err.toString().match(/circular dependency/i));
        });

        it('should not throw circular dependency error if two modules require the same thing', function () {
            container.register('name', function () {
                return 'bob';
            });
            container.register('one', function (name) {
                return name + ' one';
            });
            container.register('two', function (name) {
                return name + ' two';
            });
            container.register('all', function (one, two) {
                return one + ' ' + two;
            });

            try {
                var result = container.get('all');

                expect(result).to.be.ok;
                expect(result).to.equal('bob one bob two');
            }
            catch (err) {
                assert.ok(false, 'Should not have thrown error: ' + err.message);
            }
        });

        it('should throw error if it cant find dependency', function () {
            var err;
            try {
                container.get('one');
            }
            catch (e) {
                err = e;
            }

            expect(err).to.be.ok;
            expect(err.message).to.equal('Dependency "one" was not registered');
        });

        it('should throw error if it cant find dependency of dependency', function () {
            container.register('one', function (two) {
                return 'one';
            });

            var err;
            try {
                container.get('one');
            }
            catch (e) {
                err = e;
            }

            expect(err).to.be.ok;
            expect(err.message).to.equal('Dependency "two" was not registered');
        });

        it('should inject the container (_container)', function () {
            assert.equal(container.get('_container'), container);
        });
    });

    describe('resolve()', function () {
        it('should exist', function () {
            expect(container.resolve).to.be.ok;
            expect(container.resolve).to.be.a('function');
        });

        it('should let you get multiple dependencies at once, injector style', function (done) {
            container.register('name', function () {
                return 'bob';
            });
            container.register('one', function (name) {
                return name + ' one';
            });
            container.register('two', function (name) {
                return name + ' two';
            });

            container.resolve(function (one, two) {
                assert.ok(one);
                assert.ok(two);
                assert.equal(one, 'bob one');
                assert.equal(two, 'bob two');

                expect(one).to.be.ok;
                expect(two).to.be.ok;

                expect(one).to.equal('bob one');
                expect(two).to.equal('bob two');

                done();
            });
        });
    });

    describe('list()', function () {
        it('should exist', function () {
            expect(container.list).to.be.ok;
            expect(container.list).to.be.a('function');
        });

        it('should list dependencies registered', function () {
            container.register('one', function (name) {
                return name + ' one';
            });
            container.register('two', function (name) {
                return name + ' two';
            });

            var list = container.list();

            expect(list.one.func('1')).to.equal('1 one');
            expect(list.two.func('2')).to.equal('2 two');
        });
    });

    describe('clearAll()', function () {
        /**
         * Get a object list's length.
         *
         * @param {object} list
         *
         * @return {number}
         */
        var listLength = function (list) {
            return Object.keys(list).length;
        };

        it('should exist', function () {
            expect(container.clearAll).to.be.ok;
            expect(container.clearAll).to.be.a('function');
        });

        it('should do nothing on a initial empty container', function () {
            // NOTICE: there is always one element in the container: the container itself under the key "_container".
            expect(listLength(container.list())).to.be.equal(1);

            container.clearAll();

            expect(listLength(container.list())).to.be.equal(1);
        });

        it('should clear the container', function () {
            container.register('foo', 'bar');
            container.register('num', 124);
            container.register('bool', true);
            container.register('fnc', function () {
                return 'text';
            });

            expect(listLength(container.list())).to.be.not.equal(1);

            container.clearAll();

            expect(listLength(container.list())).to.be.equal(1);
        });
    });
});
