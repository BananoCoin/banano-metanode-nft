'use strict';
// libraries

// modules
const ipfsUtil = require('../ipfs-util.js');

// constants
const ACTION = 'get_nft_owner_assets';

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

/**
 * gets the NFT assets of a single owner.
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftOwnerAssets = async (context, req, res) => {
  // loggingUtil.log(ACTION, 'getNftOwnerAssets', context, req, res);
  const fetch = context.fetch;

  /* istanbul ignore if */
  if (fetch === undefined) {
    throw Error('context.fetch is required');
  }

  const bananojs = context.bananojs;

  /* istanbul ignore if */
  if (bananojs === undefined) {
    throw Error('context.bananojs is required');
  }

  const fs = context.fs;

  /* istanbul ignore if */
  if (fs === undefined) {
    throw Error('context.fs is required');
  }

  /* istanbul ignore if */
  if (req === undefined) {
    throw Error('req is required');
  }

  /* istanbul ignore if */
  if (req.body === undefined) {
    throw Error('req.body is required');
  }

  /* istanbul ignore if */
  if (req.body.owner === undefined) {
    throw Error('req.body.owner is required');
  }

  /* istanbul ignore if */
  if (config.bananodeApiUrl === undefined) {
    throw Error('config.bananodeApiUrl is required');
  }

  const owner = req.body.owner;

  const resp = {};
  resp.success = true;
  resp.assetInfos = await ipfsUtil.getOwnedAssets(fetch, bananojs, fs, ACTION, owner);

  loggingUtil.log(ACTION, 'getNftOwnerAssets', 'resp', resp);

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftOwnerAssets;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
