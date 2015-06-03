var path = require('path');
global.chai = require('chai');
global.sinon = require('sinon');
global.expect = chai.expect;
global.srcDir = path.resolve(__dirname, '../source');

process.env.NODE_ENV = 'test';

process.setMaxListeners(1000);
