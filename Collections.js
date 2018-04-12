const Listing = require('./Listing');
const Collection = require('./Collection');

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
  }
};