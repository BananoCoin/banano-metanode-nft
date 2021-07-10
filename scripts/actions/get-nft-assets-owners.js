'use strict';
// libraries
const bs58 = require('bs58');
const bananojs = require('@bananocoin/bananojs');

// modules
const ipfsUtil = require('../ipfs-util.js');

// constants
const ACTION = 'get_nft_assets_owners';

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
 * gets the owners of a NFT's assets
 * @memberof NFT
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getNftAssetsOwners = async (context, req, res) => {
  const fetch = context.fetch;

  /* istanbul ignore if */
  if (fetch === undefined) {
    throw Error('context.fetch is required');
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
  const ipfsCid = req.body.ipfs_cid;
  // loggingUtil.log(ACTION, 'getNftInfoForIpfsCid', ipfsCid);
  const ipfsResp = await ipfsUtil.getNftInfoForIpfsCid(fetch, ipfsCid);
  // loggingUtil.log(ACTION, 'getNftInfoForIpfsCid', 'ipfsResp', ipfsResp);
  if (!ipfsResp.success) {
    res.send(ipfsResp);
    return;
  }

  const startAccount = ipfsResp.json.issuer;
  const startBlock = ipfsResp.json.mint_previous;
  const newRepresentative = ipfsResp.json.new_representative;

  const histBody = {
    action: 'account_history',
    account: startAccount,
    count: -1,
    raw: true,
    head: startBlock,
    reverse: true,
  };
  const histRequest = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(histBody),
  };
  // loggingUtil.log(ACTION, 'histRequest', histRequest);
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  // loggingUtil.log(ACTION, 'histResponseJson', histResponseJson);

  const resp = {};
  if (histResponseJson.history.length == 0) {
    resp.success = false;
    resp.errors = [];
    resp.errors.push('no history');
  } else {
    resp.success = true;
    resp.owners = [];
    const representativeAccount = await bananojs.getBananoAccount(newRepresentative);
    histResponseJson.history.forEach((historyElt) => {
      if (historyElt.representative == representativeAccount) {
        resp.owners.push(historyElt.account);
      }
    });
  }

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftAssetsOwners;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
