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

const VALID_FILE_STR = '^[a-zA-Z0-9_]+$';
const validFileRegExp = new RegExp(VALID_FILE_STR);

const checkValidFileStr = (value) => {
  const isValid = validFileRegExp.test(value);
  if (!isValid) {
    throw Error(`value '${value}' does not match regex '${VALID_FILE_STR}'`);
  }
};

const getReceiveBlockHashFile = (fs, sendHash) => {
  return path.join(config.receiveBlockHashDataDir, sendHash);
};

const hasReceiveBlockHash = (fs, sendHash) => {
  checkValidFileStr(sendHash);
  return fs.existsSync(getReceiveBlockHashFile(fs, sendHash));
};

const getReceiveBlockHash = (fs, sendHash) => {
  checkValidFileStr(sendHash);
  return fs.readFileSync(getReceiveBlockHashFile(fs, sendHash), 'UTF-8');
};

const makeReceiveBlockHashDir = (fs) => {
  if (!fs.existsSync(config.receiveBlockHashDataDir)) {
    fs.mkdirSync(config.receiveBlockHashDataDir, {recursive: true});
  }
};

const setReceiveBlockHash = (fs, sendHash, receiveHash) => {
  checkValidFileStr(sendHash);
  makeReceiveBlockHashDir(fs);
  const filePtr = fs.openSync(getReceiveBlockHashFile(fs, sendHash), 'w');
  fs.writeSync(filePtr, receiveHash);
  fs.closeSync(filePtr);
};

const getAccountInfoFile = (fs, owner) => {
  checkValidFileStr(owner);
  return path.join(config.accountInfosDir, owner);
};

const hasAccountInfo = (fs, owner) => {
  checkValidFileStr(owner);
  return fs.existsSync(getAccountInfoFile(fs, owner));
};

const getAccountInfo = (fs, owner) => {
  checkValidFileStr(owner);
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
  checkValidFileStr(owner);
  return fs.existsSync(getNextAssetOwnerFile(fs, owner));
};

const getNextAssetOwner = (fs, owner) => {
  checkValidFileStr(owner);
  return fs.readFileSync(getNextAssetOwnerFile(fs, owner), 'UTF-8');
};

const makeNextAssetOwnerDir = (fs) => {
  if (!fs.existsSync(config.nextAssetOwnerDir)) {
    fs.mkdirSync(config.nextAssetOwnerDir, {recursive: true});
  }
};

const setNextAssetOwner = (fs, owner, count) => {
  checkValidFileStr(owner);
  makeNextAssetOwnerDir(fs);
  const filePtr = fs.openSync(getNextAssetOwnerFile(fs, owner), 'w');
  fs.writeSync(filePtr, count);
  fs.closeSync(filePtr);
};

const makeOwnedAssetsDir = (fs, owner) => {
  const ownedAssetsDir = getOwnedAssetsDir(fs, owner);
  if (!fs.existsSync(ownedAssetsDir)) {
    fs.mkdirSync(ownedAssetsDir, {recursive: true});
  }
};

const getOwnedAssetsDir = (fs, owner) => {
  return path.join(config.ownedAssetsDir, owner);
};

const getOwnedAssetsFile = (fs, owner, asset) => {
  return path.join(getOwnedAssetsDir(fs, owner), asset);
};

const addOwnerAsset = (fs, owner, asset) => {
  checkValidFileStr(owner);
  checkValidFileStr(asset);
  makeOwnedAssetsDir(fs, owner);
  // console.log('addOwnerAsset', owner, asset);
  const filePtr = fs.openSync(getOwnedAssetsFile(fs, owner, asset), 'w');
  fs.closeSync(filePtr);
};

const deleteOwnerAsset = (fs, owner, asset) => {
  checkValidFileStr(owner);
  checkValidFileStr(asset);
  fs.unlinkSync(getOwnedAssetsFile(fs, owner, asset));
};

const listOwnerAssets = (fs, owner) => {
  const dir = getOwnedAssetsDir(fs, owner);
  const assets = [];
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((fileNm) => {
      assets.push(fileNm);
    });
  }
  // console.log('listOwnerAssets', owner, assets);
  return assets;
};

