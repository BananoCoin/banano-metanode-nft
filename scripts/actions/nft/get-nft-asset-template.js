'use strict';
// libraries

// modules
const ipfsUtil = require('../../ipfs-util.js');

// constants
/**
 * gets the owner of a single NFT asset.
 * @name get_nft_asset_template
 * @memberof RPC
 * @param {String} asset_hash the hash of the asset.
 * @param {String} action:get_nft_asset_template the action: get the template of the asset.
 * @example {"action": "get_nft_asset_template", "asset_hash":"0000...0000"}
 */
const ACTION = 'get_nft_asset_template';

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
 * gets the template of a single NFT asset.
 *  note: this will get the template of a forgery too, it only returns the template.
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftAssetTemplate = async (context, req, res) => {
  // loggingUtil.log(ACTION, 'getNftAssetTemplate', context, req, res);
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
  if (req.body.asset_hash === undefined) {
    throw Error('req.body.asset_hash is required');
  }

  /* istanbul ignore if */
  if (config.bananodeApiUrl === undefined) {
    throw Error('config.bananodeApiUrl is required');
  }

  const asset = req.body.asset_hash;

  const template = ipfsUtil.getTemplateForAsset(fs, ACTION, asset);

  const resp = {};
  resp.success = true;
  resp.asset = asset;
  resp.template = template;
  loggingUtil.log(ACTION, 'getNftAssetTemplate', 'resp', resp);

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftAssetTemplate;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
