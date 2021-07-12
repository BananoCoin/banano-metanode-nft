'use strict';
// libraries
const bs58 = require('bs58');
const AbortController = require('abort-controller');

// modules

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
  /* istanbul ignore if */
  if (fetch === undefined) {
    throw Error('context.fetch is required');
  }
  /* istanbul ignore if */
  if (config.fetchTimeout === undefined) {
    throw Error('config.fetchTimeout is required');
  }
  /* istanbul ignore if */
  if (config.ipfsApiUrl === undefined) {
    throw Error('config.ipfsApiUrl is required');
  }

  const fetchWithTimeout = async (resource, options) => {
    return new Promise( async (resolve, reject) => {
      const {timeout = config.fetchTimeout} = options;

      const controller = new AbortController();
      // const signal = controller.signal;
      // signal.addEventListener('abort', () => {
      //   console.log('getNftInfoForIpfsCid', 'aborted');
      //   resolve({'aborted': true});
      //   return false;
      // });
      const id = setTimeout(() => controller.abort(), timeout);

      loggingUtil.log('getNftInfoForIpfsCid', 'fetch');
      fetch(resource, {
        ...options,
        signal: controller.signal,
      })
          .catch((error) => {
            loggingUtil.log('getNftInfoForIpfsCid', 'error', error.message);
            clearTimeout(id);
            if (error.message == 'The user aborted a request.') {
              error.message = `timeout waiting for response from IPFS CID lookup`;
            }
            resolve({status: 408, statusText: error.message});
          })
          .then((response) => {
            loggingUtil.log('getNftInfoForIpfsCid', 'response', response);
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
  loggingUtil.log('getNftInfoForIpfsCid', 'nftJsonRequest', nftJsonRequest);
  const nftJsonResponse = await fetchWithTimeout(url, nftJsonRequest);

  loggingUtil.log('getNftInfoForIpfsCid', 'status', nftJsonResponse.status);
  loggingUtil.log('getNftInfoForIpfsCid', 'content-type', nftJsonResponse.headers);
  loggingUtil.log('getNftInfoForIpfsCid', 'content-type', nftJsonResponse.headers.get('content-type'));

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

          const regExp = new RegExp('^1220.{64}$');
          if (!regExp.test(resp.json.ipfs_cid_hex)) {
            resp.success = false;
            // check https://github.com/multiformats/js-cid
            resp.errors.push(`ipfs_cid_hex:'${resp.json.ipfs_cid_hex}' not 64 characters after prefix 1220, ${resp.json.ipfs_cid_hex.length}`);
          } else {
            resp.json.new_representative = resp.json.ipfs_cid_hex.substring(4);
            const regExp = new RegExp('^[0123456789abcdefABCDEF]{64}$');
            if (!regExp.test(resp.json.new_representative)) {
              resp.success = false;
              resp.errors.push(`new_representative:'${resp.json.new_representative}' not hex 64 characters, ${resp.json.new_representative.length}`);
            }
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
    resp.errors = [nftJsonResponse.statusText];
  } else {
    resp.errors = ['unknown error from IPFS CID lookup:' + nftJsonResponse.statusText];
  }
  return resp;
};

exports.init = init;
exports.deactivate = deactivate;
exports.getNftInfoForIpfsCid = getNftInfoForIpfsCid;
