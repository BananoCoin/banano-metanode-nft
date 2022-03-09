'use strict';
// libraries
const bananoIpfs = require('@bananocoin/banano-ipfs');
const bs58 = require('bs58');
const AbortController = require('abort-controller');

// modules
const dataUtil = require('./data-util.js');

// constants

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
    const ipfsCidHex = Buffer.from(bytes).toString('hex');
    const regExp = new RegExp('^1220[0123456789abcdefABCDEF]{64}$');
    return regExp.test(ipfsCidHex);
  };
  try {
    if (!isValidIpfsCid()) {
      throw Error(`hex value is not '1220' + 64 hex chars.`);
    }
  } catch (error) {
    const validCharSet = new Set([...('123456789' + 'ABCDEFGHJKLMNPQRSTUVWXYZ' + 'abcdefghijkmnopqrstuvwxyz')]);
    let invalidCharacters = '';
    if (error.message == 'Non-base58 character') {
      [...ipfsCid].forEach((char) => {
        if (!validCharSet.has(char)) {
          invalidCharacters = invalidCharacters + char;
        }
      });
    }

    const message = `ipfsCid '${ipfsCid}' is invalid. error '${error.message}'` + ` ${invalidCharacters}`;
    throw Error(message.trim());
  }

  const fetchWithTimeout = async (resource, options) => {
    return new Promise(async (resolve, reject) => {
      const {timeout = config.fetchTimeout} = options;

      const controller = new AbortController();
      /* istanbul ignore next */
      const controllerTimeoutFn = () => {
        controller.abort();
      };
      const id = setTimeout(controllerTimeoutFn, timeout);

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
            resolve({
              status: 408,
              statusText: error.message,
              headers: {get: () => {}},
            });
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

      if (resp.json.command !== 'nft_template') {
        resp.success = false;
        resp.errors.push(`command:'${resp.json.command}' !== 'nft_template'`);
      }

      if (resp.json.version === undefined) {
        resp.success = false;
        resp.errors.push(`version undefined`);
      } else {
        if (!config.supportedVersions.includes(resp.json.version)) {
          resp.success = false;
          resp.errors.push(`unsupported version:'${resp.json.version}' supported versions:${JSON.stringify(config.supportedVersions)}`);
        }
      }

      if (resp.json.title === undefined) {
        resp.success = false;
        resp.errors.push(`title undefined`);
      }

      if (resp.json.issuer === undefined) {
        resp.success = false;
        resp.errors.push(`issuer undefined`);
      }

      if (resp.json.max_supply !== undefined) {
        const regExp = new RegExp('^[0-9]+$');
        if (!regExp.test(resp.json.max_supply.toString())) {
          resp.success = false;
          resp.errors.push(`max_supply:'${resp.json.max_supply}' not an integer`);
        }
      }

      if (resp.json.transferable !== undefined) {
        const regExp = new RegExp('^true|false$');
        if (!regExp.test(resp.json.transferable.toString())) {
          resp.success = false;
          resp.errors.push(`transferable:'${resp.json.transferable}' not a boolean`);
        }
      }

      if (resp.json.metadata_ipfs_cid === undefined) {
        resp.success = false;
        resp.errors.push(`metadata_ipfs_cid undefined`);
      } else {
        resp.success = await addRep(bananojs, resp.json, 'metadata_', 'art_', resp.errors, resp.success);
      }

      if (resp.json.previous === undefined) {
        resp.success = false;
        resp.errors.push(`previous undefined`);
      } else {
        const regExp = new RegExp('^[0123456789abcdefABCDEF]{64}$');
        if (!regExp.test(resp.json.previous)) {
          resp.success = false;
          resp.errors.push(`previous:'${resp.json.previous}' not 64 hex characters`);
        }
      }

      if (resp.success) {
        // only add ipfs_cid representative_account if everything is correct.
        // so malformed json can't be used to mint assets.
        resp.success = await addRep(bananojs, resp, '', '', resp.errors, resp.success);
      }

      if (resp.success) {
        delete resp.errors;
        delete resp.ipfs_cid_hex;
        delete resp.ipfs_cid_hex_base58;
        delete resp.json.art_ipfs_cid_hex;
        delete resp.json.art_ipfs_cid_hex_base58;
        delete resp.json.art_representative;
        delete resp.json.art_representative_account;
      }
    } else {
      resp.errors = ['unsupported content_type'];
      // const buffer = await nftJsonResponse.buffer();
      // resp.base64 = buffer.toString('base64');
    }
  } else if (nftJsonResponse.status === 408) {
    resp.errors = [nftJsonResponse.statusText];
  } else {
    resp.errors = ['unknown error from IPFS CID lookup', 'status:' + nftJsonResponse.status, 'statusText:' + nftJsonResponse.statusText];
  }
  return resp;
};

