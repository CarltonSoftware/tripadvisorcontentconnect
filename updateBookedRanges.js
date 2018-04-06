var TripAdvisorClient = require('./TripAdvisorClient.js').getInstance();
var Tabs2 = require('./Tabs2.js');

module.exports = {
  /**
   * @return {String} AccountReference
   * @return {String} ListingReference
   * @return {Tabs2.client.common.PropertyBranding} PropertyBranding
   *
   * @return {Object}
   */
  _updateBookedRanges: (AccountReference, ListingReference, PropertyBranding) => {
    return Tabs2.getPropertyBookedRanges(PropertyBranding).then(function(bps) {
      return TripAdvisorClient._put(
        [AccountReference, ListingReference, 'availability'].join('/'),
        { body: { calendar: bps } }
      );
    });
  },

  /**
   * Update the booked ranges for a property on TripAdvisor
   *
   * @return {String} AccountReference
   * @return {String} ListingReference
   * @return {Tabs2.client.common.PropertyBranding} PropertyBranding
   *
   * @return {Promise}
   */
  updateBookedRanges: (AccountReference, ListingReference, PropertyBranding) => {
    return Tabs2.getPropertyBookedRanges(PropertyBranding).then(function(bps) {
      return TripAdvisorClient.put(
        [AccountReference, ListingReference, 'availability'].join('/'),
        { body: { calendar: bps } }
      );
    });
  }
}