var platoJsClient = require('plato-js-client');
var p = new platoJsClient.common.Property(2);
var pb = new platoJsClient.common.PropertyBranding(3);
pb.parent = p;

module.exports = {
  Property: p,
  PropertyBranding: pb
};