'use strict';
// libraries

// modules
const ipfsUtil = require('../ipfs-util.js');

// constants
const ACTION = 'get_nft_assets_owner';

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
  // loggingUtil.log(ACTION, 'getNftAssetsOwners', context, req, res);
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
  if (req.body.asset_hash === undefined) {
    throw Error('req.body.asset_hash is required');
  }

  /* istanbul ignore if */
  if (config.bananodeApiUrl === undefined) {
    throw Error('config.bananodeApiUrl is required');
  }

  const histBody = {
    action: 'account_history',
    count: -1,
    raw: true,
    head: req.body.asset_hash,
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
  loggingUtil.debug(ACTION, 'histRequest', histRequest);
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  loggingUtil.debug(ACTION, 'histResponseJson', histResponseJson);

  const resp = {};
  if (histResponseJson.history.length == 0) {
    resp.success = false;
    resp.errors = [];
    resp.errors.push('no history');
  } else {
    resp.success = true;
    resp.asset_owner = [];
    const representativeLink = histResponseJson.history[0].representative;
    const representativeAccount = await bananojs.getBananoAccount(representativeLink);
    loggingUtil.log(ACTION, 'representativeAccount', representativeAccount);
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.representative == representativeAccount) {
        const linkAccount = await bananojs.getBananoAccount(historyElt.link);
        // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.debug(ACTION, 'historyElt', ix, historyElt.hash, historyElt.account, '=>', linkAccount);
        resp.asset_owner.push({
          asset: historyElt.hash,
          owner: linkAccount,
          history: [],
        });
      }
    }
    for (let ix = 0; ix < resp.asset_owner.length; ix++) {
      // asset is the hash of the send block that created the asset.
      // owner is who it was sent to.
      const assetOwner = resp.asset_owner[ix];
      await ipfsUtil.updateAssetOwnerHistory(fetch, bananojs, ACTION, assetOwner);
    }
  }

  loggingUtil.log(ACTION, 'getNftAssetsOwners', 'resp', resp);

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftAssetsOwners;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
