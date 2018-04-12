let rp = require('request-promise-native');
let l = require('locutus');
let CryptoJS = require('crypto-js');
let toISOString = require('to-iso-string');

let TripAdvisorClient = (() => {
  let instance,
    options = {
      base_url: 'https://rentals.tripadvisor.com/api/property/v1',
      client_id: '',
      secret: '',
      returnRequestBody: false,
      resolveWithFullResponse: false
    };

  function createInstance(args) {
    if (typeof args === 'object') {
      for (let i in args) {
        if (Object.keys(options).indexOf(i) >= 0) {
          options[i] = args[i];
        }
      }
    }

    /**
     * @param {String} url
     * @param {String} part
     * @param {String} def

     * @return {String}
     */
    let _parse_url = (url, part, def) => {
      if (!url) {
        url = '';
      }
      url = l.php.url.parse_url(url);
      if (!url[part]) {
        url[part] = def;
      }

      return url[part];
    };

    /**
     * @param {String} url

     * @return {String}
     */
    let _path = (url) => {
      return _parse_url(url, 'path', '');
    };

    /**
     * @param {String} url

     * @return {String}
     */
    let _query = (url) => {
      return _parse_url(url, 'query', '');
    };

    /**
     * @param {String} method
     * @param {String} url
     * @param {String} params
     * @param {String} body
     * @param {String} ts

     * @return {String}
     */
    let _signature = (method, url, params, body, ts) => {
      let hash = CryptoJS.SHA512(
        [
          method,
          _path(url),
          params,
          ts,
          CryptoJS.SHA512(body)
        ].join("\n")
      ).toString().toLowerCase();

      let sig = CryptoJS.HmacSHA512(hash, getOptions().secret).toString();

      return sig;
    };

    /**
     * @param {String} method
     * @param {String} url
     * @param {String} params
     * @param {String} body

     * @return {String}
     */
    let _auth_header = (method, url, params, body) => {
      let ts = timestamp();

      return [
        'VRS-HMAC-SHA512 timestamp=' + ts,
        'client=' + getOptions().client_id,
        'signature=' + _signature(method, url, params, body, ts)
      ].join(', ');
    };

    /**
     * @param {String} method
     * @param {String} url
     * @param {Object} params
     * @param {Object} body

     * @return {String}
     */
    let _request = (method, url, params, body) => {
      let _url = base_url(_path(url));

      if (typeof params !== 'object') {
        params = {};
      }

      if (typeof body !== 'object') {
        body = {};
      }

      var r = {
        uri: _url,
        method: method,
        qs: params,
        headers: {
          'Authorization': _auth_header(
            method,
            _url,
            l.php.url.http_build_query(params),
            (Object.keys(body).length > 0) ? JSON.stringify(body) : ''
          ),
          'Content-Type': 'application/json'
        }
      };

      if (getOptions().resolveWithFullResponse === true || method !== 'GET') {
        r.resolveWithFullResponse = true;
      } else {
        r.json = true;
      }

      if (Object.keys(body).length > 0) {
        r.body = JSON.stringify(body);
      }

      return r;
    };

    /**
     * Perform the request
     *
     * @param {Object}  request
     * @param {Boolean} returnRequestBody
     *
     * @return {Object|Promise}
     */
    let _doRequest = (request, returnRequestBody) => {
      if (returnRequestBody === true || getOptions().returnRequestBody === true) {
        return request;
      }

      return rp(request);
    }

    /**
     * @return {Object}
     */
    this.getOptions = () => {
      return options;
    };

    /**
     * @param {String} url
     *
     * @return {String}
     */
    this.base_url = (url) => {
      if (!url) {
        url = '';
      }

      var parts = [getOptions().base_url];
      if (url.length > 0) {
        parts.push(url);
      }

      return parts.join('/');
    };

    /**
     * @return {String}
     */
    this.timestamp = () => {
      let d = new Date();
      return toISOString(d);
    };

    /**
     * Get a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this.get = (url, params) => {
      return _get(
        url,
        params
      );
    };

    /**
     * Get a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this._get = (url, params) => {
      return _doRequest(
        _request(
          'GET',
          url,
          (params) ? params.query : undefined
        ),
        (params) ? params.returnRequestBody : undefined
      );
    };

    /**
     * Put data to a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this.put = (url, params) => {
      return _put(
        url,
        params
      );
    };

    /**
     * Put data to a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this._put = (url, params) => {
      return _doRequest(
        _request(
          'PUT',
          url,
          (params) ? params.query : undefined,
          (params) ? params.body : undefined
        ),
        (params) ? params.returnRequestBody : undefined
      );
    };

    /**
     * Delete data to a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this.delete = (url, params) => {
      return _delete(url, params);
    };

    /**
     * Delete data to a url
     *
     * @param {String} url
     * @param {Object} params
     *
     * @return {Promise}
     */
    this._delete = (url, params) => {
      return _doRequest(
        _request(
          'DELETE',
          url,
          (params) ? params.query : undefined,
          (params) ? params.body : undefined
        ),
        (params) ? params.returnRequestBody : undefined
      );
    };

    return this;
  };

  return {
    getInstance(options) {
      if (!instance) {
        return this.connect(options);
      }
      return instance;
    },

    connect(options) {
      instance = createInstance(options);
      return instance;
    }
  };
})();

module.exports = TripAdvisorClient;
