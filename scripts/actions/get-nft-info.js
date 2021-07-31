'use strict';
// libraries

// modules
const ipfsUtil = require('../ipfs-util.js');

// constants
/**
 * gets the information about an NFT
 * @name get_nft_info
 * @memberof RPC
 * @param {String} ipfs_cid the ipfs cid of the template.
 * @param {String} action:get_nft_info the action: gets info about an nft.
 * @example {"action": "get_nft_info", "ipfs_cid":"QmXk...kw4b"}
 */
const ACTION = 'get_nft_info';

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
 * gets the information about an NFT
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftInfo = async (context, req, res) => {
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

  // loggingUtil.log('getNftOwner', req.body);
  const ipfsCid = req.body.ipfs_cid;
  const resp = await ipfsUtil.getNftInfoForIpfsCid(fetch, bananojs, ipfsCid);
  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftInfo;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
