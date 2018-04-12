const Entity = require('./Entity');
const Errors = require('./Errors');
const locutus = require('locutus');

function Listing(account, id) {
  this.path = account;
  this.id = id;
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

  this._set = (variable, key, value) => {
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
      return this._set(variable, key, value);
    }
  };

  this.setBathrooms = (bathrooms) => {
    for (var i in bathrooms) {
      this.addBathroom(bathrooms[i].bathroomType);
    }

    return this;
  };

  this.setBedrooms = (bedrooms) => {
    for (var i in bedrooms) {
      this.addBedroom(bedrooms[i]);
    }

    return this;
  };

  this.addBedroom = (bedroom) => {
    if (this.validateBedType(bedroom)) {
      details.bedrooms.push(bedroom);
    }
    return this;
  };

  this.setBedsOutsideBedrooms = (bedrooms) => {
    for (var i in bedrooms) {
      this.addBedOutsideBedroom(bedrooms[i]);
    }

    return this;
  };

  this.addBedOutsideBedroom = (bedroom) => {
    if (this.validateBedType(bedroom)) {
      details.bedsOutsideBedrooms.push(bedroom);
    }
    return this;
  };

  this.validateBedType = (bedroom) => {
    return ['SUPER_KING_BED', 'KING_BED', 'DOUBLE_BED', 'SOFA_BED', 'BUNK_BED', 'SINGLE_BED', 'COT_BED'].indexOf(bedroom) >= 0;
  };

  this.setMaxOccupancy = (o) => {
    return this._set('details', 'maxOccupancy', o);
  };

  this._setCheckTime = (key, hour) => {
    let times = [
      'ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 
      'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY', 
      'TWENTY_ONE', 'TWENTY_TWO', 'TWENTY_THREE', 'ZERO'
    ];

    return this._set('details', key, times[hour] ? times[hour] : 'FLEXIBLE');
  };

  this.setCheckInTime = (hour) => {
    return this._setCheckTime('checkInTime', hour);
  };

  this.setCheckOutTime = (hour) => {
    return this._setCheckTime('checkOutTime', hour);
  };

  this.setCarRequired = (bool) => {
    return this._set('details', 'carRequired', (bool === true) ? 'REQUIRED' : 'NOT_REQUIRED');
  };

  this.setCarRecommended = () => {
    return this._set('details', 'carRequired', 'RECOMMENDED');
  };

  this.addBathroom = (type) => {
    if (['NONE', 'FAMILY', 'SHOWER', 'TOILET', 'ENSUITE'].indexOf(type.toUpperCase()) < 0) {
      throw new Errors.GeneralError('Invalid bathroom type');
    }
    details.bathrooms.push({ bathroomType: type.toUpperCase() });
    return this;
  };

  this.addBedroomByNumber = (doubles, singles) => {
    if (typeof doubles !== 'number') {
      doubles = 0;
    }
    if (typeof singles !== 'number') {
      singles = 0;
    }

    var bed = [];
    for (var i = 0; i < doubles; i++) {
      bed.push('DOUBLE_BED');
    }
    for (var i = 0; i < singles; i++) {
      bed.push('SINGLE_BED');
    }

    details.bedrooms.push(bed);

    return this;
  };

  this.clearBedrooms = () => {
    details.bedrooms = [];
    return this;
  };

  this.clearBathrooms = () => {
    details.bathrooms = [];
    return this;
  };

  this.setTitle = (title) => {
    return this._setDescription('listingTitle', title);
  };

  this.setDescription = (desc) => {
    return this._setDescription('rentalDescription', desc);
  };

  this._setDescription = (key, desc) => {
    return this._set('descriptions', key, desc);
  };

  this.setAddress = (address) => {
    return this._setAddress('address', address);
  };

  this.setPostalCode = (postalCode) => {
    return this._setAddress('postalCode', postalCode);
  };

  this.setLatitude = (latitude) => {
    return this._setAddress('latitude', latitude);
  };

  this.setLongitude = (longitude) => {
    return this._setAddress('longitude', longitude);
  };

  this._setAddress = (key, value) => {
    return this._set('address', key, value);
  };

  this.isTemporary = () => {
    return this.id && this.id.substring(0, 27) === 'TripAdvisorListingReference'
  };

  this.isActive = () => {
    return this.active === true;
  };

  this.addPhoto = (url, externalPhotoReference, caption) => {
    photos.push({
      externalPhotoReference: externalPhotoReference,
      url: url,
      caption: caption
    });
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






  this.activate = () => {
    return this._toggleActivate(true);
  };

  this.deactivate = () => {
    return this._toggleActivate(false);
  };

  this._toggleActivate = (toggleBool) => {
    return new Promise((resolve, reject) => {
      if (toggleBool === true && this.isActive()) {
        reject(new Errors.AlreadyActive());
      }

      if (toggleBool === false && !this.isActive()) {
        reject(new Errors.AlreadyDeActive());
      }

      if (toggleBool) {
        return this._update(
          this.getPath(undefined, 'activation')
        ).then(() => {
          this.active = toggleBool;
          resolve(this);
        }, (response) => {
          reject(new Errors.DomainErrors(response));
        });
      } else {
        return this._delete(
          this.getPath(undefined, 'deactivation')
        ).then(() => {
          this.active = toggleBool;
          resolve(this);
        }, (response) => {
          reject(new Errors.DomainErrors(response));
        });
      }
    });
  }
}

Listing.prototype = new Entity();
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
        json.photos[p].externalPhotoReference,
        json.photos[p].caption
      );
    }

    delete json.photos;
  }

  return this.mutateEntity(json);
};

module.exports = Listing;