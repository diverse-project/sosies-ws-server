var ws = require('ws');
var routes = require('./routes');

var wss = new ws.Server({ host: '0.0.0.0', port: process.argv[2] || 9050 });

wss.on('connection', function connHandler(client) {
  // delegate routing
  routes(wss, client);
});

function getClientById(id) {
  if (id === undefined || id === null) {
    return null;
  }
  return wss.clients.find(function findHandler(client) {
    return client.id === id;
  });
}

module.exports = wss;
module.exports.getClientById = getClientById;
