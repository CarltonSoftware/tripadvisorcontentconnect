var Listing = require('./Listing');
var Collection = require('./Collection');
var TripAdvisorClient = require('./TripAdvisorClient');
var Errors = require('./Errors');

module.exports = {
  getAllListings: (account) => {
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
    return module.exports.getAllListings(account).then((Col) => {
      return Promise.all(
        Col.map((L) => {
          return L.get();
        })
      );
    });
  },
  getAccounts: () => {
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
    return new Promise((resolve, reject) => {
      module.exports.getAllListings(account).then((Collection) => {
        var temps = [];
        Collection.forEach((Listing) => {
          if (Listing.isTemporary()) {
            temps.push(Listing);
          }
        });

        if (temps.length > 0) {
          let _u = (index) => {
            if (temps[index]) {
              console.log('Updating reference', temps[index].id());
              temps[index].updateReference(temps[index].id().substring(27)).then(() => {
                index++;
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
  }
};