/**
 * @author Michael Raith
 * @email  michael.raith@bcmsolutions.de
 * @date   02.06.2015 11:38
 */

var container = require('../source/index').container;
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');

/**
 * NOTICE: this file was automatically converted from Coffeescript back to pure JavaScript.
 */
describe('inject', function () {
    var testFiles = [];

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
        var deps = container();

        assert.ok(deps);
    });

    it('should return module without deps', function () {
        var Abc = function () {
            return 'abc';
        };

        var deps = container();
        deps.register('abc', Abc);
        
        assert.equal(deps.get('abc'), 'abc');
    });

    it('should get a single dependency', function () {
        var Stuff = function (names) {
            return names[0];
        };

        var Names = function () {
            return ['one', 'two'];
        };

        var deps = container();
        deps.register('stuff', Stuff);
        deps.register('names', Names);

        assert.equal(deps.get('stuff'), 'one');
    });

    it('should resovle multiple dependencies', function () {
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

        var deps = container();
        deps.register('Post', post);
        deps.register('Users', users);
        deps.register('Comments', comments);

        var PostClass = deps.get('Post');

        var apost = new PostClass([
            {
                text: 'woot'
            }
        ], {
            name: 'bob'
        });

        assert.equal(apost.authorName(), 'bob');
        assert.equal(apost.firstCommentText(), 'woot');
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

        var deps = container();
        deps.register('name', name);
        deps.register('people', people);
        deps.register('places', places);

        var peopleDb = db({});
        var placesDb = db({});
        var peoplez = deps.get('people', {
            db: peopleDb
        });
        var placez = deps.get('places', {
            db: placesDb
        });

        assert.equal(peoplez.name, 'bob');
        assert.equal(placez.name, 'bob');

        peoplez.add({
            name: 'one'
        });
        placez.add({
            name: 'two'
        });

        assert.ok(peoplez.find('one'));
        assert.ok(!placez.find('one'));
        assert.ok(placez.find('two'));
        assert.ok(!peoplez.find('two'));
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
                age: dad.age - 20
            };
        };

        var deps = container();
        deps.register('gpa', gpa);
        deps.register('dad', dad);
        deps.register('son', son);

        var ason = deps.get('son');

        assert.equal(ason.age, 46);
    });

    it('should throw error on circular dependency', function () {
        var one = function (two) {
            return two + 1;
        };

        var two = function (one) {
            return one + 2;
        };

        var deps = container();
        deps.register('one', one);
        deps.register('two', two);

        var err;
        try {
            deps.get('one');
        }
        catch (e) {
            err = e;
        }

        assert.ok(err.toString().match(/circular dependency/i));
    });

    it('should NOT throw circular dependency error if two modules require the same thing', function () {
        var deps = container();

        deps.register('name', function () {
            return 'bob';
        });
        deps.register('one', function (name) {
            return name + ' one';
        });
        deps.register('two', function (name) {
            return name + ' two';
        });
        deps.register('all', function (one, two) {
            return one.name + ' ' + two.name;
        });

        try {
            deps.get('all');
        }
        catch (e) {
            assert.ok(false, 'should not have thrown error');
        }
    });

    it('should list dependencies registered', function () {
        var deps = container();

        deps.register('one', function (name) {
            return name + ' one';
        });
        deps.register('two', function (name) {
            return name + ' two';
        });

        var list = deps.list();

        assert.equal(list.one.func('1'), '1 one');
        assert.equal(list.two.func('2'), '2 two');
    });

    it('should throw error if it cant find dependency', function () {
        var deps = container();

        var err;
        try {
            deps.get('one');
        }
        catch (e) {
            err = e;
        }

        assert.ok(err);
    });

    it('should throw error if it cant find dependency of dependency', function () {
        var deps = container();

        deps.register('one', function (two) {
            return 'one';
        });

        var err;
        try {
            deps.get('one');
        }
        catch (e) {
            err = e;
        }

        assert.ok(err);
    });

    it('should let you get multiple dependencies at once, injector style', function (done) {
        var deps = container();

        deps.register('name', function () {
            return 'bob';
        });
        deps.register('one', function (name) {
            return name + ' one';
        });
        deps.register('two', function (name) {
            return name + ' two';
        });

        deps.resolve(function (one, two) {
            assert.ok(one);
            assert.ok(two);
            assert.equal(one, 'bob one');
            assert.equal(two, 'bob two');

            done();
        });
    });

    it('should return the SAME instance to everyone', function () {
        var deps = container();

        deps.register('asdf', function () {
            return {
                woot: 'hi'
            };
        });
        deps.register('a', function (asdf) {
            return asdf.a = 'a';
        });
        deps.register('b', function (asdf) {
            return asdf.b = 'b';
        });

        var asdf = deps.get('asdf');
        var a = deps.get('a');
        var b = deps.get('b');

        assert.equal(asdf.a, 'a');
        assert.equal(asdf.b, 'b');
    });

    it('should inject the container (_container)', function () {
        var deps = container();

        assert.equal(deps.get('_container'), deps);
    });

    describe('cache', function () {
        it('should re-use the same instance', function () {
            var deps = container();

            deps.register('a', function () {
                return {
                    one: 'one'
                };
            });

            var a = deps.get('a');

            assert.deepEqual(a, {
                one: 'one'
            });
            assert.notEqual(a, {
                one: 'one'
            });

            var a2 = deps.get('a');

            assert.equal(a, a2);
        });
    });

    describe('overrides', function () {
        it('should override a dependency', function () {
            var deps = container();

            deps.register('a', function (b) {
                return {
                    value: b
                };
            });
            deps.register('b', 'b');

            var a = deps.get('a', {
                b: 'henry'
            });

            assert.equal(a.value, 'henry');
        });

        it('should not cache when you override', function () {
            var deps = container();

            deps.register('a', function (b) {
                return {
                    value: b
                };
            });
            deps.register('b', 'b');

            var overriddenA = deps.get('a', {
                b: 'henry'
            });

            var a = deps.get('a');

            assert.notEqual(a.value, 'henry', 'it cached the override value');
            assert.equal(a.value, 'b');
        });

        it('should ignore the cache when you override', function () {
            var deps = container();

            deps.register('a', function (b) {
                return {
                    value: b
                };
            });
            deps.register('b', 'b');

            var a = deps.get('a');
            var overriddenA = deps.get('a', {
                b: 'henry'
            });

            assert.notEqual(overriddenA.value, 'b', 'it used the cached value');
            assert.equal(overriddenA.value, 'henry');
        });

        it('should override on resolve', function (done) {
            var deps = container();

            deps.register('a', function (b) {
                return {
                    value: b
                };
            });
            deps.register('b', 'b');

            deps.resolve({
                b: 'bob'
            }, function (a) {
                assert.equal(a.value, 'bob');
                done();
            });
        });
    });

    describe('file helpers', function () {
        it('should let you register a file', function (done) {
            var afile = path.join(os.tmpDir(), "A.js");
            var acode = "module.exports = function() { return 'a' }";
            testFiles.push(afile);

            var bfile = path.join(os.tmpDir(), "B.js");
            var bcode = "module.exports = function(A) { return A + 'b' }";
            testFiles.push(bfile);

            fs.writeFile(afile, acode, function (err) {
                assert.ifError(err);

                var deps = container();
                var loadResult = deps.load(afile);

                var a = deps.get('A');
                assert.equal(a, 'a');

                fs.writeFile(bfile, bcode, function (err) {
                    assert.ifError(err);

                    deps.load(bfile);
                    var b = deps.get('B');
                    assert.equal(b, 'ab');

                    done();
                });
            });
        });

        it('should let you register a whole directory', function (done) {
            var dir = path.join(os.tmpDir(), 'testinject');

            var afile = path.join(dir, "A.js");
            var acode = "module.exports = function() { return 'a' }";
            testFiles.push(afile);

            var bfile = path.join(dir, "B.js");
            var bcode = "module.exports = function(A) { return A + 'b' }";
            testFiles.push(bfile);

            fs.mkdir(dir, function (err) {
                fs.writeFile(afile, acode, function (err) {
                    assert.ifError(err);

                    fs.writeFile(bfile, bcode, function (err) {
                        assert.ifError(err);

                        var deps = container();
                        deps.load(dir);

                        var b = deps.get('B');
                        assert.equal(b, 'ab');

                        done();
                    });
                });
            });
        });

        it('should let you load a file without an extension');

        it('should load a folder with a file with parse errors without accidentally trying to load the folder as a file');

        it('should not crash if trying to load something as a file without an extension (crashed on fs.stat)');

        // NOTICE: this test does not work. We need to load every module to read the module's dependencies!
        xit('should be lazy', function (done) {
            var dir = path.join(os.tmpDir(), 'testinject');

            var cfile = path.join(dir, "C.js");
            var ccode = "throw new Error('Should not be loaded because we do not require it');";
            testFiles.push(cfile);

            var dfile = path.join(dir, "D.js");
            var dcode = "module.exports = function() { return 'd'; };";
            testFiles.push(dfile);

            fs.mkdir(dir, function (err) {
                fs.writeFile(cfile, ccode, function (err) {
                    assert.ifError(err);

                    fs.writeFile(dfile, dcode, function (err) {
                        assert.ifError(err);

                        var deps = container();
                        deps.load(dir);

                        assert.equal('d', deps.get('D'));
                        done();
                    });
                });
            });
        });
    });

    describe('simple dependencies', function () {
        it('doesnt have to be a function. objects work too', function () {
            var deps = container();
            deps.register('a', 'a');

            assert.equal(deps.get('a'), 'a');
        });
    });
    
    describe('registering a hash', function () {
        it('should register a hash of key : dep pairs', function () {
            var deps = container();
            deps.register({
                a: 'a',
                b: 'b'
            });

            assert.equal(deps.get('a'), 'a');
            assert.equal(deps.get('b'), 'b');
        });
    });
    
    describe('nested containers', function () {
        it('should inherit deps from the parent');
    });
    
    describe('maybe', function () {
        it('should support objects/data instead of functions?');
        it('should support optional dependencies?');
    });
});