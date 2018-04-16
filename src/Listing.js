var Entity = require('./Entity');
var Errors = require('./Errors');
var locutus = require('locutus');

function Listing(accountId, listingId) {
  let account = accountId;
  let id = listingId;
  let bookedRanges = [];
  let defaultRate = {
    nightlyRate: 0,
    minimumStay: 3,
    weeklyRate: 0
  };
  let seasonalRates = [];
  let weekendType = 'FRIDAY_SATURDAY_SUNDAY';

  this.features = [];
  this.nearbyAmenities = [];
  this.guestRequirements = [];


  let details = {
    bedsOutsideBedrooms: [],
    bedrooms: [],
    bathrooms: [],
    maxOccupancy: 1,
    checkInTime: 'FLEXIBLE',
    checkOutTime: 'FLEXIBLE',
    carRequired: 'REQUIRED'
  };
  let photos = [];
  let descriptions = {
    listingTitle: '',
    rentalDescription: '',
    gettingThere: null,
    furtherDetails: null,
    furtherDetailsIndoors: null,
    furtherDetailsOutdoors: null,
    searchSummary: null,
    describeTheArea: null,
    describeTheDestination: null
  };
  let address = {
    address: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    showExactAddress: true
  };
  let bookingPolicies = {
    additionalHouseRules: '',
    cancellationPolicy: 'MODERATE',
    daysTillQuoteExpires: 7,
    paymentOptions: {
      paymentScheduleType: 'FULL_PAYMENT',
      splitPaymentPercentage: null,
      splitPaymentDaysBeforeArrival: null
    },
    rentalAgreement: {
      useCustomAgreement: false
    }
  };

  let _set = (variable, key, value) => {
    if (typeof value === 'string') {
      value = '"' + value.split('\n').join('\\n') + '"';
    }

    eval(variable + '["' + key + '"] = ' + value + ';');
    return this;
  };

  this._setObject = (variable, key, value) => {
    if (typeof this['set' + locutus.php.strings.ucfirst(key)] === 'function') {
      return this['set' + locutus.php.strings.ucfirst(key)](value);
    } else {
      return _set(variable, key, value);
    }
  };

  this.setWeekendType = (type) => {
    if (typeof type !== 'string' || ['NONE', 'FRIDAY_SATURDAY', 'SATURDAY_SUNDAY', 'FRIDAY_SATURDAY_SUNDAY'].indexOf(type.toUpperCase()) < 0) {
      throw new Errors.GeneralError('Weekend Type invalid');
    }
    weekendType = type.toUpperCase();
    return this;
  };

  this.getWeekendType = () => {
    return weekendType;
  };

  /**
   * Return the account id
   *
   * @return {String}
   */
  this.getAccount = () => {
    return account;
  };

  /**
   * Set the account
   *
   * @param {String} a
   *
   * @return {Listing}
   */
  this.setAccount = (a) => {
    account = a;
    return this;
  };

  /**
   * Return the listing id
   *
   * @return {String}
   */
  this.id = () => {
    return id;
  };

  /**
   * Set the id
   *
   * @param {String} identifier
   *
   * @return {Listing}
   */
  this.setId = function(identifier) {
    id = identifier;
    return this;
  };

  let _validateChangeoverDay = (cd) => {
    if (['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'FLEXIBLE'].indexOf(cd.toUpperCase()) < 0) {
      throw new Errors.GeneralError('Specified changeover day is invalid.');
    } else {
      return true;
    }
  }

  /**
   * Set the default rate
   *
   * @param {Object} rate
   *
   * @return {Listing}
   */
  this.setDefaultRate = (rate) => {
    if (!typeof rate === 'object' || !rate) {
      return this;
    }
    var requiredFields = ['minimumStay'];
    var optionalFields = ['monthlyRate', 'weekendRate', 'additionalGuestFeeThreshold', 'additionalGuestFeeAmount'];

    if (typeof rate.nightlyRate === 'undefined') {
      requiredFields.push('weeklyRate');
    } else {
      requiredFields.push('nightlyRate');
    }
    if (typeof rate.weeklyRate === 'undefined') {
      requiredFields.push('nightlyRate');
    } else {
      requiredFields.push('weeklyRate');
    }
    for (var i in requiredFields) {
      if (typeof rate[requiredFields[i]] !== 'undefined') {
        _set('defaultRate', requiredFields[i], rate[requiredFields[i]]);
      } else {
        throw new Errors.GeneralError(requiredFields[i] + ' missing from defaultRate');
      }
    }

    for (var i in optionalFields) {
      if (rate[optionalFields[i]]) {
        _set('defaultRate', optionalFields[i], rate[optionalFields[i]]);
      }
    }

    if (typeof rate.changeoverDay === 'string') {
      if (_validateChangeoverDay(rate.changeoverDay)) {
        _set('defaultRate', 'changeoverDay', rate.changeoverDay.toUpperCase());
      }
    }

    return this;
  };

  /**
   * Get the default rate
   *
   * @return {Object}
   */
  this.getDefaultRate = () => {
    return defaultRate;
  };

  this.setSeasonalRates = (_seasonalRates) => {
    seasonalRates = [];

    for (var i in _seasonalRates) {
      this.addSeasonalRate(_seasonalRates[i]);
    }

    return this;
  };

  /**
   * Add a seasonal rate
   *
   * @param {Object} data - Containing keys :
   *  - name
   *  - startDate
   *  - endDate
   *  - nightlyRate
   *  - weeklyRate
   *  - monthlyRate
   *  - minimumStay
   *  - changeoverDay (optional but one of SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, FLEXIBLE)
   *
   * @return {Listing}
   */
  this.addSeasonalRate = (data) => {
    var minimumStay = 7;
    var required = ['name', 'startDate', 'endDate', 'minimumStay'];
    var optional = ['additionalGuestFeeThreshold', 'additionalGuestFeeAmount'];
    if (data.minimumStay) { 
      minimumStay = data.minimumStay;
    }

    if (minimumStay < 7) {
      required.push('nightlyRate');
      required.push('weeklyRate');
      optional.push('monthlyRate');
    } else if (minimumStay < 30) {
      required.push('weeklyRate');
      optional.push('nightlyRate');
      optional.push('monthlyRate');
    } else if (minimumStay > 30) {
      required.push('monthlyRate');
      optional.push('nightlyRate');
      optional.push('weeklyRate');
    }

    var rate = {};
    for (var i in required) {
      if (typeof data[required[i]] !== 'undefined') {
        rate[required[i]] = data[required[i]];
        delete required[i];
      }
    }

    required = required.filter((e) => {
      return e !== undefined;
    });

    if (required.length > 0) {
      throw new Errors.GeneralError('Some season rate keys are missing: ' + required.join(', '));
    }

    for (var i in optional) {
      if (typeof data[optional[i]] !== 'undefined') {
        rate[optional[i]] = data[optional[i]];
      }
    }

    if (typeof data.changeoverDay === 'string') {
      if (_validateChangeoverDay(data.changeoverDay)) {
        rate.changeoverDay = data.changeoverDay.toUpperCase(); 
      }
    }

    seasonalRates.push(rate);
    return this;
  };

  /**
   * Get the seasonal rates
   *
   * @return {Array}
   */
  this.getSeasonalRates = () => {
    return seasonalRates;
  };

  /**
   * Get bedrooms array
   *
   * @return {Array}
   */
  this.getBedrooms = () => {
    return details.bedrooms;
  };

  let _addBedroom = (beds) => {
    for (var i in beds) {
      this.validateBedType(beds[i]);
    }
    details.bedrooms.push({ beds: beds });
  };

  /**
   * Set bedrooms with an array
   * This will mainly be called by get();
   *
   * @param {Array} bedrooms
   *
   * @return {Listing}
   */
  this.setBedrooms = (bedrooms) => {
    for (var i in bedrooms) {
      _addBedroom(bedrooms[i].beds);
    }

    return this;
  };

  /**
   * Set beds outside rooms with an array
   * This will mainly be called by get();
   *
   * @param {Array} bedrooms
   *
   * @return {Listing}
   */
  this.setBedsOutsideBedrooms = (bedrooms) => {
    for (var i in bedrooms) {
      this.addBedOutsideBedroom(bedrooms[i]);
    }

    return this;
  };

  /**
   * Add a bed outside of rooms
   *
   * @param {String} bedroom type
   *
   * @return {Listing}
   */
  this.addBedOutsideBedroom = (bedroom) => {
    if (this.validateBedType(bedroom)) {
      details.bedsOutsideBedrooms.push(bedroom);
    }
    return this;
  };

  /**
   * Validate the bedtype
   *
   * @param {String} bedroom
   *
   * @return {Listing}
   */
  this.validateBedType = (bedroom) => {
    if (['SUPER_KING_BED', 'KING_BED', 'DOUBLE_BED', 'SOFA_BED', 'BUNK_BED', 'SINGLE_BED', 'COT_BED'].indexOf(bedroom) >= 0) {
      return true;
    } else {
      throw new Errors.GeneralError('Invalid bedtype ' + bedroom)
    }
  };

  /**
   * Set the bedrooms by the number
   * 
   * @param {Number} doubles
   * @param {Number} singles
   *
   * @return {Listing}
   */
  this.setBedroomsByNumber = (doubles, singles) => {
    details.bedrooms = [];

    if (typeof doubles !== 'number') {
      doubles = 0;
    }
    if (typeof singles !== 'number') {
      singles = 0;
    }

    var bed = [];
    var pointer = 0;
    for (var i = 0; i < doubles; i++) {
      _addBedroom(['DOUBLE_BED']);
      pointer++;
    }
    for (var j = 0; j < singles; j++) {
      _addBedroom(['SINGLE_BED']);
      pointer++;
    }

    return this;
  };

  /**
   * Max occupancy checker
   *
   * @param {Number} occupancy
   *
   * @return {Listing}
   */
  this.setMaxOccupancy = (occupancy) => {
    return _set('details', 'maxOccupancy', occupancy);
  };



  let _setCheckTime = (key, hour) => {
    let times = [
      'ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 
      'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY', 
      'TWENTY_ONE', 'TWENTY_TWO', 'TWENTY_THREE', 'ZERO'
    ];

    return _set('details', key, times[hour] ? times[hour] : 'FLEXIBLE');
  };

  this.setCheckInTime = (hour) => {
    return _setCheckTime('checkInTime', hour);
  };

  this.setCheckOutTime = (hour) => {
    return _setCheckTime('checkOutTime', hour);
  };

  this.setCarRequired = (bool) => {
    return _set('details', 'carRequired', (bool === true) ? 'REQUIRED' : 'NOT_REQUIRED');
  };

  this.setCarRecommended = () => {
    return _set('details', 'carRequired', 'RECOMMENDED');
  };



  this.setBathrooms = (bathrooms) => {
    details.bathrooms = [];
    for (var i in bathrooms) {
      this.addBathroom(bathrooms[i].bathroomType);
    }

    return this;
  };

  this.addBathroom = (type) => {
    if (_validateBathroomType(type)) {
      details.bathrooms.push({ bathroomType: type.toUpperCase() }); 
    }
    return this;
  };

  let _validateBathroomType = (type) => {
    if (['NONE', 'FAMILY', 'SHOWER', 'TOILET', 'ENSUITE'].indexOf(type.toUpperCase()) < 0) {
      throw new Errors.GeneralError('Invalid bathroom type');
    }

    return true;
  };

  let _addBathroomType = (num, type) => {
    for (var i = 0; i < num; i++) {
      this.addBathroom(type);
    }

    return this;
  };

  let clearBathroomType = (type) => {
    if (_validateBathroomType(type)) {
      for (var i in details.bathrooms) {
        if (details.bathrooms.bathroomType === type.toUpperCase()) {
          delete details.bathrooms[i];
        }
      }
    }

    return this;
  };

  this.setShowers = (num) => {
    clearBathroomType('SHOWER');
    return _addBathroomType(num, 'SHOWER');
  };

  this.setToilets = (num) => {
    clearBathroomType('TOILET');
    return _addBathroomType(num, 'TOILET');
  };

  this.setFamilyBathrooms = (num) => {
    clearBathroomType('FAMILY');
    return _addBathroomType(num, 'FAMILY');
  };

  this.getBathrooms = () => {
    return details.bathrooms;
  };



  this.getBookedRanges = () => {
    return bookedRanges;
  };

  this.setBookedRanges = (cal) => {
    bookedRanges = [];
    for (var i in cal) {
      this.addBookedRange(cal[i].start, cal[i].end, cal[i].label);
    }
    return this;
  };

  this.addBookedRange = (start, end, label) => {
    bookedRanges.push({ start: start, end: end, label: label || '' });
    return this;
  };

  this.updateBookedRanges = () => {
    return new Promise((resolve,reject) => {
      this._update(
        this.getPath(undefined, 'availability'),
        { bookedRanges: this.getBookedRanges() }
      ).then((response) => {
        resolve(response.toJSON().body);
      }).catch((err) => {
        reject(err);
      });
    });
  };



  this.setTitle = (title) => {
    return _set('descriptions', 'listingTitle', title);
  };

  this.setDescription = (desc) => {
    return _set('descriptions', 'rentalDescription', desc);
  };

  this.setAddress = (address) => {
    return _set('address', 'address', address);
  };

  this.setPostalCode = (postalCode) => {
    return _set('address', 'postalCode', postalCode);
  };

  this.setLatitude = (latitude) => {
    return _set('address', 'latitude', latitude);
  };

  this.setLongitude = (longitude) => {
    return _set('address', 'longitude', longitude);
  };

  this.isTemporary = () => {
    return this.id() && this.id().substring(0, 27) === 'TripAdvisorListingReference'
  };

  this.isActive = () => {
    return this.active === true;
  };

  this.addPhoto = (url, caption, externalPhotoReference) => {
    if (typeof url !== 'string' || url.length === 0) {
      throw new Errors.GeneralError('Invalid photo url supplied.');
    }

    photos.push({
      externalPhotoReference: externalPhotoReference || url.substring(0, 512),
      url: url,
      caption: caption || ''
    });

    return this;
  };

  /**
   * @return {Array}
   */
  this.getPhotos = () => {
    return photos;
  };

  /**
   * Set a new photo set
   * 
   * @param {Array} photosArr
   *
   * @return {Object}
   */
  this.setPhotos = (photosArr) => {
    photos = [];
    for (var i in photosArr) {
      if (typeof photosArr[i] === 'string') {
        this.addPhoto(photosArr[i]);
      } else {
        this.addPhoto(
          photosArr[i].url,
          photosArr[i].caption,
          photosArr[i].externalPhotoReference
        );
      }
    }
    return this;
  };

  /**
   * @return {Object}
   */
  this.getBookingPolicies = () => {
    return bookingPolicies;
  };

  /**
   * @return {Object}
   */
  this.getDescriptions = () => {
    return descriptions;
  };

  /**
   * @return {Object}
   */
  this.getAddress = () => {
    return address;
  };

  /**
   * @return {Object}
   */
  this.getDetails = () => {
    return {
      propertyType: 'COTTAGE',
      bedsOutsideBedrooms: details.bedsOutsideBedrooms,
      bedrooms: details.bedrooms,
      bathrooms: details.bathrooms,
      maxOccupancy: details.maxOccupancy,
      checkInTime: details.checkInTime,
      checkOutTime: details.checkOutTime,
      carRequired: details.carRequired
    };
  };





  let _toggleActivate = (toggleBool) => {
    return new Promise((resolve, reject) => {
      if (toggleBool === true && this.isActive()) {
        reject(new Errors.AlreadyActive());
      }

      if (toggleBool === false && !this.isActive()) {
        reject(new Errors.AlreadyDeActive());
      }

      this._update(
        this.getPath(undefined, (toggleBool) ? 'activation' : 'deactivation')
      ).then((response) => {
        this.active = toggleBool;
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  };

  /**
   * Activate the listing
   * 
   * @return {Promise}
   */
  this.activate = () => {
    return _toggleActivate(true);
  };

  /**
   * Deactivate the listing
   * 
   * @return {Promise}
   */
  this.deactivate = () => {
    return _toggleActivate(false);
  };

  this.path = function() {
    return this.getAccount();
  };

  /**
   * Update a listings reference
   *
   * @param {String} reference
   *
   * @return {Promise}
   */
  this.updateReference = (reference) => {
    return new Promise((resolve, reject) => {
      this._update(
        this.getPath(undefined, reference)
      ).then((response) => {
        this.setId(reference);
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  };
}

Listing.prototype = new Entity();
Listing.prototype.constructor = Listing;
Listing.prototype.toArray = function() {
  return {
    details: this.getDetails(),
    textLanguage: 'en_US',
    descriptions: {
      listingTitle: this.getDescriptions().listingTitle,
      rentalDescription: this.getDescriptions().rentalDescription
    },
    address: this.getAddress(),
    features: this.features,
    nearbyAmenities: this.nearbyAmenities,
    guestRequirements: this.guestRequirements,
    currency: 'GBP',
    active: this.active || false,
    photos: this.getPhotos(),
    bookingPolicies: this.getBookingPolicies(),
    rates: {
      defaultRate: this.getDefaultRate(),
      seasonalRates: this.getSeasonalRates(),
      damageDeposit: 0,
      taxPercentage: 0,
      weekendType: this.getWeekendType()
    }
  };
};
Listing.prototype.mutateResponse = function(json) {
  if (typeof json.externalAccountReference === 'string') {
    this.setAccount(json.externalAccountReference);
  }
  if (typeof json.externalListingReference === 'string') {
    this.setId(json.externalListingReference);
  }

  var objects = ['details', 'address', 'descriptions', 'bookingPolicies'];
  for (var i in objects) {
    if (json[objects[i]]) {
      for (var p in json[objects[i]]) {
        this._setObject(
          objects[i],
          p,
          json[objects[i]][p]
        );
      }

      delete json[objects[i]];
    }
  }

  if (json.photos) {
    for (var p in json.photos) {
      this.addPhoto(
        json.photos[p].url,
        json.photos[p].caption,
        json.photos[p].externalPhotoReference
      );
    }

    delete json.photos;
  }

  if (typeof json.rates === 'object' 
    && json.rates !== null
  ) {
    this.setDefaultRate(json.rates.defaultRate);

    if (json.rates.seasonalRates) {
      this.setSeasonalRates(json.rates.seasonalRates);
    }
    delete json.rates;
  } else if (json.rates === null) {
    delete json.rates;
  }

  if (json.calendar 
    && json.calendar.bookedRanges 
    && Array.isArray(json.calendar.bookedRanges)
  ) {
    this.setBookedRanges(json.calendar.bookedRanges);
  }

  return this.mutateEntity(json);
};

module.exports = Listing;