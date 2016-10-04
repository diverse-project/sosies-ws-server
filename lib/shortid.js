const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = function shortid() {
  let id = '';
  for (let i=0; i < 5; i++) {
    id += CHARS[Math.floor(Math.random() * (CHARS.length - 1))];
  }
  return id;
};
