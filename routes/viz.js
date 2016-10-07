var path = require('path');
var chalk = require('chalk');
var exec = require('child_process');

var routes = require('.');
var utils = require('../lib/utils');

function getMainClients(server) {
  return server.clients
    .filter(function filterHandler(client) {
      return client.upgradeReq.url === routes.MAIN;
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
    var client;
    var ringo;

    try {
      action = JSON.parse(msg);
      switch (action.type) {
        case 'ALL_DATA':
          viz.send(JSON.stringify({
            type: 'ALL_DATA',
            clients: getMainClients(server).map(function mapHandler(c) {
              return {
                id: c.id,
                port: c.port,
                ringo: c.ringo,
                active: c.active,
                data: c.latestData
              };
            })
          }));

          break;

        case 'DATA':
          client = getMainClient(server, action.id);
          if (client) {
            viz.send(JSON.stringify({
              type: 'DATA',
              id: action.id,
              active: client.active,
              data: client.data
            }));
          }
          break;

        case 'CREATE':
          if (!server.mdmsInstances[action.id]) {
            ringo = utils.getRingoSosie(action.ringo);
            console.log(chalk.green('>'), 'creating new MdMS instance', chalk.cyan(action.id), 'using', chalk.green(ringo.name));
            server.availablePort += 1; // eslint-disable-line no-param-reassign
            server.mdmsInstances[action.id] = exec.spawn( // eslint-disable-line no-param-reassign
              ringo.path,
              ['server.js', '--port=' + server.availablePort, action.id, ringo.name],
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
          }
          break;

        case 'DELETE':
          mdms = server.mdmsInstances[action.id];
          if (mdms) {
            mdms.kill('SIGHUP');
            delete server.mdmsInstances[action.id]; // eslint-disable-line no-param-reassign
          }
          break;

        case 'ACTIVATE':
          client = getMainClient(server, action.id);
          if (client) {
            client.active = true;
            console.log(chalk.green('>'), 'instance', chalk.cyan(action.id), 'is now', chalk.green('active'));
          }
          break;

        case 'DEACTIVATE':
          client = getMainClient(server, action.id);
          if (client) {
            client.active = false;
            console.log(chalk.green('>'), 'instance', chalk.cyan(action.id), 'is now', chalk.yellow('inactive'));
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
