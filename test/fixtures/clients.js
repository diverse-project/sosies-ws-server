var WebSocket = require('ws');

function randomNumber(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function createFakeData() {
  var data = {};
  var j = 0;

  data.functions = {};
  for (j; j < randomNumber(0, 10); j += 1) {
    data.functions['func' + j] = randomNumber(0, 10000);
  }

  return data;
}

function createClient(name) {
  var closeFn;
  var interval;
  var client = new WebSocket('ws://localhost:9050');
  client.on('open', function () {
    client.send(JSON.stringify({ type: 'REGISTER', id: name }));
    setTimeout(function () {
      client.send(JSON.stringify({ type: 'DATA', data: createFakeData() }));
    }, 1000);
  });

  interval = setInterval(function intervalHandler() {
    var data = createFakeData();
    client.send(JSON.stringify({ type: 'DATA', data: data }));
  }, randomNumber(1000, 3000));

  closeFn = client.close;
  client.close = function () {
    clearInterval(interval);
    closeFn.call(client);
  };

  return client;
}

createClient('rhino0');
createClient('rhino5');

setTimeout(function () {
  var c = createClient('rhino1');
  setTimeout(function () {
    c.close();
  }, 35000);
}, 1000);

setTimeout(function () {
  createClient('rhino2');
}, 2500);

setTimeout(function () {
  var c = createClient('rhino3');
  setTimeout(function () {
    c.close();
  }, 5000);
}, 10000);

setTimeout(function () {
  createClient('rhino4');
}, 15000);
