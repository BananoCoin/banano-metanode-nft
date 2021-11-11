'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/nft/get-nft-asset-owner.js');
const ipfsUtil = require('../../../scripts/ipfs-util.js');
const dataUtil = require('../../../scripts/data-util.js');
const mockFs = require('../../util/mock-fs.js');
const mockFetch = require('../../util/mock-fetch.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');

// constants
const goodOwner2 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';
const goodSendHash4 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodSendHash6 = '0000000000000000000000000000000000000000000000000000000000000006';

const blockInfos = {};
blockInfos[goodSendHash4] = {
  contents: {
    link_as_account: goodOwner2,
  },
};
blockInfos[goodSendHash6] = {
};
// variables

// functions
describe(actionUtil.ACTION, () => {
  const getContext = (histories) => {
    return {
      bananojs: bananojs,
      fs: mockFs,
      fetch: mockFetch.fetch(histories, blockInfos, {}),
    };
  };
  it('get status 200 goodSendHash no history', async () => {
    const context = getContext(
        [
          {head: goodSendHash4, history: []},
          {account: goodOwner2},
        ],
    );
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {asset_hash: goodSendHash4});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      asset_owner: {
        asset: goodSendHash4,
        history: [
          {
            'owner': goodOwner2,
            'receive': '',
            'send': goodSendHash4,
          },
        ],
        owner: goodOwner2,
        received: 'false',
      },
      success: true,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodSendHash no blockInfo', async () => {
    const context = getContext(
        [
          {head: goodSendHash6},
          {account: goodOwner2},
        ],
    );
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {asset_hash: goodSendHash6});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      errors: [
        'no history',
      ],
      success: false,
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
