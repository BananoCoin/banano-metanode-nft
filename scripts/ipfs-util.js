'use strict';
// libraries
const bs58 = require('bs58');
const AbortController = require('abort-controller');
const awaitSemaphore = require('await-semaphore');

// modules
const dataUtil = require('./data-util.js');

// constants

// variables
/* eslint-disable no-unused-vars */
let config;
let loggingUtil;
let mutex;
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
  mutex = new awaitSemaphore.Mutex();
};

const deactivate = () => {
  /* eslint-disable no-unused-vars */
  config = undefined;
  loggingUtil = undefined;
  mutex = undefined;
  /* eslint-enable no-unused-vars */
};

const getNftInfoForIpfsCid = async (fetch, bananojs, ipfsCid) => {
  /* istanbul ignore if */
  if (fetch === undefined) {
    throw Error('fetch is required');
  }
  /* istanbul ignore if */
  if (bananojs === undefined) {
    throw Error('bananojs is required');
  }
  /* istanbul ignore if */
  if (config.fetchTimeout === undefined) {
    throw Error('config.fetchTimeout is required');
  }
  /* istanbul ignore if */
  if (config.ipfsApiUrl === undefined) {
    throw Error('config.ipfsApiUrl is required');
  }
  /* istanbul ignore if */
  if (ipfsCid === undefined) {
    throw Error('ipfsCid is required');
  }

  const isValidIpfsCid = () => {
    const bytes = bs58.decode(ipfsCid);
    const hex = bytes.toString('hex');
    const regExp = new RegExp('^1220[0123456789abcdefABCDEF]{64}$');
    return regExp.test(hex);
  };
  try {
    if (!isValidIpfsCid()) {
      throw Error(`hex value is not '1220' + 64 hex chars.`);
    }
  } catch (error) {
    const validCharSet = new Set([...'123456789'+
      'ABCDEFGHJKLMNPQRSTUVWXYZ'+
      'abcdefghijkmnopqrstuvwxyz']);
    let invalidCharacters = '';
    if (error.message == 'Non-base58 character') {
      [...ipfsCid].forEach((char) => {
        if (!validCharSet.has(char)) {
          invalidCharacters = invalidCharacters + char;
        }
      });
    }

    const message = `ipfsCid '${ipfsCid}' is invalid. error '${error.message}'`+
        ` ${invalidCharacters}`;
    throw Error(message.trim());
  }


  const fetchWithTimeout = async (resource, options) => {
    return new Promise( async (resolve, reject) => {
      const {timeout = config.fetchTimeout} = options;

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      loggingUtil.debug('getNftInfoForIpfsCid', 'fetch');
      fetch(resource, {
        ...options,
        signal: controller.signal,
      })
          .catch((error) => {
            loggingUtil.debug('getNftInfoForIpfsCid', 'error', error.message);
            clearTimeout(id);
            if (error.message == 'The user aborted a request.') {
              error.message = `timeout waiting for response from IPFS CID lookup`;
            }
            resolve({status: 408, statusText: error.message, headers: {get: () => {}}});
          })
          .then((response) => {
            loggingUtil.debug('getNftInfoForIpfsCid', 'response', response);
            clearTimeout(id);
            resolve(response);
          });
    });
  };

  const url = `${config.ipfsApiUrl}/${ipfsCid}`;

  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en',
    'content-type': 'application/json',
  };

  const nftJsonRequest = {
    method: 'GET',
    headers: headers,
  };
  loggingUtil.debug('getNftInfoForIpfsCid', 'nftJsonRequest', nftJsonRequest);
  const nftJsonResponse = await fetchWithTimeout(url, nftJsonRequest);

  loggingUtil.debug('getNftInfoForIpfsCid', 'status', nftJsonResponse.status);
  loggingUtil.debug('getNftInfoForIpfsCid', 'content-type', nftJsonResponse.headers);
  loggingUtil.debug('getNftInfoForIpfsCid', 'content-type', nftJsonResponse.headers.get('content-type'));

  const resp = {};
  resp.status = nftJsonResponse.status;
  resp.ipfs_cid = ipfsCid;
  resp.success = false;
  if (nftJsonResponse.status === 200) {
    const contentType = nftJsonResponse.headers.get('content-type');
    resp.content_type = contentType;
    if (resp.content_type === 'application/json') {
      resp.json = await nftJsonResponse.json();
      resp.success = true;
      resp.errors = [];

      if (resp.json.command !== 'mint_nft') {
        resp.success = false;
        resp.errors.push(`command:'${resp.json.command}' !== 'mint_nft'`);
      }

      if (resp.json.version === undefined) {
        resp.success = false;
        resp.errors.push(`version undefined`);
      }

      if (resp.json.title === undefined) {
        resp.success = false;
        resp.errors.push(`title undefined`);
      }

      if (resp.json.issuer === undefined) {
        resp.success = false;
        resp.errors.push(`issuer undefined`);
      }

      if (resp.json.max_supply === undefined) {
        resp.success = false;
        resp.errors.push(`max_supply undefined`);
      } else {
        const regExp = new RegExp('^[0-9]+$');
        if (!regExp.test(resp.json.max_supply.toString())) {
          resp.success = false;
          resp.errors.push(`max_supply:'${resp.json.max_supply}' not an integer`);
        }
      }

      if (resp.json.ipfs_cid === undefined) {
        resp.success = false;
        resp.errors.push(`ipfs_cid undefined`);
      } else {
        const regExp = new RegExp('^Qm[0-9A-Za-z]{0,64}$');
        if (!regExp.test(resp.json.ipfs_cid)) {
          resp.success = false;
          resp.errors.push(`ipfs_cid:'${resp.json.ipfs_cid}' not Qm+base58`);
        } else {
          const bytes = bs58.decode(resp.json.ipfs_cid);
          resp.json.ipfs_cid_hex = bytes.toString('hex');
          resp.json.ipfs_cid_hex_base58 = bs58.encode(Buffer.from(bytes));

          const regExp = new RegExp('^1220[0123456789abcdefABCDEF]{64}$');
          if (!regExp.test(resp.json.ipfs_cid_hex)) {
            resp.success = false;
            // check https://github.com/multiformats/js-cid
            resp.errors.push(`ipfs_cid_hex:'${resp.json.ipfs_cid_hex}' not 64 hex characters after prefix 1220, ${resp.json.ipfs_cid_hex.length}`);
          } else {
            resp.json.new_representative = resp.json.ipfs_cid_hex.substring(4);
            resp.json.new_representative_account = await bananojs.getBananoAccount(resp.json.new_representative);
          }
        }
      }

      if (resp.json.mint_previous === undefined) {
        resp.success = false;
        resp.errors.push(`mint_previous undefined`);
      } else {
        const regExp = new RegExp('^[0123456789abcdefABCDEF]{64}$');
        if (!regExp.test(resp.json.mint_previous)) {
          resp.success = false;
          resp.errors.push(`mint_previous:'${resp.json.mint_previous}' not 64 hex characters`);
        }
      }

      if (resp.success) {
        delete resp.errors;
      }
    } else {
      resp.errors = ['unsupported content_type'];
      // const buffer = await nftJsonResponse.buffer();
      // resp.base64 = buffer.toString('base64');
    }
  } else if (nftJsonResponse.status === 408) {
    resp.errors = [
      nftJsonResponse.statusText,
    ];
  } else {
    resp.errors = [
      'unknown error from IPFS CID lookup',
      'status:' + nftJsonResponse.status,
      'statusText:' + nftJsonResponse.statusText,
    ];
  }
  return resp;
};

