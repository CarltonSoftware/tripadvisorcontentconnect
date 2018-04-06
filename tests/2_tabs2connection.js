var Tabs2 = require('../Tabs2.js');
var platoJsClient = require('plato-js-client');
var data = require('./data.js');
var update = require('../updateBookedRanges.js');
var client = require('../TripAdvisorClient.js');

describe('check tabs2 connection', function() {
  it('Check connect function', function() {
    console.assert(typeof Tabs2.connect === 'function');
  });
  it('Check client function', function() {
    console.assert(typeof Tabs2.client === 'function');
  });
  it('Check check function', function() {
    console.assert(typeof Tabs2.check === 'function');
  });
  it('Check check function equals false', function() {
    console.assert(Tabs2.check() === false);
  });

  after(function() {
    describe('create tabs2 connection', function() {
      it('Connect to the tabs2 api', function() {
        return Tabs2.connect(
          process.env.APIURL,
          process.env.APIUSER,
          process.env.APIUSERPASSWORD,
          process.env.APIKEY,
          process.env.APISECRET
        ).then((t) => {
          console.assert(Tabs2.check() === true);
        });
      });

      after(function() {
        describe('check tabs2 api functions', function() {
          it('Get the titles endpoint', function() {
            let c = new platoJsClient.Collection({
              object: platoJsClient.common.Title,
              path: 'title'
            });

            return c.fetch().then(function(titles) {
              console.assert(titles instanceof platoJsClient.Collection);
              console.assert(Array.isArray(titles.collection));
            });
          });

          it('Test getting booking periods and is an array', function() {
            Tabs2.getPropertyBookedRanges(data.PropertyBranding).then(function(bookingPeriods) {
              console.assert(Array.isArray(bookingPeriods));
            });
          });

          after(function() {
            describe('check update booking ranges on httpbin', function() {
              it('Check data is correct', function() {
                var tr = client.connect({
                  base_url: 'https://httpbin.org/put',
                  client_id: 123,
                  secret: 'abc'
                });
                update._updateBookedRanges(12345, 67890, data.PropertyBranding).then(function(data) {
                  console.assert(data.uri === 'https://httpbin.org/put/12345/67890/availability');
                });
              });
            });
          });
        });
      });
    });
  });
});