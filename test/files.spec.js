var path = require('path');
var assert = require('assert');
var container = require('../source/index').container;

describe('File Names', function () {
    it('should load files with dashes in a sane way', function (done) {
        var deps = container();

        var dashedFileUser = function (roflCoptor) {
            assert.ok(roflCoptor);
            done();
        };

        deps.load(path.join(__dirname, 'test-files'));
        deps.register('dashedFileUser', dashedFileUser);
        var getResult = deps.get('dashedFileUser');
    });
});
