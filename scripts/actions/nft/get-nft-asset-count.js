'use strict';
// libraries

// modules
const ipfsUtil = require('../../ipfs-util.js');

// constants
/**
 * gets the count of all assets for the given template.
 * @name get_nft_asset_count
 * @memberof RPC
 * @example {"action": "get_nft_asset_count", "ipfs_cid":"QmXk...kw4b"}
 */
const ACTION = 'get_nft_asset_count';

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
 * gets the count of all assets for the given template.
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftTemplateList = async (context, req, res) => {
  /* istanbul ignore if */
  if (req === undefined) {
    throw Error('req is required');
  }

  /* istanbul ignore if */
  if (req.body === undefined) {
    throw Error('req.body is required');
  }

  /* istanbul ignore if */
  if (req.body.ipfs_cid === undefined) {
    throw Error('req.body.ipfs_cid is required');
  }

  const template = req.body.ipfs_cid;
  const assets = ipfsUtil.listTemplateAssets(context.fs, ACTION, template);

  const resp = {};
  resp.success = true;
  resp.count = assets.length;

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftTemplateList;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
