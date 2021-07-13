'use strict';
// libraries

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

  /* istanbul ignore if */
  if (config.bananodeApiUrl === undefined) {
    throw Error('config.bananodeApiUrl is required');
  }

  const ipfsCid = req.body.ipfs_cid;
  loggingUtil.debug(ACTION, 'getNftInfoForIpfsCid', ipfsCid);
  const ipfsResp = await ipfsUtil.getNftInfoForIpfsCid(fetch, bananojs, ipfsCid);
  loggingUtil.debug(ACTION, 'getNftInfoForIpfsCid', 'ipfsResp', ipfsResp);
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
    resp.asset_owners = [];
    const representativeAccount = await bananojs.getBananoAccount(newRepresentative);
    loggingUtil.log(ACTION, 'representativeAccount', representativeAccount);
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.representative == representativeAccount) {
        const linkAccount = await bananojs.getBananoAccount(historyElt.link);
        // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.debug(ACTION, 'historyElt', ix, historyElt.hash, historyElt.account, '=>', linkAccount);
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
      const asset_owner = resp.asset_owners[ix];

      const assetRepresentativeAccount = await bananojs.getBananoAccount(asset_owner.asset);

      let send_to_owner_hash = asset_owner.asset;

      // find the receive block that recieved the send.
      let owner_receive_hash = await getReceiveBlock(fetch, asset_owner.asset, asset_owner.owner, send_to_owner_hash);
      loggingUtil.log(ACTION, 'getNftAssetsOwners',
          'asset', assetRepresentativeAccount,
          'send_to_owner_hash', '=>', 'owner_receive_hash',
          send_to_owner_hash, '=>', owner_receive_hash);
      while ((send_to_owner_hash !== undefined) && (owner_receive_hash !== undefined)) {
        // looking in the history of asset_owner.owner,
        // starting at the owner_receive_hash (the point the owner received the nft)
        // find the next send block with the representative set to the same nft hash (the asset_owner.asset)
        // and return the hash of the send block, and the new owner.
        asset_owner.history.push(
            {
              owner: asset_owner.owner,
              send: send_to_owner_hash,
              receive: owner_receive_hash,
            },
        );

        const nextAssetOwner = await getNextAssetOwner(fetch, bananojs, assetRepresentativeAccount, asset_owner.owner, owner_receive_hash);
        if (nextAssetOwner !== undefined) {
          loggingUtil.log(ACTION, 'getNftAssetsOwners', 'asset_owner', '=>', 'nextAssetOwner', asset_owner, '=>', nextAssetOwner);
          asset_owner.owner = nextAssetOwner.owner;
          send_to_owner_hash = nextAssetOwner.send;
          owner_receive_hash = await getReceiveBlock(fetch, asset_owner.asset, asset_owner.owner, send_to_owner_hash);
          if (owner_receive_hash === undefined) {
            // show an entry in history if it is sent but not recieved
            asset_owner.history.push(
                {
                  owner: asset_owner.owner,
                  send: send_to_owner_hash,
                  receive: '',
                },
            );
          }
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

const getNextAssetOwner = async (fetch, bananojs, assetRepresentativeAccount, owner, owner_receive_hash) => {
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
  loggingUtil.debug(ACTION, 'histRequest', histRequest);
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  if (histResponseJson.history !== undefined) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'account', historyElt.account);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'owner_receive_hash', owner_receive_hash);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'representative', historyElt.representative);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'assetRepresentativeAccount', assetRepresentativeAccount);
      if (historyElt.representative == assetRepresentativeAccount) {
        const linkAccount = await bananojs.getBananoAccount(historyElt.link);
        // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'return', historyElt.hash, owner, '=>', linkAccount);
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
  loggingUtil.debug(ACTION, 'histRequest', histRequest);
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  if (histResponseJson.history !== undefined) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      if (historyElt.link == send_to_owner_hash) {
      // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
        loggingUtil.log(ACTION, 'getReceiveBlock', send_to_owner_hash, '=>', historyElt.hash);
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
