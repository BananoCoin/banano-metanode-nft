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
  // loggingUtil.log(ACTION, 'getNftAssetsOwners', context, req, res);
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

  /* istanbul ignore if */
  if (config.bananodeApiUrl === undefined) {
    throw Error('config.bananodeApiUrl is required');
  }

  const ipfsCid = req.body.ipfs_cid;
  loggingUtil.log(ACTION, 'getNftInfoForIpfsCid', ipfsCid);
  const ipfsResp = await ipfsUtil.getNftInfoForIpfsCid(fetch, ipfsCid);
  loggingUtil.log(ACTION, 'getNftInfoForIpfsCid', 'ipfsResp', ipfsResp);
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
    resp.asset_owners = [];
    const representativeAccount = await bananojs.getBananoAccount(newRepresentative);
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.representative == representativeAccount) {
        const linkAccount = await bananojs.getBananoAccount(historyElt.link);
        // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.log(ACTION, 'historyElt', ix, historyElt.hash, historyElt.account, '=>', linkAccount);
        resp.asset_owners.push({
          asset: historyElt.hash,
          owner: linkAccount,
          history: [],
        });
      }
    }
    for (let ix = 0; ix < resp.asset_owners.length; ix++) {
      // asset is the hash of the send block that created the asset.
      // owner is who it was sent to.
      // need to find the receive block
      const asset_owner = resp.asset_owners[ix];

      let send_to_owner_hash = asset_owner.asset;
      let owner_receive_hash = await getReceiveBlock(fetch, asset_owner.asset, asset_owner.owner, send_to_owner_hash);
      loggingUtil.log(ACTION, 'getNftAssetsOwners', 'owner_receive_hash', asset_owner, '=>', owner_receive_hash);
      while ((send_to_owner_hash !== undefined) && (owner_receive_hash !== undefined)) {
        const nextAssetOwner = await getNextAssetOwner(fetch, asset_owner.asset, asset_owner.owner, owner_receive_hash);
        if (nextAssetOwner !== undefined) {
          loggingUtil.log(ACTION, 'getNftAssetsOwners', asset_owner, '=>', nextAssetOwner);
          asset_owner.history.push(
              {
                owner: asset_owner.owner,
                send: asset_owner.send,
                receive: owner_receive_hash,
              },
          );
          asset_owner.owner = nextAssetOwner.owner;
          send_to_owner_hash = nextAssetOwner.send;
          owner_receive_hash = getReceiveBlock(fetch, asset_owner.asset, asset_owner.owner, send_to_owner_hash);
        } else {
          send_to_owner_hash = undefined;
          owner_receive_hash = undefined;
        }
      }
    }
  }

  loggingUtil.log(ACTION, 'getNftAssetsOwners', 'resp', resp);

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getNftAssetsOwners;
};

const getNextAssetOwner = async (fetch, asset, owner, owner_receive_hash) => {
  const histBody = {
    action: 'account_history',
    account: owner,
    count: -1,
    raw: true,
    head: owner_receive_hash,
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
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  if (histResponseJson.history !== undefined) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.link == owner_receive_hash) {
        const linkAccount = await bananojs.getBananoAccount(historyElt.link);
        // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.log(ACTION, 'getNextAssetOwner', ix, historyElt.hash, historyElt.account, '=>', linkAccount);
        return {
          send: historyElt.hash,
          owner: linkAccount,
        };
      }
    }
  }
  return undefined;
};

const getReceiveBlock = async (fetch, asset, owner, send_to_owner_hash) => {
  const histBody = {
    action: 'account_history',
    account: owner,
    count: -1,
    raw: true,
    reverse: false,
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
  if (histResponseJson.history !== undefined) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.link == send_to_owner_hash) {
      // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.log(ACTION, 'getReceiveBlock', ix, historyElt.hash);
        return historyElt.hash;
      }
    }
  }
  return undefined;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
