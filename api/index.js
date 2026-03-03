const { buildApp } = require('../dist/server');

const app = buildApp();

module.exports = async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
};
