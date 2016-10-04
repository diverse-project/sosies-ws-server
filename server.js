var ws = require('ws');
var chalk = require('chalk');

var routes = require('./routes');

var port = process.argv[2] || 9050;

var server = new ws.Server({ host: '0.0.0.0', port: port });
console.log(chalk.gray('WebSocket server listening at:', chalk.cyan('0.0.0.0:' + port)));

server.on('connection', function connHandler(client) {
  // delegate routing
  routes(server, client);
});

function getClientById(id) {
  if (id === undefined || id === null) {
    return null;
  }
  return server.clients.find(function findHandler(client) {
    return client.id === id;
  });
}

module.exports = server;
module.exports.getClientById = getClientById;
