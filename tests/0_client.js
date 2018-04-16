var dotenv = require('dotenv');

if (process.env && process.env.NODE_ENV) {
  dotenv.config({ path: '.env.' + process.env.NODE_ENV });
} else {
  dotenv.config();
}


var client = require('../src/TripAdvisorClient');
var options = { client_id: 'ABC', secret: 'XYZ' };
var tr = client.connect(options);

describe('test required functions', function() {
  let funcs = [
    'getInstance'
  ];

  for (var i in funcs) {
    it(funcs[i] + ' is a function', function() {
      console.assert(typeof client[funcs[i]] === 'function');
    }); 
  }
});

describe('test client options', function() {
  for (var i in options) {
    it('Check ' + i, function() {
      console.assert(tr.getOptions()[i] === options[i]);
    });
  }
});

describe('test base_url', function() {
  it('Check base_url', function() {
    console.assert(tr.base_url() === 'https://rentals.tripadvisor.com/api/property/v1');
  });
});

describe('test timestamp', function() {
  it('Check timestamp', function() {
    console.assert(tr.timestamp().slice(-1) === 'Z');
  });
});

describe('check requests', function() {
  it('Check _get request object', function() {
    console.assert(tr._get('abc', { returnRequestBody: true }).uri === (tr.base_url() + '/abc'));
  });
  it('Check _get request object with params', function() {
    console.assert(tr._get('abc', { returnRequestBody: true, query: { foo: 'bar' } }).qs.foo === 'bar');
  });
  it('Check _put request object', function() {
    console.assert(JSON.parse(tr._put('abc', { returnRequestBody: true, body: { body: '123' } }).body).body === '123');
  });
});