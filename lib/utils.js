var path = require('path');
var RINGOS = [
  /* 'ringo-add', */ 'ringo-delete', 'ringo-replace', 'ringo-replaceNew'
];

function randomInt(min, max) {
  min = Math.ceil(min); // eslint-disable-line no-param-reassign
  max = Math.floor(max); // eslint-disable-line no-param-reassign
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function randomRingo() {
  var name = RINGOS[randomInt(0, RINGOS.length - 1)];
  return {
    name: name,
    path: path.resolve(__dirname, '..', 'sosified-ringos', name, 'bin', 'ringo')
  };
}

function getRingoSosie(name) {
  return {
    name: name,
    path: path.resolve(__dirname, '..', 'sosified-ringos', name, 'bin', 'ringo')
  };
}

module.exports = {
  randomInt: randomInt,
  randomRingo: randomRingo,
  getRingoSosie: getRingoSosie
};
