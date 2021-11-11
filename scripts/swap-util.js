'use strict';
// libraries
const crypto = require('crypto');

// modules

// constants
const BLOCK_TYPES = [
  'send#atomic_swap',
  'receive#atomic_swap',
  'change#abort_receive_atomic_swap',
  'send#payment',
  'change#abort_payment',
  'receive#payment',
];

// variables
const swaps = new Map();
/* eslint-disable no-unused-vars */
let config;
let loggingUtil;
/* eslint-enable no-unused-vars */

// functions
const init = (_config, _loggingUtil) => {
  /* istanbul ignore if */
  if (_config === undefined) {
    throw new Error('config is required.');
  }
  /* istanbul ignore if */
  if (_loggingUtil === undefined) {
    throw new Error('loggingUtil is required.');
  }
  config = _config;
  loggingUtil = _loggingUtil;
};

const deactivate = () => {
  /* eslint-disable no-unused-vars */
  config = undefined;
  loggingUtil = undefined;
  /* eslint-enable no-unused-vars */
};

const start = (sender, receiver) => {
  const nonce = crypto.randomBytes(32).toString('hex').toUpperCase();
  const swap = {
    sender: sender,
    receiver: receiver,
    nonce: nonce,
  };
  swaps.set(nonce, swap);
  return nonce;
};

exports.init = init;
exports.deactivate = deactivate;
exports.start = start;
