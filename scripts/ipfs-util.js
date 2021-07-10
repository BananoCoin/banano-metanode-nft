'use strict';

// modules
const bananoIpfs = require('banano-ipfs');

// constants
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

const getNftInfoForIpfsCid = async (fetch, ipfsCid) => {
  const url = `https://ipfs.globalupload.io/${ipfsCid}`;

  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en',
    'content-type': 'application/json',
  };

  const nftJsonRequest = {
    method: 'GET',
    headers: headers,
  };
  const nftJsonResponse = await fetch(url, nftJsonRequest);

  // loggingUtil.log('getNftOwner', 'status', nftJsonResponse.status);
  // loggingUtil.log('getNftOwner', 'content-type', nftJsonResponse.headers);
  // loggingUtil.log('getNftOwner', 'content-type', nftJsonResponse.headers.get('content-type'));

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

      try {
        resp.json.new_representative = bananoIpfs.ifpsCidToAccount(resp.json.ifps_cid);
      } catch (error) {
        resp.success = false;
        resp.errors.push(error);
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
  } else {
    resp.errors = ['unknown ipfs_cid'];
  }
  return resp;
};

exports.init = init;
exports.deactivate = deactivate;
exports.getNftInfoForIpfsCid = getNftInfoForIpfsCid;
