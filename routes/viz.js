var path = require('path');
var chalk = require('chalk');
var exec = require('child_process');

var routes = require('.');

function getMainClients(server) {
  return server.clients
    .filter(function filterHandler(client) {
      return client.upgradeReq.url === routes.MAIN;
    })
    .map(function mapHandler(client) {
      return { id: client.id, port: client.port, data: client.latestData };
    });
}

function getMainClient(server, id) {
  return getMainClients(server)
    .find(function findHandler(client) {
      return client.id === id;
    });
}

function vizHandler(server, viz) {
  console.log(chalk.green('+'), 'new', chalk.cyan(routes.VIZ), 'client');

  viz.on('message', function msgHandler(msg) {
    // message from WebApp sosies-visualizer
    var action;
    var mdms;
    try {
      action = JSON.parse(msg);
      switch (action.type) {
        case 'ALL_DATA':
          viz.send(JSON.stringify({
            type: 'ALL_DATA',
            clients: getMainClients(server)
          }));

          break;

        case 'DATA':
          viz.send(JSON.stringify({
            type: 'DATA',
            id: action.id,
            data: getMainClient(server, action.id)
          }));
          break;

        case 'CREATE':
          console.log(chalk.green('>'), 'creating new MdMS instance', chalk.cyan(action.id));
          server.availablePort += 1; // eslint-disable-line no-param-reassign
          server.mdmsInstances[action.id] = exec.spawn( // eslint-disable-line no-param-reassign
            'ringo',
            ['server.js', '--port=' + server.availablePort, action.id],
            { cwd: path.resolve(__dirname, '..', '..', 'mdms-ringojs') }
          );
          server.mdmsInstances[action.id].stdout.on('data', function onData(data) {
            var str = data.toString().replace(/\\n/g, '').trim();
            if (str.length > 0) {
              console.log(chalk.cyan(action.id), chalk.green('>'), str);
            }
          });
          server.mdmsInstances[action.id].stderr.on('data', function onData(data) {
            var str = data.toString().replace(/\\n/g, '').trim();
            if (str.length > 0) {
              console.log(chalk.cyan(action.id), chalk.red('>'), str);
            }
          });
          break;

        case 'DELETE':
          mdms = server.mdmsInstances[action.id];
          if (mdms) {
            mdms.kill('SIGHUP');
          }
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

  viz.on('close', function onClose() {
    console.log(chalk.red('-'), chalk.cyan(routes.VIZ), 'client left');
  });
}

module.exports = vizHandler;
