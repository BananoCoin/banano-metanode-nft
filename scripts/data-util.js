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

const makeReceiveBlockHashDir = (fs) => {
  if (!fs.existsSync(config.receiveBlockHashDataDir)) {
    fs.mkdirSync(config.receiveBlockHashDataDir, {recursive: true});
  }
};

const setReceiveBlockHash = (fs, sendHash, receiveHash) => {
  makeReceiveBlockHashDir(fs);
  const filePtr = fs.openSync(getReceiveBlockHashFile(fs, sendHash), 'w');
  fs.writeSync(filePtr, receiveHash);
  fs.closeSync(filePtr);
};

const getAccountInfoFile = (fs, owner) => {
  return path.join(config.accountInfosDir, owner);
};

const hasAccountInfo = (fs, owner) => {
  return fs.existsSync(getAccountInfoFile(fs, owner));
};

const getAccountInfo = (fs, owner) => {
  return fs.readFileSync(getAccountInfoFile(fs, owner), 'UTF-8');
};

const makeAccountInfoDir = (fs) => {
  if (!fs.existsSync(config.accountInfosDir)) {
    fs.mkdirSync(config.accountInfosDir, {recursive: true});
  }
};

const setAccountInfo = (fs, owner, accountInfo) => {
  makeAccountInfoDir(fs);
  const filePtr = fs.openSync(getAccountInfoFile(fs, owner), 'w');
  fs.writeSync(filePtr, accountInfo);
  fs.closeSync(filePtr);
};

const getNextAssetOwnerFile = (fs, owner) => {
  return path.join(config.nextAssetOwnerDir, owner);
};

const hasNextAssetOwner = (fs, owner) => {
  return fs.existsSync(getNextAssetOwnerFile(fs, owner));
};

const getNextAssetOwner = (fs, owner) => {
  return fs.readFileSync(getNextAssetOwnerFile(fs, owner), 'UTF-8');
};

const makeNextAssetOwnerDir = (fs) => {
  if (!fs.existsSync(config.nextAssetOwnerDir)) {
    fs.mkdirSync(config.nextAssetOwnerDir, {recursive: true});
  }
};

const setNextAssetOwner = (fs, owner, count) => {
  makeNextAssetOwnerDir(fs);
  const filePtr = fs.openSync(getNextAssetOwnerFile(fs, owner), 'w');
  fs.writeSync(filePtr, count);
  fs.closeSync(filePtr);
};

exports.init = init;
exports.deactivate = deactivate;
exports.hasReceiveBlockHash = hasReceiveBlockHash;
exports.getReceiveBlockHash = getReceiveBlockHash;
exports.setReceiveBlockHash = setReceiveBlockHash;
exports.hasAccountInfo = hasAccountInfo;
exports.getAccountInfo = getAccountInfo;
exports.setAccountInfo = setAccountInfo;
exports.hasNextAssetOwner = hasNextAssetOwner;
exports.getNextAssetOwner = getNextAssetOwner;
exports.setNextAssetOwner = setNextAssetOwner;
