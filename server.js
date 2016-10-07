var http = require('http');
var chalk = require('chalk');
var ws = require('ws');

var routes = require('./routes');
var utils = require('./lib/utils');

var port = process.argv[2] || 9050;
var server = http.createServer();

var wss = new ws.Server({ server: server });
wss.mdmsInstances = {};
wss.availablePort = 9059;

wss.on('connection', function connHandler(client) {
  // delegate routing
  routes(wss, client); // eslint-disable-line global-require
});

function getClientById(id) {
  if (id === undefined || id === null) {
    return null;
  }
  return wss.clients.find(function findHandler(client) {
    return client.id === id;
  });
}

function getActiveMainWSClient() {
  return wss.clients
    .filter(function filterHandler(c) {
      return c.upgradeReq.url === '/';
    })
    .filter(function filterHandler(c) {
      return c.active;
    });
}

function sendToViz(msg) {
  wss.clients
    .filter(function filterHandler(c) {
      return c.upgradeReq.url === '/viz';
    })
    .forEach(function feHandler(c) {
      c.send(JSON.stringify(msg));
    });
}

server.on('request', function reqHandler(req, res) {
  var clients = getActiveMainWSClient();
  var randomClient;
  var proxyReq;
  if (clients.length === 0) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('No available MdMS instance yet.');
  } else {
    randomClient = clients[utils.randomInt(0, clients.length - 1)];
    proxyReq = http.request({
      port: randomClient.port,
      hostname: '0.0.0.0',
      method: req.method,
      headers: req.headers,
      path: req.url
    });
    proxyReq.on('response', function resHandler(proxyRes) {
      proxyRes.on('data', function onData(data) {
        res.write(data);
      });
      proxyRes.on('end', function onEnd() {
        randomClient.send(JSON.stringify({ type: 'DATA' }));
        sendToViz({
          type: 'ANSWER',
          id: randomClient.id,
          url: req.url
        });
        res.end();
      });
      res.writeHead(proxyRes.statusCode, Object.assign(proxyRes.headers, {
        'MdMS-Instance': randomClient.id
      }));
    });
    req.on('data', function onData(data) {
      proxyReq.write(data);
    });
    req.on('end', function onEnd() {
      proxyReq.end();
    });
  }
});

server.listen(port, function listenHandler() {
  console.log(chalk.green('>'), 'HTTP & WebSocket servers listening on ', chalk.cyan('0.0.0.0:' + port));
});

module.exports = wss;
module.exports.getClientById = getClientById;
