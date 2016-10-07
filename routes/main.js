var WebSocket = require('ws');
var chalk = require('chalk');

var routes = require('.');

function sendToVizualizers(server, msg) {
  server.clients
    .filter(function filterHandler(client) {
      return client.upgradeReq.url === routes.VIZ;
    })
    .forEach(function forEachHandler(vizClient) {
      if (vizClient && vizClient.readyState === WebSocket.OPEN) {
        vizClient.send(JSON.stringify(msg));
      }
    });
}

function mainHandler(server, client) {
  client.on('message', function msgHandler(msg) {
    // message from rhino VMs
    var action;
    try {
      action = JSON.parse(msg);
      switch (action.type) {
        case 'REGISTER':
          client.id = action.id; // eslint-disable-line no-param-reassign
          client.port = action.port; // eslint-disable-line no-param-reassign
          client.ringo = action.ringo; // eslint-disable-line no-param-reassign
          console.log(chalk.green('+'), 'new client registered', client.id, ':' + chalk.cyan(client.port));
          sendToVizualizers(server, {
            type: 'REGISTER',
            id: client.id,
            port: client.port,
            ringo: client.ringo
          });
          break;

        case 'DATA':
          client.latestData = action.data; // eslint-disable-line no-param-reassign
          sendToVizualizers(server, {
            type: 'DATA',
            id: client.id,
            port: client.port,
            ringo: client.ringo,
            data: client.latestData
          });
          break;

        default:
          break;
      }
    } catch (err) {
      console.log(chalk.red('!'), client.id, chalk.red('received message is not a valid JSON'));
    }
  });

  client.on('close', function closeHandler() {
    // notify vizualizer that a rhino VM closed
    if (client.id) {
      sendToVizualizers(server, { type: 'CLOSE', id: client.id });
      console.log(chalk.red('-'), client.id);
    } else {
      console.log(chalk.red('-'), 'client closed before registering');
    }
  });
}

module.exports = mainHandler;
