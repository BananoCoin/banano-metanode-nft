'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/nft/get-nft-info.js');
const ipfsUtil = require('../../../scripts/ipfs-util.js');
const mockFs = require('../../util/mock-fs.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const erc1155IpfsCid = 'QmdaZCaeg8EfhZAsAaNd6BopGo7GVoYYrG8YhUwwiZKWPN';
const artIpfsCid = 'QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR';
const goodHead = '0000000000000000000000000000000000000000000000000000000000000000';

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200 ' + goodIpfsCid, async () => {
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
                  command: 'nft_template',
                  version: '0.0.1',
                  title: '',
                  issuer: '',
                  max_supply: '1',
                  transferable: 'true',
                  metadata_ipfs_cid: artIpfsCid,
                  previous: goodHead,
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
      representative_account: 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn',
      json: {
        command: 'nft_template',
        issuer: '',
        max_supply: '1',
        transferable: 'true',
        previous: goodHead,
        metadata_ipfs_cid: artIpfsCid,
        title: '',
        version: '0.0.1',
      },
      status: 200,
      success: true,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 ' + erc1155IpfsCid, async () => {
    const context = {
      bananojs: bananojs,
      fetch: (resource, options) => {
        if (resource == `${config.ipfsApiUrl}/${erc1155IpfsCid}`) {
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
                  name: 'r/place BANANO 2022',
                  image: 'QmVvAhBftbWg6pAR36Gg5DWzi2YBdGDXoHHBjsndzJV1i8',
                  animation_url: 'QmTza4eYsyzBoZo1a3BEWVzfCgeXGH8np3Qt8VPcPQyxk4',
                  description: 'Participation token for BANANO contributors on r/place',
                  properties: {
                    issuer: 'ban_1rp1aceaawpub5zyztzs4tn7gcugm5bc3o6oga16bb18bquqm1bjnoomynze',
                    supply_block_hash: '079871683378A92059E87A4BABFABCCC066ED529D53D4474541836267CF19AAF',
                  },
                };
              },
            });
          });
        }
        return new Promise(async (resolve) => {
          resolve({
            status: 404,
            statusText: resource,
            headers: {
              get: (header) => {
                if (header == 'content-type') {
                  return 'application/json';
                }
              },
            },
            json: () => {
              return {
              };
            },
          });
        });
      },
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: erc1155IpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      content_type: 'application/json',
      ipfs_cid: erc1155IpfsCid,
      representative_account: 'ban_3rmh8m3nm15dfx39qaw95uu9pd69iozhiupqwa8d9e8h6nwarcaocsbknkbk',
      json: {
        command: 'nft_template',
        issuer: 'ban_1rp1aceaawpub5zyztzs4tn7gcugm5bc3o6oga16bb18bquqm1bjnoomynze',
        transferable: 'true',
        previous: '079871683378A92059E87A4BABFABCCC066ED529D53D4474541836267CF19AAF',
        metadata_ipfs_cid: 'QmVvAhBftbWg6pAR36Gg5DWzi2YBdGDXoHHBjsndzJV1i8',
        title: 'r/place BANANO 2022',
        version: 'ERC1155',
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
