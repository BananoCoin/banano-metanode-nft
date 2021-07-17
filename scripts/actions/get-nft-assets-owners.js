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
      const assetOwner = resp.asset_owners[ix];

      const assetRepresentativeAccount = await bananojs.getBananoAccount(assetOwner.asset);

      let sendHash = assetOwner.asset;

      // find the receive block that recieved the send.
      let receiveHash = await getReceiveBlock(fetch, assetOwner.owner, sendHash);
      loggingUtil.log(ACTION, 'getNftAssetsOwners',
          'asset', assetRepresentativeAccount,
          'sendHash', '=>', 'receiveHash',
          sendHash, '=>', receiveHash);
      while (receiveHash !== undefined) {
        // looking in the history of asset_owner.owner,
        // starting at the receiveHash (the point the owner received the nft)
        // find the next send block with the representative set to the same nft hash (the asset_owner.asset)
        // and return the hash of the send block, and the new owner.
        assetOwner.history.push(
            {
              owner: assetOwner.owner,
              send: sendHash,
              receive: receiveHash,
            },
        );

        const nextAssetOwner = await getNextAssetOwner(fetch, bananojs, assetRepresentativeAccount, assetOwner.owner, receiveHash);
        if (nextAssetOwner !== undefined) {
          loggingUtil.log(ACTION, 'getNftAssetsOwners', 'assetOwner', '=>', 'nextAssetOwner', assetOwner, '=>', nextAssetOwner);
          assetOwner.owner = nextAssetOwner.owner;
          sendHash = nextAssetOwner.send;
          receiveHash = await getReceiveBlock(fetch, nextAssetOwner.owner, nextAssetOwner.send);
          loggingUtil.log(ACTION, 'getNftAssetsOwners', 'assetOwner', '=>', 'nextAssetOwner', assetOwner, '=>', nextAssetOwner, 'receiveHash', receiveHash);

          const isReceiveHashUndefined = () => {
            const retval = receiveHash === undefined;
            loggingUtil.log(ACTION, 'isReceiveHashUndefined', retval, 'nextAssetOwner', nextAssetOwner);
            return retval;
          };

          if (isReceiveHashUndefined()) {
            // show an entry in history if it is sent but not recieved
            assetOwner.history.push(
                {
                  owner: assetOwner.owner,
                  send: sendHash,
                  receive: '',
                },
            );
          }
        } else {
          receiveHash = undefined;
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

const getReceiveBlock = async (fetch, owner, sendHash) => {
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
      loggingUtil.log(ACTION, 'getReceiveBlock', 'historyElt', ix, owner, '=>', sendHash, 'link', historyElt, 'match', (historyElt.link == sendHash));

      const isLinkSendHash = () => {
        const retval = historyElt.link == sendHash;
        loggingUtil.log(ACTION, 'isLinkSendHash', retval, historyElt.link, sendHash);
        return retval;
      };

      if (isLinkSendHash()) {
        loggingUtil.log(ACTION, 'getReceiveBlock', sendHash, '=>', historyElt.hash);
        return historyElt.hash;
      }
    }
  }
  loggingUtil.log(ACTION, 'getReceiveBlock', sendHash, 'no receive block');
  return undefined;
};

const getNextAssetOwner = async (fetch, bananojs, assetRepresentativeAccount, owner, receiveHash) => {
  const histBody = {
    action: 'account_history',
    account: owner,
    count: -1,
    raw: true,
    head: receiveHash,
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
  loggingUtil.debug(ACTION, 'histResponseJson', histRequest);

  const isHistoryUndefined = () => {
    const retval = histResponseJson.history !== undefined;
    loggingUtil.log(ACTION, 'isHistoryUndefined', retval, owner);
    return retval;
  };

  if (isHistoryUndefined()) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'account', historyElt.account);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'receiveHash', receiveHash);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'representative', historyElt.representative);
      loggingUtil.log(ACTION, 'getNextAssetOwner', ix, 'assetRepresentativeAccount', assetRepresentativeAccount);
      const isHistoryEltSend = () => {
        const retval = historyElt.type == 'send';
        loggingUtil.log('isHistoryEltSend', retval, historyElt.type);
        return retval;
      };
      if (isHistoryEltSend()) {
        if (historyElt.representative == assetRepresentativeAccount) {
          const linkAccount = await bananojs.getBananoAccount(historyElt.link);
          // loggingUtil.log(ACTION, 'historyElt', ix, historyElt);
          loggingUtil.log(ACTION, 'getNextAssetOwner', 'return asset owner', historyElt.hash, owner, '=>', linkAccount);
          return {
            send: historyElt.hash,
            owner: linkAccount,
          };
        }
      }
    }
  }
  loggingUtil.log(ACTION, 'getNextAssetOwner', 'no next asset owner');
  return undefined;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
