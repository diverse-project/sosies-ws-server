var main = require('./main');
var viz = require('./viz');
var unknown = require('./unknown');

var MAIN = '/';
var VIZ = '/viz';

function routeHandler(server, client) {
  switch (client.upgradeReq.url) {
    case MAIN:
      return main(server, client);

    case VIZ:
      return viz(server, client);

    default:
      return unknown(server, client);
  }
}

module.exports = routeHandler;
exports.MAIN = MAIN;
exports.VIZ = VIZ;
