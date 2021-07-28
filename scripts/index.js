'use strict';
// libraries
const bananojs = require('@bananocoin/bananojs');
const express = require('express');
const http = require('http');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const awaitSemaphore = require('await-semaphore');

// modules

// constants
const config = require('./config.json');
const configOverride = require('../config.json');

const loggingUtil = {};
loggingUtil.info = console.log;
loggingUtil.isLogEnabled = () => {
  return false;
};
if (loggingUtil.isLogEnabled()) {
  loggingUtil.log = console.log;
} else {
  loggingUtil.log = () => {};
}

loggingUtil.isDebugEnabled = () => {
  return false;
};
if (loggingUtil.isDebugEnabled()) {
  loggingUtil.debug = console.log;
} else {
  loggingUtil.debug = () => {};
}

loggingUtil.trace = console.trace;


// variables
const modules = [];
/* eslint-disable no-unused-vars */
let instance;
let mutex;
/* eslint-enable no-unused-vars */

const init = async () => {
  loggingUtil.info('STARTED init');

  overrideConfig();

  if (config.webPort == '') {
    throw Error('webPort is required in ./config.json');
  }
  if (config.bananodeApiUrl == '') {
    throw Error('bananodeApiUrl is required in ./config.json');
  }

  bananojs.setBananodeApiUrl(config.bananodeApiUrl);
  mutex = new awaitSemaphore.Mutex();

  addModules();
  await initModules();

  initServer();

  process.on('SIGINT', closeProgram);

  loggingUtil.info('SUCCESS init');
};

const addModules = () => {
  modules.push(require('./ipfs-util.js'));
  modules.push(require('./data-util.js'));
  modules.push(require('./actions/get-bananode-api-url.js'));
  modules.push(require('./actions/get-pinata-api-url.js'));
  modules.push(require('./actions/get-ipfs-api-url.js'));
  modules.push(require('./actions/get-nft-asset-owner.js'));
  modules.push(require('./actions/get-nft-owner-assets.js'));
  modules.push(require('./actions/get-nft-template-owner.js'));
  modules.push(require('./actions/get-nft-info.js'));
};

const initModules = async () => {
  for (let moduleIx = 0; moduleIx < modules.length; moduleIx++) {
    const item = modules[moduleIx];
    await item.init(config, loggingUtil);
  }
};

const deactivateModules = async () => {
  loggingUtil.info('STARTED deactivate');
  const reverseModules = modules.slice().reverse();
  for (let moduleIx = 0; moduleIx < reverseModules.length; moduleIx++) {
    const item = reverseModules[moduleIx];
    await item.deactivate(config, loggingUtil);
  }
  loggingUtil.info('SUCCESS deactivate');
};

const initServer = () => {
  const app = express();

  app.use(express.static('static-html', {
    setHeaders: function(res, path) {
      res.setHeader('Access-Control-Allow-Origin', config.ipfsApiUrl);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'content-type');
    },
  }));

  app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
  }));
  app.use(express.json({
    limit: '50mb',
    extended: true,
  }));

  app.use((err, req, res, next) => {
    if (err) {
      loggingUtil.info(dateUtil.getDate(), 'error', req.url, err.message, err.body);
      res.send('');
    } else {
      next();
    }
  });

  const actions = {};

  app.post('/', async (req, res) => {
    try {
      // loggingUtil.log('post', req.body);
      const actionFn = actions[req.body.action];
      if (actionFn !== undefined) {
        const context = {};
        context.fs = fs;
        context.bananojs = bananojs;
        context.fetch = fetch;

        const mutexRelease = await mutex.acquire();
        try {
          return await actionFn(context, req, res);
        } finally {
          mutexRelease();
        }
      }

      const resp = {};
      resp.success = false;
      resp.errors = [];
      resp.errors.push(`unknown action '${req.body.action}'`);
      res.send(resp);
    } catch (error) {
      /* istanbul ignore next */
      console.trace(error);
    }
  });

  app.get('/favicon.ico', async (req, res) => {
    res.redirect(302, '/favicon-16x16.png');
  });

  app.post('/favicon.ico', async (req, res) => {
    res.redirect(302, '/favicon.ico');
  });


  app.get('/js-lib/bananocoin-bananojs.js', async (req, res) => {
    const bananojsPath = path.join('node_modules', '@bananocoin', 'bananojs', 'dist', 'bananocoin-bananojs.js');
    const data = fs.readFileSync(bananojsPath);
    res.type('application/javascript').send(data);
  });

  for (let moduleIx = 0; moduleIx < modules.length; moduleIx++) {
    const item = modules[moduleIx];
    if (item.addAction !== undefined) {
      item.addAction(actions);
    }
  }

  app.use((req, res, next) => {
    res.status(404);
    res.type('text/plain;charset=UTF-8').send('');
  });

  const server = http.createServer(app);

  instance = server.listen(config.webPort, (err) => {
    if (err) {
      loggingUtil.error('ERROR', err);
    }
    loggingUtil.info('listening on PORT', config.webPort);
  });

  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.on('npmStop', () => {
      socket.emit('npmStopAck');
      socket.disconnect(true);
      closeProgram();
    });
  });
};

const closeProgram = async () => {
  console.info('STARTED closing program.');
  await deactivateModules();
  instance = undefined;
  mutex = undefined;
  console.info('SUCCESS closing program.');
  process.exit(0);
};

const isObject = function(obj) {
  return (!!obj) && (obj.constructor === Object);
};

const overrideValues = (src, dest) => {
  Object.keys(src).forEach((key) => {
    const srcValue = src[key];
    const destValue = dest[key];
    if (isObject(destValue)) {
      overrideValues(srcValue, destValue);
    } else {
      dest[key] = srcValue;
    }
  });
};

const overrideConfig = () => {
  loggingUtil.debug('STARTED overrideConfig', config);
  overrideValues(configOverride, config);
  loggingUtil.debug('SUCCESS overrideConfig', config);
};

init()
    .catch((e) => {
      console.info('FAILURE init.', e.message);
      console.trace('FAILURE init.', e);
    });
