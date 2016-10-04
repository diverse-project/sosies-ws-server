var chalk = require('chalk');

function unknownHandler(server, client) {
  console.warn('Unknown route:', chalk.red(client.upgradeReq.url));
}

module.exports = unknownHandler;
