const TripAdvisorClient = require('./TripAdvisorClient.js').getInstance();
const Errors = require('./Errors');

function Collection(path, entity) {
  this.path = path;
  this.entity = entity;
  this.entities = [];
}

/**
 * Returns a promise of the fetched resource
 *
 * @param {Array} dependencies - keys of subentities, if any, to get for each item in the collection, e.g. 'property'
 *
 * @returns {Collection.prototype@call;promiseResult}
 */
Collection.prototype.fetch = function() {
  let t = this;
  return new Promise((resolve, reject) => {
    TripAdvisorClient.get(t.path).then((json) => {
      t.entities = json.map((i) => {
        let e = new t.entity();
        return e.mutateResponse(i);
      });

      resolve(t);
    }, (response) => {
      reject(new Errors.StatusError(response));
    });
  });
};

/**
* forEach shortcut
*
* @param {function} callback
* @param {*} [thisArg] - Value to use as this
*
* @returns {undefined}
*/
Collection.prototype.forEach = function(callback, thisArg) {
  return this.entities.forEach(callback, thisArg);
};

/**
* Map shortcut
*
* @param {function} callback
* @param {*} [thisArg] - Value to use as this
*
* @returns {Array}
*/
Collection.prototype.map = function(callback, thisArg) {
  return this.entities.map(callback, thisArg);
};

/**
* Filter shortcut
*
* @param {function} callback - Test function
* @param {*} [thisArg] - Value to use as this
*
* @returns {Collection}
*/
Collection.prototype.filter = function(callback, thisArg) {
  this.entities = this.entities.filter(callback, thisArg);
  return this;
};

/**
* Pop shortcut
*
* @returns {Entity}
*/
Collection.prototype.pop = function() {
  return this.entities.pop();
};

/**
* Shift shortcut
*
* @returns {Entity}
*/
Collection.prototype.shift = function() {
  return this.entities.shift();
};

/**
* Count
*
* @returns {Number}
*/
Collection.prototype.count = function() {
  return this.entities.length;
};

module.exports = Collection;
