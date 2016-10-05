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
  console.log(chalk.green('+'), 'new', chalk.cyan(routes.VIZ), 'client');

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
          console.warn(chalk.yellow('!'), chalk.cyan(routes.VIZ), 'server does not handle', chalk.yellow(action.type), 'messages');
          break;
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.warn(chalk.red('!'), 'viz client sent a non-valid JSON message');
      } else {
        console.error(chalk.red('ERR!', 'unable to process viz client message'));
        console.error(err.stack);
      }
    }
  });

  client.on('close', function onClose() {
    console.log(chalk.red('-'), chalk.cyan(routes.VIZ), 'client left');
  });
}

module.exports = vizHandler;
