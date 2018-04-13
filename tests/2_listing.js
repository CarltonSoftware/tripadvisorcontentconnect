var assert = require('chai').assert;
var tr = require('../src/TripAdvisorClient').getInstance();
var Listing = require('../src/Listing');
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


  it('Check seasonal rate throws an error', function() {
    assert.throw(function() {
      l3.addSeasonalRate({ name: 'Winter', startDate: '2010-01-01', endDate: '2010-01-02', nightlyRate: 100, minimumStay: 7 });
    }, Error, 'Some season rate keys are missing: weeklyRate');
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
    .addPhoto('http://via.placeholder.com/100x400')
    .addPhoto('http://via.placeholder.com/200x400')
    .addPhoto('http://via.placeholder.com/300x400')
    .addPhoto('http://via.placeholder.com/400x400', 'Caption')
    .setAddress('Bank House, Market Place, Reepham, GB')
    .setPostalCode('NR10 4JJ')
    .setLongitude(1.2345)
    .setLatitude(5.4321)
    .setTitle('Cottage title')
    .setDescription('Lorem ipsum dolor sit amet, consectetur adipiscing elite')
    .setToilets(2)
    .setShowers(1)
    .setDefaultRate({ nightlyRate: 100, minimumStay: 7, weeklyRate: 700 });

  var shouldBe = [
    { accessor: 'details.propertyType', value: 'COTTAGE' },
    { accessor: 'details.bathrooms', value: [{ bathroomType: 'TOILET'}, { bathroomType: 'TOILET'}, { bathroomType: 'SHOWER'}] },
    { accessor: 'details.maxOccupancy', value: 4 },
    { accessor: 'descriptions.listingTitle', value: 'Cottage title' },
    { accessor: 'descriptions.rentalDescription', value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elite' },
    { accessor: 'details.bedrooms', value: [{ beds: [ 'DOUBLE_BED' ]}, { beds: [ 'DOUBLE_BED' ]}, { beds: [ 'SINGLE_BED' ]}] },
    { accessor: 'photos[0]', value: { externalPhotoReference: 'http://via.placeholder.com/100x400', url: 'http://via.placeholder.com/100x400', caption: '' } },
    { accessor: 'photos[1]', value: { externalPhotoReference: 'http://via.placeholder.com/200x400', url: 'http://via.placeholder.com/200x400', caption: '' } },
    { accessor: 'photos[2]', value: { externalPhotoReference: 'http://via.placeholder.com/300x400', url: 'http://via.placeholder.com/300x400', caption: '' } },
    { accessor: 'photos[3]', value: { externalPhotoReference: 'http://via.placeholder.com/400x400', url: 'http://via.placeholder.com/400x400', caption: 'Caption' } },
    { accessor: 'address.address', value: 'Bank House, Market Place, Reepham, GB' },
    { accessor: 'address.postalCode',value: 'NR10 4JJ' },
    { accessor: 'address.longitude', value: 1.2345 },
    { accessor: 'address.latitude', value: 5.4321 },
    { accessor: 'address', value: { address: 'Bank House, Market Place, Reepham, GB', postalCode: 'NR10 4JJ', latitude: 5.4321, longitude: 1.2345, showExactAddress: true } },
    { accessor: 'rates.defaultRate', value: { nightlyRate: 100, minimumStay: 7, weeklyRate: 700 } }
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