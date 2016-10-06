var http = require('http');
var chalk = require('chalk');
var ws = require('ws');
var routes = require('./routes');
var wss;

var port = process.argv[2] || 9050;
var server = http.createServer(function reqHandler(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello world');
});

wss = new ws.Server({ server: server });
wss.mdmsInstances = {};
wss.availablePort = 9060;

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

server.listen(port, function listenHandler() {
  console.log(chalk.green('>'), 'HTTP & WebSocket servers listening on ', chalk.cyan('0.0.0.0:' + port));
});

module.exports = wss;
module.exports.getClientById = getClientById;
