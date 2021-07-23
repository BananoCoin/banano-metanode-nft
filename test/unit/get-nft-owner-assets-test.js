'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-owner-assets.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');
const mockFetch = require('../util/mock-fetch.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants
const goodOwner2 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';

// variables

// functions
describe(actionUtil.ACTION, () => {
  const getContext = (histories, blockInfos) => {
    return {
      bananojs: bananojs,
      fs: mockFs,
      fetch: mockFetch.fetch(histories, blockInfos),
    };
  };


  it('get status 200 goodOwner no history', async () => {
    const context = getContext(
        [
          {account: goodOwner2},
        ],
    );
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {owner: goodOwner2});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
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
