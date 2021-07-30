'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-template-count.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {
      bananojs: {},
      fs: mockFs,
      fetch: {},
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      count: 0,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    dataUtil.init(config, loggingUtil);
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    dataUtil.deactivate();
    mockFs.clear();
  });
});
