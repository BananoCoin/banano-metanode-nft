'use strict';
// libraries

// modules
const ipfsUtil = require('../ipfs-util.js');

// constants
// TODO: rename to get_nft_asset_owner

const ACTION = 'get_nft_asset_owner';

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
 * gets the owner of a single NFT asset.
 *  note: this will get the owner of a forgery too, it only checks the chain of ownership.
 * algorithm:
 *  - starting from a send block, identified by the asset_hash,
 *  get the representative.
 *  - call updateAssetOwnerHistory using the asset_hash as the asset,
*   and the representative as the owner.
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftAssetsOwner = async (context, req, res) => {
  // loggingUtil.log(ACTION, 'getNftAssetsOwner', context, req, res);
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

  const blockInfoBody = {
    action: 'block_info',
    json_block: 'true',
    hash: asset,
  };
  const blockInfoRequest = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(blockInfoBody),
  };
  loggingUtil.debug(ACTION, 'blockInfoRequest', blockInfoRequest);
  const blockInfoResponse = await fetch(config.bananodeApiUrl, blockInfoRequest);
  const blockInfoResponseJson = await blockInfoResponse.json();
  loggingUtil.debug(ACTION, 'blockInfoResponseJson', blockInfoResponseJson);

  const resp = {};
  if (blockInfoResponseJson.contents === undefined) {
    resp.success = false;
    resp.errors = [];
    resp.errors.push('no history');
  } else {
    resp.success = true;

    const owner = blockInfoResponseJson.contents.link_as_account;

    resp.asset_owner = {
      asset: asset,
      owner: owner,
      history: [],
    };

    const accountInfo = await ipfsUtil.getAccountInfo(fetch, ACTION, owner);

    await ipfsUtil.updateAssetOwnerHistory(fetch, bananojs, fs, ACTION, resp.asset_owner, accountInfo);
  }

  loggingUtil.log(ACTION, 'getNftAssetsOwner', 'resp', resp);

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftAssetsOwner;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
