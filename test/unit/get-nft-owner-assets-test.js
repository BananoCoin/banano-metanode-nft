'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const templateActionUtil = require('../../scripts/actions/get-nft-template-owner.js');
const actionUtil = require('../../scripts/actions/get-nft-owner-assets.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');
const mockFetch = require('../util/mock-fetch.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants
const artIpfsCid = 'QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR';
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const goodHead = '0000000000000000000000000000000000000000000000000000000000000000';
const goodOwner4link = '0000000000000000000000000000000000000000000000000000000000000002';
const goodOwnerBlink = '000000000000000000000000000000000000000000000000000000000000000B';
const goodOwnerB = 'ban_111111111111111111111111111111111111111111111111111d7qqrs8tn';
const goodReceiveHash3 = '0000000000000000000000000000000000000000000000000000000000000003';
const goodSendHash4 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodSendHash6 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodReceiveHash8 = '0000000000000000000000000000000000000000000000000000000000000008';
const goodSendHashA = '000000000000000000000000000000000000000000000000000000000000000A';
const goodOwner4 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';
const goodOwner6 = 'ban_1111111111111111111111111111111111111111111111111116i3bqjdmq';
const goodAssetRep = 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn';

// variables
const accountInfos = {};
accountInfos[goodOwner4] = `{"confirmation_height":"1","confirmation_height_frontier": "${goodReceiveHash8}"}`;
accountInfos[goodOwnerB] = `{"confirmation_height":"1","confirmation_height_frontier": "${goodReceiveHash8}"}`;

// functions
describe(actionUtil.ACTION, () => {
  const getContext = (histories, blockInfos) => {
    const fetchFn = mockFetch.fetch(histories, blockInfos, accountInfos);
    return {
      bananojs: bananojs,
      fs: mockFs,
      fetch: (resource, options) => {
        loggingUtil.debug('fetch', resource, options);
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
                  'command': 'mint_nft',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'ipfs_cid': artIpfsCid,
                  'mint_previous': goodHead,
                };
              },
            });
          });
        }
        return fetchFn(resource, options);
      },
    };
  };

  it('get status 200 goodOwner no history', async () => {
    const context = getContext(
        [
          {account: goodOwner4},
        ],
    );
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {owner: goodOwner4});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      assetInfos: [],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  it('get status 200 one owner with receive', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'state',
            subtype: 'send',
          },
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'state',
            subtype: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        head: goodReceiveHash3,
        history: [
          {
            type: 'state',
            subtype: 'receive',
            hash: goodReceiveHash3,
            representative: goodOwner4,
            link: goodSendHash4,
          },
          {
            type: 'state',
            subtype: 'receive',
            hash: goodReceiveHash8,
            representative: goodOwner6,
            link: goodReceiveHash8,
          },
        ],
      },
    ]);

    let actualTemplateResponse;
    try {
      actualTemplateResponse = await getResponse(templateActionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedTemplateResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
          ],
          owner: goodOwner4,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
        },
        {
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
          ],
          owner: goodOwner4,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '1',
        },

      ],
    };
    expect(actualTemplateResponse).to.deep.equal(expectedTemplateResponse);

    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {owner: goodOwner4});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      assetInfos: [
        {
          asset: goodSendHash4,
          template: goodIpfsCid,
          mint_number: '1',
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  it('get status 200 two owner with receive', async () => {
    dataUtil.addOwnerAsset(mockFs, goodOwner4, goodSendHash4);
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        head: goodReceiveHash3,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHash3,
            representative: goodOwner6,
            link: goodSendHash4,
          },
          {
            hash: goodSendHash6,
            representative: goodOwner4,
            link: goodOwnerBlink,
            type: 'send',
          },
          {
            hash: goodSendHashA,
            representative: goodOwner6,
            link: goodOwnerBlink,
            type: 'send',
          },
        ],
      },
      {
        head: goodReceiveHash8,
      },
      {
        account: goodOwnerB,
        head: goodReceiveHash8,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHash8,
            representative: goodOwner6,
            link: goodSendHashA,
          },
        ],
      },
    ]);

    let actualTemplateResponse;
    try {
      actualTemplateResponse = await getResponse(templateActionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedTemplateResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
            {
              owner: goodOwnerB,
              receive: goodReceiveHash8,
              send: goodSendHashA,
            },
          ],
          max_supply: '1',
          mint_number: '0',
          owner: goodOwnerB,
          template: goodIpfsCid,
        },
      ],
    };
    expect(actualTemplateResponse).to.deep.equal(expectedTemplateResponse);

    accountInfos[goodOwnerB] = `{"confirmation_height":"2","confirmation_height_frontier":"${goodReceiveHash8}"}`;

    try {
      actualTemplateResponse = await getResponse(templateActionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    expect(actualTemplateResponse).to.deep.equal(expectedTemplateResponse);

    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {owner: goodOwner4});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      assetInfos: [],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    mockFetch.init(config, loggingUtil);
    dataUtil.init(config, loggingUtil);
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
    templateActionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    templateActionUtil.deactivate();
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    dataUtil.deactivate();
    mockFetch.deactivate();
    mockFs.clear();
  });
});
