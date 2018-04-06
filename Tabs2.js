var platoJsClient = require('plato-js-client');
var client = platoJsClient.client.getInstance();

module.exports = {

  /**
   * Connect to the api and return a client instance
   *
   * @param {String} host
   * @param {String} username
   * @param {String} password
   * @param {String} clientId
   * @param {String} clientSecret
   *
   * @return {platoJsClient.client}
   */
  connect: (host, username, password, clientId, clientSecret) => {
    return client.setInstance({
      apiRoot: host,
      clientId: clientId,
      apiPrefix: '/v2'
    }).authenticate(username, password, clientSecret);
  },

  /**
   * Check if the client has a token
   *
   * @return {boolean}
   */
  check: () => {
    return typeof client.getToken() === 'string';
  },

  /**
   * Return the client instance
   *
   * @return {platoJsClient.client}
   */
  client: () => {
    return client;
  },

  /**
   * Get the booked ranges array
   *
   * @param {platoJsClient.common.PropertyBranding}
   *
   * @return {Array}
   */
  getPropertyBookedRanges: (PropertyBranding) => {
    return PropertyBranding.getAvailability().then(function(collection) {
      let bookingPeriods = [],
        start = null,
        end = null;

      collection.forEach(function(a) {
        if (a.daysavailable === 0) {
          if (start === null) {
            start = a.date;
          }
          end = a.date;
        } else {
          if (start) {
            bookingPeriods.push({
              start: start,
              end: end
            });
          }

          start = null;
          end = null;
        }
      })
      
      return bookingPeriods;
    });
  }
}