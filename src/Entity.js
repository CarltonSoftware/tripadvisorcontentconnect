var TripAdvisorClient = require('./TripAdvisorClient').getInstance();
var Errors = require('./Errors');

/**
 * Base object
 *
 * @returns {Entity}
 */
function Entity() {
  /**
   * @returns {String}
   */
  this.path = function() {
    return '';
  };

  /**
   * @returns {String}
   */
  this.id = function() {
    return '';
  };
};

let _checkId = (id) => {
  if ((['string', 'number'].indexOf(typeof id) < 0) 
    || (typeof id === 'string' && id.length === 0)
  ) {
    throw new Errors.IdNotSpecified();
  }
};
let _checkPath = (path) => {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Errors.PathNotSpecified();
  }
};

/**
 * Function used to map json values onto a single object. 
 *
 * @param {Object} entity
 *
 * @returns {Entity.prototype}
 */
Entity.prototype.mutateResponse = function(entity) {
  return this.mutateEntity(entity);
};

/**
 * Function responsible for mapping the values onto the parent object
 *
 * @param {Object} res Entity
 *
 * @returns {Entity.prototype}
 */
Entity.prototype.mutateEntity = function(entity) {
  for (var prop in entity) {
    if (this.hasOwnProperty(prop) && typeof this[prop] === 'object' && this[prop] !== null) {
      if (typeof this[prop].mutateResponse === 'function') {
        this[prop].mutateResponse(entity[prop]);
      } else {
        this[prop] = entity[prop];
      }
    } else {
      this[prop] = entity[prop];
    }
  }

  return this;
};

/**
 * Return a mutated promised result
 *
 * @param {String} path Path to request
 * @param {Object} params Request paramaters
 *
 * @returns {Promise}
 */
Entity.prototype._get = function(path, params) {
  var e = this;
  return new Promise((resolve, reject) => {
    TripAdvisorClient.get(path, { query: params }).then((json) => {
      resolve(e.mutateResponse(json));
    }, (err) => {
      reject(new Errors.StatusError(err));
    });
  });
};

/**
 * Return a mutated promised result
 *
 * @param {String} path   Path to request
 * @param {Object} params Body paramaters
 *
 * @returns {Promise}
 */
Entity.prototype._update = function(path, params) {
  return new Promise((resolve, reject) => {
    TripAdvisorClient.put(path, { body: params }).then((response) => {
      resolve(response);
    }, (err) => {
      if (err.statusCode === 400) {
        if (typeof err.error === 'string' && err.error.length > 0) {
          let body = JSON.parse(err.error);
          if (Array.isArray(body)) {
            reject(new Errors.DomainErrors(err));
          } else {
            reject(new Errors.BadRequestError(err));
          }
        }
      }
      reject(new Errors.StatusError(err));
    });
  });
};

/**
 * Return a mutated promised result
 *
 * @param {String} path   Path to request
 * @param {Object} params Query paramaters
 *
 * @returns {Promise}
 */
Entity.prototype._delete = function(path, params) {
  return TripAdvisorClient.delete(path, { query: params });
};

/**
 * Check for a parent object and recurse through, creating a path
 * based on the parents of the object
 *
 * @returns {String}
 */
Entity.prototype.getPath = function(prefix, suffix) {
  if (typeof this.parent === 'object') {
    prefix = this.parent.getPath(prefix);
  }
  _checkPath(this.path());
  _checkId(this.id());
  return [
    (typeof prefix === 'string') ? prefix : undefined,
    this.path(),
    this.id(),
    (typeof suffix === 'string') ? suffix : undefined
  ].filter((i) => {
    return typeof i !== 'undefined'
  }).join('/');
};

/**
 * Return the post representation
 *
 * @returns {Object}
 */
Entity.prototype.toArray = function() {
  return {};
};

/**
 * Return the get
 *
 * @returns {Promise}
 */
Entity.prototype.get = function() {
  return this._get(this.getPath());
};

/**
 * Return the update
 *
 * @returns {Promise}
 */
Entity.prototype.update = function() {
  return this._update(this.getPath(), this.toArray());
};

/**
 * Return the create
 *
 * @returns {Promise}
 */
Entity.prototype.create = () => {
  return this.update();
};

module.exports = Entity;