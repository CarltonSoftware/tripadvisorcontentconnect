var assert = require('chai').assert;
var tr = require('../TripAdvisorClient').getInstance();
var Entity = require('../Entity');

describe('Test Entity', function() {
  it('Check get without path throws an error', function() {
    var e = new Entity();
    assert.throws(e.get, Error, 'Path not specified');
  });
  it('Check update without id throws an error', function() {
    var e = new Entity('path');
    assert.throws(e.update, Error, 'ID not specified');
  });
});