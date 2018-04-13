const Listing = require('./Listing');
const Collection = require('./Collection');
const TripAdvisorClient = require('./TripAdvisorClient');

module.exports = {
  getAllListings: (account) => {
    let c = new Collection(account, Listing);
    return c.fetch();
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
  }
};