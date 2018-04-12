const TripAdvisorClient = require('./TripAdvisorClient.js').getInstance();
const Errors = require('./Errors.js');

/**
 * Base object
 *
 * @returns {Entity}
 */
function Entity() {};

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
  return TripAdvisorClient.put(path, { body: params });
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

  return [
    (typeof prefix === 'string') ? prefix : undefined,
    this.path,
    this.id,
    (typeof suffix === 'string') ? suffix : undefined
  ].filter((i) => {
    return typeof i !== 'undefined'
  }).join('/');
};

/**
 * Return the post representation
 *
 * @returns {Entity.prototype.toArray.EntityAnonym$0}
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
  if (typeof this.path === 'undefined') {
    throw new Errors.PathNotSpecified();
  }

  return this._get(this.getPath());
};

/**
 * Return the update
 *
 * @returns {Promise}
 */
Entity.prototype.update = function() {
  if (typeof this.id === 'undefined') {
    throw new Errors.IdNotSpecified();
  }

  if (typeof this.path === 'undefined') {
    throw new Errors.PathNotSpecified();
  }

  return this._update(this.getPath(), this.toArray());
};

/**
 * Return the create
 *
 * @returns {Promise}
 */
Entity.prototype.create = function() {
  return this.update();
};

module.exports = Entity;