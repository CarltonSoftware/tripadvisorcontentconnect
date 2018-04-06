var client = require('../TripAdvisorClient.js');
var options = { client_id: process.env.ta_client_id, secret: process.env.ta_secret };
var tr;

describe('check connection', function() {
  it('try out new connection', function() {
    tr = client.connect(options);
    for (var i in options) {
      it('Check ' + i, function() {
        console.assert(tr.getOptions()[i] === options[i]);
      });
    }
  });
  it('try get', function() {
    this.timeout(15000);
    return tr.get().then((json) => {
      console.assert(Array.isArray(json));
    }, (err) => {
      //console.log(err);
    });
  });
});