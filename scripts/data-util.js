'use strict';
// libraries
const path = require('path');

// modules

// constants

// variables
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

const getReceiveBlockHashFile = (fs, sendHash) => {
  return path.join(config.receiveBlockHashDataDir, sendHash);
};

const hasReceiveBlockHash = (fs, sendHash) => {
  return fs.existsSync(getReceiveBlockHashFile(fs, sendHash));
};

const getReceiveBlockHash = (fs, sendHash) => {
  return fs.readFileSync(getReceiveBlockHashFile(fs, sendHash), 'UTF-8');
};

const setReceiveBlockHash = (fs, sendHash, receiveHash) => {
  const filePtr = fs.openSync(getReceiveBlockHashFile(fs, sendHash), 'w');
  fs.writeSync(filePtr, receiveHash);
  fs.closeSync(filePtr);
};

exports.init = init;
exports.deactivate = deactivate;
exports.hasReceiveBlockHash = hasReceiveBlockHash;
exports.getReceiveBlockHash = getReceiveBlockHash;
exports.setReceiveBlockHash = setReceiveBlockHash;
