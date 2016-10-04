var expect = require('expect');
var WebSocket = require('ws');

describe('Tests suite:', function () {
  var server;
  var foo;
  var bar;
  var baz;
  var viz;

  before(function () {
    // start the WebSocket server on default port 9050
    server = require('../server'); // eslint-disable-line global-require
  });

  it('should add a new client (id: foo)', function (done) {
    foo = new WebSocket('ws://localhost:9050');
    foo.on('open', function () {
      foo.send(JSON.stringify({ type: 'REGISTER', id: 'foo' }));
      setTimeout(function () {
        // give a chance to the server to process the message before assertion
        expect(server.getClientById('foo')).toExist();
        done();
      }, 100);
    });
  });

  it('connect a new client (id: bar)', function (done) {
    bar = new WebSocket('ws://localhost:9050');
    bar.on('open', function () {
      bar.send(JSON.stringify({ type: 'REGISTER', id: 'bar' }));
      setTimeout(function () {
        // give a chance to the server to process the message before assertion
        expect(server.getClientById('bar')).toExist();
        done();
      }, 100);
    });
  });

  it('connect a new client (id: baz)', function (done) {
    baz = new WebSocket('ws://localhost:9050');
    baz.on('open', function () {
      baz.send(JSON.stringify({ type: 'REGISTER', id: 'baz' }));
      setTimeout(function () {
        // give a chance to the server to process the message before assertion
        expect(server.getClientById('baz')).toExist();
        done();
      }, 100);
    });
  });

  it('connect a new visualizer client', function (done) {
    viz = new WebSocket('ws://localhost:9050/viz');
    viz.on('open', function () {
      setTimeout(function () {
        // give a chance to the server to process the message before assertion
        expect(server.clients.length).toEqual(4);
        done();
      }, 100);
    });
  });

  it('make client "foo" send data to server', function (done) {
    var data = {
      functions: ['one', 'two'],
      count: 42
    };
    foo.send(JSON.stringify({ type: 'DATA', data: data }));

    setTimeout(function () {
      // give a chance to the server to process the message before assertion
      expect(server.getClientById('foo').latestData).toEqual(data);
      done();
    }, 100);
  });

  it('make client "baz" send data to server', function (done) {
    var data = {
      functions: ['some', 'func'],
      count: {
        some: 4,
        func: 14
      }
    };
    baz.send(JSON.stringify({ type: 'DATA', data: data }));

    setTimeout(function () {
      // give a chance to the server to process the message before assertion
      expect(server.getClientById('baz').latestData).toEqual(data);
      done();
    }, 100);
  });

  it('vizualizer ask for latest data', function (done) {
    viz.on('message', function msgHandler(msg) {
      var jsonMsg = JSON.parse(msg);
      expect(jsonMsg.type).toEqual('ALL_DATA');
      expect(jsonMsg.clients.length).toEqual(3);
      expect(jsonMsg.clients[0]).toEqual({
        id: 'foo',
        data: {
          functions: ['one', 'two'],
          count: 42
        }
      });
      done();
    });
    viz.send(JSON.stringify({ type: 'ALL_DATA' }));
  });

  after(function () {
    server.close();
  });
});