const getOwnedAssets = async (fetch, bananojs, fs, action, owner, chainAccountInfoCache) => {
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

  loggingUtil.log(action, 'getOwnedAssets', 'owner', owner);
  const dirtyAssets = dataUtil.listOwnerAssets(fs, owner);
  loggingUtil.log(action, 'getOwnedAssets', 'dirtyAssets', dirtyAssets);
  for (let dirtyAssetIx = 0; dirtyAssetIx < dirtyAssets.length; dirtyAssetIx++) {
    const dirtyAsset = dirtyAssets[dirtyAssetIx];
    const dirtyOwnerAsset = {
      owner: owner,
      asset: dirtyAsset,
      history: [],
    };
    loggingUtil.log(action, 'getOwnedAssets', 'dirtyOwnerAsset', dirtyOwnerAsset);
    await updateAssetOwnerHistory(fetch, bananojs, fs, action, dirtyOwnerAsset, chainAccountInfoCache);
    loggingUtil.log(action, 'getOwnedAssets', 'dirtyOwnerAsset.owner', dirtyOwnerAsset.owner, 'owner', owner, 'same?', dirtyOwnerAsset.owner !== owner);
    if (dirtyOwnerAsset.owner !== owner) {
      dataUtil.deleteOwnerAsset(fs, owner, dirtyOwnerAsset.asset);
    }
  }
  return dataUtil.listOwnerAssets(fs, owner);
};

const updateAssetOwnerHistory = async (fetch, bananojs, fs, action, assetOwner, chainAccountInfoCache) => {
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

  /* istanbul ignore if */
  if (action === undefined) {
    throw Error('action is required');
  }

  /* istanbul ignore if */
  if (assetOwner === undefined) {
    throw Error('assetOwner is required');
  }

  /* istanbul ignore if */
  if (chainAccountInfoCache === undefined) {
    throw Error('chainAccountInfoCache is required');
  }

  const getChainAccountInfo = chainAccountInfoCache.getChainAccountInfo;

  const assetRepresentativeAccount = await bananojs.getBananoAccount(assetOwner.asset);

  let sendHash = assetOwner.asset;

  // find the receive block that received the send.
  let receiveHash = await getReceiveBlock(fetch, fs, action, assetOwner.owner, sendHash);
  loggingUtil.log(action, 'getNftAssetsOwners', 'asset', assetRepresentativeAccount, 'sendHash', '=>', 'receiveHash', sendHash, '=>', receiveHash);
  if (receiveHash === undefined) {
    // show an entry in history if it is sent but never received
    assetOwner.history.push({
      owner: assetOwner.owner,
      send: sendHash,
      receive: '',
    });
  } else {
    while (receiveHash !== undefined) {
      // looking in the history of asset_owner.owner,
      // starting at the receiveHash (the point the owner received the nft)
      // find the next send block with the representative set to the same nft hash (the asset_owner.asset)
      // and return the hash of the send block, and the new owner.
      assetOwner.history.push({
        owner: assetOwner.owner,
        send: sendHash,
        receive: receiveHash,
      });

      const nextAssetOwner = await getNextAssetOwner(fetch, fs, bananojs, action, assetRepresentativeAccount, assetOwner.owner, receiveHash, getChainAccountInfo);
      if (nextAssetOwner !== undefined) {
        loggingUtil.log(action, 'getNftAssetsOwners', 'assetOwner', '=>', 'nextAssetOwner', assetOwner.owner, '=>', nextAssetOwner.owner);
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
          // show an entry in history if it is sent but not received
          assetOwner.history.push({
            owner: assetOwner.owner,
            send: sendHash,
            receive: '',
          });
        }
      } else {
        receiveHash = undefined;
      }
    }
  }

  assetOwner.received = 'false';
  if (assetOwner.history[assetOwner.history.length - 1].receive.length > 0) {
    assetOwner.received = 'true';
  }
  dataUtil.addOwnerAsset(fs, assetOwner.owner, assetOwner.asset);
  loggingUtil.log(action, 'addOwnerAsset', assetOwner.owner, assetOwner.asset);
};

