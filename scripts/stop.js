'use strict';
const io = require('socket.io-client');
const config = require('../config.json');

if (config.webPort == undefined) {
  throw Error('webPort is required in ./config.json');
}

const url = `http://localhost:${config.webPort}`;

const socketClient = io.connect(url, {
  timeout: 30000,
});

const timeoutErrorFn = () => {
  console.log('timeout error, cannot connnect to url', url);
  process.exit(0);
};

const timeoutId = setTimeout(timeoutErrorFn, 30000);

const acknCallbackFn = function (err, userData) {
  clearTimeout(timeoutId);
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

socketClient.on('connect', () => {
  socketClient.emit('npmStop', acknCallbackFn);
});
socketClient.on('disconnect', acknCallbackFn);
