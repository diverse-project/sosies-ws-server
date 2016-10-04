var chalk = require('chalk');

var routes = require('.');

function getMainClients(server) {
  return server.clients
    .filter(function filterHandler(client) {
      return client.upgradeReq.url === routes.MAIN;
    })
    .map(function mapHandler(client) {
      return { id: client.id, data: client.latestData };
    });
}

function getMainClient(server, id) {
  return getMainClients(server)
    .find(function findHandler(client) {
      return client.id === id;
    });
}

function vizHandler(server, client) {
  client.on('message', function msgHandler(msg) {
    // message from WebApp sosies-visualizer
    var action;
    try {
      action = JSON.parse(msg);
      switch (action.type) {
        case 'ALL_DATA':
          client.send(JSON.stringify({
            type: 'ALL_DATA',
            clients: getMainClients(server)
          }));

          break;

        case 'DATA':
          client.send(JSON.stringify({
            type: 'DATA',
            id: action.id,
            data: getMainClient(server, action.id)
          }));
          break;

        default:
          break;
      }
    } catch (err) {
      console.log(chalk.red('!'), ' viz client sent a non-valid JSON message');
    }
  });
}

module.exports = vizHandler;
