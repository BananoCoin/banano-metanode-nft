'use strict';

// libraries

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/nft/get-nft-asset-template.js');
const ipfsUtil = require('../../../scripts/ipfs-util.js');
const dataUtil = require('../../../scripts/data-util.js');
const mockFs = require('../../util/mock-fs.js');
const mockFetch = require('../../util/mock-fetch.js');
const { config, loggingUtil, getResponse } = require('../../util/get-response.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const goodOwner2 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';
const goodLink = '0000000000000000000000000000000000000000000000000000000000000001';
const goodSendHash4 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodAssetRep = 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn';

const blockInfos = {};
blockInfos[goodSendHash4] = {
  contents: {
    link_as_account: goodOwner2,
  },
};
// variables

// functions
describe(actionUtil.ACTION, () => {
  const getContext = (histories) => {
    return {
      bananojs: {},
      fs: mockFs,
      fetch: {},
    };
  };
  it('get status 200 goodSendHash', async () => {
    const context = getContext([
      {
        head: goodSendHash4,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodLink,
          },
        ],
      },
      { account: goodOwner2 },
    ]);
    ipfsUtil.setTemplateForAsset(mockFs, actionUtil.ACTION, goodSendHash4, goodIpfsCid);
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, { asset_hash: goodSendHash4 });
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      asset: goodSendHash4,
      template: goodIpfsCid,
      success: true,
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
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    dataUtil.deactivate();
    mockFetch.deactivate();
    mockFs.clear();
  });
});
