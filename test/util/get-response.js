'use strict';
// libraries

// modules

// constants
const DEBUG = false;

const LOG = false;

// variables

// functions
const config = {
  fetchTimeout: 0,
  pinataApiUrl: 'pinataApiUrlValue',
  ipfsApiUrl: 'ipfsApiUrlValue',
  bananodeApiUrl: 'bananodeApiUrlValue',
  receiveBlockHashDataDir: 'receiveBlockHashDataDir',
  accountInfosDir: 'accountInfosDir',
  nextAssetOwnerDir: 'nextAssetOwnerDir',
  ownedAssetsDir: 'ownedAssetsDir',
  assetTemplateDataDir: 'assetTemplateDataDir',
  assetTemplateCounterDataDir: 'assetTemplateCounterDataDir',
  templateDataDir: 'templateDataDir',
  supportedVersions: ['0.0.1'],
  currentVersion: '0.0.1',
};

const loggingUtil = {};
loggingUtil.trace = console.trace;
loggingUtil.isDebugEnabled = () => {
  return DEBUG;
};
if (DEBUG) {
  loggingUtil.debug = console.log;
  loggingUtil.log = console.log;
} else {
  if (LOG) {
    loggingUtil.log = console.log;
    loggingUtil.debug = () => {};
  } else {
    loggingUtil.log = () => {};
    loggingUtil.debug = () => {};
  }
}

const getResponse = (actionUtil, context, body) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = body;
    const res = {};
    res.send = (sent) => {
      loggingUtil.debug('called', fn, sent);
      resolve(sent);
    };
    loggingUtil.debug('calling', fn);
    fn(context, req, res)
        .catch((error) => {
          loggingUtil.debug('error', fn, error);
          resolve({
            success: false,
            errors: [error.message],
          });
        });
  });
};

exports.getResponse = getResponse;
exports.loggingUtil = loggingUtil;
exports.config = config;
