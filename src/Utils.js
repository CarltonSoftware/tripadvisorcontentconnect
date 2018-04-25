var Listing = require('./Listing');
var Collection = require('./Collection');
var TripAdvisorClient = require('./TripAdvisorClient');
var Errors = require('./Errors');
var sleep = require('system-sleep');

module.exports = {
  connect: () => {
    const dotenv = require('dotenv');
    if (process.env && process.env.NODE_ENV) {
      dotenv.config({ path: '.env.' + process.env.NODE_ENV });
    } else {
      dotenv.config();
    }

    return TripAdvisorClient.connect({ 
      base_url: process.env.ta_base_url,
      client_id: process.env.ta_client_id,
      secret: process.env.ta_secret
    });
  },
  getAllListings: (account) => {
    module.exports.connect();

    return new Promise((resolve, reject) => {
      let c = new Collection(account, Listing);
      c.fetch().then((json) => {
        resolve(json)
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getAllFullListings: (account) => {
    module.exports.connect();

    return module.exports.getAllListings(account).then((Col) => {
      return Promise.all(
        Col.map((L) => {
          return L.get();
        })
      );
    });
  },
  getListing: (accountId, listingId, cb) => {
    module.exports.connect();

    var L = new Listing(accountId, listingId);
    return new Promise((resolve, reject) => {
      L.get().then((Li) => {
        if (module.exports[cb]) {
          module.exports[cb](Li);
        } else if (typeof cb === 'string') {
          console.log(cb);
        }
        resolve(L);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  deActivateListing: (accountId, listingId) => {
    module.exports.connect();

    var L = new Listing(accountId, listingId);
    return new Promise((resolve, reject) => {
      L.get().then((Li) => {
        if (Li.active === true) {
          Li.deactivate().then(() => {
            console.log('Listing deactivated');
            resolve(Li);
          }).catch((err) => {
            reject(err);   
          });
        } else {
          reject(new Errors.GeneralError('Listing already deactivated')); 
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getAccounts: () => {
    module.exports.connect();

    return new Promise((resolve, reject) => {
      TripAdvisorClient.getInstance().get().then((data) => {
        resolve(data.map((d) => {
          return d.externalAccountReference;
        }).filter((value, index, self) => {
          return self.indexOf(value) === index;
        }));
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getAccountIds: (account) => {
    module.exports.connect();

    return new Promise((resolve, reject) => {
      module.exports.getAllListings(account).then((Collection) => {
        resolve(Collection.map((l) => {
            return l.id();
          })
        );
      }).catch((err) => {
        reject(err);
      });
    });
  },
  updateTripadvisorReferences: (account) => {
    module.exports.connect();

    return new Promise((resolve, reject) => {
      module.exports.getAllListings(account).then((Collection) => {
        var temps = [];
        Collection.forEach((Listing) => {
          if (Listing.isTemporary()) {
            temps.push(Listing);
          }
        });

        console.log(temps.length);

        if (temps.length > 0) {
          let _u = (index) => {
            if (temps[index]) {
              console.log('Updating reference', temps[index].id());
              temps[index].updateReference(temps[index].id().substring(27)).then(() => {
                index++;
                sleep(5000);
                _u(index);
              }).catch((err) => {
                reject(err);
              });
            } else {
              resolve(temps.length);
            }
          };

          _u(0);
        } else {
          reject(new Errors.GeneralError('No temporary listings found'));
        }
      }).catch((err) => {
        reject(err);
      });
    });
  },
  log: (item) => {
    console.log(item);
  }
};