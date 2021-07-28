'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-info.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const mockFs = require('../util/mock-fs.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const artIpfsCid = 'QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR';
const goodHead = '0000000000000000000000000000000000000000000000000000000000000000';

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {
      bananojs: bananojs,
      fetch: (resource, options) => {
        if (resource == `${config.ipfsApiUrl}/${goodIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                  command: 'mint_nft',
                  version: '',
                  title: '',
                  issuer: '',
                  max_supply: '1',
                  transferable: 'true',
                  ipfs_cid: artIpfsCid,
                  mint_previous: goodHead,
                };
              },
            });
          });
        }
      },
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      content_type: 'application/json',
      ipfs_cid: goodIpfsCid,
      representative: '1d2c906def1e5e04841de91c8b65e0f37c30a3d45c6a2c454fd332d2906f8d57',
      representative_account: 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn',
      json: {
        command: 'mint_nft',
        issuer: '',
        max_supply: '1',
        transferable: 'true',
        mint_previous: goodHead,
        ipfs_cid: artIpfsCid,
        title: '',
        version: '',
      },
      status: 200,
      success: true,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    mockFs.clear();
  });
});