const getReceiveBlock = async (fetch, fs, action, owner, sendHash) => {
  /* istanbul ignore if */
  if (owner === undefined) {
    throw Error('owner is required');
  }
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
        loggingUtil.debug(action, 'getReceiveBlock', 'historyElt', ix, owner, '=>', sendHash, 'link', historyElt.link, 'match', historyElt.link == sendHash);
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
};

const getAccountInfo = async (fetch, action, owner) => {
  const accountInfoBody = {
    action: 'account_info',
    account: owner,
    include_confirmed: true,
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
  const accountInfoResponseJson = await accountInfoResponse.json();
  // delete accountInfoResponseJson.frontier;
  delete accountInfoResponseJson.open_block;
  delete accountInfoResponseJson.representative_block;
  delete accountInfoResponseJson.balance;
  delete accountInfoResponseJson.modified_timestamp;
  delete accountInfoResponseJson.block_count;
  delete accountInfoResponseJson.account_version;
  loggingUtil.debug(action, 'accountInfoResponseJson', accountInfoResponseJson);
  return JSON.stringify(accountInfoResponseJson);
};

const getNextAssetOwner = async (fetch, fs, bananojs, action, assetRepresentativeAccount, owner, receiveHash, getChainAccountInfo) => {
  let useCachedAccountInfo = false;
  const chainAccountInfo = await getChainAccountInfo(owner);
  if (dataUtil.hasAccountInfo(fs, owner)) {
    const cacheAccountInfo = dataUtil.getAccountInfo(fs, owner);
    // console.log('getNextAssetOwner', 'owner', owner);
    // console.log('getNextAssetOwner', 'cached account info', JSON.parse(cacheAccountInfo));
    // console.log('getNextAssetOwner', 'chains account info', JSON.parse(chainAccountInfo));
    // console.log('getNextAssetOwner', 'cached account info', JSON.parse(cacheAccountInfo).confirmation_height);
    // console.log('getNextAssetOwner', 'chains account info', JSON.parse(chainAccountInfo).confirmation_height);
    if (cacheAccountInfo == chainAccountInfo && dataUtil.hasNextAssetOwner(fs, receiveHash)) {
      // if we have cached the account info
      // and the cached account info is the same as the provided account info,
      // then no send blocks were published, and we can returned the cached data.
      useCachedAccountInfo = true;
    }
  }
  // console.log('getNextAssetOwner', 'owner', owner, 'useCachedAccountInfo', useCachedAccountInfo);
  if (useCachedAccountInfo) {
    const nextAssetOwner = dataUtil.getNextAssetOwner(fs, receiveHash);
    if (nextAssetOwner.length === 0) {
      // console.log('getNextAssetOwner', 'owner', owner, 'nextAssetOwner', 'undefined');
      return undefined;
    }
    return JSON.parse(nextAssetOwner);
  } else {
    const accountInfoJson = JSON.parse(chainAccountInfo);
    const nextAssetOwner = await getNextAssetOwnerForCache(fetch, bananojs, action, assetRepresentativeAccount, owner, receiveHash, accountInfoJson);
    if (nextAssetOwner === undefined) {
      dataUtil.setNextAssetOwner(fs, receiveHash, '');
    } else {
      dataUtil.setNextAssetOwner(fs, receiveHash, JSON.stringify(nextAssetOwner));
    }
    return nextAssetOwner;
  }
};

const getNextAssetOwnerForCache = async (fetch, bananojs, action, assetRepresentativeAccount, owner, receiveHash, accountInfoJson) => {
  /* istanbul ignore if */
  if (receiveHash === undefined) {
    throw Error('receiveHash is required');
  }
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
        const retval = historyElt.type == 'send' || (historyElt.type == 'state' && historyElt.subtype == 'send');
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
        const retval = historyElt.hash == confirmationHeightFrontier;
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

const getChainAccountInfoCache = (fetch, action) => {
  const accountInfoByOwnerMap = new Map();
  const getChainAccountInfoFromMap = async (owner) => {
    if (accountInfoByOwnerMap.has(owner)) {
      return accountInfoByOwnerMap.get(owner);
    } else {
      const accountInfo = await getAccountInfo(fetch, action, owner);
      accountInfoByOwnerMap.set(owner, accountInfo);
      return accountInfo;
    }
  };

  const putChainAccountInfoFromMap = (fs) => {
    accountInfoByOwnerMap.forEach((accountInfo, owner) => {
      loggingUtil.log('putChainAccountInfoFromMap', owner);
      dataUtil.setAccountInfo(fs, owner, accountInfo);
    });
  };

  return {
    getChainAccountInfo: getChainAccountInfoFromMap,
    putChainAccountInfo: putChainAccountInfoFromMap,
  };
};

const getTemplateForAsset = (fs, action, asset) => {
  if (dataUtil.hasTemplateForAsset(fs, asset)) {
    return dataUtil.getTemplateForAsset(fs, asset);
  } else {
    return '';
  }
};

const setTemplateForAsset = (fs, action, asset, template) => {
  dataUtil.setTemplateForAsset(fs, asset, template);
};

const getTemplateCounterForAsset = (fs, action, asset) => {
  if (dataUtil.hasTemplateCounterForAsset(fs, asset)) {
    return dataUtil.getTemplateCounterForAsset(fs, asset);
  } else {
    return '';
  }
};

const setTemplateCounterForAsset = (fs, action, asset, counter) => {
  dataUtil.setTemplateCounterForAsset(fs, asset, parseInt(counter).toFixed(0));
};

const addTemplateAndAsset = (fs, action, template, asset) => {
  /* istanbul ignore if */
  if (fs === undefined) {
    throw Error('fs is required');
  }
  /* istanbul ignore if */
  if (action === undefined) {
    throw Error('action is required');
  }
  /* istanbul ignore if */
  if (template === undefined) {
    throw Error('template is required');
  }
  /* istanbul ignore if */
  if (asset === undefined) {
    throw Error('asset is required');
  }
  dataUtil.addTemplateAndAsset(fs, template, asset);
};

const listTemplates = (fs, action) => {
  /* istanbul ignore if */
  if (fs === undefined) {
    throw Error('fs is required');
  }
  /* istanbul ignore if */
  if (action === undefined) {
    throw Error('action is required');
  }
  return dataUtil.listTemplates(fs);
};

const listTemplateAssets = (fs, action, template) => {
  /* istanbul ignore if */
  if (fs === undefined) {
    throw Error('fs is required');
  }
  /* istanbul ignore if */
  if (action === undefined) {
    throw Error('action is required');
  }
  /* istanbul ignore if */
  if (template === undefined) {
    throw Error('template is required');
  }
  return dataUtil.listTemplateAssets(fs, template);
};

const addRep = async (bananojs, json, inFieldNmPrefix, outFieldNmPrefix, errors, success) => {
  const key = `${inFieldNmPrefix}ipfs_cid`;
  const value = json[key];

  /* istanbul ignore if */
  if (value === undefined) {
    console.trace('error');
    throw Error(`'${key}' not a key in ${Object.keys(json)}`);
  }
  const representativeAccountFieldNm = `${outFieldNmPrefix}representative_account`;
  try {
    const representative = bananoIpfs.ifpsCidToAccount(value);
    json[representativeAccountFieldNm] = representative;
    return success;
  } catch (error) {
    errors.push(`${key}:'${value}' error '${error.message}'`);
    return false;
  }
};

const getTemplateMaxSupply = (fs, action, template) => {
  if (template.length > 0 && dataUtil.hasTemplateMaxSupply(fs, template)) {
    return dataUtil.getTemplateMaxSupply(fs, template);
  } else {
    return '';
  }
};

const setTemplateMaxSupply = (fs, action, template, maxSupply) => {
  dataUtil.setTemplateMaxSupply(fs, template, parseInt(maxSupply).toFixed(0));
};

exports.init = init;
exports.deactivate = deactivate;
exports.getNftInfoForIpfsCid = getNftInfoForIpfsCid;
exports.updateAssetOwnerHistory = updateAssetOwnerHistory;
exports.getAccountInfo = getAccountInfo;
exports.getOwnedAssets = getOwnedAssets;
exports.getReceiveBlock = getReceiveBlock;
exports.getChainAccountInfoCache = getChainAccountInfoCache;
exports.getTemplateForAsset = getTemplateForAsset;
exports.setTemplateForAsset = setTemplateForAsset;
exports.getTemplateCounterForAsset = getTemplateCounterForAsset;
exports.setTemplateCounterForAsset = setTemplateCounterForAsset;
exports.addTemplateAndAsset = addTemplateAndAsset;
exports.listTemplates = listTemplates;
exports.listTemplateAssets = listTemplateAssets;
exports.getTemplateMaxSupply = getTemplateMaxSupply;
exports.setTemplateMaxSupply = setTemplateMaxSupply;
