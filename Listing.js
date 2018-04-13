const Entity = require('./Entity');
const Errors = require('./Errors');
const locutus = require('locutus');

function Listing(accountId, listingId) {
  let account = accountId;
  let id = listingId;

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
      value = '"' + value + '"';
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

  /**
   * Return the account id
   *
   * @return {String}
   */
  this.getAccount = function() {
    return account;
  };

  /**
   * Set the account
   *
   * @param {String} a
   *
   * @return {Listing}
   */
  this.setAccount = function(a) {
    account = a;
    return this;
  };

  /**
   * Return the listing id
   *
   * @return {String}
   */
  this.id = function() {
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
    for (var i in bathrooms) {
      this.addBathroom(bathrooms[i].bathroomType);
    }

    return this;
  };

  this.addBathroom = (type) => {
    if (['NONE', 'FAMILY', 'SHOWER', 'TOILET', 'ENSUITE'].indexOf(type.toUpperCase()) < 0) {
      throw new Errors.GeneralError('Invalid bathroom type');
    }
    details.bathrooms.push({ bathroomType: type.toUpperCase() });
    return this;
  };

  this.clearBathrooms = () => {
    details.bathrooms = [];
    return this;
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
    return this.id && this.id.substring(0, 27) === 'TripAdvisorListingReference'
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
    if (toggleBool === true && this.isActive()) {
      reject(new Errors.AlreadyActive());
    }

    if (toggleBool === false && !this.isActive()) {
      reject(new Errors.AlreadyDeActive());
    }

    return this._update(
      this.getPath(undefined, (toggleBool) ? 'activation' : 'deactivation')
    );
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
}

Listing.prototype = new Entity();
Listing.prototype.constructor = Listing;
Listing.prototype.toArray = function() {
  return {
    details: this.getDetails(),
    descriptions: this.getDescriptions(),
    address: this.getAddress(),
    features: this.features,
    nearbyAmenities: this.nearbyAmenities,
    guestRequirements: this.guestRequirements,
    currency: 'GBP',
    active: this.active || false,
    photos: this.getPhotos(),
    textLanguage: 'en_US',
    bookingPolicies: this.getBookingPolicies()
  };
};
Listing.prototype.mutateResponse = function(json) {
  if (!this.path) {
    this.path = json.externalAccountReference; 
  }
  if (!this.id) {
    this.id = json.externalListingReference; 
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

  return this.mutateEntity(json);
};

module.exports = Listing;