const updateAssetOwnerHistory = async (fetch, bananojs, fs, action, assetOwner, accountInfo) => {
  /* istanbul ignore if */
  if (fetch === undefined) {
    throw Error('fetch is required');
  }

  /* istanbul ignore if */
  if (bananojs === undefined) {
    throw Error('bananojs is required');
  }

  /* istanbul ignore if */
  if (fs === undefined) {
    throw Error('fs is required');
  }

  const assetRepresentativeAccount = await bananojs.getBananoAccount(assetOwner.asset);

  let sendHash = assetOwner.asset;

  // find the receive block that recieved the send.
  let receiveHash = await getReceiveBlock(fetch, fs, action, assetOwner.owner, sendHash);
  loggingUtil.log(action, 'getNftAssetsOwners',
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

    const nextAssetOwner = await getNextAssetOwner(fetch, fs, bananojs, action, assetRepresentativeAccount, assetOwner.owner, receiveHash, accountInfo);
    if (nextAssetOwner !== undefined) {
      loggingUtil.log(action, 'getNftAssetsOwners', 'assetOwner', '=>', 'nextAssetOwner', assetOwner, '=>', nextAssetOwner);
      assetOwner.owner = nextAssetOwner.owner;
      sendHash = nextAssetOwner.send;
      receiveHash = await getReceiveBlock(fetch, fs, action, nextAssetOwner.owner, nextAssetOwner.send);
      loggingUtil.log(action, 'getNftAssetsOwners', 'assetOwner', '=>', 'nextAssetOwner', assetOwner, '=>', nextAssetOwner, 'receiveHash', receiveHash);

      const isReceiveHashUndefined = () => {
        const retval = receiveHash === undefined;
        loggingUtil.log(action, 'isReceiveHashUndefined', retval, 'nextAssetOwner', nextAssetOwner);
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
};

const getReceiveBlock = async (fetch, fs, action, owner, sendHash) => {
  const mutexRelease = await mutex.acquire();
  try {
    if (dataUtil.hasReceiveBlockHash(fs, sendHash)) {
      return dataUtil.getReceiveBlockHash(fs, sendHash);
    }
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
    loggingUtil.debug(action, 'histRequest', histRequest);
    const histResponse = await fetch(config.bananodeApiUrl, histRequest);
    const histResponseJson = await histResponse.json();
    if (histResponseJson.history !== undefined) {
      for (let ix = 0; ix < histResponseJson.history.length; ix++) {
        const historyElt = histResponseJson.history[ix];

        /* istanbul ignore if */
        if (loggingUtil.isDebugEnabled()) {
          loggingUtil.debug(action, 'getReceiveBlock', 'historyElt', ix,
              owner, '=>', sendHash, 'link', historyElt.link, 'match',
              (historyElt.link == sendHash));
        }

        dataUtil.setReceiveBlockHash(fs, historyElt.link, historyElt.hash);
      }
    }

    if (dataUtil.hasReceiveBlockHash(fs, sendHash)) {
      const receiveHash = dataUtil.getReceiveBlockHash(fs, sendHash);
      loggingUtil.log(action, 'getReceiveBlock', sendHash, '=>', receiveHash);
      return receiveHash;
    }
    loggingUtil.log(action, 'getReceiveBlock', sendHash, 'no receive block');
    return undefined;
  } finally {
    mutexRelease();
  }
};

const getAccountInfo = async (fetch, action, owner) => {
  const accountInfoBody = {
    action: 'account_info',
    account: owner,
  };
  const accountInfoRequest = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(accountInfoBody),
  };
  loggingUtil.debug(action, 'accountInfoRequest', accountInfoRequest);
  const accountInfoResponse = await fetch(config.bananodeApiUrl, accountInfoRequest);
  const accountInfoResponseJson = await accountInfoResponse.text();
  loggingUtil.debug(action, 'accountInfoResponseJson', accountInfoResponseJson);
  return accountInfoResponseJson;
};

const getNextAssetOwner = async (fetch, fs, bananojs, action, assetRepresentativeAccount, owner, receiveHash, accountInfo) => {
  const mutexRelease = await mutex.acquire();
  try {
    if (dataUtil.hasAccountInfo(fs, owner) &&
        (dataUtil.getAccountInfo(fs, owner) == accountInfo) &&
        dataUtil.hasNextAssetOwner(fs, receiveHash)) {
      const nextAssetOwner = dataUtil.getNextAssetOwner(fs, receiveHash);
      if (nextAssetOwner.length === 0) {
        return undefined;
      }
      return JSON.parse(nextAssetOwner);
    } else {
      const accountInfoJson = JSON.parse(accountInfo);
      const nextAssetOwner = await getNextAssetOwnerForCache(fetch, bananojs, action, assetRepresentativeAccount, owner, receiveHash, accountInfoJson);
      dataUtil.setAccountInfo(fs, owner, accountInfo);
      if (nextAssetOwner === undefined) {
        dataUtil.setNextAssetOwner(fs, receiveHash, '');
      } else {
        dataUtil.setNextAssetOwner(fs, receiveHash, JSON.stringify(nextAssetOwner));
      }
      return nextAssetOwner;
    }
  } finally {
    mutexRelease();
  }
};

const getNextAssetOwnerForCache = async (fetch, bananojs, action, assetRepresentativeAccount, owner, receiveHash, accountInfoJson) => {
  const confirmationHeightFrontier = accountInfoJson.confirmation_height_frontier;
  const histBody = {
    action: 'account_history',
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
  loggingUtil.debug(action, 'histRequest', histRequest);
  const histResponse = await fetch(config.bananodeApiUrl, histRequest);
  const histResponseJson = await histResponse.json();
  loggingUtil.debug(action, 'histResponseJson', histResponseJson);

  const isHistoryUndefined = () => {
    const retval = histResponseJson.history === undefined;
    loggingUtil.log(action, 'isHistoryUndefined', retval, owner);
    return retval;
  };

  if (!isHistoryUndefined()) {
    for (let ix = 0; ix < histResponseJson.history.length; ix++) {
      const historyElt = histResponseJson.history[ix];
      loggingUtil.log(action, 'historyElt', historyElt);
      loggingUtil.debug(action, 'getNextAssetOwner', ix, 'account', historyElt.account);
      loggingUtil.debug(action, 'getNextAssetOwner', ix, 'receiveHash', receiveHash);
      loggingUtil.debug(action, 'getNextAssetOwner', ix, 'representative', historyElt.representative);
      loggingUtil.debug(action, 'getNextAssetOwner', ix, 'assetRepresentativeAccount', assetRepresentativeAccount);
      const isHistoryEltSend = () => {
        const retval = (historyElt.type == 'send') ||
          ((historyElt.type == 'state') && (historyElt.subtype == 'send'));
        loggingUtil.log('isHistoryEltSend', retval, historyElt.type, historyElt.subtype);
        return retval;
      };
      if (isHistoryEltSend()) {
        if (historyElt.representative == assetRepresentativeAccount) {
          const linkAccount = await bananojs.getBananoAccount(historyElt.link);
          // loggingUtil.log(action, 'historyElt', ix, historyElt);
          loggingUtil.log(action, 'getNextAssetOwner', 'return asset owner', historyElt.hash, owner, '=>', linkAccount);
          return {
            send: historyElt.hash,
            owner: linkAccount,
          };
        }
      }

      const isConfirmationHeightFrontier = () => {
        const retval = (historyElt.hash == confirmationHeightFrontier);
        loggingUtil.log('isConfirmationHeightFrontier', retval, historyElt.hash, confirmationHeightFrontier);
        return retval;
      };
      if (isConfirmationHeightFrontier()) {
        loggingUtil.log(action, 'getNextAssetOwner', 'reached confirmed frontier with no next asset owner');
        return undefined;
      }
    }
  }
  loggingUtil.log(action, 'getNextAssetOwner', 'no next asset owner');
  return undefined;
};

exports.init = init;
exports.deactivate = deactivate;
exports.getNftInfoForIpfsCid = getNftInfoForIpfsCid;
exports.updateAssetOwnerHistory = updateAssetOwnerHistory;
exports.getAccountInfo = getAccountInfo;
