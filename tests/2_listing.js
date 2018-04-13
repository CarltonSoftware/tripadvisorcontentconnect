var assert = require('chai').assert;
var tr = require('../TripAdvisorClient').getInstance();
var Listing = require('../Listing');
var given = require('mocha-testdata').given;

describe('Test Listing Errors', function() {
  var l2 = new Listing();
  it('Check new listing throws correct path', function() {
    assert.throw(function() {
      l2.getPath()
    }, Error, 'Path not specified');
  });

  var l3 = new Listing();
  l3.setAccount('ABC');
  it('Check new listing throws correct id error', function() {
    assert.throw(function() {
      l3.getPath()
    }, Error, 'ID not specified');
  });
});

describe('Test new Listing', function() {
  var l = new Listing('ABC', '123');
  it('Check listing has correct account and id', function() {
    console.assert(l.getPath() === 'ABC/123');
    console.assert(l.path() === 'ABC');
    console.assert(l.id() === '123');
  });

  // Set data
  l.setMaxOccupancy(4)
    .setBedroomsByNumber(2, 1)
    .addPhoto('http://via.placeholder.com/400x400')
    .setAddress('Bank House, Market Place, Reepham, GB')
    .setPostalCode('NR10 4JJ')
    .setLongitude(1.2345)
    .setLatitude(5.4321);

  var shouldBe = [
    { accessor: 'details.propertyType', value: 'COTTAGE' },
    { accessor: 'details.maxOccupancy', value: 4 },
    { accessor: 'details.bedrooms', value: [{ beds: [ 'DOUBLE_BED' ]}, { beds: [ 'DOUBLE_BED' ]}, { beds: [ 'SINGLE_BED' ]}] },
    { accessor: 'photos', value: [ { externalPhotoReference: 'http://via.placeholder.com/400x400', url: 'http://via.placeholder.com/400x400', caption: '' } ] },
    { accessor: 'address.address', value: 'Bank House, Market Place, Reepham, GB' },
    { accessor: 'address.postalCode',value: 'NR10 4JJ' },
    { accessor: 'address.longitude', value: 1.2345 },
    { accessor: 'address.latitude', value: 5.4321 },
    { accessor: 'address', value: { address: 'Bank House, Market Place, Reepham, GB', postalCode: 'NR10 4JJ', latitude: 5.4321, longitude: 1.2345, showExactAddress: true } }
  ];

  given(shouldBe).it('Check value equals accessor', function(item) {
    var val = eval('l.toArray().' + item.accessor);

    if (Array.isArray(val) && Array.isArray(item.value)) {
      console.assert(JSON.stringify(val) === JSON.stringify(item.value));
    } else if (typeof val === 'object' && typeof item.value === 'object') {
      console.assert(JSON.stringify(val) === JSON.stringify(item.value));
    } else {
      console.assert(val === item.value);
    }
  });
});