const getTemplateForAssetFile = (fs, asset) => {
  return path.join(config.assetTemplateDataDir, asset);
};

const hasTemplateForAsset = (fs, asset) => {
  checkValidFileStr(asset);
  return fs.existsSync(getTemplateForAssetFile(fs, asset));
};

const getTemplateForAsset = (fs, asset) => {
  checkValidFileStr(asset);
  return fs.readFileSync(getTemplateForAssetFile(fs, asset), 'UTF-8');
};

const makeTemplateForAssetDir = (fs) => {
  if (!fs.existsSync(config.assetTemplateDataDir)) {
    fs.mkdirSync(config.assetTemplateDataDir, {recursive: true});
  }
};

const setTemplateForAsset = (fs, asset, template) => {
  checkValidFileStr(asset);
  checkValidFileStr(template);
  makeTemplateForAssetDir(fs);
  const filePtr = fs.openSync(getTemplateForAssetFile(fs, asset), 'w');
  fs.writeSync(filePtr, template);
  fs.closeSync(filePtr);
};

const getTemplateCounterForAssetFile = (fs, asset) => {
  return path.join(config.assetTemplateCounterDataDir, asset);
};

const hasTemplateCounterForAsset = (fs, asset) => {
  checkValidFileStr(asset);
  return fs.existsSync(getTemplateCounterForAssetFile(fs, asset));
};

const getTemplateCounterForAsset = (fs, asset) => {
  checkValidFileStr(asset);
  return fs.readFileSync(getTemplateCounterForAssetFile(fs, asset), 'UTF-8');
};

const makeTemplateCounterForAssetDir = (fs) => {
  if (!fs.existsSync(config.assetTemplateCounterDataDir)) {
    fs.mkdirSync(config.assetTemplateCounterDataDir, {recursive: true});
  }
};

const setTemplateCounterForAsset = (fs, asset, template) => {
  checkValidFileStr(asset);
  checkValidFileStr(template);
  makeTemplateCounterForAssetDir(fs);
  const filePtr = fs.openSync(getTemplateCounterForAssetFile(fs, asset), 'w');
  fs.writeSync(filePtr, template);
  fs.closeSync(filePtr);
};

const makeTemplatetDir = (fs) => {
  if (!fs.existsSync(config.templateDataDir)) {
    fs.mkdirSync(config.templateDataDir, {recursive: true});
  }
};

const getTemplateFile = (fs, template) => {
  return path.join(config.templateDataDir, template);
};

const listTemplates = (fs) => {
  const dir = config.templateDataDir;
  const templates = [];
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((fileNm) => {
      templates.push(fileNm);
    });
  }
  return templates;
};

const addTemplate = (fs, template) => {
  checkValidFileStr(template);
  makeTemplatetDir(fs);
  const filePtr = fs.openSync(getTemplateFile(fs, template), 'w');
  fs.closeSync(filePtr);
};

exports.init = init;
exports.deactivate = deactivate;
exports.checkValidFileStr = checkValidFileStr;
exports.hasReceiveBlockHash = hasReceiveBlockHash;
exports.getReceiveBlockHash = getReceiveBlockHash;
exports.setReceiveBlockHash = setReceiveBlockHash;
exports.hasAccountInfo = hasAccountInfo;
exports.getAccountInfo = getAccountInfo;
exports.setAccountInfo = setAccountInfo;
exports.hasNextAssetOwner = hasNextAssetOwner;
exports.getNextAssetOwner = getNextAssetOwner;
exports.setNextAssetOwner = setNextAssetOwner;
exports.addOwnerAsset = addOwnerAsset;
exports.deleteOwnerAsset = deleteOwnerAsset;
exports.listOwnerAssets = listOwnerAssets;
exports.hasTemplateForAsset = hasTemplateForAsset;
exports.getTemplateForAsset = getTemplateForAsset;
exports.setTemplateForAsset = setTemplateForAsset;
exports.hasTemplateCounterForAsset = hasTemplateCounterForAsset;
exports.getTemplateCounterForAsset = getTemplateCounterForAsset;
exports.setTemplateCounterForAsset = setTemplateCounterForAsset;
exports.listTemplates = listTemplates;
exports.addTemplate = addTemplate;
